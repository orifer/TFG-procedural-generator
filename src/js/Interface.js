import { GUI } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/libs/dat.gui.module.js';

class Interface {

    constructor(app) {

      // Main app
      this.app = app;

      // Create the GUI
      window.gui = new GUI({ autoPlace: false });

      this.createRightPanel();
      this.createPlanetCategory();
      this.createDebugCategory();
      this.createCameraCategory();


      // Load the planet name
      this.app.planet.updatePlanetName();

      // Resolution
      window.gui.add(this.app.planet, "resolution", [256, 512, 1024, 2048, 4096]).name("Resolution").onChange(value => { this.app.planet.renderScene() });

      // Seed
      window.gui.add(this.app.planet, "seedString").listen().onFinishChange(value => { this.app.planet.renderScene() }).name("Seed");

      // New planet button
      window.gui.add(this.app.planet, "randomize").name("New planet");

      // Play/stop simulation
      window.gui.add(this.app, "playing").name("Play/Stop");
      
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
      matFolder.add(this.app.planet, "normalScale", -3.0, 6.0).listen().onChange(value => { this.app.planet.updateMaterial(); });

      matFolder.add(this.app.planet, "wireframe").onChange(value => { this.app.planet.updateMaterial(); });
      matFolder.add(this.app.planet, "rotate");

    }

    createDebugCategory() {
      let debugFolder = window.gui.addFolder('Debug');
      debugFolder.add(this.app.planet, "displayMap", ["textureMap", "heightMap", "normalMap"]).onChange(value => { this.app.planet.updateMaterial() });
    }

    createCameraCategory() {
      let cameraFolder = window.gui.addFolder('Camera');
      cameraFolder.add(this.app.controls, "autoRotate").name('Rotate');
      cameraFolder.add(this.app.camera, "fov", 20, 120).name("FOV").onChange(value => { this.app.camera.updateProjectionMatrix() });
    }

}

export default Interface;