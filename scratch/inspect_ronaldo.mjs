import fs from 'fs';
import { RobloxFile } from '../app/js/vendor/rbxm-parser.js';

const buf = fs.readFileSync('ronaldo.rbxm');
const file = RobloxFile.parse(buf);
console.log('Root instances:', file.Instances.length);
function dump(inst, indent = '') {
    console.log(indent + inst.ClassName + ' "' + inst.Name + '"');
    if (inst._props) {
        for (const [k, v] of inst._props) {
            if (k.toLowerCase().includes('mesh') || k.toLowerCase().includes('texture') || k === 'VertexColor' || k === 'Scale' || k === 'Offset' || k === 'Size' || k === 'Color') {
                console.log(indent + '  ' + k + ' = ' + JSON.stringify(v?.value));
            }
        }
    }
    for (const child of inst.Children || []) {
        dump(child, indent + '  ');
    }
}
for (const inst of file.Instances) {
    dump(inst);
}
