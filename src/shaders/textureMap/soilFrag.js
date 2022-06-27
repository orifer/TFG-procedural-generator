// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
// Soil moisture and vegetation
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
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;

///////////////////////////////////////////////////////////////////////////////

#define map(p) texture(iChannel0,fract((p)/uResolution.xy))
#define buf(p) texture(iChannel3,fract((p)/uResolution.xy))


// ################################################################
// ||                         FUNCTIONS                          ||
// ################################################################


vec2 move(float q) {
    return plate_move(q, uFrame, uTime);
}


vec4 climate(vec2 fragCoord, vec2 pass) {
    vec2 p = fragCoord * MAP_RES / uResolution.xy;
    if (p.x < 0.5) p.x = 0.5;
    vec2 uv = p / uResolution.xy;
    return texture(iChannel1, uv + pass);
}


vec2 offset(vec2 p) {
    vec4 c = map(p);
    vec4 n = map(p + N);
    vec4 e = map(p + E);
    vec4 s = map(p + S);
    vec4 w = map(p + W);

    if( (mod(uFrame, 3000.) < 10.) || c.x < 0.) { // no plate under this point
        return vec2(0);
    } else if (move(n.x) == S) {
        return N;
    } else if (move(e.x) == W) {
        return E;
    } else if (move(s.x) == N) {
        return S;
    } else if (move(w.x) == E) {
        return W;
    } else if (move(c.x) != vec2(0) && map(p - move(c.x)).x >= 0.) { // rift
        return vec2(0);
    }
}


// ################################################################
// ||                           MAIN                             ||
// ################################################################


void main() {
    vec2 fragCoord = vUv * uResolution.xy;

    if (uTime < OCEAN_START_TIME) {
        gl_FragColor = vec4(0);
        return;
    }
    
    float height = MAP_HEIGHT(texture(iChannel0, fragCoord/uResolution.xy).z);
    float temp = climate(fragCoord, PASS3).y;
    float vapour = texture(iChannel2, fragCoord/uResolution.xy).w;
    vec2 p = fragCoord + offset(fragCoord);
    vec4 c = buf(p);
    float moisture = c.w;
    moisture *= 1. - 1e-5 * moisture * clamp(temp, 0., 15.);
    if (uTime > OCEAN_END_TIME) moisture += 3. * clamp(vapour, 0., 0.01);
    moisture = clamp(moisture, 0., 5.);
    if (height == 0.) moisture = 5.;
    
    if (uTime < OCEAN_END_TIME) {
        c.xyz = hash32(fragCoord) * vec3(0.5, 1., 2.);
    } else {
        c.xyz = vec3(0);
    }
    
    gl_FragColor = vec4(c.xyz, moisture);
}


`; export default fragmentShader;