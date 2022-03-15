import * as THREE from "https://cdn.skypack.dev/three@0.136";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js";
import Stats from "https://cdn.skypack.dev/three@0.136/examples/jsm/libs/stats.module";


class BaseApp {

    constructor() {

        // Camera
        this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100000 );
        this.camera.position.z = 4000;
        window.camera = this.camera;

        // Scene
        this.scene = new THREE.Scene();

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            alpha: false,
            antialias: true
        });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        window.renderer = this.renderer;

        // Add to html
        document.getElementById('container').appendChild( this.renderer.domElement );

        // Stats
        this.stats = Stats()
        document.body.appendChild(this.stats.dom)

        // Lights
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.04);
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight( 0xffffff, 1.2 );
        this.directionalLight.position.set( 1, 1, 1000 );
        this.scene.add(this.directionalLight);
        window.light = this.directionalLight;

        // Camera controls
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5;
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = 0.01;
        this.controls.zoomSpeed = 0.2;

        // Events
        window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
    }


    onWindowResize() {
        // Update camera
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        // Update renderer
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
    

    render(timestamp) {
        requestAnimationFrame( this.render.bind(this) );
        this.controls.update();
        this.stats.update()
        this.renderer.render( this.scene, this.camera );
    }

}

export default BaseApp;