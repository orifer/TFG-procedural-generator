import * as THREE from 'three';
import BaseApp from './src/js/BaseApp.js'
import Planet from './src/js/Planet.js'
import Interface from './src/js/Interface.js'
import Atmosphere from './src/js/Atmosphere.js'
import Sun from './src/js/Sun.js';
import Stars from './src/js/Stars.js';


export default class app extends BaseApp {

    constructor() {
        super();

        // Interface (GUI)
        this.interface = new Interface(this);

        this.time = 0;
        this.playing = false;

        this.stars = new Stars(this);
        
        super.postProcessing();
        this.render();
    }

    loadScene(props) {
        this.sceneId = props.sceneId;

        // Seed
        this.seed = props.seed;
        props.seed = (THREE.MathUtils.seededRandom(this.seed)  + 0.5); // Normalized seed between 0.5 and 1.5

        switch (this.sceneId) {
            case "0": this.loadScene0(props); break;
            case "1": this.loadScene1(props); break;
            default: break;
        }
    }

    // Earth-like
    loadScene0(props) {
        this.sun = new Sun(this);
        this.planet = new Planet(this, props);
        this.atmos = new Atmosphere(this, props);
        
        this.interface.init();
        this.interface.goToPlanet();
        this.interface.loadHistoryInterface();
    }

    // Water world
    loadScene1(props) {
        this.sun = new Sun(this);
        this.planet = new Planet(this, props);
        this.atmos = new Atmosphere(this, props);
        this.atmos.size = 0.04;
        this.atmos.waveLengths = new THREE.Vector3(700, 530, 440);
        this.playing = true;
        
        this.interface.init();
        this.interface.goToPlanetFast();
        this.interface.loadBasicInterface();
    }

    render() {
        super.render();
        
        if (this.playing) {
            this.time += 0.016;
        }

        switch (this.sceneId) {
            case "0":
                this.planet.update();
                this.atmos.update();
                this.sun.update();     
                this.stars.update();  
                this.interface.update();
                break;

            case "1":
                this.planet.update();
                this.atmos.update();
                this.sun.update();     
                this.stars.update();  
                this.interface.update();
                break;
        
            default:
                break;
        }
    }

}

new app();