// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
const vertShader = /* glsl */ `

varying vec2 vUv;
varying float distToCamera;
varying vec4 vCenter;

uniform vec3 uCenter;


void main() {
	vUv = uv;

	gl_Position = projectionMatrix * (modelViewMatrix * vec4(position, 1.0));
    distToCamera = gl_Position.w;
	vCenter = projectionMatrix * viewMatrix * vec4( uCenter, 1.0 );
}

`;
export default vertShader;