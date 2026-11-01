import fs from 'fs';
import vm from 'vm';

async function test() {
    const { parseRbxm } = await import('file:///C:/Users/Renat/Desktop/Conblox/app/js/studio/RbxmImporter.js');
    const { ScriptRunner } = await import('file:///C:/Users/Renat/Desktop/Conblox/app/js/engine/ScriptRunner.js');
    const runner = new ScriptRunner(null, console);

    const buf = fs.readFileSync('C:/Users/Renat/Desktop/Conblox/app/Animate.rbxm');
    const parsed = parseRbxm(new Uint8Array(buf));
    const anim = parsed.roots[0];
    let js = runner.transpileLua(anim.Source);

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
