// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
const vertShader = /* glsl */ `

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying mat3 vNormalMatrix;
varying mat4 vModelViewMatrix;
varying mat4 vModelMatrix;
varying mat4 vViewMatrix;
varying vec3 vCameraPosition;

varying float distToCamera;

float PI = 3.14159265358979323846264338;

void main() {
	vUv = uv;
	vPosition = position;
	vNormal = normal;
	vNormalMatrix = normalMatrix;
	vModelViewMatrix = modelViewMatrix;
	vModelMatrix = modelMatrix;
	vViewMatrix = viewMatrix;
	vCameraPosition = cameraPosition;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    distToCamera = gl_Position.w;
}

`;
export default vertShader;