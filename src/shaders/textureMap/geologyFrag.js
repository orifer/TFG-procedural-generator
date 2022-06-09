// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
// Plate tectonics and hydraulic erosion model
// Inspired & based on David A. Robert's work <https://davidar.io>

import COMMON from '../../shaders/textureMap/commonFrag.js';

const fragmentShader = COMMON + /* glsl */ `


// ################################################################
// ||                   VARIABLES & QUALIFIERS                   ||
// ################################################################


varying vec2 vUv; // The "coordinates" in UV mapping representation
varying vec3 vPosition; // Vertex position

uniform float uTime; // Time in seconds since load
uniform float uFrame; // Frame number
uniform vec3 uResolution; // Canvas size (width,height)
uniform vec2 uMouse; // Mouse position (width,height)
uniform bool uMouseClick; // True if mouse is pressed
uniform bool uAddingTerrain; // True if adding terrain
uniform bool uRemovingTerrain; // True if removing terrain


// Texture channels from other buffers
uniform sampler2D iChannel0;

///////////////////////////////////////////////////////////////////////////////

#define buf(p) textureLod(iChannel0,fract((p) / uResolution.xy),0.)


// ################################################################
// ||                         FUNCTIONS                          ||
// ################################################################


// Generate procedural craters based on https://www.shadertoy.com/view/MtjGRD
float craters(vec3 x) {
	vec3 p = floor(x);
	vec3 f = fract(x); // Same as x - floor(x)
	float va = 0.; 
	float wt = 0.; 
	for (int i = -2; i <= 2; i++) {
		for (int j = -2; j <= 2; j++) {
			for (int k = -2; k <= 2; k++) { 
				vec3 g = vec3(i,j,k); 
				vec3 o = 0.8 * hash33(p + g); 
				float d = distance(f - g, o); 
				float w = exp(-4. * d); 
				va += w * sin(2.*PI * sqrt(d)); 
				wt += w; 
			}
        }
    }
    return abs(va / wt); 
}


vec2 move(float q) {
    return plate_move(q, uFrame, uTime);
}


float slope(vec2 p, vec2 q) {
    if (p == q) return 0.;
    return (buf(q).z - buf(p).z) / distance(p,q);
}


vec2 rec(vec2 p) { // direction of water flow at point
    vec2 d = vec2(0);
    if (slope(p + N,  p) >= slope(p + d, p)) d = N;
    if (slope(p + NE, p) >= slope(p + d, p)) d = NE;
    if (slope(p + E,  p) >= slope(p + d, p)) d = E;
    if (slope(p + SE, p) >= slope(p + d, p)) d = SE;
    if (slope(p + S,  p) >= slope(p + d, p)) d = S;
    if (slope(p + SW, p) >= slope(p + d, p)) d = SW;
    if (slope(p + W,  p) >= slope(p + d, p)) d = W;
    if (slope(p + NW, p) >= slope(p + d, p)) d = NW;
    return d;
}


// Transforms a 2D vertex coordinate to 3D cartesian coordinates given latitude and longitude
// This is used to deform and wrap a 2D plane into a 3D Sphere
vec3 planeToCartesian(vec2 uv) {
    float scale = 1.5;
    float lat = 180. * uv.y - 90.;
    float lon = 360. * uv.x;
    
    return scale * vec3( sin(lon*PI/180.) * cos(lat*PI/180.), sin(lat*PI/180.), cos(lon*PI/180.) * cos(lat*PI/180.));
}


// Creates a heightmap of a terrain with craters
float protoplanet(vec2 uv) {
    float height = 0.;

     // Modify the vertex position to be projected into a sphere
     vec3 p = planeToCartesian(uv);

    // Multiple passes various crater sizes
    for (float i = 0.; i < 5.; i++) {
        
        // Generate the craters
        float c = craters(vec3(0.4 * pow(2.2, i) * p));

        // Generate the FBM noise
        float noise = 0.4 * exp(-3. * c) * FBM(10. * p);

        // Constrain a value to lie between two further values
        float x = 3. * pow(0.4, i);
        float min = 0.;
        float max = 1.;
        float w = clamp(x, min, max);

        // Mix and add the result
        height += w * (c + noise);
    }

    // Play with the contrast
    return pow(height, 3.);
}


// ################################################################
// ||                           MAIN                             ||
// ################################################################


void main() {
    vec2 p = vUv * uResolution.xy;

    if(uTime < OCEAN_START_TIME && mod(uFrame, 50.) < 1. || uFrame < 10.) {
        gl_FragColor = vec4(0);
        gl_FragColor.x = -1.;
        gl_FragColor.w = hash12(p);
        gl_FragColor.z = clamp(15. - 3.5 * protoplanet(p / uResolution.xy), 0., 15.);
        return;
    }
    
    gl_FragColor = buf(p);
    
    if (uTime < OCEAN_START_TIME) return;
    float smoothstart = smoothstep(OCEAN_START_TIME, OCEAN_END_TIME, uTime);


    vec4 n = buf(p + N);
    vec4 e = buf(p + E);
    vec4 s = buf(p + S);
    vec4 w = buf(p + W);

    
    if (uTime < TECTONICS_END_TIME || uTime > STORY_END_TIME) {
        // diffuse uplift through plate
        float dy = 0.;
        if (e.x == gl_FragColor.x) dy += e.y - gl_FragColor.y;
        if (w.x == gl_FragColor.x) dy += w.y - gl_FragColor.y;
        if (n.x == gl_FragColor.x) dy += n.y - gl_FragColor.y;
        if (s.x == gl_FragColor.x) dy += s.y - gl_FragColor.y;
        gl_FragColor.y = max(0., gl_FragColor.y + 0.1 * dy);
    }
    
    // Tectonic uplift
    float max_uplift = 1.;
    if (gl_FragColor.z - OCEAN_DEPTH > 1.) max_uplift = 1. / (gl_FragColor.z - OCEAN_DEPTH);
    gl_FragColor.z += clamp(2. * gl_FragColor.y - 1., 0., max_uplift);
    
    if (gl_FragColor.z >= OCEAN_DEPTH - 0.05) {
        // thermal erosion
        float dz = 0.;
        if (abs(e.z - gl_FragColor.z) > 1.) dz += e.z - gl_FragColor.z;
        if (abs(w.z - gl_FragColor.z) > 1.) dz += w.z - gl_FragColor.z;
        if (abs(n.z - gl_FragColor.z) > 1.) dz += n.z - gl_FragColor.z;
        if (abs(s.z - gl_FragColor.z) > 1.) dz += s.z - gl_FragColor.z;
        gl_FragColor.z = max(0., gl_FragColor.z + 0.02 * dz);

        // flow accumulation
        gl_FragColor.w = 1. + fract(gl_FragColor.w);
        if (rec(p + N)  == -N)  gl_FragColor.w += floor(buf(p + N).w);
        if (rec(p + NE) == -NE) gl_FragColor.w += floor(buf(p + NE).w);
        if (rec(p + E)  == -E)  gl_FragColor.w += floor(buf(p + E).w);
        if (rec(p + SE) == -SE) gl_FragColor.w += floor(buf(p + SE).w);
        if (rec(p + S)  == -S)  gl_FragColor.w += floor(buf(p + S).w);
        if (rec(p + SW) == -SW) gl_FragColor.w += floor(buf(p + SW).w);
        if (rec(p + W)  == -W)  gl_FragColor.w += floor(buf(p + W).w);
        if (rec(p + NW) == -NW) gl_FragColor.w += floor(buf(p + NW).w);

        if (rec(p) == vec2(0)) { // local minima
            gl_FragColor.z += 0.001; // extra sediment
        } else {
            vec4 receiver = buf(p + rec(p));
            if (gl_FragColor.z >= OCEAN_DEPTH) gl_FragColor.w = floor(gl_FragColor.w) + fract(receiver.w); // basin colouring
            // hydraulic erosion with stream power law
            float pslope = (gl_FragColor.z - receiver.z) / length(rec(p));
            float dz = min(pow(floor(gl_FragColor.w), 0.8) * pow(pslope, 2.), gl_FragColor.z);
            dz *= smoothstart;
            gl_FragColor.z = max(gl_FragColor.z - 0.05 * dz, receiver.z);
        }
    } else {
        gl_FragColor.w = fract(gl_FragColor.w);
    }
	
    // approximation of sediment accumulation
    if (uTime < TECTONICS_END_TIME || uTime > STORY_END_TIME) {
        gl_FragColor.z += 2.5e-4 * clamp(gl_FragColor.z + 2.5, 0., 10.) * smoothstart;
    } else if (gl_FragColor.z >= OCEAN_DEPTH - 0.05) {
        gl_FragColor.z += 2.5e-4;
    }
    
    bool subduct = false;
    float prev_uplift = gl_FragColor.y;

    if (mod(uFrame, 5000.) < 10.) {
        // generate new plate boundaries;
        gl_FragColor.x = -1.;
    } else if (gl_FragColor.x < 0.) { // no plate under this point yet
        if (length(hash33(vec3(p,uFrame))) < 7e-3) {
            // seed a new plate with random velocity
            gl_FragColor.x = fract(hash13(vec3(p,uFrame)) + 0.25);
        } else {
            // accretion
            int dir = int(4.*hash13(vec3(p,uFrame)));
            if(dir == 0) gl_FragColor.x = s.x;
            if(dir == 1) gl_FragColor.x = w.x;
            if(dir == 2) gl_FragColor.x = n.x;
            if(dir == 3) gl_FragColor.x = e.x;
        }
        gl_FragColor.y = clamp(gl_FragColor.y, 0., 1.);
    } else if (move(n.x) == S) {
        if (move(gl_FragColor.x) != S) subduct = true;
        gl_FragColor = n;
    } else if (move(e.x) == W) {
        if (move(gl_FragColor.x) != W) subduct = true;
        gl_FragColor = e;
    } else if (move(s.x) == N) {
        if (move(gl_FragColor.x) != N) subduct = true;
        gl_FragColor = s;
    } else if (move(w.x) == E) {
        if (move(gl_FragColor.x) != E) subduct = true;
        gl_FragColor = w;
    } else if (move(gl_FragColor.x) != vec2(0) && buf(p - move(gl_FragColor.x)).x >= 0.) {
        // rift
        gl_FragColor.x = -1.;
        if (gl_FragColor.z < OCEAN_DEPTH) {
            gl_FragColor.y = 0.;
            gl_FragColor.z = 0.;
        }
        gl_FragColor.w = hash12(p);
    }
    
    if (subduct) {
        gl_FragColor.y = 1.;
    } else if (uTime < TECTONICS_END_TIME || uTime > STORY_END_TIME) {
        gl_FragColor.y = max(gl_FragColor.y - 1e-4, 0.);
    }

    // Terraforming
    float brushSize = 20.; // ToDo: make this a parameter
    vec2 r = (p - (uMouse.xy*uResolution.xy)) / brushSize;
    float magnitude = 0.;
    if (uAddingTerrain) magnitude = 0.5 * exp(-0.5 * dot(r,r));
    else if (uRemovingTerrain) magnitude = -1. * (0.5 * exp(-0.5 * dot(r,r)));
    if (uMouseClick) gl_FragColor.z += magnitude;
    
    
    gl_FragColor.y = clamp(gl_FragColor.y, 0., 1.);
    gl_FragColor.z = max(gl_FragColor.z, 0.);
}


`; export default fragmentShader;