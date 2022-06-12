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
    this.subdivisions = 128;
    this.size = 1;

    this.seedString = "Earth";
    this.initSeed();

    // Material properties
    this.roughness = 0.8;
    this.metalness = 0.5;
    this.normalScale = 1.0;
    this.displacementScale = 0.004;
    this.wireframe = false;
    this.rotate = true;

    // Texture map to display
    this.displayTextureMap = 0;

    // Map to display
    this.displayMap = "textureMap";

    // Mouse position on planet
    this.mouseIntersectUV = new THREE.Vector2(0, 0);
    
    this.createScene();
    this.renderScene();
  }


  createScene() {
    this.textureMap = new TextureMap(this.app.renderer, this.resolution);
    this.material = new THREE.MeshStandardMaterial();
    this.geo = new THREE.SphereGeometry( this.size, this.subdivisions, this.subdivisions );
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
      mouse: this.mouseIntersectUV,
      mouseClick: { value: false },
      addingTerrain: { value: false },
      removingTerrain: { value: false },
    });
    
    this.heightMap = this.textureMap.heightMapTexture;
    this.normalMap = this.textureMap.normalMapTexture;

    this.updateMaterial();
  }


  update() {
    if (this.app.playing) {
      if (this.rotate) {
        this.ground.rotation.y -= 0.001;
      }

      // Update shader
      this.textureMap.render({
        time: this.app.time,
        resolution: this.resolution,
        displayTextureMap: this.displayTextureMap,
        mouse: this.mouseIntersectUV,
        mouseClick: { value: this.app.mouseClick },
        addingTerrain: { value: this.app.addingTerrain },
        removingTerrain: { value: this.app.removingTerrain },
      });

      // Calculate objects intersecting the picking ray via raycasting
      const intersects = this.app.raycaster.intersectObjects( this.app.scene.children );
      for ( let i = 0; i < intersects.length; i ++ ) {
        if (intersects[i].object == this.ground) {
          this.mouseIntersectUV = intersects[i].uv;
        }
      }
    }
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


  switchGeometry() {
    if (this.geo.type == 'SphereGeometry') {
      this.geo = new THREE.PlaneGeometry( 6, 3 );
      this.app.ambientLight.intensity = 1.6
      this.app.directionalLight.intensity = 0.
      this.rotate = false
      if (this.app.atmos) this.app.atmos.size = 0.;
    } else if (this.geo.type == 'PlaneGeometry') {
      this.geo = new THREE.SphereGeometry( this.size, this.subdivisions, this.subdivisions );
      this.app.ambientLight.intensity = 0.04
      this.app.directionalLight.intensity = 1.
    }

    this.ground.geometry.dispose()
    this.ground.geometry = this.geo
  }


  updateGeometry() {
    this.geo = new THREE.SphereGeometry( this.size, this.subdivisions, this.subdivisions );
    this.ground.geometry.dispose()
    this.ground.geometry = this.geo
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

    // Alternativa con three
    // console.log(THREE.MathUtils.seededRandom());
  }


  randomize() {
    this.seedString = new String(Math.floor(100000 + Math.random() * 900000));
    this.renderScene();
  }


  updateNormalScaleForRes(value) {
    this.normalScale = value * 0.0002;
  }

  
} export default Planet;
