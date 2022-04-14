import * as THREE from 'three';

import BufferManager from '../../shaders/BufferManager.js';
import BufferShader from '../../shaders/BufferShader.js';

import BUFFER_MAIN_FRAG from '../../shaders/textureMap/mainFrag.js';
import BUFFER_GEO_FRAG from '../../shaders/textureMap/geologyFrag.js'
import VERT from '../../shaders/vertexShader.js'

class TextureMap {

  constructor(app) {
    this.app = app;
    this.setup();
  }

  setup() {
    this.counter = 0;
    this.width = 1024;
    this.height = 1024;
    this.resolution = new THREE.Vector3(this.width, this.height, window.devicePixelRatio);
    this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1)

    // Targets
    this.targetMain = new BufferManager(this.app.renderer, { width: this.width, height: this.height });
    this.targetGeo = new BufferManager(this.app.renderer, { width: this.width, height: this.height });

    // Main buffer
    this.bufferMain = new BufferShader(
      VERT,
      BUFFER_MAIN_FRAG,
      {
        uTime: { value: 0 },
        uFrame: { value: 0 },
        uResolution: { value: this.resolution },
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
        uResolution: { value: this.resolution },
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
    if (this.width != res) {
      this.width = res;
      this.height = res;

      // Clear memory disposing the rendering context
      this.targetMain.dispose();
      this.targetGeo.dispose();

      this.targetMain = new BufferManager(this.app.renderer, { width: this.width, height: this.height });
      this.targetGeo = new BufferManager(this.app.renderer, { width: this.width, height: this.height });

      // this.targetMain.readBuffer.width = res;
      // this.targetMain.readBuffer.height = res;
      // this.targetMain.writeBuffer.width = res;
      // this.targetMain.writeBuffer.height = res;

      // this.targetGeo.readBuffer.width = res;
      // this.targetGeo.readBuffer.height = res;
      // this.targetGeo.writeBuffer.width = res;
      // this.targetGeo.writeBuffer.height = res;
    }
  }

}

export default TextureMap;
