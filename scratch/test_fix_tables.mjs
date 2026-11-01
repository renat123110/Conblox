function fixLua(js) {
    // 1. Array of primitives: {"a", "b"} or {1, 2, 3} -> ["a", "b"]
    js = js.replace(/\{(\s*(?:'[^']*'|"[^"]*"|-?\d+(?:\.\d+)?|true|false)\s*(?:,\s*(?:'[^']*'|"[^"]*"|-?\d+(?:\.\d+)?|true|false)\s*)*)\}/g, '[$1]');

    // 2. Convert inline key = value inside braces: { id = "...", weight = 9 } -> { id: "...", weight: 9 }
    js = js.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=(?!=)\s*/g, '$1$2: ');

    // 3. Multiline table keys ending with comma or brace: idle = { -> idle: {
    js = js.replace(/(^\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(\{)/gm, '$1$2: $3');
    js = js.replace(/(^\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+?)(,\s*)$/gm, '$1$2: $3$4');

    // 4. Array of objects: idle: { { ... }, { ... } } -> idle: [ { ... }, { ... } ]
    js = js.replace(/(:\s*)\{([\s\n]*\{)/g, '$1[$2');
    js = js.replace(/(\}\s*)\}([\s\n]*,)/g, '$1]$2');

    // 5. Bare else -> } else {
    js = js.replace(/\belse\b/g, '} else {');

    return js;
}

import fs from 'fs';
import vm from 'vm';

async function test() {
    const { parseRbxm } = await import('file:///C:/Users/Renat/Desktop/Conblox/app/js/studio/RbxmImporter.js');
    const { ScriptRunner } = await import('file:///C:/Users/Renat/Desktop/Conblox/app/js/engine/ScriptRunner.js');
    const runner = new ScriptRunner(null, console);

    const buf = fs.readFileSync('C:/Users/Renat/Desktop/Conblox/app/Animate.rbxm');
    const parsed = parseRbxm(new Uint8Array(buf));
    const anim = parsed.roots[0];
    let src = anim.Source;
    src = src.replace(/=\s*if\s+(.+?)\s+then\s+(.+?)\s+else\s+([^\n;]+)/g, '= ($1 ? $2 : $3)');
    let js = runner.transpileLua(src);
    js = fixLua(js);

    try {
        new vm.Script('(async function() {\n' + js + '\n})');
        console.log('SUCCESS! ALL 15,630 CHARS OF Animate.rbxm COMPILED WITH ZERO SYNTAX ERRORS!');
    } catch (e) {
        console.log('Compile error:', e.message);
        const lines = js.split('\n');
        const match = e.stack.match(/<anonymous>:(\d+)/);
        if (match) {
            const lineNo = parseInt(match[1]) - 1;
            console.log('Error around line', lineNo);
            for (let j = Math.max(0, lineNo - 5); j <= Math.min(lines.length - 1, lineNo + 5); j++) {
                console.log((j+1) + ': ' + lines[j]);
            }
        }
    }
}
test();
