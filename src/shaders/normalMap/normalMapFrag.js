// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram

const fragShader = /* glsl */ `

varying vec2 vUv;
uniform float resolution;
uniform sampler2D heightMap;
uniform sampler2D textureMap;

float getBrightness(vec4 color) {
	float bright = 1.0 - (0.2126*color.r + 0.7152*color.g + 0.0722*color.b);
	return bright;
}

void main() {

	float x = vUv.x;
	float y = vUv.y;
	float pixelSize = 1.0 / resolution;

  	// float strength = scale.Y / 16;
  	float strength = 0.8;

	float level = texture2D(heightMap, vec2(x, y)).r;

	float tl = getBrightness(texture2D(textureMap, vec2(x-pixelSize, y-pixelSize)));
	float l = getBrightness(texture2D(textureMap, vec2(x-pixelSize, y)));
	float bl = getBrightness(texture2D(textureMap, vec2(x-pixelSize, y+pixelSize)));
	float b = getBrightness(texture2D(textureMap, vec2(x, y+pixelSize)));
	float br = getBrightness(texture2D(textureMap, vec2(x+pixelSize, y+pixelSize)));
	float r = getBrightness(texture2D(textureMap, vec2(x+pixelSize, y)));
	float tr = getBrightness(texture2D(textureMap, vec2(x+pixelSize, y-pixelSize)));
	float t = getBrightness(texture2D(textureMap, vec2(x, y-pixelSize)));


	float tl2 = getBrightness(texture2D(heightMap, vec2(x-pixelSize, y-pixelSize)));
	float l2 = getBrightness(texture2D(heightMap, vec2(x-pixelSize, y)));
	float bl2 = getBrightness(texture2D(heightMap, vec2(x-pixelSize, y+pixelSize)));
	float b2 = getBrightness(texture2D(heightMap, vec2(x, y+pixelSize)));
	float br2 = getBrightness(texture2D(heightMap, vec2(x+pixelSize, y+pixelSize)));
	float r2 = getBrightness(texture2D(heightMap, vec2(x+pixelSize, y)));
	float tr2 = getBrightness(texture2D(heightMap, vec2(x+pixelSize, y-pixelSize)));
	float t2 = getBrightness(texture2D(heightMap, vec2(x, y-pixelSize)));

	float ratio = 1.0;

	tl = mix(tl, tl2, ratio);
	l = mix(l, l2, ratio);
	bl = mix(bl, bl2, ratio);
	b = mix(b, b2, ratio);
	br = mix(br, br2, ratio);
	r = mix(r, r2, ratio);
	tr = mix(tr, tr2, ratio);
	t = mix(t, t2, ratio);

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


`;
export default fragShader;


