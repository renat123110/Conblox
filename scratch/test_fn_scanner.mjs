import fs from 'fs';
import { parseRbxm } from '../app/js/studio/RbxmImporter.js';

const buf = fs.readFileSync('app/Animate.rbxm');
const parsed = parseRbxm(new Uint8Array(buf));
const animScript = parsed.roots.find(r => r.Name === 'Animate') || parsed.roots[0];
const source = animScript.Source;

function analyzeFunctions(code) {
    // We want to find each function definition and see if its body contains wait/pcall/require
    // We can tokenize or scan lines
    const lines = code.split('\n');
    const fnScopes = [];
    const blockStack = [];

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];
        // Strip comments
        const clean = line.replace(/--.*$/, '');

        // Check if a function starts on this line
        const fnMatch = clean.match(/\b(?:local\s+)?function\s+([a-zA-Z0-9_]+)\s*\((.*?)\)/);
        if (fnMatch) {
            const scope = {
                name: fnMatch[1],
                startLine: lineIdx,
                hasYield: false
            };
            fnScopes.push(scope);
            blockStack.push({ type: 'function', scope });
        }

        // Check other block openers
        const ifMatches = clean.match(/\bif\b|\bwhile\b|\bfor\b/g);
        if (ifMatches) {
            for (let i = 0; i < ifMatches.length; i++) {
                blockStack.push({ type: 'control' });
            }
        }

        // Check yields
        if (/\b(?:wait|task\.wait|require|pcall|ypcall)\s*\(|\.Wait\(\)/.test(clean)) {
            // mark all current function scopes in stack as hasYield
            for (const b of blockStack) {
                if (b.type === 'function') b.scope.hasYield = true;
            }
        }

        // Check ends
        const endMatches = clean.match(/\bend\b/g);
        if (endMatches) {
            for (let i = 0; i < endMatches.length; i++) {
                if (blockStack.length > 0) {
                    const top = blockStack.pop();
                    if (top.type === 'function') {
                        top.scope.endLine = lineIdx;
                    }
                }
            }
        }
    }

    return fnScopes;
}

const scopes = analyzeFunctions(source);
console.log('Analyzed', scopes.length, 'functions:');
for (const s of scopes) {
    console.log(`- ${s.name}: hasYield = ${s.hasYield} (lines ${s.startLine + 1}-${(s.endLine || 0) + 1})`);
}
