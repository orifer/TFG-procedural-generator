// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
const fragShader = /* glsl */ `

// ----------------------------------------------------------------------------

float PI = 3.14159265358979323846264338;
varying vec2 vUv; // The "coordinates" in UV mapping representation
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vCameraPosition;
varying mat3 vNormalMatrix;
varying mat4 vModelViewMatrix;
varying mat4 vModelMatrix;
varying mat4 vViewMatrix;
varying float distToCamera;


uniform float size;

// ----------------------------------------------------------------------------

// Brightness to color
vec3 brightnessToColor(float b) {
    b *= 0.25;
    return (vec3(b, b*b, b*b*b*b)/0.25)*0.8;
}


void main() {
    // vec4 P = (vModelViewMatrix) * vec4(vPosition,0.2);
    
    float radial = 2.5-distToCamera;
    radial *= radial;

    float brightness = 1. + radial * 0.2;
    
    gl_FragColor.rgb = brightnessToColor(brightness)*radial;
    gl_FragColor.a = radial;
}


// Caso 2: Problema al zoom pero girar bien
// void main() {
//     // vec4 P = (vModelViewMatrix) * vec4(vPosition,0.2);
    
//     float radial = 2.5-distToCamera;
//     radial *= radial;

//     float brightness = 1. + radial * 0.2;
    
//     gl_FragColor.rgb = brightnessToColor(brightness)*radial;
//     gl_FragColor.a = radial;
// }


// Caso 1: Problema al girar pero zoom bien
// void main() {
//     float radial = -vPosition.z;
//     radial *= 2./size;

//     float brightness = 1. + radial * 0.83;
    
//     gl_FragColor.rgb = brightnessToColor(brightness)*radial;
//     gl_FragColor.a = radial;
// }




`;
export default fragShader;