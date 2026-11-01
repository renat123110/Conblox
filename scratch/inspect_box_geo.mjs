import * as THREE from './app/js/vendor/three.min.js';

const geo = new THREE.BoxGeometry(2, 2, 1);
const pos = geo.attributes.position.array;
const uvs = geo.attributes.uv.array;

// There are 6 faces, each with 4 vertices (indexed).
// Total vertices = 24.
const faceNames = ['+X (Right)', '-X (Left)', '+Y (Top)', '-Y (Bottom)', '+Z (Back)', '-Z (Front)'];

for (let f = 0; f < 6; f++) {
    console.log(`=== Face ${f}: ${faceNames[f]} ===`);
    for (let v = 0; v < 4; v++) {
        const i = f * 4 + v;
        const p = `pos=(${pos[i*3].toFixed(1)}, ${pos[i*3+1].toFixed(1)}, ${pos[i*3+2].toFixed(1)})`;
        const u = `uv=(${uvs[i*2].toFixed(2)}, ${uvs[i*2+1].toFixed(2)})`;
        console.log(`  v${v}: ${p} ${u}`);
    }
}
