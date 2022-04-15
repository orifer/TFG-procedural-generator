// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
import COMMON from '../../shaders/textureMap/commonFrag.js';

const fragmentShader = COMMON + /* glsl */ `


// ################################################################
// ||                   VARIABLES & QUALIFIERS                   ||
// ################################################################


varying vec2 vUv; // The "coordinates" in UV mapping representation
uniform float uTime; // Time in seconds since load
uniform vec2 uResolution; // Canvas size (width,height)

// Buffers
uniform sampler2D iChannel0;

///////////////////////////////////////////////////////////////////////////////

#define buf(p) textureLod(iChannel0,(p)/uResolution.xy,0.)


// ################################################################
// ||                           MAIN                             ||
// ################################################################


void main() {
    vec2 p = vUv * uResolution.xy;
    float height = MAP_HEIGHT( buf(p).z );
    gl_FragColor =  vec4(height,height,height,1.0);
}


`; export default fragmentShader;