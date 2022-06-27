// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
// Atmospheric pressure and circulation model
// Inspired & based on David A. Robert's work <https://davidar.io>

import COMMON from './commonFrag.js';

const fragmentShader = COMMON + /* glsl */ `


// ################################################################
// ||                   VARIABLES & QUALIFIERS                   ||
// ################################################################


varying vec2 vUv; // The "coordinates" in UV mapping representation
varying vec3 vPosition; // Vertex position

uniform float uTime; // Time in seconds since load
uniform float uFrame; // Frame number
uniform vec3 uResolution; // Canvas size (width,height)

// Texture channels from other buffers
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

///////////////////////////////////////////////////////////////////////////////

#define buf(uv) texture(iChannel1, uv)
#define SIGMA vec4(6,4,1,0) // for gaussian blur


// ################################################################
// ||                         FUNCTIONS                          ||
// ################################################################


// Normal probability density function
vec4 normpdf(float x) {
	return 0.39894 * exp(-0.5 * x*x / (SIGMA*SIGMA)) / SIGMA;
}


// mean sea level pressure
vec4 mslp(vec2 uv) {
    float lat = 180. * (uv.y * uResolution.y / MAP_RES.y) - 90.;
    float y = textureLod(iChannel0, uv * MAP_ZOOM, MAP_LOD).z;
    float height = MAP_HEIGHT(y);
    vec4 r;
    if (y > OCEAN_DEPTH) { // land
        r.x = 1012.5 - 6. * cos(lat*PI/45.); // annual mean
        r.y = 15. * sin(lat*PI/90.); // January/July delta
    } else { // ocean
        r.x = 1014.5 - 20. * cos(lat*PI/30.); // annual mean
        r.y = 20. * sin(lat*PI/35.) * abs(lat)/90.; // delta
    }
    r.z = height;
    return r;
}


// horizontally blurred MSLP
vec4 pass1(vec2 uv) {
    vec4 r = vec4(0);
    for (float i = -20.; i <= 20.; i++)
        r += mslp(uv + i*E/uResolution.xy) * normpdf(i);
    return r;
}


// fully blurred MSLP
vec4 pass2(vec2 uv) {
    vec4 r = vec4(0);
    for (float i = -20.; i <= 20.; i++)
        r += buf(uv + i*N/uResolution.xy + PASS1) * normpdf(i);
    return r;
}


// time-dependent MSLP and temperature
vec4 pass3(vec2 uv) {
    vec4 c = buf(uv + PASS2);
    float t = mod(uTime/2., 12.); // simulated month of the year
    float delta = 1. - 2. * smoothstep(1.5, 4.5, t) + 2. * smoothstep(7.5, 10.5, t);
    float mbar = c.x + c.y * delta;
    
    float lat = 180. * (uv.y * uResolution.y / MAP_RES.y) - 90.;
    float land = step(OCEAN_DEPTH, textureLod(iChannel0, uv * MAP_ZOOM, MAP_LOD).z);
    float height = c.z;
    float temp = -27. + 73. * tanh(2.2 * exp(-0.5 * pow((lat + 5. * delta)/30., 2.)));
    temp -= mbar - 1012.;
    temp /= 1.8;
    temp += 1.5 * land;
    float th = 4.;
    
    return vec4(mbar, temp - th * height, temp, 0);
}


// wind vector field
vec4 pass4(vec2 uv) {
    vec2 p = uv * uResolution.xy;
    float n = buf(mod(p + N, MAP_RES)/uResolution.xy + PASS3).x;
    float e = buf(mod(p + E, MAP_RES)/uResolution.xy + PASS3).x;
    float s = buf(mod(p + S, MAP_RES)/uResolution.xy + PASS3).x;
    float w = buf(mod(p + W, MAP_RES)/uResolution.xy + PASS3).x;
    vec2 grad = vec2(e - w, n - s) / 2.;
    float lat = 180. * fract(uv.y * uResolution.y / MAP_RES.y) - 90.;
    vec2 coriolis = 15. * sin(lat*PI/180.) * vec2(-grad.y, grad.x);
    vec2 v = coriolis - grad;
    return vec4(v,0,0);
}


// ################################################################
// ||                           MAIN                             ||
// ################################################################


void main() {
    vec2 fragCoord = vUv * uResolution.xy;
    vec2 uv = fragCoord / uResolution.xy;
    
    if (uv.x < 0.5) {  
        // Down left 
        if (uv.y < 0.5) {
    		gl_FragColor = pass1(uv - PASS1);
        
        // Up left
        } else {
    		gl_FragColor = pass2(uv - PASS2);
        }
    } else {
        // Down right
        if (uv.y < 0.5) {
    		gl_FragColor = pass3(uv - PASS3);
        // Up right
        } else {
    		gl_FragColor = pass4(uv - PASS4);
        }
    }

}


`; export default fragmentShader;