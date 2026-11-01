import fs from 'fs';
import { parseRbxm } from '../app/js/studio/RbxmImporter.js';
import { ScriptRunner } from '../app/js/engine/ScriptRunner.js';
import { Instance } from '../app/js/engine/Instance.js';
import { DataModel } from '../app/js/engine/DataModel.js';

const dm = new DataModel();
const ws = dm.GetService('Workspace');

const buf = fs.readFileSync('app/Animate.rbxm');
const parsed = parseRbxm(new Uint8Array(buf));
const animScript = parsed.roots.find(r => r.Name === 'Animate') || parsed.roots[0];

// Create Figure model
const figure = Instance.new('Model');
figure.Name = 'Character';
figure.Parent = ws;

const torso = Instance.new('Part');
torso.Name = 'Torso';
torso.Parent = figure;

for (const name of ['Right Shoulder', 'Left Shoulder', 'Right Hip', 'Left Hip', 'Neck']) {
    const m = Instance.new('Motor6D');
    m.Name = name;
    m.Parent = torso;
}

const hum = Instance.new('Humanoid');
hum.Parent = figure;

animScript.Parent = figure;

const runner = new ScriptRunner(dm, {
    log: (...args) => console.log('[LOG]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    error: (...args) => console.error('[ERROR]', ...args)
});

console.log('Testing script runner execution...');
runner.runScript(animScript);

setTimeout(() => {
    console.log('Firing Running event with 16...');
    hum.Running.Fire(16);
    console.log('After Running event, active tracks count:', hum._activeAnimationTracks?.size || 0);
    for (const t of hum._activeAnimationTracks || []) {
        console.log('Track:', t.name, 'isPlaying:', t.isPlaying, 'timePos:', t.timePosition);
    }
}, 200);

setTimeout(() => {
    console.log('Done test');
    process.exit(0);
}, 600);
