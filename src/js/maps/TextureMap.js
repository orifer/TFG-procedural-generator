import * as THREE from 'three';

import BufferManager from '../../shaders/BufferManager.js';
import BufferShader from '../../shaders/BufferShader.js';

import BUFFER_MAIN_FRAG from '../../shaders/textureMap/mainFrag.js';
import BUFFER_GEO_FRAG from '../../shaders/textureMap/geologyFrag.js'
import VERT from '../../shaders/vertexShader.js'

class TextureMap {

  constructor(renderer, resolution) {
    this.renderer = renderer;
    this.resolution = resolution;
    this.setup();
  }

  setup() {
    this.counter = 0;
    this.resolutionVector = new THREE.Vector3(this.resolution, this.resolution, window.devicePixelRatio);
    this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1)

    // Targets
    this.targetMain = new BufferManager(this.renderer, { width: this.resolution, height: this.resolution });
    this.targetGeo = new BufferManager(this.renderer, { width: this.resolution, height: this.resolution });

    // Main buffer
    this.bufferMain = new BufferShader(
      VERT,
      BUFFER_MAIN_FRAG,
      {
        uTime: { value: 0 },
        uFrame: { value: 0 },
        uResolution: { value: this.resolutionVector },
        uSelectedMap: { value: 0 },
        iChannel0: { value: null },
        iChannel1: { value: null },
        iChannel2: { value: null },
        iChannel3: { value: null },
      });

    // Geo buffer
    this.bufferGeo = new BufferShader(
      VERT,
      BUFFER_GEO_FRAG,
      {
        uTime: { value: 0 },
        uFrame: { value: 0 },
        uResolution: { value: this.resolutionVector },
        iChannel0: { value: null }
      });

  }


  render(props) {

    // Geo buffer
    this.bufferGeo.uniforms.uTime.value = props.time;
    this.bufferGeo.uniforms.uFrame.value = this.counter;
    this.bufferGeo.uniforms.uResolution.value = new THREE.Vector3(props.resolution, props.resolution, window.devicePixelRatio);
    this.bufferGeo.uniforms.iChannel0.value = this.targetGeo.readBuffer.texture;
    this.targetGeo.render(this.bufferGeo.scene, this.orthoCamera);

    // Main buffer
    this.bufferMain.uniforms.uTime.value = props.time;
    this.bufferMain.uniforms.uFrame.value = this.counter;
    this.bufferMain.uniforms.uResolution.value = new THREE.Vector3(props.resolution, props.resolution, window.devicePixelRatio);
    this.bufferMain.uniforms.uSelectedMap.value = props.selectedMap;
    this.bufferMain.uniforms.iChannel0.value = this.targetGeo.readBuffer.texture;
    this.targetMain.render(this.bufferMain.scene, this.orthoCamera);

    // Save the result texture
    this.texture = this.targetMain.readBuffer.texture;

    this.counter++;
  }


  updateResolution(res) {
    
    if (this.resolution != res) {
      // Set new resolution
      this.resolution = res;

      // Clear memory disposing the rendering context
      this.targetMain.dispose();
      this.targetGeo.dispose();
      
      // Create new buffers with new resolution
      this.targetMain = new BufferManager(this.renderer, { width: this.resolution, height: this.resolution });
      this.targetGeo = new BufferManager(this.renderer, { width: this.resolution, height: this.resolution });
    }
  }


} export default TextureMap;