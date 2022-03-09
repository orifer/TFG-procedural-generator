import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
import NoiseMap from './NoiseMap.js'
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

  randomize() {
    this.seedString = new String(Math.floor(100000 + Math.random() * 900000));
    this.renderScene();
  }

  createScene() {
    this.textureMap = new TextureMap();
    this.normalMap = new NormalMap();
    this.heightMap = new NoiseMap();

    this.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xFFFFFF)
    });

    let geo = new THREE.SphereBufferGeometry( 1024, 64, 64 );

    this.ground = new THREE.Mesh(geo, this.material);
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
    
    this.heightMap.render({
      seed: this.seed,
      resolution: this.resolution,
      res1: Utils.getRandomInt(resMin, resMax),
      res2: Utils.getRandomInt(resMin, resMax),
      resMix: Utils.getRandomInt(resMin, resMax),
      mixScale: Utils.getRandomInt(0.5, 1.0),
      doesRidged: Math.floor(Utils.getRandomInt(0, 4))
    });

    this.normalMap.render({
      resolution: this.resolution,
      waterLevel: this.waterLevel,
      heightMap: this.heightMap.map.texture,
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
      this.material.bumpMap = this.normalMap;
      // this.material.heightMap = this.normalMap;
      // this.material.normalMap = this.normalMap;
      this.material.normalScale = new THREE.Vector2(this.normalScale, this.normalScale);
    }
    else if (this.displayMap == "heightMap") {
      this.material.map = this.heightMap.map.texture;
      this.material.normalMap = null;
    }
    else if (this.displayMap == "normalMap") {
      this.material.map = this.normalMap.map.texture;
      this.material.normalMap = null;
    }

    this.material.needsUpdate = true;
  }
  
  updateNormalScaleForRes(value) {
    if (value == 256) this.normalScale = 0.25;
    if (value == 512) this.normalScale = 0.5;
    if (value == 1024) this.normalScale = 1.0;
    if (value == 2048) this.normalScale = 1.5;
    if (value == 4096) this.normalScale = 3.0;
  }

}

export default Planet;
