// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
// Wind flow map, atmospheric water vapour, and air pollution model
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



// ################################################################
// ||                         FUNCTIONS                          ||
// ################################################################


float map(vec2 fragCoord) {
    return MAP_HEIGHT(texture(iChannel0, fragCoord/uResolution.xy).z);
}


vec2 getVelocity(vec2 uv) {
    vec2 p = uv * MAP_RES;
    if (p.x < 0.5) p.x = 0.5;
    vec2 v = texture(iChannel1, p/uResolution.xy + PASS4).xy;
    if (length(v) > 1.) v = normalize(v);
    return v;
}


vec2 getPosition(vec2 fragCoord) {
    for(int i = -1; i <= 1; i++) {
        for(int j = -1; j <= 1; j++) {
            vec2 uv = (fragCoord + vec2(i,j)) / uResolution.xy;
            vec2 p = texture(iChannel2, fract(uv)).xy;
            if(p.x == 0.) {
                if (hash13(vec3(fragCoord + vec2(i,j), uFrame)) > 1e-4) continue;
                p = fragCoord + vec2(i,j) + hash21(float(uFrame)) - 0.5; // add particle
            } else if (hash13(vec3(fragCoord + vec2(i,j), uFrame)) < 8e-3) {
                continue; // remove particle
            }
            vec2 v = getVelocity(uv);
            p = p + v;
            p.x = mod(p.x, uResolution.x);
            if(abs(p.x - fragCoord.x) < 0.5 && abs(p.y - fragCoord.y) < 0.5)
                return p;
        }
    }
    return vec2(0);
}


// ################################################################
// ||                           MAIN                             ||
// ################################################################


void main() {
    vec2 fragCoord = vUv * uResolution.xy;

    if (uFrame < 10.) {
        gl_FragColor = vec4(0);
        return;
    }
    
    vec4 c = texture(iChannel2, fragCoord/uResolution.xy);
    float particle = (c.x > 0.) ? 1. : 0.9 * c.y;
    vec2 p = getPosition(fragCoord);
    gl_FragColor.xy = (p == vec2(0)) ? vec2(0., particle) : p;
    
    vec2 uv = fragCoord/uResolution.xy;
    
    vec2 v = getVelocity(uv);
    vec2 vn = getVelocity(uv + N/uResolution.xy);
    vec2 ve = getVelocity(uv + E/uResolution.xy);
    vec2 vs = getVelocity(uv + S/uResolution.xy);
    vec2 vw = getVelocity(uv + W/uResolution.xy);
    float div = (ve - vw).x/2. + (vn - vs).y/2.;
    
    float height = map(fragCoord);
    float hn = map(fragCoord + N);
    float he = map(fragCoord + E);
    float hs = map(fragCoord + S);
    float hw = map(fragCoord + W);
    vec2 hgrad = vec2(he - hw, hn - hs)/2.;
    
    vec4 climate = texture(iChannel1, uv * MAP_RES / uResolution.xy + PASS3);
    float mbar = climate.x;
    float temp = climate.y;
    c = texture(iChannel2, fract((fragCoord - v) / uResolution.xy));
    
    // water vapour advection
    float w = c.w;
    float noise = clamp(3. * FBM(vec3(5. * fragCoord/uResolution.xy, uTime)) - 1., 0., 1.);
    if (uTime < OCEAN_END_TIME) w += 0.08 * noise * (1. - smoothstep(OCEAN_START_TIME, OCEAN_END_TIME, uTime));
    if (height == 0.) w += noise * clamp(temp + 2., 0., 100.)/32. * (0.075 - 3. * div - 0.0045 * (mbar - 1012.));
    w -= 0.005 * w; // precipitation
    w -= 0.3 * length(hgrad); // orographic lift
    gl_FragColor.w = clamp(w, 0., 3.);
    
    // pollution advection
    float co2 = c.z;
    vec4 d = texture(iChannel3, fragCoord/uResolution.xy);
    bool human = d.z == -1.;
    float moisture = d.w;
    if (human) {
        co2 += 0.015;
    } else {
        co2 -= 0.01 * plant_growth(moisture, temp);
    }

    gl_FragColor.z = clamp(co2, 0., 3.);
}


`; export default fragmentShader;