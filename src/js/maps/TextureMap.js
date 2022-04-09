import * as THREE from 'three';
import fragShader from '../../shaders/textureMap/textureMapFrag.js'
import vertShader from '../../shaders/textureMap/textureMapVert.js'
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
      vertexShader: vertShader,
      fragmentShader: fragShader,
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
