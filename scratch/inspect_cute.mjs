
import fs from 'fs';
import { parseRbxm } from '../app/js/studio/RbxmImporter.js';
const buf = fs.readFileSync('CuteRobot.rbxm');
const { roots } = parseRbxm(new Uint8Array(buf));
const model = roots[0];
for (const desc of model.GetDescendants()) {
    if (desc.IsA && desc.IsA('BasePart')) {
        console.log(desc.Name, 'Pos:', desc.Position, 'CFrame:', desc.CFrame ? JSON.stringify(desc.CFrame) : 'none');
    }
}
