import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';

import fragment from './src/shaders/fragment.js';
import vertex from './src/shaders/vertex.js';

export default class app {

    constructor () {
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        document.getElementById('container').appendChild( this.renderer.domElement );

        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 500 );
        this.camera.position.z = 2;
        this.scene = new THREE.Scene();
        this.addMesh();
        this.time = 0;
        this.render();

        this.onWindowResize();
        window.addEventListener( 'resize', this.onWindowResize.bind(this), false );

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    }

    addMesh() {
        this.geometry = new THREE.SphereBufferGeometry( 1, 32, 32 );
        // this.material = new THREE.MeshNormalMaterial();
        this.material = new THREE.ShaderMaterial( {
            uniforms: {
                time: { value: 0 },
                u_resolution: { type: "v2", value: new THREE.Vector2() },
                u_mouse: { type: "v2", value: new THREE.Vector2() }
            },
            vertexShader: vertex,
            fragmentShader: fragment
        } );

        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.scene.add( this.mesh );
    }

    render() {
        this.time += 0.05;
        this.material.uniforms.time.value = this.time;

        // this.mesh.rotation.x += 0.001;
        // this.mesh.rotation.y += 0.002;
        this.renderer.render( this.scene, this.camera );
        window.requestAnimationFrame(this.render.bind(this))
    }

    onWindowResize( event ) {
        // Update camera
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        // Update renderer
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        // Some variables
        this.width = this.renderer.domElement.width;
        this.height = this.renderer.domElement.height;
    }

}

new app();