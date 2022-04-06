import BaseApp from './src/js/BaseApp.js'
import Planet from './src/js/Planet.js'
import Interface from './src/js/Interface.js'
import Atmosphere from './src/js/Atmosphere.js'


export default class app extends BaseApp {

    constructor () {
        super();

        this.time = 0;
        this.playing = false;

        // Planet
        this.planet = new Planet(this);
        this.scene.add(this.planet.view);

        // Atmos
        this.atmos = new Atmosphere(this);

        // Interface (GUI)
        this.interface = new Interface(this);

        this.render();
    }

    render() {
        if (this.playing) {
            this.time += 0.016;
        }
        
        super.render();
        this.planet.update();
        this.atmos.update();
    }

}

new app();