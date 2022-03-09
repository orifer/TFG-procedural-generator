import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
import vertShader from '../shaders/texture.js'
import flowNoiseFragShader from '../shaders/flowNoiseFragShader.js'
import Map from './Map.js'

class NoiseMap extends Map {

  constructor() {
    super();
    this.setup();
    super.setup();
    this.time = 0;
  }

  setup() {
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        time: {type: "i", value: 0},
        index: {type: "i", value: 0},
        seed: {type: "f", value: 0},
        resolution: {type: "f", value: 0},
        res1: {type: "f", value: 0},
        res2: {type: "f", value: 0},
        resMix: {type: "f", value: 0},
        mixScale: {type: "f", value: 0},
        doesRidged: {type: "f", value: 0}
      },
      vertexShader: vertShader,
      fragmentShader: flowNoiseFragShader,
      transparent: true,
      depthWrite: false
    });
    
  }

  render(props) {
    // props.seed
    // props.resolution
    // props.res1
    // props.res2
    // props.resMix
    // props.mixScale

    let resolution = props.resolution;

    this.mat.uniforms.seed.value = props.seed;
    this.mat.uniforms.resolution.value = props.resolution;
    this.mat.uniforms.res1.value = props.res1;
    this.mat.uniforms.res2.value = props.res2;
    this.mat.uniforms.resMix.value = props.resMix;
    this.mat.uniforms.mixScale.value = props.mixScale;
    this.mat.uniforms.doesRidged.value = props.doesRidged;
    this.mat.needsUpdate = true;

    super.render(props);
  }

}

export default NoiseMap;
