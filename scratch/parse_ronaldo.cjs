const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('app/js/vendor/rbxm-parser.js', 'utf8');
const context = vm.createContext({
    console,
    process,
    globalThis: {},
    Uint8Array,
    ArrayBuffer,
    DataView,
    TextDecoder,
    TextEncoder
});
context.globalThis = context;
const m = new vm.SourceTextModule(code, { context });
(async () => {
    await m.link(() => {});
    await m.evaluate();
    const { RobloxFile } = m.namespace;
    const buf = fs.readFileSync('ronaldo.rbxm');
    const file = RobloxFile.ReadFromBuffer(new Uint8Array(buf));
    console.log('Roots count:', file.Roots.length);
    function dump(inst, indent = '') {
        console.log(indent + inst.constructor.name + ' "' + (inst._props?.get('Name')?.value || '') + '"');
        if (inst._props) {
            for (const [k, v] of inst._props) {
                if (k.toLowerCase().includes('mesh') || k.toLowerCase().includes('texture') || k === 'VertexColor' || k === 'Scale' || k === 'Offset' || k === 'Size' || k === 'Color') {
                    console.log(indent + '  ' + k + ' = ' + JSON.stringify(v?.value));
                }
            }
        }
        for (const child of inst._children || []) {
            dump(child, indent + '  ');
        }
    }
    for (const inst of file.Roots) {
        dump(inst);
    }
})();
