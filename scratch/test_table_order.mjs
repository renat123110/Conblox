import fs from 'fs';
import { parseRbxm } from '../app/js/studio/RbxmImporter.js';

const buf = fs.readFileSync('app/Animate.rbxm');
const parsed = parseRbxm(new Uint8Array(buf));
const animScript = parsed.roots.find(r => r.Name === 'Animate') || parsed.roots[0];
const source = animScript.Source;

// Test table conversion on raw Lua
let js = source;
// Replace table syntax inside raw Lua
// 1. Array of primitives: {"a", "b"} -> ["a", "b"]
js = js.replace(/\{(\s*(?:'[^']*'|"[^"]*"|-?\d+(?:\.\d+)?|true|false)\s*(?:,\s*(?:'[^']*'|"[^"]*"|-?\d+(?:\.\d+)?|true|false)\s*)*)\}/g, '[$1]');

// 2. Table key = val syntax: ["key"] = val -> ["key"]: val
js = js.replace(/(\[\s*(?:'[^']*'|"[^"]*"|\d+)\s*\])\s*=/g, '$1:');

// 3. Table key = val -> key: val inside table literals (preceded by { or ,)
js = js.replace(/(?<=[{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?=[{\[\'\"a-zA-Z0-9_]|null)/g, (m, k) => {
    return `${k}: `;
});

// 4. Array of objects: idle = { { ... }, { ... } } -> idle: [ { ... }, { ... } ]
js = js.replace(/(:\s*)\{([\s\n]*\{)/g, '$1[$2');
js = js.replace(/(\}\s*)\}([\s\n]*,)/g, '$1]$2');

// Check onDied in js:
console.log('onDied after table conversion on raw Lua:');
const m = js.match(/function onDied[\s\S]*?end/);
console.log(m ? m[0] : 'not found');
