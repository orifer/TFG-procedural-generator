// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram

const textureMapVert = /* glsl */ `


uniform float time; // Time in seconds since load
varying vec2 vUv; // 2d Vertex position
varying vec3 vPosition; // Vertex position
uniform vec2 pixels;
float PI = 3.14159265358979323846264338;

void main() {

	// 2d Vertex position
	vUv = uv;

	// 3d Vertex position
	vPosition = position;
	
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}



`;
export default textureMapVert;