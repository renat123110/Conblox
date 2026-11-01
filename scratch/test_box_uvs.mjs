// Test UV orientation on BoxGeometry
import '../app/js/vendor/three.min.js';
const THREE = globalThis.THREE;

const geo = new THREE.BoxGeometry(2, 2, 1);
const pos = geo.attributes.position.array;
const uv = geo.attributes.uv.array;

const faceNames = ['+X (Right)', '-X (Left)', '+Y (Top)', '-Y (Bottom)', '+Z (Back)', '-Z (Front)'];
for (let f = 0; f < 6; f++) {
    console.log(`\n=== Face ${f}: ${faceNames[f]} ===`);
    for (let v = 0; v < 4; v++) {
        const pIdx = (f * 4 + v) * 3;
        const uIdx = (f * 4 + v) * 2;
        console.log(`  v${v}: pos=(${pos[pIdx].toFixed(1)}, ${pos[pIdx+1].toFixed(1)}, ${pos[pIdx+2].toFixed(1)})  uv=(${uv[uIdx].toFixed(1)}, ${uv[uIdx+1].toFixed(1)})`);
    }
}
