import * as THREE from 'three';

class BufferManager {

    constructor(renderer = THREE.WebGLRenderer, {width, height}) {
        this.readBuffer = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            stencilBuffer: false
        })

        this.writeBuffer = this.readBuffer.clone()
    }

    swap() {
        const temp = this.readBuffer
        this.readBuffer = this.writeBuffer
        this.writeBuffer = temp
    }

    render(scene, camera, toScreen = false) {
        renderer.setRenderTarget(this.writeBuffer);
        if (toScreen) {
            renderer.render(scene, camera);
        } else {
            renderer.render(scene, camera, this.writeBuffer, true);
        }
        renderer.setRenderTarget(null);
        this.swap()
    }

    dispose() {
        this.readBuffer.dispose();
        this.writeBuffer.dispose();
    }

}

export default BufferManager;