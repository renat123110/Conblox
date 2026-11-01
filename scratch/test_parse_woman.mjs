import fs from 'fs';
import { parseRbxm } from '../app/js/studio/RbxmImporter.js';

const buf = fs.readFileSync('C:/Users/Renat/Desktop/Conblox/WomanBody.rbxm');
const { roots } = parseRbxm(buf);

console.log('Roots count:', roots.length);
for (const r of roots) {
    console.log('Class:', r.ClassName, 'Name:', r.Name);
    console.log('BodyPart:', r.BodyPart);
    console.log('MeshId:', r.MeshId);
    console.log('BaseTextureId:', r.BaseTextureId);
    console.log('OverlayTextureId:', r.OverlayTextureId);
}
