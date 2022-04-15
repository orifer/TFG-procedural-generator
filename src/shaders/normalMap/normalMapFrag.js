// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
const fragShader = /* glsl */ `


// ################################################################
// ||                   VARIABLES & QUALIFIERS                   ||
// ################################################################


varying vec2 vUv; // The "coordinates" in UV mapping representation
uniform vec2 uResolution; // Canvas size (width,height)
uniform sampler2D uHeightMap; // Height map texture


// ################################################################
// ||                         FUNCTIONS                          ||
// ################################################################


float getBrightness(vec4 color) {
	float bright = 1.0 - (0.2126*color.r + 0.7152*color.g + 0.0722*color.b);
	return bright;
}


// ################################################################
// ||                           MAIN                             ||
// ################################################################


void main() {

	float x = vUv.x;
	float y = vUv.y;
	float pixelSize = 1.0 / uResolution.x;

  	// float strength = scale.Y / 16;
  	float strength = 0.8;

	float tl = getBrightness(texture2D(uHeightMap, vec2(x-pixelSize, y-pixelSize)));
	float l = getBrightness(texture2D(uHeightMap, vec2(x-pixelSize, y)));
	float bl = getBrightness(texture2D(uHeightMap, vec2(x-pixelSize, y+pixelSize)));
	float b = getBrightness(texture2D(uHeightMap, vec2(x, y+pixelSize)));
	float br = getBrightness(texture2D(uHeightMap, vec2(x+pixelSize, y+pixelSize)));
	float r = getBrightness(texture2D(uHeightMap, vec2(x+pixelSize, y)));
	float tr = getBrightness(texture2D(uHeightMap, vec2(x+pixelSize, y-pixelSize)));
	float t = getBrightness(texture2D(uHeightMap, vec2(x, y-pixelSize)));

	// Compute dx using Sobel:
	//           -1 0 1
	//           -2 0 2
	//           -1 0 1
	float dX = tr + 2.0 * r + br - tl - 2.0 * l - bl;

	// Compute dy using Sobel:
	//           -1 -2 -1
	//            0  0  0
	//            1  2  1
	float dY = bl + 2.0 * b + br - tl - 2.0 * t - tr;


	vec3 N = vec3(dX, dY, 1.0 / strength);

	normalize(N);
	N = N * 0.5 + 0.5;

  	gl_FragColor = vec4(N, 1.0);
}


`; export default fragShader;