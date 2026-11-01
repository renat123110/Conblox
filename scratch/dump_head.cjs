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
    for (const filename of ['R6TemplateCat.rbxm', 'StarterCharacter.rbxm']) {
        console.log('=== ' + filename + ' ===');
        const buf = fs.readFileSync(filename);
        const file = RobloxFile.ReadFromBuffer(new Uint8Array(buf));
        function dump(inst, indent = '') {
            const name = inst._props?.get('Name')?.value || '';
            const cname = inst.constructor.name;
            if (name === 'Head' || cname === 'SpecialMesh' || cname === 'Decal' || name === 'Torso') {
                console.log(indent + cname + ' "' + name + '"');
                if (inst._props) {
                    for (const [k, v] of inst._props) {
                        const val = typeof v?.value === 'bigint' ? v.value.toString() : (v?.value?._name || v?.value);
                        console.log(indent + '   ' + k + ': ' + JSON.stringify(val));
                    }
                }
            }
            for (const child of inst._children || []) dump(child, indent + '  ');
        }
        for (const r of file.Roots) dump(r);
    }
})();
