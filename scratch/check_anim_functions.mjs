import fs from 'fs';
import { parseRbxm } from '../app/js/studio/RbxmImporter.js';

const buf = fs.readFileSync('app/Animate.rbxm');
const parsed = parseRbxm(new Uint8Array(buf));
const animScript = parsed.roots.find(r => r.Name === 'Animate') || parsed.roots[0];
const source = animScript.Source;

// Find all functions and check if they contain wait
const fnRegex = /(?:local\s+)?function\s+([a-zA-Z0-9_]+)\s*\((.*?)\)([\s\S]*?)end/g;
let m;
while ((m = fnRegex.exec(source)) !== null) {
    const fnName = m[1];
    const body = m[3];
    const hasWait = /\bwait\s*\(|\btask\.wait\s*\(/.test(body);
    console.log(`Function '${fnName}': hasWait = ${hasWait}`);
}
