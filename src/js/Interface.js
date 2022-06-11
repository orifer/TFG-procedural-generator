import { GUI } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/libs/lil-gui.module.min.js';
// INFO: https://lil-gui.georgealways.com/

class Interface {

    constructor(app) {

      // Main app
      this.app = app;

      // Create the GUI
      window.gui = new GUI({ autoPlace: false });

      // Load the panels
      this.createRightPanel();
      this.createPlanetCategory();
      this.createAtmosphereCategory();
      this.createDebugCategory();
      this.createCameraCategory();
      this.createBottomPanel();
      this.createLeftPanel();


      // Load the planet name
      this.app.planet.updatePlanetName();

      // Resolution
      window.gui.add(this.app.planet, "resolution", [256, 512, 1024, 2048, 4096]).name("Resolution").onChange(value => { this.app.planet.renderScene() });

      // Seed
      window.gui.add(this.app.planet, "seedString").listen().onFinishChange(value => { this.app.planet.renderScene() }).name("Seed");
    

      // Map visualization
      var selectedMapOptions  = { 
        Normal: 0, 
        Plates: 1, 
        Rivers: 2,
        Flow: 3,
        Temperature: 4,
      };
      window.gui.add(this.app.planet, "displayTextureMap", selectedMapOptions).name("selectedMap").onChange(value => { this.app.planet.renderScene() });
      
      // Time
      window.gui.add(this.app, "time", 0., 60.).listen();

      // New planet button
      window.gui.add(this.app.planet, "randomize").name("New planet");
      
      window.gui.close();
    }

    createRightPanel() {

      // Main container
      let infoBoxHolder = document.createElement("div");
      infoBoxHolder.setAttribute("id", "infoBoxHolder");
      document.body.appendChild(infoBoxHolder);
  
      // Planet name
      let infoBox = document.createElement("div");
      infoBox.setAttribute("id", "infoBox");
      infoBox.innerHTML = "Planet<br><div id='planetName'></div>";
      infoBoxHolder.appendChild(infoBox);
  
      // Open controls btn
      infoBoxHolder.appendChild(window.gui.domElement);
    }

    createPlanetCategory() {
      let matFolder = window.gui.addFolder('Planet');

      matFolder.add(this.app.planet, "roughness", 0.0, 1.0).onChange(value => { this.app.planet.updateMaterial(); });
      matFolder.add(this.app.planet, "metalness", 0.0, 1.0).onChange(value => { this.app.planet.updateMaterial(); });
      matFolder.add(this.app.planet, "normalScale", -1.5, 1.5).listen().onChange(value => { this.app.planet.updateMaterial(); });
      matFolder.add(this.app.planet, "displacementScale", -0.05, 0.1).listen().onChange(value => { this.app.planet.updateMaterial(); });
      matFolder.add(this.app.planet, "subdivisions", 2, 512, 1).onChange(value => { this.app.planet.updateGeometry(); });
      
      matFolder.add(this.app.planet, "wireframe").onChange(value => { this.app.planet.updateMaterial(); });
      matFolder.add(this.app.planet, "rotate");

      matFolder.close();
    }


    createAtmosphereCategory() {
      let atmFolder = window.gui.addFolder('Atmosphere');

      atmFolder.add(this.app.atmos, "size", 0.0, 2.0).listen();
      atmFolder.add(this.app.atmos, "densityFalloff", -5.0, 50.0);
      atmFolder.add(this.app.atmos, "opticalDepthPoints", 0, 32, 1);
      atmFolder.add(this.app.atmos, "inScatterPoints", 0, 32, 1);
      atmFolder.add(this.app.atmos, "scatteringStrength", 0, 64);

      // Wavelengths
      let waveFolder = atmFolder.addFolder('Wavelengths (nm)');
      waveFolder.add(this.app.atmos.waveLengths, "x").name("Red");
      waveFolder.add(this.app.atmos.waveLengths, "y").name("Green");
      waveFolder.add(this.app.atmos.waveLengths, "z").name("Blue");
      waveFolder.close();

      atmFolder.close();
    }


