const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('app/js/vendor/rbxm-parser.js', 'utf8');
const context = vm.createContext({ console, process, globalThis: {}, Uint8Array, ArrayBuffer, DataView, TextDecoder, TextEncoder, Set, Map });
context.globalThis = context;
const m = new vm.SourceTextModule(code, { context });
(async () => {
    await m.link(() => {});
    await m.evaluate();
    const { RobloxFile } = m.namespace;
    const buf = fs.readFileSync('StarterCharacter.rbxm');
    const file = RobloxFile.ReadFromBuffer(new Uint8Array(buf));
    const root = file.Roots[0];
    function walk(inst) {
        if (inst.constructor.name === 'Motor6D') {
            const p0 = inst._props.get('Part0')?.value;
            const p1 = inst._props.get('Part1')?.value;
            console.log('Motor6D:', inst._props.get('Name')?.value, 'Part0:', p0?._props?.get('Name')?.value, 'Part1:', p1?._props?.get('Name')?.value);
        }
        for (const c of inst._children || []) walk(c);
    }
    walk(root);
})();
