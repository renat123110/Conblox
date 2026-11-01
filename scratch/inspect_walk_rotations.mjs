import fs from 'fs';
import { parseRbxm } from '../app/js/studio/RbxmImporter.js';

const buf = fs.readFileSync('app/content/animations/180426354.rbxm');
const parsed = parseRbxm(new Uint8Array(buf));
const kfs = parsed.roots.find(r => r.ClassName === 'KeyframeSequence') || parsed.roots[0];
const kfList = kfs.GetKeyframes();
for (let idx of [0, 5, 10, 15]) {
    const kf = kfList[idx];
    const poses = kf.GetDescendants().filter(i => i.ClassName === 'Pose');
    console.log(`--- KF ${idx} time=${kf.Time} ---`);
    for (let p of poses) {
        console.log(p.Name, 'rot:', JSON.stringify(p.CFrame.orientation));
    }
}
