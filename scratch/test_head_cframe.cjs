const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('app/js/vendor/rbxm-parser.js', 'utf8');
const context = vm.createContext({ console, process, globalThis: {}, Uint8Array, ArrayBuffer, DataView, TextDecoder, TextEncoder });
context.globalThis = context;
const m = new vm.SourceTextModule(code, { context });
(async () => {
    await m.link(() => {});
    await m.evaluate();
    const { RobloxFile } = m.namespace;
    const buf = fs.readFileSync('R6TemplateCat.rbxm');
    const file = RobloxFile.ReadFromBuffer(new Uint8Array(buf));
    
    // Import RbxmImporter logic
    function toVector3(value) {
        if (!value) return { x: 0, y: 0, z: 0 };
        return { x: value.X ?? value.x, y: value.Y ?? value.y, z: value.Z ?? value.z };
    }

    function toCFrame(value) {
        if (!value) return { position: {x:0,y:0,z:0}, orientation: {x:0,y:0,z:0} };
        const position = toVector3(value.Position);
        const matrix = value.Orientation;
        if (!Array.isArray(matrix) || matrix.length !== 9) return { position, orientation: {x:0,y:0,z:0} };

        const x = Math.asin(Math.max(-1, Math.min(1, -matrix[5])));
        const cosX = Math.cos(x);
        let y;
        let z;
        if (Math.abs(cosX) > 1e-6) {
            y = Math.atan2(matrix[2], matrix[8]);
            z = Math.atan2(matrix[3], matrix[4]);
        } else {
            y = Math.atan2(-matrix[6], matrix[0]);
            z = 0;
        }
        const degrees = 180 / Math.PI;
        return { position, orientation: { x: x * degrees, y: y * degrees, z: z * degrees } };
    }

    function check(inst) {
        const name = inst._props?.get('Name')?.value || '';
        if (name === 'Head' || name === 'Torso') {
            const cf = inst._props?.get('CFrame')?.value;
            console.log(name, 'parsed CFrame:', toCFrame(cf));
        }
        for (const child of inst._children || []) check(child);
    }
    for (const r of file.Roots) check(r);
})();
