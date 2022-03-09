// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
const vertex = /* glsl */ `



varying vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}




`;
export default vertex;