import * as THREE from 'three';
import fragShader from '../../shaders/heightMap/heightMapFrag.js'
import vertShader from '../../shaders/vertexShader.js'
import Map from './Map.js'

class HeightMap extends Map {

  constructor() {
    super();
    this.setup();
    super.setup();
  }

  setup() {
    const uniforms = {
      resolution: {type: "f", value: 0},
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
    this.mat.uniforms.resolution.value = props.resolution;
    this.mat.needsUpdate = true;
    super.render(props);
  }

}

export default HeightMap;
