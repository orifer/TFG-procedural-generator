import * as THREE from 'three';
import { EffectComposer } from "https://unpkg.com/three@0.139/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.139/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.139/examples/jsm/postprocessing/UnrealBloomPass.js";

class Sun {

  constructor(app) {

    // Main app
    this.app = app;
    this.view = new THREE.Object3D();

    this.size = 2048;
    this.position = new THREE.Vector3(50000., 0, 0);
    this.app.directionalLight.position.copy(this.position);

    this.createScene();
  }

  createScene() {
    this.scene = new THREE.Scene();
    // this.scene.background = new THREE.Color( 0xffFF );

    // Bloom renderer
    // var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };
    // var renderTarget = new THREE.WebGLRenderTarget( window.innerWidth , window.innerHeight, parameters );

    const renderScene = new RenderPass(this.scene, this.app.camera);
    // renderScene.clear=false

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85 );
    bloomPass.threshold = 0;
    bloomPass.strength = 2;
    bloomPass.radius = 0.6;

    this.bloomComposer = new EffectComposer(renderer);
    this.bloomComposer.setSize(window.innerWidth, window.innerHeight);
    this.bloomComposer.renderToScreen = true;
    this.bloomComposer.addPass(renderScene);
    this.bloomComposer.addPass(bloomPass);

    //sun object
    const color = new THREE.Color("#FDB813");
    const geometry = new THREE.IcosahedronGeometry(this.size, 15);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(this.position);
    this.scene.add(sphere);

    this.view.add(sphere);
    this.app.scene.add(this.view);
  }

  render() {
    renderer.render(this.scene, this.app.camera);
    // this.bloomComposer.render();
    // Abandona esta idea!!!!!!!
    // Hacer un sol con shader
  }

}

export default Sun;





