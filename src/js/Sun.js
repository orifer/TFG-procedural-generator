import * as THREE from 'three';
import vertShader from '../shaders/sunShaders/sunVertex.js'
import fragShader from '../shaders/sunShaders/sunFrag.js'

class Sun {

  constructor(app) {

    // Main app
    this.app = app;
    this.view = new THREE.Object3D();

    this.size = 8000;
    this.position = new THREE.Vector3(200000, 0, 0);
    this.app.directionalLight.position.copy(this.position);

    this.createScene();
  }

  createScene() {

    // Sun 
    const geometryCorona = new THREE.SphereBufferGeometry(this.size, 16, 16);
    const materialCorona = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        uSize: {value: this.size },
        uCenter: {value: this.position }
      },
      vertexShader: vertShader,
      fragmentShader: fragShader,
      transparent: true
    });

    this.coronaMesh = new THREE.Mesh(geometryCorona, materialCorona);
    this.coronaMesh.position.copy(this.position);
    this.view.add(this.coronaMesh);

    this.app.scene.add(this.view);
  }

  update() {
  }

}

export default Sun;