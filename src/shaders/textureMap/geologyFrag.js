// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
const fragmentShader = /* glsl */ `

/*
################################
||  Variables and constants   ||
################################
*/

float PI = 3.14159265358979323846264338;

varying vec2 vUv; // The "coordinates" in UV mapping representation
varying vec3 vPosition; // Vertex position

uniform float uTime; // Time in seconds since load
uniform float uFrame; // Frame number
uniform vec3 uResolution; // Canvas size (width,height)
uniform sampler2D iChannel0;

// Hash scales //
#define HASHSCALE1 .1031
#define HASHSCALE3 vec3(.1031, .1030, .0973)

///////////////////////////////////////////////////////////////////////////////

#define PI 3.14159265359

#define buf(p) textureLod(iChannel0,fract((p) / uResolution.xy),0.)
// #define buf(p) textureLod(iChannel0,fract(p),0.)


#define OCEAN_START_TIME 15.
#define LAND_START_TIME 20.
#define OCEAN_END_TIME 25.
#define LAND_END_TIME 30.
#define SLOWING_START_TIME 113.
#define DAYNIGHT_START_TIME 120.
#define HUMAN_START_TIME 125.
#define TECTONICS_END_TIME 126.
#define CO2_START_TIME 180.
#define WARMING_START_TIME 200.
#define WARMING_END_TIME 220.
#define OVERLAY_END_TIME 230.
#define MUSIC_END_TIME 235.
#define STORY_END_TIME 250.

#define CAMERA_DIST 25.
#define DEEP_WATER vec4(0.01, 0.02, 0.08, 1)
#define SHALLOW_WATER vec4(0.11, 0.28, 0.51, 1)
#define WARM vec4(1.,0.5,0.,1)
#define COOL vec4(0.,0.5,1.,1)

#define OCEAN_DEPTH ocean_depth(uTime)

#define ATMOSPHERE_THICKNESS 0.2

#define MAP_HEIGHT(y) (0.4 * max(0., (y) - OCEAN_DEPTH))

#define MAP_LOD max(1., floor(log2(uResolution.x / 144.)))
#define MAP_ZOOM pow(2., MAP_LOD)
#define MAP_RES (uResolution.xy / MAP_ZOOM)

#define PASS1 vec2(0.0,0.0)
#define PASS2 vec2(0.0,0.5)
#define PASS3 vec2(0.5,0.0)
#define PASS4 vec2(0.5,0.5)

#define N  vec2( 0, 1)
#define NE vec2( 1, 1)
#define E  vec2( 1, 0)
#define SE vec2( 1,-1)
#define S  vec2( 0,-1)
#define SW vec2(-1,-1)
#define W  vec2(-1, 0)
#define NW vec2(-1, 1)




///////////////////////////////////////////////////////////////////////////////

float ocean_depth(float t) {
    if (TECTONICS_END_TIME < t && t < STORY_END_TIME) t = TECTONICS_END_TIME;
    float d = 7.25 + 0.25 * sin(t/5.);
    d *= smoothstep(OCEAN_START_TIME, OCEAN_END_TIME, t);
    return d;
}


// Hash function 3-3
// IN:  vec3
// OUT: vec3
vec3 hash33(vec3 p3) {
    p3 = fract(p3 * HASHSCALE3);
    p3 += dot(p3, p3.yxz+19.19);
    return fract((p3.xxy + p3.yxx)*p3.zyx);
}


//  Hash function 3-1
// IN:  vec3
// OUT: float
float hash13(vec3 p3) {
    p3  = fract(p3 * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

float hash12(vec2 p) {
	vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}


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


// Noise function
// By David Hoskins, May 2014. @ https://www.shadertoy.com/view/4dsXWn
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
float Noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p); 
    f *= f * (3.0-2.0*f);

    return mix(
        mix(mix(hash13(i + vec3(0.,0.,0.)), hash13(i + vec3(1.,0.,0.)),f.x),
        mix(hash13(i + vec3(0.,1.,0.)), hash13(i + vec3(1.,1.,0.)),f.x),f.y),
        mix(mix(hash13(i + vec3(0.,0.,1.)), hash13(i + vec3(1.,0.,1.)),f.x),
        mix(hash13(i + vec3(0.,1.,1.)), hash13(i + vec3(1.,1.,1.)),f.x),f.y),
        f.z
    );
}


// Fractal Brownian Motion noise function developed by Ken Perlin
float FBM( vec3 p ) {
    mat3 m = mat3( 0.00,  0.80,  0.60,
                -0.80,  0.36, -0.48,
                -0.60, -0.48,  0.64 ) * 1.7;

    float f;
    f += 0.5000   * Noise(p); p = m*p;
    f += 0.2500   * Noise(p); p = m*p;
    f += 0.1250   * Noise(p); p = m*p;
    f += 0.0625   * Noise(p); p = m*p;
    f += 0.03125  * Noise(p); p = m*p;
    f += 0.015625 * Noise(p);

    return f;
}


float hash13(vec3);
vec2 plate_move(float q, float uFrame, float uTime) {
    if (uTime >= TECTONICS_END_TIME && uTime < STORY_END_TIME) return vec2(0);
    vec2 v = vec2(cos(2.*PI*q), sin(2.*PI*q));
    if (hash13(vec3(v,uFrame)) < 0.05) {
        if (hash13(vec3(v+1.,uFrame)) < abs(v.x) / (abs(v.x) + abs(v.y))) {
            return vec2(sign(v.x),0.);
        } else {
            return vec2(0.,sign(v.y));
        }
    }
    return vec2(0);
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
    
    
    gl_FragColor.y = clamp(gl_FragColor.y, 0., 1.);
    gl_FragColor.z = max(gl_FragColor.z, 0.);
}





`;
export default fragmentShader;