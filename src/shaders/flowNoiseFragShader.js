// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
const flowNoiseFragShader = /* glsl */ `


// import noise from 'glsl-noise/classic/3d'

varying vec2 vUv;
uniform int index;
uniform float seed;
uniform float resolution;
uniform float res1;
uniform float res2;
uniform float resMix;
uniform float mixScale;
uniform float doesRidged;
const int octaves = 16;

// #define M_PI 3.1415926535897932384626433832795;



















/* https://www.shadertoy.com/view/XsX3zB
 *
 * The MIT License
 * Copyright © 2013 Nikita Miropolskiy
 * 
 * ( license has been changed from CCA-NC-SA 3.0 to MIT
 *
 *   but thanks for attributing your source code when deriving from this sample 
 *   with a following link: https://www.shadertoy.com/view/XsX3zB )
 *
 * ~
 * ~ if you're looking for procedural noise implementation examples you might 
 * ~ also want to look at the following shaders:
 * ~ 
 * ~ Noise Lab shader by candycat: https://www.shadertoy.com/view/4sc3z2
 * ~
 * ~ Noise shaders by iq:
 * ~     Value    Noise 2D, Derivatives: https://www.shadertoy.com/view/4dXBRH
 * ~     Gradient Noise 2D, Derivatives: https://www.shadertoy.com/view/XdXBRH
 * ~     Value    Noise 3D, Derivatives: https://www.shadertoy.com/view/XsXfRH
 * ~     Gradient Noise 3D, Derivatives: https://www.shadertoy.com/view/4dffRH
 * ~     Value    Noise 2D             : https://www.shadertoy.com/view/lsf3WH
 * ~     Value    Noise 3D             : https://www.shadertoy.com/view/4sfGzS
 * ~     Gradient Noise 2D             : https://www.shadertoy.com/view/XdXGW8
 * ~     Gradient Noise 3D             : https://www.shadertoy.com/view/Xsl3Dl
 * ~     Simplex  Noise 2D             : https://www.shadertoy.com/view/Msf3WH
 * ~     Voronoise: https://www.shadertoy.com/view/Xd23Dh
 * ~ 
 *
 */

/* discontinuous pseudorandom uniformly distributed in [-0.5, +0.5]^3 */
vec3 random3(vec3 c) {
	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
	vec3 r;
	r.z = fract(512.0*j);
	j *= .125;
	r.x = fract(512.0*j);
	j *= .125;
	r.y = fract(512.0*j);
	return r-0.5;
}

/* skew constants for 3d simplex functions */
const float F3 =  0.3333333;
const float G3 =  0.1666667;

/* 3d simplex noise */
float simplex3d(vec3 p) {
	 /* 1. find current tetrahedron T and it's four vertices */
	 /* s, s+i1, s+i2, s+1.0 - absolute skewed (integer) coordinates of T vertices */
	 /* x, x1, x2, x3 - unskewed coordinates of p relative to each of T vertices*/
	 
	 /* calculate s and x */
	 vec3 s = floor(p + dot(p, vec3(F3)));
	 vec3 x = p - s + dot(s, vec3(G3));
	 
	 /* calculate i1 and i2 */
	 vec3 e = step(vec3(0.0), x - x.yzx);
	 vec3 i1 = e*(1.0 - e.zxy);
	 vec3 i2 = 1.0 - e.zxy*(1.0 - e);
	 	
	 /* x1, x2, x3 */
	 vec3 x1 = x - i1 + G3;
	 vec3 x2 = x - i2 + 2.0*G3;
	 vec3 x3 = x - 1.0 + 3.0*G3;
	 
	 /* 2. find four surflets and store them in d */
	 vec4 w, d;
	 
	 /* calculate surflet weights */
	 w.x = dot(x, x);
	 w.y = dot(x1, x1);
	 w.z = dot(x2, x2);
	 w.w = dot(x3, x3);
	 
	 /* w fades from 0.6 at the center of the surflet to 0.0 at the margin */
	 w = max(0.6 - w, 0.0);
	 
	 /* calculate surflet components */
	 d.x = dot(random3(s), x);
	 d.y = dot(random3(s + i1), x1);
	 d.z = dot(random3(s + i2), x2);
	 d.w = dot(random3(s + 1.0), x3);
	 
	 /* multiply d by w^4 */
	 w *= w;
	 w *= w;
	 d *= w;
	 
	 /* 3. return the sum of the four surflets */
	 return dot(d, vec4(52.0));
}












vec3 getSphericalCoord(int index, float x, float y, float width) {
	width /= 2.0;
	x -= width;
	y -= width;
	vec3 coord = vec3(0.0, 0.0, 0.0);

	if (index == 0) {coord.x=width; coord.y=-y; coord.z=-x;}
	else if (index == 1) {coord.x=-width; coord.y=-y; coord.z=x;}
	else if (index == 2) {coord.x=x; coord.y=width; coord.z=y;}
	else if (index == 3) {coord.x=x; coord.y=-width; coord.z=-y;}
	else if (index == 4) {coord.x=x; coord.y=-y; coord.z=width;}
	else if (index == 5) {coord.x=-x; coord.y=-y; coord.z=-width;}

	return normalize(coord);
}

float simplexRidged(vec3 pos, float seed) {
	float n = simplex3d(vec3(pos + seed));
	n = (n + 1.0) * 0.5;
	n = 2.0 * (0.5 - abs(0.5 - n));
	return n;
}

float simplex(vec3 pos, float seed) {
	float n = simplex3d(vec3(pos + seed));
	return (n + 1.0) * 0.5;
}

float baseNoise(vec3 pos, float frq, float seed ) {
	float amp = 0.5;

	float n = 0.0;
	float gain = 1.0;
	for(int i=0; i<octaves; i++) {
		n +=  simplex(vec3(pos.x*gain/frq, pos.y*gain/frq, pos.z*gain/frq), seed+float(i)*10.0) * amp/gain;
		gain *= 2.0;
	}

	// increase contrast
	n = ( (n - 0.5) * 2.0 ) + 0.5;

	return n;
}

float ridgedNoise(vec3 pos, float frq, float seed) {
	float amp = 0.5;
	float n = 0.0;
	float gain = 1.0;
	for(int i=0; i<octaves; i++) {
		n +=  simplexRidged(vec3(pos.x*gain/frq, pos.y*gain/frq, pos.z*gain/frq), seed+float(i)*10.0) * amp/gain;
		gain *= 2.0;
	}

	n = pow(n, 4.0);
	return n;
}

float invRidgedNoise(vec3 pos, float frq, float seed) {

	float amp = 0.5;

	float n = 0.0;
	float gain = 1.0;
	for(int i=0; i<octaves; i++) {
		n +=  simplexRidged(vec3(pos.x*gain/frq, pos.y*gain/frq, pos.z*gain/frq), seed+float(i)*10.0) * amp/gain;
		gain *= 2.0;
	}

	n = pow(n, 4.0);
	n = 1.0 - n;

	return n;
}

float cloud(vec3 pos, float seed) {
	float n = simplex3d(vec3(pos + seed));
	// n = sin(n*4.0 * cos(n*2.0));
	n = sin(n*5.0);
	// n = abs(sin(n*5.0));
	// n = 1.0 - n;

	n = n*0.5 + 0.5;
	// n = 1.0-n;
	// n = n*1.2;
	// n = 1.0-n;

	return n;
}

float cloudNoise(vec3 pos, float frq, float seed) {

	float amp = 0.5;

	float n = 0.0;
	float gain = 1.0;
	for(int i=0; i<octaves; i++) {
		n +=  cloud(vec3(pos.x*gain/frq, pos.y*gain/frq, pos.z*gain/frq), seed+float(i)*10.0) * amp/gain;
		gain *= 2.0;
	}

	// n = pow(n, 5.0);

	n = 1.0-n;
	n = pow(n, 1.0);
	n = 1.0-n;

	return n;
}

float PI = 3.14159265358979323846264338;
vec3 planeToCartesian(vec2 vUv) {
    float scale = 1.5;
    float lat = 180. * vUv.y - 90.;
    float lon = 360. * vUv.x;
    
    return scale * vec3( sin(lon*PI/180.) * cos(lat*PI/180.), sin(lat*PI/180.), cos(lon*PI/180.) * cos(lat*PI/180.));
}

void main() {
	float x = vUv.x;
	float y = 1.0 - vUv.y;
	
	// Modify the vertex position to be projected into a sphere
    vec3 sphericalCoord = planeToCartesian(vUv);
	// vec3 sphericalCoord = getSphericalCoord(index, x*resolution, y*resolution, resolution);

	float sub1, sub2, sub3, n;

	float resMod = 1.0; // overall res magnification
	float resMod2 = mixScale; // minimum res mod

	if (doesRidged == 0.0) {
		sub1 = cloudNoise(sphericalCoord, res1*resMod, seed+11.437);
		sub2 = cloudNoise(sphericalCoord, res2*resMod, seed+93.483);
		sub3 = cloudNoise(sphericalCoord, resMix*resMod, seed+23.675);
		n = cloudNoise(sphericalCoord + vec3((sub1/sub3)*0.1), resMod2+sub2, seed+78.236);
	}
	else if (doesRidged == 1.0) {
		sub1 = ridgedNoise(sphericalCoord, res1*resMod, seed+83.706);
		sub2 = ridgedNoise(sphericalCoord, res2*resMod, seed+29.358);
		sub3 = ridgedNoise(sphericalCoord, resMix*resMod, seed+53.041);
		n = ridgedNoise(sphericalCoord + vec3((sub1/sub3)*0.1), resMod2+sub2, seed+34.982);
	}
	else  if (doesRidged == 2.0) {
		sub1 = invRidgedNoise(sphericalCoord, res1*resMod, seed+49.684);
		sub2 = invRidgedNoise(sphericalCoord, res2*resMod, seed+136.276);
		sub3 = invRidgedNoise(sphericalCoord, resMix*resMod, seed+3.587);
		n = invRidgedNoise(sphericalCoord + vec3((sub1/sub3)*0.1), resMod2+sub2, seed+33.321);
	}
	else {
		sub1 = baseNoise(sphericalCoord, res1*resMod, seed+52.284);
		sub2 = baseNoise(sphericalCoord, res2*resMod, seed+137.863);
		sub3 = baseNoise(sphericalCoord, resMix*resMod, seed+37.241);
		float alpha = sub1*3.14*2.0;
		float beta = sub2*3.14*2.0;
		float fx = cos(alpha)*cos(beta);
		float fz = sin(alpha)*cos(beta);
		float fy = sin(beta);
		n = baseNoise(sphericalCoord + (vec3(fx,fy,fz) * sub3), 1.0, seed+28.634);
	}

	gl_FragColor = vec4(vec3(n), 1.0);


}




`;
export default flowNoiseFragShader;
