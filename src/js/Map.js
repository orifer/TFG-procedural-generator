import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';

class Map {

  setup() {
    let tempRes = 1000;
    this.texture = new THREE.WebGLRenderTarget(tempRes, tempRes, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat});
    this.textureCamera = new THREE.OrthographicCamera(-tempRes/2, tempRes/2, tempRes/2, -tempRes/2, -100, 100);
    this.textureCamera.position.z = 10;
    this.textureScene = new THREE.Scene();
    this.geo = new THREE.PlaneGeometry(1, 1);
    this.plane = new THREE.Mesh(this.geo, this.mat);
    this.plane.position.z = -10;
    this.textureScene.add(this.plane);

    this.map = this.texture;
  }

  render(props) {
    let resolution = props.resolution;

    this.texture.setSize(resolution, resolution);
    this.texture.needsUpdate = true;
    this.textureCamera.left = -resolution/2;
    this.textureCamera.right = resolution/2;
    this.textureCamera.top = resolution/2;
    this.textureCamera.bottom = -resolution/2;
    this.textureCamera.updateProjectionMatrix();

    this.geo = new THREE.PlaneGeometry(resolution, resolution);
    this.plane.geometry = this.geo;

    window.renderer.setRenderTarget(this.texture);
    window.renderer.render(this.textureScene, this.textureCamera);

    window.renderer.setRenderTarget(null);
    this.geo.dispose();
  }

}

export default Map;
