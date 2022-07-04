import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.139/examples/jsm/controls/OrbitControls.js';
import Stats from "https://unpkg.com/three@0.139/examples/jsm/libs/stats.module";

// Browse effects here -> https://unpkg.com/browse/three@0.139/examples/jsm/postprocessing/
import { EffectComposer  } from 'https://unpkg.com/three@0.139/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.139/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.139/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'https://unpkg.com/three@0.139/examples/jsm/postprocessing/SMAAPass.js';


class BaseApp {

    constructor() {

        // Camera
        const fov = 35;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 0.1;
        const far = 999999.0;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(1212371., -10873., 76058.);
        window.camera = this.camera;

        // Main scene
        this.scene = new THREE.Scene();

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        // this.renderer.autoClear = false;
        this.renderer.setClearColor( 0x000000, 0 );
        window.renderer = this.renderer;

        // Add to html
        document.getElementById('container').appendChild( this.renderer.domElement );

        // Stats
        this.stats = Stats();
        this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.getElementById('stats-container').appendChild(this.stats.domElement);
        this.stats.domElement.style.position = null;
        this.stats.domElement.style.top = null;
        this.stats.domElement.style.left = null;

        // Lights
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.04);
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
        // this.directionalLight.position.set( 1, 1, 0);
        this.scene.add(this.directionalLight);
        window.light = this.directionalLight;

        // Camera controls
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5;
        this.controls.autoRotate = false
        this.controls.autoRotateSpeed = 2.0;
        this.controls.zoomSpeed = 0.2;

        // Mouse
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.pointerLeft = false;
        this.pointerRight = false;

        // Events
        window.addEventListener( 'resize', this.onWindowResize.bind(this));
        window.addEventListener( 'pointermove', this.onPointerMove.bind(this));
        window.addEventListener( 'pointerup', this.onPointerUp.bind(this));
        window.addEventListener( 'pointerdown', this.onPointerDown.bind(this));
    }

    postProcessing() {
        this.composer = new EffectComposer( this.renderer );
        this.composer.addPass(  new RenderPass( this.scene, this.camera ) );
        this.composer.addPass(  new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 2.5, 1., 0.6 ) );
        this.composer.addPass(  new SMAAPass( window.innerWidth, window.innerHeight) );
        // https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html        
    }

    updatePostProcessing() {
        // Update post-processing bloom
        if (this.playing && this.time > 3 && this.time < 8) {
            this.composer.passes[1].strength = 2.5 - (THREE.MathUtils.smoothstep((this.time-3.)/8., 0., 1.)*2.5);
            this.composer.passes[1].threshold = 0.6 + THREE.MathUtils.smoothstep((this.time-3.)/8., 0., 1.)*0.4;
        }
    }

    render(timestamp) {
        requestAnimationFrame( this.render.bind(this) );
        this.controls.update();
        this.stats.update()
        this.updatePostProcessing();

        // Update the picking ray with the camera and pointer position
	    this.raycaster.setFromCamera( this.pointer, this.camera );

        // Render scene
        // this.renderer.render( this.scene, this.camera );
        this.composer.render();
    }

    onPointerMove( event ) {
        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components
        this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }

    onPointerDown( event ) {
        // Left mouse button is down
        if (event.button === 0) this.mouseClick = true;
    }

    onPointerUp( event ) {
        // Left mouse button is up
        if (event.button === 0) this.mouseClick = false;
    }

    onWindowResize() {
        // Update camera
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        // Update renderer
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

}

export default BaseApp;