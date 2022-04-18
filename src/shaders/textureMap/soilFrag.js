// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
// Soil moisture, vegetation, predator, prey, and human colonisation model
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
    } else if(height > 0.) {
        float reproduction = 2. + clamp(temp, -15., 15.)/30.;
        // easier for prey to evade predators at higher altitudes which tend to have more hiding places
        float evasion = clamp(height, 0.5, 1.5);
        float predation = 2. - evasion;
        
        // generalised Lotka-Volterra equations
        float vege = c.x;
        float prey = c.y;
        float pred = max(c.z, 0.);
        float human = max(-c.z, 0.);
        float dvege = plant_growth(moisture, temp) - prey;
        float dprey = reproduction * vege - predation * pred - 0.5;
        float dpred = predation * prey - 1.;
        float dt = 0.1;
        vege += dt * vege * dvege;
        prey += dt * prey * dprey;
        pred += dt * pred * dpred;
        c.xyz = clamp(vec3(vege, prey, pred), 0.01, 5.);

        // diffusion
        vec4 n = buf(p + N);
        vec4 e = buf(p + E);
        vec4 s = buf(p + S);
        vec4 w = buf(p + W);
        c.xyz += dt * (max(n,0.) + max(e,0.) + max(s,0.) + max(w,0.) - 4. * c).xyz * vec3(0.25, 0.5, 1.);
        
        if (uTime > STORY_END_TIME) {
            human = 0.;
        } else if (uTime > HUMAN_START_TIME && uTime < WARMING_START_TIME &&
                   moisture > 4.9 && 5. < temp && temp < 30.) {
            int dir = int(4.*hash13(vec3(p,uFrame)));
            if (length(hash33(vec3(p,uFrame))) < 1e-2) human = 1.;
            if ((dir == 0 && s.z == -1.) ||
                (dir == 1 && w.z == -1.) ||
                (dir == 2 && n.z == -1.) ||
                (dir == 3 && e.z == -1.)) {
                human = 1.;
            }
        } else if (temp > 35.) {
            // approximating the maximum wet-bulb temperature by the average (dry-bulb) air temperature
            // sustained wet-bulb temperature above 35C is fatal for humans:
            // http://www.pnas.org/content/107/21/9552
            // photosynthesis of crops also becomes ineffective at similar temperatures
            human -= 0.01;
        }
        if (human > 0.) c.z = -human;
    } else {
        c.xyz = vec3(0);
    }
    
    gl_FragColor = vec4(c.xyz, moisture);
}


`; export default fragmentShader;