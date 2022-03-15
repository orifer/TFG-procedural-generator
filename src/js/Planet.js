import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
import TextureMap from './TextureMap.js'
import NormalMap from './NormalMap.js'

import * as seedrandom from 'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min.js';
import Utils from './Utils.js';


class Planet {

  constructor(app) {

    // Main app
    this.app = app;

    this.seedString = "Earth";
    this.initSeed();

    this.view = new THREE.Object3D();

    this.roughness = 0.8;
    this.metalness = 0.5;
    this.normalScale = 3.0;
    this.resolution = 1024;
    this.size = 1000;
    this.waterLevel = 0;

    this.displayMap = "textureMap";
    this.wireframe = false;
    this.rotate = true;

    this.createScene();
    this.renderScene();
  }

  update() {
    if (this.app.playing) {

      if (this.rotate) {
        this.ground.rotation.y += 0.001;  
      }

      // Actualizar shader
      this.textureMap.render({
        time: this.app.time,
        resolution: this.resolution
      });
    }
    
  }

  updatePlanetName() {
    let planetName = document.getElementById("planetName");
    if (planetName != null) {
      planetName.innerHTML = this.seedString;
    }
  }

  initSeed() {
    // https://github.com/davidbau/seedrandom 
    window.rng = new Math.seedrandom(this.seedString);
  }

  switchGeometry() {    
    if (this.geo.type == 'SphereBufferGeometry') {
      this.geo = new THREE.PlaneGeometry( 4096, 2048 );
    } else if (this.geo.type == 'PlaneGeometry') {
      this.geo = new THREE.SphereBufferGeometry( 1024, 128, 128 );
    }

    this.view.remove(this.ground);
    this.ground = new THREE.Mesh(this.geo, this.material);
    this.view.add(this.ground);
  }

  randomize() {
    this.seedString = new String(Math.floor(100000 + Math.random() * 900000));
    this.renderScene();
  }

  createScene() {
    this.textureMap = new TextureMap();
    this.normalMap = new NormalMap();

    this.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xFFFFFF)
    });

    this.geo = new THREE.SphereBufferGeometry( 1024, 128, 128 );

    this.ground = new THREE.Mesh(this.geo, this.material);
    this.view.add(this.ground);
  }


  renderScene() {
    this.initSeed();
    this.seed = Utils.getRandomInt(0, 1) * 1000.0;
    this.updatePlanetName();
    this.updateNormalScaleForRes(this.resolution);

    let resMin = 0.01;
    let resMax = 5.0;
    
    this.textureMap.render({
      time: this.app.time,
      resolution: this.resolution
    });

    this.normalMap.render({
      resolution: this.resolution,
      waterLevel: this.waterLevel,
      heightMap: this.textureMap.map.texture,
      textureMap: this.textureMap.map.texture
    });

    this.updateMaterial();
  }

  updateMaterial() {      
    this.material.roughness = this.roughness;
    this.material.metalness = this.metalness;
    
    if (this.wireframe) {
      this.material.wireframe = true;
    } else {
      this.material.wireframe = false;
    }

    if (this.displayMap == "textureMap") {
      this.material.map = this.textureMap.map.texture;

      this.material.displacementMap = this.textureMap.map.texture;
      this.material.displacementScale = -50.;

      this.material.bumpMap = this.textureMap.map.texture;
      this.material.bumpScale = -100.;

      // this.material.normalMap = this.normalMap.map.texture;
      // this.material.normalScale = new THREE.Vector2(this.normalScale, this.normalScale);
    }
    else if (this.displayMap == "heightMap") {
      this.material.map = this.textureMap.map.texture;
      this.material.displacementMap = null;
      this.material.bumpMap = null;
      this.material.normalMap = null;
    }
    else if (this.displayMap == "normalMap") {
      this.material.map = this.normalMap.map.texture;
      this.material.displacementMap = null;
      this.material.bumpMap = null;
      this.material.normalMap = null;
    }

    this.material.needsUpdate = true;
  }
  
  updateNormalScaleForRes(value) {
    if (value == 256) this.normalScale = 0.25;
    if (value == 512) this.normalScale = 0.5;
    if (value == 1024) this.normalScale = 0.1;
    if (value == 2048) this.normalScale = 0.2;
    if (value == 4096) this.normalScale = 0.2;
  }

}

export default Planet;
