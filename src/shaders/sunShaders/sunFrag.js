// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
const fragShader = /* glsl */ `

// ----------------------------------------------------------------------------

varying vec2 vUv; // The "coordinates" in UV mapping representation
varying float distToCamera;

varying vec4 vCenter;
uniform float uSize;

// ----------------------------------------------------------------------------

// Brightness to color
vec3 brightnessToColor(float b) {
    b *= 0.25;

    return (vec3(b, b*b, b*b*b*b)/0.25)*0.5; // orange
    // return (vec3( b*b*b, b*b, b)/0.25)*0.5; // blue
    // return (vec3(b, b*b, b*b)/0.25)*0.5; // red
}


void main() {    
    float radial = distToCamera - vCenter.w;
    radial *= (2./uSize);

    float brightness = 1. + (radial * 1.2);
    
    gl_FragColor.rgb = brightnessToColor(brightness)*radial;
    gl_FragColor.a = radial;
}

`;
export default fragShader;