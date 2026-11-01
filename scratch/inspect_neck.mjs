
import fs from 'fs';
import { parseRbxm } from '../app/js/studio/RbxmImporter.js';
const buf = fs.readFileSync('R6TemplateCat.rbxm');
const { roots } = parseRbxm(new Uint8Array(buf));
const model = roots[0];
for (const desc of model.GetDescendants()) {
    if (desc.ClassName === 'Motor6D') {
        console.log('Motor6D:', desc.Name, 'Part0:', desc.Part0?.Name, 'Part1:', desc.Part1?.Name);
        console.log('  C0:', JSON.stringify(desc.C0));
        console.log('  C1:', JSON.stringify(desc.C1));
    }
}
