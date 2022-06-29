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
      atmFolder.add(this.app.atmos, "densityFalloff", 0., 64.0);
      atmFolder.add(this.app.atmos, "opticalDepthPoints", 0, 32, 1);
      atmFolder.add(this.app.atmos, "inScatterPoints", 0, 32, 1);
      atmFolder.add(this.app.atmos, "scatteringStrength", 0, 128);

      // Wavelengths
      let waveFolder = atmFolder.addFolder('Wavelengths (nm)');
      waveFolder.add(this.app.atmos.waveLengths, "x", 400., 700.).name("Red").listen();
      waveFolder.add(this.app.atmos.waveLengths, "y", 400., 700.).name("Green").listen();
      waveFolder.add(this.app.atmos.waveLengths, "z", 400., 700.).name("Blue").listen();
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

      // Timeline
        var swiper = new Swiper(".swiper", {
          autoHeight: true,
          speed: 500,
          direction: "horizontal",
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
          },
          pagination: {
            el: ".swiper-pagination",
            type: "progressbar"
          },
          loop: false,
          effect: "slide",
          spaceBetween: 30,
          on: {
            init: function () {
              $(".swiper-pagination-custom .swiper-pagination-switch").removeClass("active");
              $(".swiper-pagination-custom .swiper-pagination-switch").eq(0).addClass("active");
            },
            slideChangeTransitionStart: function () {
              $(".swiper-pagination-custom .swiper-pagination-switch").removeClass("active");
              $(".swiper-pagination-custom .swiper-pagination-switch").eq(swiper.realIndex).addClass("active");
            }
          }
        });
        
        $(".swiper-pagination-custom .swiper-pagination-switch").click(function () {
          // swiper.slideTo($(this).index());
          // $(".swiper-pagination-custom .swiper-pagination-switch").removeClass("active");
          // $(this).addClass("active");
        });
      
   

    }


    changeView(view) {
      this.normalViewButton.classList.remove("active");
      this.platesViewButton.classList.remove("active");
      this.riversViewButton.classList.remove("active");
      this.windViewButton.classList.remove("active");
      this.temperatureViewButton.classList.remove("active");
      this.app.planet.displayTextureMap = view;
      this.app.planet.renderScene();
    }

    createLeftPanel() {

      // View options
      this.normalViewButton = document.getElementById("normal-view-button");
      this.normalViewButton.addEventListener("click", () => {
        this.changeView(0);
        this.normalViewButton.classList.toggle("active");
      });
      this.platesViewButton = document.getElementById("plates-view-button");
      this.platesViewButton.addEventListener("click", () => {
        this.changeView(1);
        this.platesViewButton.classList.add("active");
      });
      this.riversViewButton = document.getElementById("rivers-view-button");
      this.riversViewButton.addEventListener("click", () => {
        this.changeView(2);
        this.riversViewButton.classList.add("active");
      });
      this.windViewButton = document.getElementById("wind-view-button");
      this.windViewButton.addEventListener("click", () => {
        this.changeView(3);
        this.windViewButton.classList.add("active");
      });
      this.temperatureViewButton = document.getElementById("temperature-view-button");
      this.temperatureViewButton.addEventListener("click", () => {
        this.changeView(4);
        this.temperatureViewButton.classList.add("active");
      });


      // Add Terrain
      let addTerrainButton = document.getElementById("add-terrain-button");
      this.app.addingTerrain = false;
      addTerrainButton.addEventListener("click", () => {
        addTerrainButton.classList.toggle("active");
        delTerrainButton.classList.remove("active");

        if (this.app.addingTerrain) {
          this.app.addingTerrain = false;
          this.app.controls.enabled = true;
        } else {
          this.app.addingTerrain = true;
          this.app.removingTerrain = false;
          this.app.controls.enabled = false;
        }
      });
      // Del Terrain
      let delTerrainButton = document.getElementById("del-terrain-button");
      this.app.removingTerrain = false;
      delTerrainButton.addEventListener("click", () => {
        addTerrainButton.classList.remove("active");
        delTerrainButton.classList.toggle("active");

        if (this.app.removingTerrain) {
          this.app.removingTerrain = false;
          this.app.controls.enabled = true;
        } else {
          this.app.removingTerrain = true;
          this.app.addingTerrain = false;
          this.app.controls.enabled = false;
        }
      });


      // Play/stop simulation
      let playButton = document.getElementById("play-pause-button");
      playButton.addEventListener("click", () => {
        playButton.classList.toggle("active");
        playButton.children[0].classList.toggle("fa-play");
        playButton.children[0].classList.toggle("fa-pause");
        this.app.playing = !this.app.playing;
      });
    }

}

export default Interface;