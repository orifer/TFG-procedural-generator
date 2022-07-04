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

    loadScene(sceneId, props) {        
        switch (sceneId) {
            case "0": this.loadScene0(props); break;
            case "1": this.loadScene1(props); break;
            default: break;
        }
    }

    loadScene0(props) {
        this.sceneId = 0;

        this.sun = new Sun(this);
        this.planet = new Planet(this, props.resolution);
        this.atmos = new Atmosphere(this);
        
        this.interface.init();
        this.interface.goToPlanet();
        this.interface.loadHistoryInterface();
    }

    render() {
        super.render();
        
        if (this.playing) {
            this.time += 0.016;
        }

        switch (this.sceneId) {
            case 0:
                this.planet.update();
                this.atmos.update();
                this.sun.update();     
                this.stars.update();  
                this.interface.update();
                break;

            case 1:
                break;
        
            default:
                break;
        }
        
    }

}

new app();