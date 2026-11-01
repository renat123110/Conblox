import fs from 'fs';
import { parseRbxm } from '../app/js/studio/RbxmImporter.js';
import { ScriptRunner } from '../app/js/engine/ScriptRunner.js';

const buf = fs.readFileSync('app/Animate.rbxm');
const parsed = parseRbxm(new Uint8Array(buf));
const animScript = parsed.roots.find(r => r.Name === 'Animate') || parsed.roots[0];

console.log('Found animScript:', animScript.Name, 'Source length:', animScript.Source?.length);

const runner = new ScriptRunner(null, { log: console.log, warn: console.warn, error: console.error });
let transpiled;
try {
    transpiled = runner.transpileLua(animScript.Source);
    console.log('Transpilation succeeded, result length:', transpiled.length);
    fs.writeFileSync('scratch/animate_transpiled_now.js', transpiled);
} catch (e) {
    console.error('Transpile threw:', e);
}

try {
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const fn = new AsyncFunction('script', 'Figure', 'Humanoid', 'game', 'workspace', 'Vector3', 'CFrame', transpiled);
    console.log('Compilation as AsyncFunction SUCCEEDED!');
} catch (e) {
    console.error('Compilation as AsyncFunction FAILED:', e);
}
