import * as THREE from 'three';
import vertShader from '../../shaders/vertexShader.js'
import fragShader from '../../shaders/normalMap/normalMapFrag.js'
import Map from './Map.js'

class NormalMap extends Map {

  constructor() {
    super();
    this.setup();
    super.setup();
  }

  setup() {
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        resolution: {type: "f", value: 0},
        heightMap: {type: "t", value: new THREE.Texture()},
        textureMap: {type: "t", value: new THREE.Texture()}
      },
      vertexShader: vertShader,
      fragmentShader: fragShader,
      transparent: true,
      depthWrite: false
    });
  }

  render(props) {
    this.mat.uniforms.resolution.value = props.resolution;
    this.mat.uniforms.heightMap.value = props.heightMap;
    this.mat.uniforms.textureMap.value = props.textureMap;
    this.mat.needsUpdate = true;

    super.render(props);
  }

}

export default NormalMap;
