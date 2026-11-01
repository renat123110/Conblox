const fs = require('fs');
const vm = require('vm');
const threeCode = fs.readFileSync('app/js/vendor/three.min.js', 'utf8');
const context = vm.createContext({ console, Math });
vm.runInContext(threeCode, context);
const THREE = context.THREE;

function toVector3(value) {
    if (!value) return new THREE.Vector3();
    return new THREE.Vector3(value.X ?? value.x ?? 0, value.Y ?? value.y ?? 0, value.Z ?? value.z ?? 0);
}

function toCFrame(value) {
    const position = toVector3(value.Position);
    const matrix = value.Orientation;
    if (!Array.isArray(matrix) || matrix.length !== 9) return { position, orientation: new THREE.Vector3() };

    const x = Math.asin(Math.max(-1, Math.min(1, -matrix[5])));
    const cosX = Math.cos(x);
    let y;
    let z;
    if (Math.abs(cosX) > 1e-6) {
        y = Math.atan2(matrix[2], matrix[8]);
        z = Math.atan2(matrix[3], matrix[4]);
    } else {
        y = Math.atan2(-matrix[6], matrix[0]);
        z = 0;
    }
    const degrees = 180 / Math.PI;
    return { position, orientation: new THREE.Vector3(x * degrees, y * degrees, z * degrees) };
}

const rawC0 = { Position: { X: 0, Y: 1, Z: 0 }, Orientation: [-1, 0, 0, 0, 0, 1, 0, 1, 0] };
const rawC1 = { Position: { X: 0, Y: -0.5, Z: 0 }, Orientation: [-1, 0, 0, 0, 0, 1, 0, 1, 0] };

const c0 = toCFrame(rawC0);
const c1 = toCFrame(rawC1);

console.log('c0 orientation degrees:', c0.orientation);
console.log('c1 orientation degrees:', c1.orientation);

const toMatrix = (frame) => {
    const object = new THREE.Object3D();
    object.position.set(frame.position.x, frame.position.y, frame.position.z);
    object.rotation.set(
        frame.orientation.x * Math.PI / 180,
        frame.orientation.y * Math.PI / 180,
        frame.orientation.z * Math.PI / 180,
        'YXZ'
    );
    object.updateMatrix();
    return object.matrix;
};

// If Torso has orientation (0, 0, 0) and position (0, 3, 0):
const torsoPos = new THREE.Vector3(0, 3, 0);
const torsoOri = new THREE.Vector3(0, 0, 0);

const part1Matrix = toMatrix({ position: torsoPos, orientation: torsoOri })
    .multiply(toMatrix(c0))
    .multiply(new THREE.Matrix4()) // Transform
    .multiply(new THREE.Matrix4()) // CurrentAngle
    .multiply(toMatrix(c1).invert());

const pos = new THREE.Vector3();
const quat = new THREE.Quaternion();
const scl = new THREE.Vector3();
part1Matrix.decompose(pos, quat, scl);
const euler = new THREE.Euler().setFromQuaternion(quat, 'YXZ');
console.log('Result Head pos:', pos);
console.log('Result Head euler degrees:', euler.x * 180 / Math.PI, euler.y * 180 / Math.PI, euler.z * 180 / Math.PI);
