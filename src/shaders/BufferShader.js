import * as THREE from 'three';

class BufferShader {

    constructor(vertexShader, fragmentShader, uniforms = {}) {
        this.uniforms = uniforms;
        this.material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms
        })
        this.scene = new THREE.Scene();
        this.scene.add(new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material));
    }

}

export default BufferShader;
