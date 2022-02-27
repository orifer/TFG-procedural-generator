// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram

const vertex = /* glsl */ `


uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
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
export default vertex;