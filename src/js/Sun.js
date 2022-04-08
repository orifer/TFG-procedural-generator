import * as THREE from 'three';
import vertShader from '../shaders/sunShaders/sunVertex.js'
import fragShader from '../shaders/sunShaders/sunFrag.js'

class Sun {

  constructor(app) {

    // Main app
    this.app = app;
    this.view = new THREE.Object3D();

    this.size = 2000;
    this.position = new THREE.Vector3(50000., 0, 0);
    this.app.directionalLight.position.copy(this.position);

    this.createScene();
  }

  createScene() {

    // Sun 
    const geometryCorona = new THREE.SphereBufferGeometry(this.size, 30, 30);
    const materialCorona = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        time: {value: 0 },
        size: {value: this.size }
      },
      vertexShader: vertShader,
      fragmentShader: fragShader,
      transparent: true
    });

    const coronaMesh = new THREE.Mesh(geometryCorona, materialCorona);
    coronaMesh.position.copy(this.position);
    this.view.add(coronaMesh);

    this.app.scene.add(this.view);
  }

  update() {
    
  }

}

export default Sun;





