import * as THREE from 'three';

import BufferManager from '../../shaders/BufferManager.js';
import BufferShader from '../../shaders/BufferShader.js';

import BUFFER_MAIN_FRAG from '../../shaders/textureMap/mainFrag.js';
import BUFFER_GEO_FRAG from '../../shaders/textureMap/geologyFrag.js'
import BUFFER_CIRCULATION_FRAG from '../../shaders/textureMap/circulationFrag.js'
import BUFFER_WIND_FRAG from '../../shaders/textureMap/windFrag.js'
import BUFFER_SOIL_FRAG from '../../shaders/textureMap/soilFrag.js'
import BUFFER_HEIGHTMAP_FRAG from '../../shaders/heightMap/heightMapFrag.js';
import BUFFER_NORMALMAP_FRAG from '../../shaders/normalMap/normalMapFrag.js';

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
    this.targetCirculation = new BufferManager(this.renderer, { width: this.resolution, height: this.resolution });
    this.targetWind = new BufferManager(this.renderer, { width: this.resolution, height: this.resolution });
    this.targetSoil = new BufferManager(this.renderer, { width: this.resolution, height: this.resolution });
    this.targetHeightMap = new BufferManager(this.renderer, { width: this.resolution, height: this.resolution });
    this.targetNormalMap = new BufferManager(this.renderer, { width: this.resolution, height: this.resolution });


    // Main buffer
    this.bufferMain = new BufferShader(
      VERT,
      BUFFER_MAIN_FRAG,
      {
        uTime: { value: 0 },
        uFrame: { value: 0 },
        uResolution: { value: this.resolutionVector },
        uDisplayTextureMap: { value: 0 },
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


    // Circulation buffer
    this.bufferCirculation = new BufferShader(
      VERT,
      BUFFER_CIRCULATION_FRAG,
      {
        uTime: { value: 0 },
        uFrame: { value: 0 },
        uResolution: { value: this.resolutionVector },
        iChannel0: { value: null },
        iChannel1: { value: null },
      });


    // Wind buffer
    this.bufferWind = new BufferShader(
      VERT,
      BUFFER_WIND_FRAG,
      {
        uTime: { value: 0 },
        uFrame: { value: 0 },
        uResolution: { value: this.resolutionVector },
        iChannel0: { value: null },
        iChannel1: { value: null },
        iChannel2: { value: null },
        iChannel3: { value: null },
      });


    // Soil buffer
    this.bufferSoil = new BufferShader(
      VERT,
      BUFFER_SOIL_FRAG,
      {
        uTime: { value: 0 },
        uFrame: { value: 0 },
        uResolution: { value: this.resolutionVector },
        iChannel0: { value: null },
        iChannel1: { value: null },
        iChannel2: { value: null },
        iChannel3: { value: null },
      });


    // HeightMap buffer
    this.bufferHeightMap = new BufferShader(
      VERT,
      BUFFER_HEIGHTMAP_FRAG,
      {
        uTime: { value: 0 },
        uFrame: { value: 0 },
        uResolution: { value: this.resolutionVector },
        iChannel0: { value: null }
      });


    // NormalMap buffer
    this.bufferNormalMap = new BufferShader(
      VERT,
      BUFFER_NORMALMAP_FRAG,
      {
        uResolution: { value: this.resolutionVector },
        uHeightMap: { value: null }
      });

  }


  render(props) {

    // Geo buffer
    this.bufferGeo.uniforms.uTime.value = props.time;
    this.bufferGeo.uniforms.uFrame.value = this.counter;
    this.bufferGeo.uniforms.uResolution.value = new THREE.Vector3(props.resolution, props.resolution, window.devicePixelRatio);
    this.bufferGeo.uniforms.iChannel0.value = this.targetGeo.readBuffer.texture;
    this.targetGeo.render(this.bufferGeo.scene, this.orthoCamera);

    // Circulation buffer
    this.bufferCirculation.uniforms.uTime.value = props.time;
    this.bufferCirculation.uniforms.uFrame.value = this.counter;
    this.bufferCirculation.uniforms.uResolution.value = new THREE.Vector3(props.resolution, props.resolution, window.devicePixelRatio);
    this.bufferCirculation.uniforms.iChannel0.value = this.targetGeo.readBuffer.texture;
    this.bufferCirculation.uniforms.iChannel1.value = this.targetCirculation.readBuffer.texture;
    this.targetCirculation.render(this.bufferCirculation.scene, this.orthoCamera);

    // Wind buffer
    this.bufferWind.uniforms.uTime.value = props.time;
    this.bufferWind.uniforms.uFrame.value = this.counter;
    this.bufferWind.uniforms.uResolution.value = new THREE.Vector3(props.resolution, props.resolution, window.devicePixelRatio);
    this.bufferWind.uniforms.iChannel0.value = this.targetGeo.readBuffer.texture;
    this.bufferWind.uniforms.iChannel1.value = this.targetCirculation.readBuffer.texture;
    this.bufferWind.uniforms.iChannel2.value = this.targetWind.readBuffer.texture;
    this.bufferWind.uniforms.iChannel3.value = this.targetSoil.readBuffer.texture;
    this.targetWind.render(this.bufferWind.scene, this.orthoCamera);

    // Soil buffer
    this.bufferSoil.uniforms.uTime.value = props.time;
    this.bufferSoil.uniforms.uFrame.value = this.counter;
    this.bufferSoil.uniforms.uResolution.value = new THREE.Vector3(props.resolution, props.resolution, window.devicePixelRatio);
    this.bufferSoil.uniforms.iChannel0.value = this.targetGeo.readBuffer.texture;
    this.bufferSoil.uniforms.iChannel1.value = this.targetCirculation.readBuffer.texture;
    this.bufferSoil.uniforms.iChannel2.value = this.targetWind.readBuffer.texture;
    this.bufferSoil.uniforms.iChannel3.value = this.targetSoil.readBuffer.texture;
    this.targetSoil.render(this.bufferSoil.scene, this.orthoCamera);

    // Main buffer
    this.bufferMain.uniforms.uTime.value = props.time;
    this.bufferMain.uniforms.uFrame.value = this.counter;
    this.bufferMain.uniforms.uResolution.value = new THREE.Vector3(props.resolution, props.resolution, window.devicePixelRatio);
    this.bufferMain.uniforms.uDisplayTextureMap.value = props.displayTextureMap;
    this.bufferMain.uniforms.iChannel0.value = this.targetGeo.readBuffer.texture;
    this.bufferMain.uniforms.iChannel1.value = this.targetCirculation.readBuffer.texture;
    this.bufferMain.uniforms.iChannel2.value = this.targetWind.readBuffer.texture;
    this.bufferMain.uniforms.iChannel3.value = this.targetSoil.readBuffer.texture;
    this.targetMain.render(this.bufferMain.scene, this.orthoCamera);

    // HeightMap buffer
    this.bufferHeightMap.uniforms.uTime.value = props.time;
    this.bufferHeightMap.uniforms.uResolution.value = new THREE.Vector3(props.resolution, props.resolution, window.devicePixelRatio);
    this.bufferHeightMap.uniforms.iChannel0.value = this.targetGeo.readBuffer.texture;
    this.targetHeightMap.render(this.bufferHeightMap.scene, this.orthoCamera);

    // NormalMap buffer
    this.bufferNormalMap.uniforms.uResolution.value = new THREE.Vector3(props.resolution, props.resolution, window.devicePixelRatio);
    this.bufferNormalMap.uniforms.uHeightMap.value = this.targetHeightMap.readBuffer.texture;
    this.targetNormalMap.render(this.bufferNormalMap.scene, this.orthoCamera);

    // Save the result textures
    this.texture = this.targetMain.readBuffer.texture;
    this.heightMapTexture = this.targetHeightMap.readBuffer.texture;
    this.normalMapTexture = this.targetNormalMap.readBuffer.texture;

    // ToDo: Unify shaders and use just one time measurement
    this.counter = props.time*60.0;
  }


  // This won't be used in the future
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