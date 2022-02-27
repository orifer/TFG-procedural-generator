// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
// https://thebookofshaders.com/

const fragment = /* glsl */ `





// FRACTIONAL BROWNIAN MOTION NOISE
//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec4 mod289(vec4 x) {
return x - floor(x * (1.0 / 289.0)) * 289.0;
}

float mod289(float x) {
return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
return mod289(((x*34.0)+1.0)*x);
}

float permute(float x) {
return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r)
{
return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip)
{
const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
vec4 p,s;

p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
s = vec4(lessThan(p, vec4(0.0)));
p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

return p;
}

// (sqrt(5) - 1)/4 = F4, used once below
#define F4 0.309016994374947451

float snoise(vec4 v)
{
const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
0.276393202250021,  // 2 * G4
0.414589803375032,  // 3 * G4
-0.447213595499958); // -1 + 4 * G4

// First corner
vec4 i  = floor(v + dot(v, vec4(F4)) );
vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
vec4 i0;
vec3 isX = step( x0.yzw, x0.xxx );
vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
i0.x = isX.x + isX.y + isX.z;
i0.yzw = 1.0 - isX;
//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
i0.y += isYZ.x + isYZ.y;
i0.zw += 1.0 - isYZ.xy;
i0.z += isYZ.z;
i0.w += 1.0 - isYZ.z;

// i0 now contains the unique values 0,1,2,3 in each channel
vec4 i3 = clamp( i0, 0.0, 1.0 );
vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

//  x0 = x0 - 0.0 + 0.0 * C.xxxx
//  x1 = x0 - i1  + 1.0 * C.xxxx
//  x2 = x0 - i2  + 2.0 * C.xxxx
//  x3 = x0 - i3  + 3.0 * C.xxxx
//  x4 = x0 - 1.0 + 4.0 * C.xxxx
vec4 x1 = x0 - i1 + C.xxxx;
vec4 x2 = x0 - i2 + C.yyyy;
vec4 x3 = x0 - i3 + C.zzzz;
vec4 x4 = x0 + C.wwww;

// Permutations
i = mod289(i);
float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
vec4 j1 = permute( permute( permute( permute (
i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
+ i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
+ i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
+ i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.
vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

vec4 p0 = grad4(j0,   ip);
vec4 p1 = grad4(j1.x, ip);
vec4 p2 = grad4(j1.y, ip);
vec4 p3 = grad4(j1.z, ip);
vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
p0 *= norm.x;
p1 *= norm.y;
p2 *= norm.z;
p3 *= norm.w;
p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
m0 = m0 * m0;
m1 = m1 * m1;
return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
+ dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

}

///////////////////////////////////////////////////////////////////////////////





float PI = 3.14159265358979323846264338;
uniform float time; // Time in seconds since load
uniform float progress;
uniform vec2 u_resolution; // Canvas size (width,height)
uniform vec2 u_mouse;    // mouse position in screen pixels


float HASHSCALE1 = 443.8975;
vec3 HASHSCALE3 = vec3(.1031, .1030, .0973);

///  3 out, 3 in...
vec3 hash33(vec3 p3) {
    p3 = fract(p3 * HASHSCALE3);
    p3 += dot(p3, p3.yxz+19.19);
    return fract((p3.xxy + p3.yxx)*p3.zyx);
}

//  1 out, 3 in...
float hash13(vec3 p3)
{
        p3  = fract(p3 * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

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

float FBM( vec3 p )
{

    mat3 m = mat3( 0.00,  0.80,  0.60,
                    -0.80,  0.36, -0.48,
                    -0.60, -0.48,  0.64 ) * 1.7;

    float f;

        f = 0.5000 * Noise(p); p = m*p;
        f += 0.2500 * Noise(p); p = m*p;
        f += 0.1250 * Noise(p); p = m*p;
        f += 0.0625   * Noise(p); p = m*p;
        f += 0.03125  * Noise(p); p = m*p;
        f += 0.015625 * Noise(p);
    return f;
}

float cratersHeightMap(vec2 p) {
    float height = 0.;
    for (float i = 0.; i < 5.; i++) {
        float c = craters(vec3(0.4 * pow(2.2, i) * p, 1.0));
        float noise = 0.4 * exp(-3. * c) * FBM( vec3(10. * p, 1.0) );
        float w = clamp(3. * pow(0.4, i), 0., 1.);
        height += w * (c + noise);
    }
    return pow(height, 3.);
}




// 2d Vertex position
varying vec2 vUv;

// Vertex position
varying vec3 vPosition;


void main() {
    vec3 baseColor = vec3(0.3, 0.3, 0.3);

    // float noisy = snoise(vec4(vPosition*5. , 1.0));
    float noisy = cratersHeightMap(vUv*50.);
    vec3 noiseColor = vec3(noisy,noisy,noisy);
    
    vec3 color = mix(baseColor, noiseColor, 0.5);
    gl_FragColor = vec4(color,1.0);
}



`;
export default fragment;
