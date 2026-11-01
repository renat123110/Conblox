import fs from 'fs';
import { parseRbxm } from '../app/js/studio/RbxmImporter.js';
import { ScriptRunner } from '../app/js/engine/ScriptRunner.js';

const buf = fs.readFileSync('app/Animate.rbxm');
const parsed = parseRbxm(new Uint8Array(buf));
const animScript = parsed.roots.find(r => r.Name === 'Animate') || parsed.roots[0];

const runner = new ScriptRunner(null, { log: console.log, warn: console.warn, error: console.error });
let js = animScript.Source;

// Let's test transpileLua step by step
let transpiled = runner.transpileLua(js);
console.log('Current transpile output sample around onDied:');
const diedMatch = transpiled.match(/function onDied[\s\S]*?function onJumping/);
console.log(diedMatch ? diedMatch[0] : 'not found');

console.log('Current transpile output sample around getRigScale:');
const scaleMatch = transpiled.match(/function getRigScale[\s\S]*?var currentAnim/);
console.log(scaleMatch ? scaleMatch[0] : 'not found');

console.log('Current transpile output sample around getTool:');
const toolMatch = transpiled.match(/function getTool[\s\S]*?async function animateTool/);
console.log(toolMatch ? toolMatch[0] : 'not found');
