import fs from 'fs';
import { parseRbxm } from '../app/js/studio/RbxmImporter.js';

const buf = fs.readFileSync('C:/Users/Renat/Desktop/Conblox/app/Animate.rbxm');
const { roots } = parseRbxm(buf);

function dump(inst, depth = 0) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}${inst.ClassName}: "${inst.Name}"`);
    if (inst.ClassName === 'LocalScript' || inst.ClassName === 'Script') {
        const src = inst.Source || '';
        console.log(`${indent}  [Source length: ${src.length} chars, first line: ${src.split('\n')[0]}]`);
    }
    if (inst.ClassName === 'Animation') {
        console.log(`${indent}  [AnimationId: ${inst.AnimationId}]`);
    }
    if (inst.ClassName === 'StringValue') {
        console.log(`${indent}  [Value: ${inst.Value}]`);
    }
    for (const c of (inst.GetChildren ? inst.GetChildren() : [])) {
        dump(c, depth + 1);
    }
}

console.log('Roots count:', roots.length);
for (const r of roots) {
    dump(r);
}
