const fs = require('fs');
const vm = require('vm');
const threeCode = fs.readFileSync('app/js/vendor/three.min.js', 'utf8');
const context = vm.createContext({ console, Math });
vm.runInContext(threeCode, context);
const THREE = context.THREE;

function createRoundedBoxGeometry(width, height, depth, radiusFactor = 0.25) {
    const radius = Math.min(width, height, depth) * radiusFactor;
    const shape = new THREE.Shape();
    const halfWidth = width / 2 - radius;
    const halfHeight = height / 2 - radius;
    const left = -halfWidth + radius;
    const right = halfWidth - radius;
    const bottom = -halfHeight + radius;
    const top = halfHeight - radius;

    shape.moveTo(left, -halfHeight);
    shape.lineTo(right, -halfHeight);
    shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, bottom);
    shape.lineTo(halfWidth, top);
    shape.quadraticCurveTo(halfWidth, halfHeight, right, halfHeight);
    shape.lineTo(left, halfHeight);
    shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, top);
    shape.lineTo(-halfWidth, bottom);
    shape.quadraticCurveTo(-halfWidth, -halfHeight, left, -halfHeight);

    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: Math.max(0.01, depth - radius * 2),
        bevelEnabled: true,
        bevelSegments: 10,
        bevelSize: radius,
        bevelThickness: radius,
        curveSegments: 12
    });
    geometry.translate(0, 0, -depth / 2 + radius);
    geometry.computeBoundingBox();
    return geometry;
}

const geo = createRoundedBoxGeometry(1.2078, 1.21242, 1.207847);
console.log('geo bounding box:', geo.boundingBox);