    createDebugCategory() {
      let debugFolder = window.gui.addFolder('Debug');
      debugFolder.add(this.app.planet, "displayMap", ["textureMap", "heightMap", "normalMap"]).onChange(value => { this.app.planet.updateMaterial() });

      // Display button
      debugFolder.add(this.app.planet, "switchGeometry");

      debugFolder.close();
    }

    createCameraCategory() {
      let cameraFolder = window.gui.addFolder('Camera');
      cameraFolder.add(this.app.controls, "autoRotate").name('Rotate');
      cameraFolder.add(this.app.camera, "fov", 20, 120).name("FOV").onChange(value => { this.app.camera.updateProjectionMatrix() });
      cameraFolder.close();
    }


    createBottomPanel() {
      // Main container
      let bottomPanelHolder = document.createElement("div");
      bottomPanelHolder.setAttribute("id", "bottomPanelHolder");
      document.body.appendChild(bottomPanelHolder);
  
      // Play/stop simulation
      let playButton = document.createElement("div");
      playButton.setAttribute("id", "playButton");
      playButton.innerHTML = "<button class='btn'><i class='fa-solid fa-play fa-3x'></i></button>";
      playButton.addEventListener("click", () => {
        if (this.app.playing) {
          this.app.playing = false;
          playButton.innerHTML = "<button class='btn'><i class='fa-solid fa-play fa-3x'></i></button>";
        } else {
          this.app.playing = true;
          playButton.innerHTML = "<button class='btn'><i class='fa-solid fa-pause fa-3x'></i></button>";
        }
      });
      bottomPanelHolder.appendChild(playButton);
    }


    createLeftPanel() {
      // Main container
      let leftPanelHolder = document.createElement("div");
      leftPanelHolder.setAttribute("id", "leftPanelHolder");
      document.body.appendChild(leftPanelHolder);

      // Add Terrain
      let addTerrainButton = document.createElement("div");
      addTerrainButton.setAttribute("id", "addTerrainButton");
      addTerrainButton.innerHTML = "<button title='Pujar terreny' class='btn'><i class='fa-solid fa-paintbrush fa-2x'></i></button>";
      this.app.addingTerrain = false;
      addTerrainButton.addEventListener("click", () => {
        if (this.app.addingTerrain) {
          this.app.addingTerrain = false;
          addTerrainButton.innerHTML = "<button class='btn'><i class='fa-solid fa-paintbrush fa-2x'></i></button>";
          this.app.controls.enabled = true;
        } else {
          this.app.addingTerrain = true;
          this.app.removingTerrain = false;
          addTerrainButton.innerHTML = "<button class='btn active'><i class='fa-solid fa-ban fa-2x'></i></button>";
          delTerrainButton.innerHTML = "<button class='btn'><i class='fa-solid fa-eraser fa-2x'></i></button>";
          this.app.controls.enabled = false;
        }
      });
      leftPanelHolder.appendChild(addTerrainButton);

      // Remove Terrain
      let delTerrainButton = document.createElement("div");
      delTerrainButton.setAttribute("id", "delTerrainButton");
      delTerrainButton.innerHTML = "<button title='Baixar terreny' class='btn'><i class='fa-solid fa-eraser fa-2x'></i></button>";
      this.app.removingTerrain = false;
      delTerrainButton.addEventListener("click", () => {
        if (this.app.removingTerrain) {
          this.app.removingTerrain = false;
          delTerrainButton.innerHTML = "<button class='btn'><i class='fa-solid fa-eraser fa-2x'></i></button>";
          this.app.controls.enabled = true;
        } else {
          this.app.removingTerrain = true;
          this.app.addingTerrain = false;
          addTerrainButton.innerHTML = "<button class='btn'><i class='fa-solid fa-paintbrush fa-2x'></i></button>";
          delTerrainButton.innerHTML = "<button class='btn active'><i class='fa-solid fa-ban fa-2x'></i></button>";
          this.app.controls.enabled = false;
        }
      });
      leftPanelHolder.appendChild(delTerrainButton);


      
    }

}

export default Interface;