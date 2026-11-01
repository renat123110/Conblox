import fs from 'fs';
import { parseRbxm } from '../app/js/studio/RbxmImporter.js';

const buf = fs.readFileSync('C:/Users/Renat/Desktop/Conblox/scratch/walk_anim.rbxm');
const { roots } = parseRbxm(buf);

console.log('Roots count:', roots.length);
for (const r of roots) {
    console.log('Root:', r.ClassName, r.Name);
    console.log('Children count:', r.GetChildren ? r.GetChildren().length : 0);
    for (const c of (r.GetChildren ? r.GetChildren().slice(0, 5) : [])) {
        console.log('  Child:', c.ClassName, c.Name, 'Time:', c.Time);
        for (const p of (c.GetChildren ? c.GetChildren().slice(0, 5) : [])) {
            console.log('    Pose:', p.ClassName, p.Name, 'CFrame:', p.CFrame);
        }
    }
}
