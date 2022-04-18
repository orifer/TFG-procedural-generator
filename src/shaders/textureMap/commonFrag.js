// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
// Inspired & based on David A. Robert's work <https://davidar.io>

const fragmentShader = /* glsl */ `


// ################################################################
// ||                   VARIABLES & QUALIFIERS                   ||
// ################################################################


#define PI 3.14159265359

// Events 
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

// https://www.shadertoy.com/view/4djSRW
// Trying to find a Hash function that is the same on ALL systens
// and doesn't rely on trigonometry functions that change accuracy 
// depending on GPU. 
// It appears to be the same speed, but I suppose that depends.
// * Update: It still goes wrong eventually!

#define ITERATIONS 4

// *** Use this for integer stepped ranges, ie Value-Noise/Perlin noise functions.
#define HASHSCALE1 .1031
#define HASHSCALE3 vec3(.1031, .1030, .0973)
#define HASHSCALE4 vec4(.1031, .1030, .0973, .1099)

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


// Written by GLtracy
// https://www.shadertoy.com/view/lslXDr

// ray intersects sphere
// e = -b +/- sqrt( b^2 - c )
vec2 ray_vs_sphere( vec3 p, vec3 dir, float r ) {
	float b = dot( p, dir );
	float c = dot( p, p ) - r * r;
	
	float d = b * b - c;
	if ( d < 0.0 ) {
		return vec2( 1e4, -1e4 );
	}
	d = sqrt( d );
	
	return vec2( -b - d, -b + d );
}

// Mie
// g : ( -0.75, -0.999 )
//      3 * ( 1 - g^2 )               1 + c^2
// F = ----------------- * -------------------------------
//      8pi * ( 2 + g^2 )     ( 1 + g^2 - 2 * g * c )^(3/2)
float phase_mie( float g, float c, float cc ) {
	float gg = g * g;
	
	float a = ( 1.0 - gg ) * ( 1.0 + cc );

	float b = 1.0 + gg - 2.0 * g * c;
	b *= sqrt( b );
	b *= 2.0 + gg;	
	
	return ( 3.0 / 8.0 / PI ) * a / b;
}

// Rayleigh
// g : 0
// F = 3/16PI * ( 1 + c^2 )
float phase_ray( float cc ) {
	return ( 3.0 / 16.0 / PI ) * ( 1.0 + cc );
}

// scatter const
const float R_INNER = 1.0;
//const float R = R_INNER + 0.5;

const int NUM_OUT_SCATTER = 8;
const int NUM_IN_SCATTER = 80;

float density( vec3 p, float ph ) {
	return exp( -max( length( p ) - R_INNER, 0.0 ) / ATMOSPHERE_THICKNESS / ph );
}

float optic( vec3 p, vec3 q, float ph ) {
	vec3 s = ( q - p ) / float( NUM_OUT_SCATTER );
	vec3 v = p + s * 0.5;
	
	float sum = 0.0;
	for ( int i = 0; i < NUM_OUT_SCATTER; i++ ) {
		sum += density( v, ph );
		v += s;
	}
	sum *= length( s );
	
	return sum;
}

vec3 in_scatter( vec3 o, vec3 dir, vec2 e, vec3 l ) {
	const float ph_ray = 0.05;
    const float ph_mie = 0.02;
    
    const vec3 k_ray = vec3( 3.8, 13.5, 33.1 );
    const vec3 k_mie = vec3( 21.0 );
    const float k_mie_ex = 1.1;
    
	vec3 sum_ray = vec3( 0.0 );
    vec3 sum_mie = vec3( 0.0 );
    
    float n_ray0 = 0.0;
    float n_mie0 = 0.0;
    
	float len = ( e.y - e.x ) / float( NUM_IN_SCATTER );
    vec3 s = dir * len;
	vec3 v = o + dir * ( e.x + len * 0.5 );
    
    for ( int i = 0; i < NUM_IN_SCATTER; i++, v += s ) {   
		float d_ray = density( v, ph_ray ) * len;
        float d_mie = density( v, ph_mie ) * len;
        
        n_ray0 += d_ray;
        n_mie0 += d_mie;
        
#if 0
        vec2 e = ray_vs_sphere( v, l, R_INNER );
        e.x = max( e.x, 0.0 );
        if ( e.x < e.y ) {
           continue;
        }
#endif
        
        vec2 f = ray_vs_sphere( v, l, R_INNER + ATMOSPHERE_THICKNESS );
		vec3 u = v + l * f.y;
        
        float n_ray1 = optic( v, u, ph_ray );
        float n_mie1 = optic( v, u, ph_mie );
		
        vec3 att = exp( - ( n_ray0 + n_ray1 ) * k_ray - ( n_mie0 + n_mie1 ) * k_mie * k_mie_ex );
        
		sum_ray += d_ray * att;
        sum_mie += d_mie * att;
	}
	
	float c  = dot( dir, -l );
	float cc = c * c;
    vec3 scatter =
        sum_ray * k_ray * phase_ray( cc ) +
     	sum_mie * k_mie * phase_mie( -0.78, c, cc );
    
	
	return 10.0 * scatter;
}

// angle : pitch, yaw
mat3 rot3xy( vec2 angle ) {
	vec2 c = cos( angle );
	vec2 s = sin( angle );
	
	return mat3(
		c.y      ,  0.0, -s.y,
		s.y * s.x,  c.x,  c.y * s.x,
		s.y * c.x, -s.x,  c.y * c.x
	);
}

// ray direction
vec3 ray_dir( float fov, vec2 size, vec2 pos ) {
	vec2 xy = pos - size * 0.5;

	float cot_half_fov = tan( radians( 90.0 - fov * 0.5 ) );	
	float z = size.y * 0.5 * cot_half_fov;
	
	return normalize( vec3( xy, -z ) );
}


`;
export default fragmentShader;