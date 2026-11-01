import fs from 'fs';
import { RobloxFile } from '../app/js/vendor/rbxm-parser.js';
const buf = fs.readFileSync('CuteRobot.rbxm');
const parsed = new RobloxFile(buf);
function dump(node, depth=0) {
    let extra = '';
    if (node.className === 'Shirt') {
        extra = ' ShirtTemplate=' + node._props?.get('ShirtTemplate')?.value;
    } else if (node.className === 'Pants') {
        extra = ' PantsTemplate=' + node._props?.get('PantsTemplate')?.value;
    } else if (node.className === 'CharacterMesh') {
        const bp = node._props?.get('BodyPart')?.value;
        extra = ' MeshId=' + node._props?.get('MeshId')?.value + ' BodyPart=' + (bp?._name || bp);
    }
    console.log(' '.repeat(depth) + node.className + ': ' + node.name + extra);
    for (const c of (node.children || [])) dump(c, depth + 2);
}
for (const root of parsed.root.children) dump(root);
