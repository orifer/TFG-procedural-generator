import * as THREE from 'three';
import TextureMap from './maps/TextureMap.js'
import * as seedrandom from 'https://cdn.jsdelivr.net/npm/seedrandom@3.0.5/seedrandom.min.js';
import Utils from './Utils.js';


class Planet {

  constructor(app) {

    // Main app
    this.app = app;
    this.view = new THREE.Object3D();

    this.resolution = 1024;
    this.size = 1;

    this.seedString = "Earth";
    this.initSeed();

    // Material properties
    this.roughness = 0.8;
    this.metalness = 0.5;
    this.normalScale = 1.0;
    this.displacementScale = 0.0;
    this.wireframe = false;
    this.rotate = true;

    // Texture map to display
    this.displayTextureMap = 0;

    // Map to display
    this.displayMap = "textureMap";
    
    this.createScene();
    this.renderScene();
  }


  createScene() {
    this.textureMap = new TextureMap(this.app.renderer, this.resolution);
    this.material = new THREE.MeshStandardMaterial();
    this.geo = new THREE.SphereGeometry( this.size, 256, 256 );
    this.ground = new THREE.Mesh(this.geo, this.material);
    
    // Add to main scene
    this.view.add(this.ground);
    this.app.scene.add(this.view);
  }


  renderScene() {
    this.initSeed();
    this.updatePlanetName();
    this.updateNormalScaleForRes(this.resolution);
    this.textureMap.updateResolution(this.resolution);
    
    this.textureMap.render({
      time: this.app.time,
      resolution: this.resolution,
      displayTextureMap: this.displayTextureMap,
    });
    
    this.heightMap = this.textureMap.heightMapTexture;
    this.normalMap = this.textureMap.normalMapTexture;

    this.updateMaterial();
  }


  update() {
    if (this.app.playing) {
      if (this.rotate) {
        this.ground.rotation.y += 0.001;  
      }


      // Actualizar shader
      this.textureMap.render({
        time: this.app.time,
        resolution: this.resolution,
        displayTextureMap: this.displayTextureMap
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
    this.seed = Utils.getRandomInt(0, 1) * 1000.0;
    // WIP 
  }


  switchGeometry() {    
    if (this.geo.type == 'SphereGeometry') {
      this.geo = new THREE.PlaneGeometry( 1024*8, 1024*4 );
      this.app.ambientLight.intensity = 1.8
      this.app.directionalLight.intensity = 0.
      this.rotate = false
    } else if (this.geo.type == 'PlaneGeometry') {
      this.geo = new THREE.SphereGeometry( this.size, 256, 256 );
      this.app.ambientLight.intensity = 0.04
      this.app.directionalLight.intensity = 1.2
    }

    this.ground.geometry.dispose()
    this.ground.geometry = this.geo
  }


  randomize() {
    this.seedString = new String(Math.floor(100000 + Math.random() * 900000));
    this.renderScene();
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
      this.material.map = this.textureMap.texture;
      this.material.displacementMap = this.heightMap;
      this.material.displacementScale = this.displacementScale;

      this.material.normalMap = this.normalMap;
      this.material.normalScale = new THREE.Vector2(this.normalScale, this.normalScale);
    }
    else if (this.displayMap == "heightMap") {
      this.material.map = this.heightMap;
      this.material.displacementMap = null;
      this.material.normalMap = null;
    }
    else if (this.displayMap == "normalMap") {
      this.material.map = this.normalMap;
      this.material.displacementMap = null;
      this.material.normalMap = null;
    }

    this.material.needsUpdate = true;
  }
  

  updateNormalScaleForRes(value) {
    if (value == 256) this.normalScale = 0.25;
    if (value == 512) this.normalScale = 0.5;
    if (value == 1024) this.normalScale = 0.2;
    if (value == 2048) this.normalScale = 0.7;
    if (value == 4096) this.normalScale = 0.8;
  }

  
} export default Planet;
