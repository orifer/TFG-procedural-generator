// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
import COMMON from '../../shaders/textureMap/commonFrag.js';

const fragmentShader = COMMON + /* glsl */ `


// ################################################################
// ||                   VARIABLES & QUALIFIERS                   ||
// ################################################################


varying vec2 vUv; // The "coordinates" in UV mapping representation
varying vec3 vPosition; // Vertex position

uniform float uTime; // Time in seconds since load
uniform vec2 uResolution; // Canvas size (width,height)
uniform int uDisplayTextureMap; // The map to show

// Buffers
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;

///////////////////////////////////////////////////////////////////////////////

#define buf(p) textureLod(iChannel0,(p)/uResolution.xy,0.)

#define CAMERA_DIST 25.

#define DEEP_WATER vec4(0.01, 0.02, 0.08, 1)
#define SHALLOW_WATER vec4(0.11, 0.28, 0.51, 1)
#define WARM vec4(1.,0.5,0.,1)
#define COOL vec4(0.,0.5,1.,1)


// ################################################################
// ||                         FUNCTIONS                          ||
// ################################################################


vec3 fromlatlon(float lat, float lon) {
    return vec3(sin(lon*PI/180.) * cos(lat*PI/180.), sin(lat*PI/180.), cos(lon*PI/180.) * cos(lat*PI/180.));
}


vec4 climate(vec2 fragCoord, vec2 pass) {
    vec2 p = fragCoord * MAP_RES / uResolution.xy;
    if (p.x < 0.5) p.x = 0.5;
    vec2 uv = p / uResolution.xy;
    return texture(iChannel1, uv + pass);
}


vec4 map_land(vec2 fragCoord, bool ocean) {
    vec2 p = fragCoord;
    vec2 grad = vec2(buf(p+E).z - buf(p+W).z, buf(p+N).z - buf(p+S).z);
    float light = cos(atan(grad.y, grad.x) + 0.25*PI) * clamp(0.2 * length(grad), 0., 1.);
    vec4 fragColor = vec4(vec3(0.015 + 0.085 * light), 1);
    if (!ocean) fragColor.rgb *= 3.;
    float y = buf(fragCoord).z;
    if (y < OCEAN_DEPTH) {
        if (ocean)
            fragColor = mix(DEEP_WATER, SHALLOW_WATER, y / OCEAN_DEPTH);
        else
            fragColor.rgb = vec3(0);
    }
    fragColor.w = MAP_HEIGHT(y);
    return fragColor;
}


vec4 map_flow(vec2 fragCoord) {
    float mbar = climate(fragCoord, PASS3).x;
    vec4 r = WARM;
    r = mix(r, vec4(1), smoothstep(1000., 1012., floor(mbar)));
    r = mix(r, COOL, smoothstep(1012., 1024., floor(mbar)));
    
    vec2 p = fragCoord * MAP_RES / uResolution.xy;
    if (p.x < 1.) p.x = 1.;
    vec2 uv = p / uResolution.xy;
    vec2 v = texture(iChannel1, uv + PASS4).xy;
    
    vec4 c = texture(iChannel2, fragCoord/uResolution.xy);
    float flow = (c.x > 0.) ? 1. : c.y;
    flow *= clamp(length(v), 0., 1.);
    
    vec4 fragColor = map_land(fragCoord, false);
    fragColor = mix(fragColor, r, 0.5 * flow);
    return fragColor;
}


vec4 map_temp(vec2 fragCoord) {
    float height = MAP_HEIGHT(buf(fragCoord).z);
    float temp0 = climate(fragCoord, PASS3).z;
    float temp = temp0 - mix(4., 3., smoothstep(WARMING_START_TIME, WARMING_END_TIME, uTime)) * height;
    temp = floor(temp/2.)*2.;
    vec4 r = COOL;
    r = mix(r, vec4(1), smoothstep(-20.,  0., temp));
    r = mix(r, WARM,    smoothstep(  0., 25., temp));
    vec4 fragColor = map_land(fragCoord, false);
    fragColor = mix(fragColor, r, 0.35);
    return fragColor;
}


vec4 map_life(vec2 fragCoord) {
    vec4 c = texture(iChannel3, fragCoord/uResolution.xy);
    float vege = c.x;
    float prey = c.y * 2.;
    float pred = max(c.z, 0.);

    vec4 fragColor = map_land(fragCoord, true);
    fragColor = mix(fragColor, vec4(0.0, 1.0, 0.1, 1), 0.75 * smoothstep(0., 5., vege - prey - pred));
    fragColor = mix(fragColor, vec4(0.8, 0.5, 0.0, 1), 0.75 * smoothstep(0., 5., prey - pred));
    fragColor = mix(fragColor, vec4(0.5, 0.0, 0.0, 1), 0.75 * smoothstep(0., 5., pred));
    return fragColor;
}


vec4 map_plates(vec2 fragCoord) {
    vec2 p = fragCoord;
    float q = buf(p).x;
    float uplift = buf(p).y;
    vec4 r = vec4(0,0,0,1);
    r.rgb = (q < 0.) ? vec3(1) : .6 + .6 * cos(2.*PI*q + vec3(0,23,21));
    vec4 fragColor = map_land(fragCoord, false);
    fragColor = r * (5. * fragColor + 3. * clamp(2. * uplift - 1., 0., 1.) + 0.05);
    return fragColor;
}


vec4 map_rivers(vec2 fragCoord) {
    vec4 fragColor = map_land(fragCoord, true);
    float flow = buf(fragCoord).w;
    fragColor.rgb = mix(fragColor.rgb, .6 + .6 * cos(2.*PI * fract(flow) + vec3(0,23,21)),
                        clamp(0.15 * log(floor(flow)), 0., 1.));
    return fragColor;
}


vec4 map_sat(vec2 fragCoord) {
    vec2 p = fragCoord;
    vec2 uv = p / uResolution.xy;
    float y = buf(p).z;
    float lat = 180. * uv.y - 90.;
    float lon = 360. * uv.x - 180.;
    float height = MAP_HEIGHT(y);
    
    vec2 grad = vec2(buf(p+E).z - buf(p+W).z, buf(p+N).z - buf(p+S).z);
    float clouds = 1.;
    vec4 ocean = mix(vec4(0.01, 0.02, 0.08, 1), vec4(0.11, 0.28, 0.51, 1), y / OCEAN_DEPTH);

    float temp0 = climate(p, PASS3).z;
    float temp = temp0 - mix(4., 3., smoothstep(WARMING_START_TIME, WARMING_END_TIME, uTime)) * height;
    
    // Dry land
    vec3 dry = vec3(0.89, 0.9, 0.89);
    dry = mix(dry, vec3(0.11, 0.10, 0.05), smoothstep(-10., 0., temp));
    dry = mix(dry, vec3(1.00, 0.96, 0.71), smoothstep( 0., 20., temp));
    dry = mix(dry, vec3(0.81, 0.48, 0.31), smoothstep(20., 30., temp));

    // Vegetation
    vec3 veg = vec3(0.89, 0.9, 0.89);
    veg = mix(veg, vec3(0.56, 0.49, 0.28), smoothstep(-10., 0., temp));
    veg = mix(veg, vec3(0.18, 0.34, 0.04), smoothstep( 0., 20., temp));
    veg = mix(veg, vec3(0.05, 0.23, 0.04), smoothstep(20., 30., temp));

    float moisture = texture(iChannel3, uv).w;
    vec4 land = vec4(0,0,0,1);
    land.rgb = mix(dry, veg, plant_growth(moisture, temp));

    if (uTime < LAND_END_TIME) {
        float c = (15. - y) / 3.5;
        float heat = clamp(2. / pow(uTime + 1., 2.), 0., 1.);
        vec4 rock = mix(vec4(0.58, 0.57, 0.55, 1), vec4(0.15, 0.13, 0.1, 1), smoothstep(0., 3., c));
        rock *= clamp(0.2 * length(grad), 0., 1.);
        rock += 5. * c * heat * vec4(1., 0.15, 0.05, 1.);
        land = mix(rock, land, smoothstep(LAND_START_TIME, LAND_END_TIME, uTime));
    }

    vec4 r = vec4(0,0,0,1);
    if (y < OCEAN_DEPTH && uTime > OCEAN_START_TIME) {
        r = mix(land, ocean, smoothstep(0., 2., uTime - OCEAN_START_TIME));
    } else {
        r = land;
    }
    
    float vapour = texture(iChannel2, uv).w;
    r.rgb = mix(r.rgb, vec3(1), 0.3 * clouds * log(1. + vapour) * smoothstep(0., LAND_END_TIME, uTime));
    return r;
}


vec4 map(vec2 uv) {
    vec2 p = uv * uResolution.xy;
    
    // Show map to view
    if (uDisplayTextureMap == 0) return map_sat(p);    // Normal view
    if (uDisplayTextureMap == 1) return map_plates(p); // Plates view
    if (uDisplayTextureMap == 2) return map_rivers(p); // Rivers view
    if (uDisplayTextureMap == 3) return map_flow(p);   // Flow view
    // if (uDisplayTextureMap == 4) return map_temp(p);   // Temperature view
    // if (uDisplayTextureMap == 5) return map_life(p);   // Life view

    return map_sat(p);
}


// ################################################################
// ||                           MAIN                             ||
// ################################################################


void main() {
    gl_FragColor = map(vUv);

    gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1./1.5));
    gl_FragColor.a = 1.;
}


`; export default fragmentShader;