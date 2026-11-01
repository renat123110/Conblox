import fs from 'fs';
import { parseRbxm } from '../app/js/studio/RbxmImporter.js';

const buf = fs.readFileSync('R6TemplateCat.rbxm');
const { roots } = parseRbxm(buf.buffer);

function printTree(inst, depth = 0) {
    const indent = '  '.repeat(depth);
    let details = `ClassName=${inst.ClassName}, Name=${inst.Name}`;
    if (inst.Position) details += `, Pos=(${inst.Position.x.toFixed(2)}, ${inst.Position.y.toFixed(2)}, ${inst.Position.z.toFixed(2)})`;
    if (inst.Orientation) details += `, Ori=(${inst.Orientation.x.toFixed(2)}, ${inst.Orientation.y.toFixed(2)}, ${inst.Orientation.z.toFixed(2)})`;
    if (inst.Size) details += `, Size=(${inst.Size.x.toFixed(2)}, ${inst.Size.y.toFixed(2)}, ${inst.Size.z.toFixed(2)})`;
    if (inst.MeshType) details += `, MeshType=${inst.MeshType}`;
    if (inst.MeshId) details += `, MeshId=${inst.MeshId}`;
    if (inst.Texture) details += `, Texture=${inst.Texture}, Face=${inst.Face}`;
    if (inst.ShirtTemplate) details += `, ShirtTemplate=${inst.ShirtTemplate}`;
    if (inst.PantsTemplate) details += `, PantsTemplate=${inst.PantsTemplate}`;
    console.log(indent + details);
    for (const ch of inst.GetChildren()) {
        printTree(ch, depth + 1);
    }
}

for (const r of roots) {
    printTree(r);
}
