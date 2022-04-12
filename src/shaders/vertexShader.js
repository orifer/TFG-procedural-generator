// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
const vertexShader = /* glsl */ `


varying vec2 vUv; // 2d Vertex position
varying vec3 vPosition; // Vertex position

void main() {

	// 2d Vertex position
	vUv = uv;

	// 3d Vertex position
	vPosition = position;
	
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}



`;
export default vertexShader;