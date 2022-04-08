import BaseApp from './src/js/BaseApp.js'
import Planet from './src/js/Planet.js'
import Interface from './src/js/Interface.js'
import Atmosphere from './src/js/Atmosphere.js'
import Sun from './src/js/Sun.js';


export default class app extends BaseApp {

    constructor () {
        super();

        this.time = 0;
        this.playing = false;

        this.sun = new Sun(this);
        this.planet = new Planet(this);
        this.atmos = new Atmosphere(this);

        // Interface (GUI)
        this.interface = new Interface(this);

        this.render();
    }

    render() {
        super.render();
        
        if (this.playing) {
            this.time += 0.016;
        }
        
        this.planet.render();
        this.atmos.update();
        
        this.renderer.autoClear = false;
        // renderer.clearDepth();
        this.sun.render();
        
        renderer.autoClear = true;
    }

}

new app();