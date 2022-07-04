// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
// Inspired & based on David A. Robert's work <https://davidar.io>

const fragmentShader = /* glsl */ `


// ################################################################
// ||                   VARIABLES & QUALIFIERS                   ||
// ################################################################

uniform float uSeed; 

#define PI 3.14159265359

// Events 
#define OCEAN_START_TIME 15.
#define LAND_START_TIME 20.
#define OCEAN_END_TIME 25.
#define LAND_END_TIME 30.
#define TECTONICS_END_TIME 35.
#define STORY_END_TIME 35.

#define OCEAN_DEPTH ocean_depth(uTime)

#define MAP_HEIGHT(y) (0.4 * max(0., (y) - OCEAN_DEPTH))

#define MAP_LOD max(1., floor(log2(uResolution.x / 144.)))
#define MAP_ZOOM pow(2., MAP_LOD)
#define MAP_RES (uResolution.xy / MAP_ZOOM)

#define PASS1 vec2(0.0,0.0)
#define PASS2 vec2(0.0,0.5)
#define PASS3 vec2(0.5,0.0)
#define PASS4 vec2(0.5,0.5)

// Directions
#define N  vec2( 0, 1)
#define NE vec2( 1, 1)
#define E  vec2( 1, 0)
#define SE vec2( 1,-1)
#define S  vec2( 0,-1)
#define SW vec2(-1,-1)
#define W  vec2(-1, 0)
#define NW vec2(-1, 1)


// ################################################################
// ||                         FUNCTIONS                          ||
// ################################################################


float hash13(vec3);
vec2 plate_move(float q, float uFrame, float uTime) {
    // q = plate color (0.-1.)

    // No movement outside the time range
    if (uTime >= TECTONICS_END_TIME && uTime < STORY_END_TIME) return vec2(0);
    
    // Get a pseudorandom value between (0,0) and (1,1)
    vec2 v = vec2(cos(2.*PI*q), sin(2.*PI*q));

    // Chances of movement in the current frame (0.5 = 50% chance)
    // ToDo: Change this value via uniform
    if (hash13(vec3(v,uFrame)) < 0.05) {

        // Decide the direction of the movement
        if (hash13(vec3(v+1.,uFrame)) < abs(v.x) / (abs(v.x) + abs(v.y))) {
            return vec2(sign(v.x),0.);
        } else {
            return vec2(0.,sign(v.y));
        }
    }
    return vec2(0);
}

float ocean_depth(float t) {
    if (TECTONICS_END_TIME < t && t < STORY_END_TIME) t = TECTONICS_END_TIME;
    float d = 7.25 + 0.25 * sin(t/5.);
    d *= smoothstep(OCEAN_START_TIME, OCEAN_END_TIME, t);
    return d;
}

float plant_growth(float moisture, float temp) {
    float growth = clamp(moisture / 3., 0., 1.);
    // https://www2.nrel.colostate.edu/projects/century/MANUAL/html_manual/man96.html#FIG3-8B
    growth *= smoothstep(0., 25., temp) - smoothstep(25., 35., temp);
    return growth;
}


// Hash without Sine
// Creative Commons Attribution-ShareAlike 4.0 International Public License
// Created by David Hoskins.
#define HASHSCALE1 .1031 * uSeed
#define HASHSCALE3 vec3(.1031, .1030, .0973) * uSeed
#define HASHSCALE4 vec4(.1031, .1030, .0973, .1099) * uSeed

//----------------------------------------------------------------------------------------
//  1 out, 1 in...
float hash11(float p)
{
	vec3 p3  = fract(vec3(p) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

//----------------------------------------------------------------------------------------
//  1 out, 2 in...
float hash12(vec2 p)
{
	vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

//----------------------------------------------------------------------------------------
//  1 out, 3 in...
float hash13(vec3 p3)
{
	p3  = fract(p3 * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

//----------------------------------------------------------------------------------------
//  2 out, 1 in...
vec2 hash21(float p)
{
	vec3 p3 = fract(vec3(p) * HASHSCALE3);
	p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.xx+p3.yz)*p3.zy);

}

//----------------------------------------------------------------------------------------
///  2 out, 2 in...
vec2 hash22(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xx+p3.yz)*p3.zy);

}

//----------------------------------------------------------------------------------------
///  2 out, 3 in...
vec2 hash23(vec3 p3)
{
	p3 = fract(p3 * HASHSCALE3);
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xx+p3.yz)*p3.zy);
}

//----------------------------------------------------------------------------------------
//  3 out, 1 in...
vec3 hash31(float p)
{
   vec3 p3 = fract(vec3(p) * HASHSCALE3);
   p3 += dot(p3, p3.yzx+19.19);
   return fract((p3.xxy+p3.yzz)*p3.zyx); 
}


//----------------------------------------------------------------------------------------
///  3 out, 2 in...
vec3 hash32(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
    p3 += dot(p3, p3.yxz+19.19);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

//----------------------------------------------------------------------------------------
///  3 out, 3 in...
vec3 hash33(vec3 p3)
{
	p3 = fract(p3 * HASHSCALE3);
    p3 += dot(p3, p3.yxz+19.19);
    return fract((p3.xxy + p3.yxx)*p3.zyx);

}

//----------------------------------------------------------------------------------------
// 4 out, 1 in...
vec4 hash41(float p)
{
	vec4 p4 = fract(vec4(p) * HASHSCALE4);
    p4 += dot(p4, p4.wzxy+19.19);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);
    
}

//----------------------------------------------------------------------------------------
// 4 out, 2 in...
vec4 hash42(vec2 p)
{
	vec4 p4 = fract(vec4(p.xyxy) * HASHSCALE4);
    p4 += dot(p4, p4.wzxy+19.19);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);

}

//----------------------------------------------------------------------------------------
// 4 out, 3 in...
vec4 hash43(vec3 p)
{
	vec4 p4 = fract(vec4(p.xyzx)  * HASHSCALE4);
    p4 += dot(p4, p4.wzxy+19.19);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);
}

//----------------------------------------------------------------------------------------
// 4 out, 4 in...
vec4 hash44(vec4 p4)
{
	p4 = fract(p4  * HASHSCALE4);
    p4 += dot(p4, p4.wzxy+19.19);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);
}


// By David Hoskins, May 2014. @ https://www.shadertoy.com/view/4dsXWn
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

float Noise(in vec3 p)
{
    vec3 i = floor(p);
        vec3 f = fract(p); 
        f *= f * (3.0-2.0*f);

    return mix(
                mix(mix(hash13(i + vec3(0.,0.,0.)), hash13(i + vec3(1.,0.,0.)),f.x),
                        mix(hash13(i + vec3(0.,1.,0.)), hash13(i + vec3(1.,1.,0.)),f.x),
                        f.y),
                mix(mix(hash13(i + vec3(0.,0.,1.)), hash13(i + vec3(1.,0.,1.)),f.x),
                        mix(hash13(i + vec3(0.,1.,1.)), hash13(i + vec3(1.,1.,1.)),f.x),
                        f.y),
                f.z);
}

const mat3 m = mat3( 0.00,  0.80,  0.60,
                    -0.80,  0.36, -0.48,
                    -0.60, -0.48,  0.64 ) * 1.7;

float FBM( vec3 p )
{
    float f;

        f = 0.5000 * Noise(p); p = m*p;
        f += 0.2500 * Noise(p); p = m*p;
        f += 0.1250 * Noise(p); p = m*p;
        f += 0.0625   * Noise(p); p = m*p;
        f += 0.03125  * Noise(p); p = m*p;
        f += 0.015625 * Noise(p);
    return f;
}


`;
export default fragmentShader;