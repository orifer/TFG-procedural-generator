import * as THREE from 'three';
import vertShader from '../shaders/starsShaders/starsVertex.js'
import fragShader from '../shaders/starsShaders/starsFrag.js'

class Stars {

  constructor(app) {

    // Main app
    this.app = app;
    this.view = new THREE.Object3D();

    this.createScene();
  }
  createScene() {
    var geometry = new THREE.SphereBufferGeometry(600000, 32, 32);
    var material = new THREE.ShaderMaterial({
      uniforms: {
        u_resolution: { value: { x: window.innerWidth, y: window.innerHeight } },
      },
      side: THREE.BackSide,
      vertexShader: vertShader,
      fragmentShader: fragShader
    });

    var mesh = new THREE.Mesh(geometry, material);
    this.view.add(mesh);

    this.app.scene.add(this.view);
  }

  update() {
    
  }

}

export default Stars;





