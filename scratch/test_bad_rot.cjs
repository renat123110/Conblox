const fs = require('fs');
const vm = require('vm');
const threeCode = fs.readFileSync('app/js/vendor/three.min.js', 'utf8');
const context = vm.createContext({ console, Math });
vm.runInContext(threeCode, context);
const THREE = context.THREE;

const front = new THREE.Vector3(0, 0, -1);
const top = new THREE.Vector3(0, 1, 0);

// Rotate by (-90, 0, 180)
const eulerBad = new THREE.Euler(-Math.PI / 2, 0, Math.PI, 'YXZ');
const frontBad = front.clone().applyEuler(eulerBad);
const topBad = top.clone().applyEuler(eulerBad);

console.log('With bad rotation:');
console.log('Front (-Z) goes to:', frontBad);
console.log('Top (+Y) goes to:', topBad);

// Rotate by (0, 0, 0)
const eulerGood = new THREE.Euler(0, 0, 0, 'YXZ');
const frontGood = front.clone().applyEuler(eulerGood);
const topGood = top.clone().applyEuler(eulerGood);

console.log('With good rotation:');
console.log('Front (-Z) goes to:', frontGood);
console.log('Top (+Y) goes to:', topGood);
