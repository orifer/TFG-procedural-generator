import * as THREE from 'three';
import { GUI } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/libs/lil-gui.module.min.js';
import gsap from 'https://cdn.skypack.dev/gsap@3.10.4';
// INFO: https://lil-gui.georgealways.com/

class Interface {

    constructor(app) {
      this.app = app;     // Main app
      this.loadDialog();
    }

    init() {
      // Create the GUI
      window.gui = new GUI({ autoPlace: false });      
    }

    loadDialog() {
      var that = this; // context

      $( function() { // Document ready

        // Dialog
        $( "#dialog-start" ).dialog({
          dialogClass: "no-close",
          resizable: false,
          height: "auto",
          width: 600,
          modal: false,
          buttons: {
            Ok: function() {
              // Save the values before closing the dialog
              var sceneId = $(':radio:checked', this)[0].value;
              var resolution = $(':radio:checked', this)[1].value;
              var seed = $('#seed-1', this)[0].value;

              that.app.loadScene({
                sceneId: sceneId,
                resolution: resolution,
                seed: seed
              });

              $( this ).dialog( "close" );
            }
          }
        });

        // Checkbox constructor parameters
        $( ".checkboxradio input" ).checkboxradio({
          icon: false
        });

        // Random button
        $( "#random-seed-button" ).click(function() {
          $('#seed-1').val(THREE.MathUtils.randInt(0, 9999999999));
        });
        $('#seed-1').val(THREE.MathUtils.randInt(0, 9999999999));
      });
    }

    loadHistoryInterface() {
      // Show elements
      $(".left-panel").removeClass("hide");
      $("#left-info-panel").removeClass("hide");
      $("#stats-container").removeClass("hide");
      $("#bottom-timeline").removeClass("hide");

      // Load the panels
      this.createRightPanel();
      this.createPlanetCategory();
      this.createAtmosphereCategory();
      this.createDebugCategory();
      this.createCameraCategory();
      this.createBottomPanel();
      this.createLeftPanel();
      
      // Seed
      window.gui.add(this.app, "seed").disable();

      // Time
      window.gui.add(this.app, "time", 0., 100.).listen();
      
      window.gui.close();
    }


    loadBasicInterface() {
      // Show elements
      $("#stats-container").removeClass("hide");

      // Load the panels
      this.createRightPanel();
      this.createPlanetCategory();
      this.createAtmosphereCategory();
      this.createDebugCategory();
      this.createCameraCategory();
      
      // Seed
      window.gui.add(this.app, "seed").disable();

      // Time
      window.gui.add(this.app, "time", 0., 100.).listen();
      
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
      infoBox.innerHTML = "Planet<br><div id='planetName'>Earth-like</div>";
      infoBoxHolder.appendChild(infoBox);
  
      // Open controls btn
      infoBoxHolder.appendChild(window.gui.domElement);
    }

    createPlanetCategory() {
      let matFolder = window.gui.addFolder('Planeta');

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
      let atmFolder = window.gui.addFolder('Atmosfera');

      atmFolder.add(this.app.atmos, "size", 0.0, 0.2).listen();
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
      let cameraFolder = window.gui.addFolder('Càmera');
      cameraFolder.add(this.app.controls, "autoRotate").name('Rotar');
      cameraFolder.add(this.app.camera, "fov", 20, 120).name("FOV").onChange(value => { this.app.camera.updateProjectionMatrix() });
      cameraFolder.close();
    }


    createBottomPanel() {

      // Timeline
        var swiper = new Swiper(".swiper", {
          autoHeight: true,
          speed: 8000,
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
            slideChangeTransitionEnd: function () {
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

        // Add event listener for the continue button
        $(".swiper-button-next")[0].addEventListener("click", this.onButtonNextClick.bind(this));
        
      }
      
    onButtonNextClick() {
      this.clickTime = this.app.time;
      this.app.playing = true;
      setTimeout(this.nextStep.bind(this), 8000);

      // Stars
      gsap.to(this.app.stars.view.rotation , { 
        x: 0, 
        y: this.app.stars.view.rotation.y - 4, 
        z: 0 ,
        duration: 10, 
        ease: "power2.inOut"
      });

      // Planet
      gsap.to(this.app.planet.ground.rotation , { 
        x: 0, 
        y: this.app.planet.ground.rotation.y + 8, 
        z: 0 ,
        duration: 5, 
        ease: "power1.inOut"
      });

      // Camera
      this.app.controls.autoRotate = true;
      setTimeout(this.stopCamera.bind(this), 5000);
    }

    stopCamera() {
      this.app.controls.autoRotate = false;
      this.app.controls.autoRotateSpeed = 2.0;

      // Camera to position
      gsap.to(this.app.camera.position , { x: 4.6, y: 1., z: 2., duration: 4, ease: "power3.inOut" });
    }

    // Restart values after animation step
    nextStep() {
      this.app.playing = false;
      this.app.planet.rotationSpeed = 0.0003;
    }


    // This is executed on every tick
    update() {
      var deltaTime = this.app.time - this.clickTime;

      // Create a normalFunction-like curve
      var duration = 4.;
      var smoothValue = THREE.MathUtils.smoothstep(deltaTime/duration,0.,0.5) - THREE.MathUtils.smoothstep(deltaTime/duration,0.5,1.)
      if (smoothValue)  this.app.controls.autoRotateSpeed = smoothValue * -30.;
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

    goToPlanet() {
      gsap.to(this.app.camera.position , { x: 4.6, y: 1., z: 2., duration: 8, ease: "power4.out" });
    }

    goToPlanetFast() {
      this.app.camera.position.set(4.6, 1., 2.);
    }

}

export default Interface;