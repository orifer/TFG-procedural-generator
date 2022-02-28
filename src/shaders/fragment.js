// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
// https://thebookofshaders.com/

const fragment = /* glsl */ `



/*
################################
||                            ||
||  Variables and constants   ||
||                            ||
################################
*/

float PI = 3.14159265358979323846264338;

uniform float time; // Time in seconds since load
uniform vec2 u_resolution; // Canvas size (width,height)
uniform vec2 u_mouse;    // mouse position in screen pixels

varying vec2 vUv; // 2d Vertex position
varying vec3 vPosition; // Vertex position

// Hash scales //
float HASHSCALE1 = 443.8975;
vec3 HASHSCALE3 = vec3(.1031, .1030, .0973);

///////////////////////////////////////////////////////////////////////////////


// Hash function 3-3
// IN:  vec3
// OUT: vec3
vec3 hash33(vec3 p3) {
    p3 = fract(p3 * HASHSCALE3);
    p3 += dot(p3, p3.yxz+19.19);
    return fract((p3.xxy + p3.yxx)*p3.zyx);
}


//  Hash function 3-1
// IN:  vec3
// OUT: float
float hash13(vec3 p3) {
    p3  = fract(p3 * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}


// Generate craters
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


// Noise function
// By David Hoskins, May 2014. @ https://www.shadertoy.com/view/4dsXWn
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
float Noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p); 
    f *= f * (3.0-2.0*f);

    return mix(
        mix(mix(hash13(i + vec3(0.,0.,0.)), hash13(i + vec3(1.,0.,0.)),f.x),
        mix(hash13(i + vec3(0.,1.,0.)), hash13(i + vec3(1.,1.,0.)),f.x),f.y),
        mix(mix(hash13(i + vec3(0.,0.,1.)), hash13(i + vec3(1.,0.,1.)),f.x),
        mix(hash13(i + vec3(0.,1.,1.)), hash13(i + vec3(1.,1.,1.)),f.x),f.y),
        f.z
    );
}


// Fractal Brownian Motion noise function developed by Ken Perlin
float FBM( vec3 p ) {
    mat3 m = mat3( 0.00,  0.80,  0.60,
                -0.80,  0.36, -0.48,
                -0.60, -0.48,  0.64 ) * 1.7;

    float f;
    f += 0.5000   * Noise(p); p = m*p;
    f += 0.2500   * Noise(p); p = m*p;
    f += 0.1250   * Noise(p); p = m*p;
    f += 0.0625   * Noise(p); p = m*p;
    f += 0.03125  * Noise(p); p = m*p;
    f += 0.015625 * Noise(p);

    return f;
}


// Creates a heightmap of a terrain with craters
float cratersHeightMap(vec3 p) {
    float height = 0.;

    // Multiple passes various crater sizes
    for (float i = 0.; i < 5.; i++) {
        
        // Generate the craters
        float c = craters(vec3(0.4 * pow(2.2, i) * p));

        // Generate the FBM noise
        float noise = 0.4 * exp(-3. * c) * FBM( vec3(10. * p) );

        // Constrain a value to lie between two further values
        float x = 3. * pow(0.4, i);
        float min = 0.;
        float max = 1.;
        float w = clamp(x, min, max);

        // Mix and add the result
        height += w * (c + noise);
    }

    return pow(height, 3.);
}


// Transforms a 2D vertex coordinate to 3D cartesian coordinates given latitude and longitude
// This is used to deform and wrap a 2D plane into a 3D Sphere
vec3 planeToCartesian(vec2 vUv) {
    float scale = 1.5;
    float lat = 180. * vUv.y - 90.;
    float lon = 360. * vUv.x;
    
    return scale * vec3( sin(lon*PI/180.) * cos(lat*PI/180.), sin(lat*PI/180.), cos(lon*PI/180.) * cos(lat*PI/180.));
}


void main() {
    // Solid greyish color
    vec3 baseColor = vec3(0.3, 0.3, 0.3);

    // float noisy = snoise(vec4(vPosition*5. , 1.0));

    // Modify the vertex position to be projected into a sphere
    vec3 p = planeToCartesian(vUv);

    // Create a height map
    float noisy = cratersHeightMap(p);
    vec3 noiseColor = vec3(noisy,noisy,noisy);
    
    // Mix the base color with the generated one
    vec3 color = mix(baseColor, noiseColor, 0.1);
    
    gl_FragColor = vec4(color,1.0);
}





`;
export default fragment;
