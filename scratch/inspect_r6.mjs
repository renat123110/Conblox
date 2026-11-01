import fs from 'fs';
import { parseRbxm } from '../app/js/studio/RbxmImporter.js';

for (const filename of ['R6Template.rbxm', 'R6TemplateCat.rbxm']) {
    console.log('=== FILE: ' + filename + ' ===');
    const buf = fs.readFileSync(filename);
    const { roots } = parseRbxm(new Uint8Array(buf));
    const model = roots[0];
    console.log('Root model:', model.Name, model.ClassName);
    for (const desc of model.GetDescendants()) {
        let extra = '';
        if (desc.ClassName === 'Decal' || desc.ClassName === 'Texture') {
            extra = ' Texture=' + desc.Texture + ' Face=' + desc.Face;
        } else if (desc.ClassName === 'SpecialMesh') {
            extra = ' MeshId=' + desc.MeshId + ' TextureId=' + desc.TextureId + ' MeshType=' + desc.MeshType;
        } else if (desc.ClassName === 'Shirt') {
            extra = ' ShirtTemplate=' + desc.ShirtTemplate;
        } else if (desc.ClassName === 'Pants') {
            extra = ' PantsTemplate=' + desc.PantsTemplate;
        } else if (desc.IsA && desc.IsA('BasePart')) {
            extra = ' Size=(' + desc.Size?.x + ', ' + desc.Size?.y + ', ' + desc.Size?.z + ') CFrame=' + JSON.stringify(desc.CFrame);
        }
        console.log('  ' + desc.ClassName + ': ' + desc.Name + extra);
    }
}
