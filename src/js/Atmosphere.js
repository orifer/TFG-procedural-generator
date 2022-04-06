import * as THREE from "https://cdn.skypack.dev/three@0.136";
import fragmentShader from '../shaders/atmosFrag.js'
import vertexShader from '../shaders/vertexShader.js'

class Atmosphere {

  constructor(app) {

    // Main app
    this.app = app;
    this.view = new THREE.Object3D();

    this.size = 200;
    this.createScene();
  }

  createScene() {

    this._target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    this._target.texture.format = THREE.RGBFormat;
    this._target.texture.minFilter = THREE.NearestFilter;
    this._target.texture.magFilter = THREE.NearestFilter;
    this._target.texture.generateMipmaps = false;
    this._target.stencilBuffer = false;
    this._target.depthBuffer = true;
    this._target.depthTexture = new THREE.DepthTexture();
    this._target.depthTexture.format = THREE.DepthFormat;
    this._target.depthTexture.type = THREE.FloatType;

    window.renderer.setRenderTarget(this._target);

    this._postCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

    const uniforms = {
      cameraNear: { value: this.app.camera.near },
      cameraFar: { value: this.app.camera.far },
      cameraPosition: { value: this.app.camera.position },
      tDiffuse: { value: null },
      tDepth: { value: null },
      inverseProjection: { value: null },
      inverseView: { value: null },
      planetPosition: { value: null },
      planetRadius: { value: null },
      atmosphereRadius: { value: null }
    }

    this.material =  new THREE.ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
    })

    this.postPlane = new THREE.PlaneBufferGeometry( 2, 2 );
    this.postQuad = new THREE.Mesh(this.postPlane, this.material);

    this._postScene = new THREE.Scene();
    this._postScene.add( this.postQuad );
  }

  render() {
    if (this.size) {
      
      // Workaround for rendering the post processing scene
      window.renderer.setRenderTarget(this._target);
      window.renderer.render(this.app.scene, this.app.camera);
      window.renderer.setRenderTarget( null );
  
      // Update uniform values
      this.material.uniforms.inverseProjection.value = this.app.camera.projectionMatrixInverse;
      this.material.uniforms.inverseView.value = this.app.camera.matrixWorld;
      this.material.uniforms.tDiffuse.value = this._target.texture;
      this.material.uniforms.tDepth.value = this._target.depthTexture;
      this.material.uniforms.cameraNear.value = this.app.camera.near;
      this.material.uniforms.cameraFar.value = this.app.camera.far;
      this.material.uniforms.cameraPosition.value = this.app.camera.position;
      this.material.uniforms.planetPosition.value = new THREE.Vector3(0, 0, 0);
      this.material.uniforms.planetRadius.value = this.app.planet.size;
      this.material.uniforms.atmosphereRadius.value = this.app.planet.size + this.size;
      this.material.uniformsNeedUpdate = true;
  
      // Render
      window.renderer.render( this._postScene, this._postCamera );
    }
  }



}

export default Atmosphere;
