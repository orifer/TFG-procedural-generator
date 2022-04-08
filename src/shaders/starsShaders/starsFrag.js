// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
const fragShader = /* glsl */ `

// ----------------------------------------------------------------------------

float PI = 3.14159265358979323846264338;
varying vec2 vUv; // The "coordinates" in UV mapping representation

uniform vec2 u_resolution;

// ----------------------------------------------------------------------------

// A hash function
float hash( const in float n ) {
	return fract(sin(n)*4378.5453);
}

// 3D Perlin noise
float pnoise(in vec3 o) {
	vec3 p = floor(o);
	vec3 fr = fract(o);
		
	float n = p.x + p.y*57.0 + p.z * 1009.0;

	float a = hash(n+  0.0);
	float b = hash(n+  1.0);
	float c = hash(n+ 57.0);
	float d = hash(n+ 58.0);
	
	float e = hash(n+  0.0 + 1009.0);
	float f = hash(n+  1.0 + 1009.0);
	float g = hash(n+ 57.0 + 1009.0);
	float h = hash(n+ 58.0 + 1009.0);
	
	
	vec3 fr2 = fr * fr;
	vec3 fr3 = fr2 * fr;
	
	vec3 t = 3.0 * fr2 - 2.0 * fr3;
	
	float u = t.x;
	float v = t.y;
	float w = t.z;

	float res1 = a + (b-a)*u +(c-a)*v + (a-b+d-c)*u*v;
	float res2 = e + (f-e)*u +(g-e)*v + (e-f+h-g)*u*v;
	
	float res = res1 * (1.0- w) + res2 * (w);
	
	return res;
}

float SmoothNoise( vec3 p ) {
    float f;
	mat3 m = mat3( 0.00,  0.80,  0.60,
				  -0.80,  0.36, -0.48,
				  -0.60, -0.48,  0.64 );
    f  = 0.5000*pnoise( p ); p = m*p*2.02;
    f += 0.2500*pnoise( p ); 
	
    return f * (1.0 / (0.5000 + 0.2500));
}

// Credits to uqone https://www.shadertoy.com/view/WdX3D4
vec3 getStars(in vec3 from, in vec3 dir, float power) {
	float scale = 1024.;
	float density = 16.;
	vec3 color = vec3(pow(SmoothNoise(dir*scale), density));
	return pow(color*2.25, vec3(power));
}


void main() {    
	vec2 uvo=vUv*2.-1.;
	uvo.y*=(u_resolution.y/u_resolution.x);

	vec3 dir=normalize(vec3(uvo,.8));
    dir = normalize(dir);
	
	vec3 from=vec3(0.0);
    vec3 colorStars=clamp(getStars(from, dir, 0.9), 0.0, 1.0);
	vec3 color=clamp(colorStars,vec3(0.0),vec3(1.0));
    color = pow(color, vec3(1.2));

    gl_FragColor = vec4(color,1.0);
}

`;
export default fragShader;