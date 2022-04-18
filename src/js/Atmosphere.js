import * as THREE from 'three';
import fragmentShader from '../shaders/atmosphere/atmosFrag.js'
import vertexShader from '../shaders/vertexShader.js'
import Utils from '../js/Utils.js';

class Atmosphere {

  constructor(app) {

    // Main app
    this.app = app;
    this.view = new THREE.Object3D();

    this.size = 0;
    this.densityFalloff = 10.;
    this.opticalDepthPoints = 8.;
    this.inScatterPoints = 8.;
    this.waveLengths = new THREE.Vector3(700, 530, 440);
    this.scatteringStrength = 8.;

    this.createScene();
  }

  createScene() {

    this._target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    this._target.texture.minFilter = THREE.NearestFilter;
    this._target.texture.magFilter = THREE.NearestFilter;
    this._target.texture.generateMipmaps = false;
    this._target.stencilBuffer = false;
    this._target.depthBuffer = true;
    this._target.depthTexture = new THREE.DepthTexture();
    this._target.depthTexture.format = THREE.DepthFormat;
    this._target.depthTexture.type = THREE.FloatType;

    this._postCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

    const uniforms = {
      cameraNear: { value: this.app.camera.near },
      cameraFar: { value: this.app.camera.far },
      cameraPosition: { value: this.app.camera.position },
      tDiffuse: { value: null },
      tDepth: { value: null },
      inverseProjection: { value: null },
      inverseView: { value: null },
      planetPosition: { value: new THREE.Vector3(0, 0, 0) },
      planetRadius: { value: this.app.planet.size },
      atmosphereRadius: { value: null },
      sunPosition: { value: this.app.sun.position },
      densityFalloff: { value: this.densityFalloff },
      opticalDepthPoints: { value: this.opticalDepthPoints },
      inScatterPoints: { value: this.inScatterPoints },
      scatteringCoefficients: { value: null },
    }

    this.material =  new THREE.ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      depthWrite: false,
    })

    this.postPlane = new THREE.PlaneBufferGeometry( 2, 2 );
    this.postQuad = new THREE.Mesh(this.postPlane, this.material);

    this._postScene = new THREE.Scene();
    this._postScene.add( this.postQuad );
  }

  render() {
    if (this.size) {

      // First, render the main scene
      renderer.setRenderTarget(this._target);
      renderer.render(this.app.scene, this.app.camera);
      renderer.setRenderTarget( null );


      // Update uniform values
      this.material.uniforms.tDiffuse.value = this._target.texture;
      this.material.uniforms.tDepth.value = this._target.depthTexture;

      this.material.uniforms.inverseProjection.value = this.app.camera.projectionMatrixInverse;
      this.material.uniforms.inverseView.value = this.app.camera.matrixWorld;
      this.material.uniforms.cameraPosition.value = this.app.camera.position;

      this.material.uniforms.atmosphereRadius.value = (1 + this.size) * this.app.planet.size;
      this.material.uniforms.densityFalloff.value = this.densityFalloff;
      this.material.uniforms.opticalDepthPoints.value = this.opticalDepthPoints;
      this.material.uniforms.inScatterPoints.value = this.inScatterPoints;

      var scatterR = Math.pow(400 / this.waveLengths.x, 4) * this.scatteringStrength;
      var scatterG = Math.pow(400 / this.waveLengths.y, 4) * this.scatteringStrength;
      var scatterB = Math.pow(400 / this.waveLengths.z, 4) * this.scatteringStrength;
      var scatteringCoefficients = new THREE.Vector3(scatterR, scatterG, scatterB);
      this.material.uniforms.scatteringCoefficients.value = scatteringCoefficients;

      // Render
      renderer.render( this._postScene, this._postCamera );
    }
  }

  update() {
    if (this.app.playing) {

      // If time is between 15 and 20, increase the size of the atmosphere progressively
      if (this.app.time > 15 && this.app.time < 20) {
        var increasingSpeed1 = 0.0005;
        var increasingSpeed2 = 0.003;
        this.size += Math.min( THREE.MathUtils.smoothstep(this.size, 0, 1) + increasingSpeed1, Utils.getRandomInt(0.0002, increasingSpeed2));
      }

    }

    this.render();
  }



}

export default Atmosphere;
