import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
import textureMapFrag from '../shaders/textureMapFrag.js'
import textureMapVert from '../shaders/textureMapVert.js'
import Map from './Map.js'

class TextureMap extends Map {

  constructor() {
    super();
    this.setup();
    super.setup();
  }

  setup() {
    const uniforms = {
      u_resolution: { value: { x: null, y: null } },
      u_time: { value: 0 },
      u_mouse: { value: { x: null, y: null } },
    }

    this.mat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: textureMapVert,
      fragmentShader: textureMapFrag,
      transparent: true,
      depthWrite: false
    });

  }

  render(props) {
    this.mat.uniforms.u_time.value = props.time;
    this.mat.needsUpdate = true;

    super.render(props);
  }

}

export default TextureMap;
