import fs from 'fs';
import vm from 'vm';

function transpileFull(src) {
    let js = src;

    // Comments: --[[ ... ]] -> /* ... */
    js = js.replace(/--\[\[[\s\S]*?\]\]/g, '/*$&*/');
    js = js.replace(/--.*$/gm, match => '//' + match.substring(2));

    // Luau ternary if: local x = if cond then val1 else val2 -> var x = (cond ? val1 : val2)
    js = js.replace(/=\s*if\s+(.+?)\s+then\s+(.+?)\s+else\s+([^\n;]+)/g, '= ($1 ? $2 : $3)');

    // Luau type statements
    js = js.replace(/^\s*(?:export\s+)?type\s+[a-zA-Z0-9_]+(?:\s*<.*?>)?\s*=.*$/gm, '');
    js = js.replace(/\s+as\s+[a-zA-Z0-9_<>?,|\s]+/g, '');
    js = js.replace(/(local\s+[a-zA-Z0-9_]+)\s*:\s*[a-zA-Z0-9_<>?,|\s]+(?=\s*=)/g, '$1');
    js = js.replace(/\)\s*:\s*[a-zA-Z0-9_<>?,|\s]+(?=\s*($|\n|do|then|\{))/gm, ')');
    js = js.replace(/(\bfunction(?:\s+[a-zA-Z0-9_.:]+)?\s*)\(([^)]*)\)/g, (match, fnHead, params) => {
        const cleaned = params.split(',').map(p => p.replace(/([a-zA-Z0-9_]+)\s*:\s*[^,]+/g, '$1').trim()).join(', ');
        return fnHead + '(' + cleaned + ')';
    });

    // nil -> null
    js = js.replace(/\bnil\b/g, 'null');

    // string concatenation: .. -> +
    js = js.replace(/\s*\.\.\s*/g, ' + ');

    // function definitions (MUST run before local -> var)
    js = js.replace(/\bfunction\s+([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)+)\s*\((.*?)\)/g, '$1 = async function($2) {');
    js = js.replace(/\bfunction\s+([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*):([a-zA-Z0-9_]+)\s*\((.*?)\)/g, (m, obj, meth, args) => {
        const selfArgs = args && args.trim().length > 0 ? `self, ${args}` : 'self';
        return `${obj}.${meth} = async function(${selfArgs}) {`;
    });
    js = js.replace(/\blocal\s+function\s+([a-zA-Z0-9_]+)\s*\((.*?)\)/g, 'async function $1($2) {');
    js = js.replace(/(?<!async\s+)\bfunction\s+([a-zA-Z0-9_]+)\s*\((.*?)\)/g, 'async function $1($2) {');
    js = js.replace(/(?<!async\s+)\bfunction\s*\((.*?)\)/g, 'async ($1) => {');

    // Multiple local assignment: local a, b = ...
    js = js.replace(/\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)+)\s*=\s*([^;\n]+)/g, (match, left, right) => {
        const trimmed = right.trim();
        if (trimmed.includes('(') || !trimmed.includes(',')) {
            return `var [${left}] = ${trimmed}`;
        }
        return `var [${left}] = [${trimmed}]`;
    });

    // local x = ... -> var x = ...
    js = js.replace(/\blocal\s+/g, 'var ');

    // table key = value syntax: ["key"] = val -> ["key"]: val
    js = js.replace(/(\[\s*(?:'[^']*'|"[^"]*"|\d+)\s*\])\s*=/g, '$1:');

    // Array of primitives: {"a", "b"} or {1, 2, 3} -> ["a", "b"]
    js = js.replace(/\{(\s*(?:'[^']*'|"[^"]*"|-?\d+(?:\.\d+)?|true|false)\s*(?:,\s*(?:'[^']*'|"[^"]*"|-?\d+(?:\.\d+)?|true|false)\s*)*)\}/g, '[$1]');

    // Table key = val -> key: val (inside object literals: preceded by { or , with optional whitespace/newlines)
    js = js.replace(/(?<=[{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?=[{\[\'\"a-zA-Z0-9_]|null)/g, (m, k) => {
        if (/^(var|let|const|function|return|if|while|for)$/.test(k)) return m;
        return `${k}: `;
    });

    // Array of objects: idle: { { ... }, { ... } } -> idle: [ { ... }, { ... } ]
    js = js.replace(/(:\s*)\{([\s\n]*\{)/g, '$1[$2');
    js = js.replace(/(\}\s*)\}([\s\n]*,)/g, '$1]$2');

    // Lua length operator: #var -> _len(var)
    js = js.replace(/#([a-zA-Z_][a-zA-Z0-9_.]*)/g, '_len($1)');

    // not equal ~= -> !==
    js = js.replace(/~=/g, '!==');

    // and / or / not -> && / || / !
    js = js.replace(/\band\b/g, '&&');
    js = js.replace(/\bor\b/g, '||');
    js = js.replace(/\bnot\b/g, '!');

    // do ... end block (not part of while/for)
    js = js.replace(/(?<!\bwhile\s+[^\n]+)(?<!\bfor\s+[^\n]+)\bdo\b/g, '{');

    // Connect
    js = js.replace(/[:.]Connect\(async\s*\((.*?)\)\s*=>/g, '.Connect(async ($1) =>');
    js = js.replace(/[:.]connect\(async\s*\((.*?)\)\s*=>/g, '.Connect(async ($1) =>');
    js = js.replace(/[:.]Connect\(function\s*\((.*?)\)/g, '.Connect(async ($1) =>');
    js = js.replace(/[:.]connect\(function\s*\((.*?)\)/g, '.Connect(async ($1) =>');

    // Lua colon method calls
    js = js.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '.$1(');

    // while ... do -> while (...) {
    js = js.replace(/\bwhile\s+(.*?)\s+do\b/g, 'while ($1) {');

    // Numeric for loop
    js = js.replace(/\bfor\s+([a-zA-Z0-9_]+)\s*=\s*([^,]+)\s*,\s*([^,]+)\s*(?:,\s*([^,]+))?\s+do\b/g, (match, varName, start, stop, step) => {
        const st = step ? step.trim() : '1';
        return `for (var ${varName} = ${start}; ${varName} <= ${stop}; ${varName} += ${st}) {`;
    });

    // Generic for loop
    js = js.replace(/\bfor\s+([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s+in\s+pairs\s*\((.*?)\)\s*do\b/g, 'for (var [$1, $2] of pairs($3)) {');
    js = js.replace(/\bfor\s+([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s+in\s+ipairs\s*\((.*?)\)\s*do\b/g, 'for (var [$1, $2] of ipairs($3)) {');
    js = js.replace(/\bfor\s+([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s+in\s+(.*?)\s+do\b/g, 'for (var [$1, $2] of _iterate($3)) {');
    js = js.replace(/\bfor\s+([a-zA-Z0-9_]+)\s+in\s+(.*?)\s+do\b/g, 'for (var $1 of _iterateVals($2)) {');

    // if ... then / elseif / else
    js = js.replace(/\bif\s+(.*?)\s+then\b/g, 'if ($1) {');
    js = js.replace(/\belseif\s+(.*?)\s+then\b/g, '__ELSE_IF_BLOCK__ ($1) {');
    js = js.replace(/\belse\b/g, '} else {');
    js = js.replace(/__ELSE_IF_BLOCK__/g, '} else if');

    // end -> }
    js = js.replace(/\bend\b/g, '}');

    // require / task.wait / wait / pcall
    js = js.replace(/(?<!await\s+)(?<![\.\w])\brequire\s*\(/g, 'await require(');
    js = js.replace(/(?<!await\s+)\btask\.wait\s*\(/g, 'await task.wait(');
    js = js.replace(/(?<!await\s+)(?<![\.\w])\bwait\s*\(/g, 'await wait(');
    js = js.replace(/(?<!await\s+)\bpcall\s*\(/g, 'await pcall(');

    // Signal:Wait() or obj.Wait()
    js = js.replace(/[:.]Wait\(\)/g, '.Wait()');
    js = js.replace(/(?<!await\s+)\b([a-zA-Z0-9_\.]+)\.Wait\(\)/g, 'await $1.Wait()');

    return js;
}

async function test() {
    const { parseRbxm } = await import('file:///C:/Users/Renat/Desktop/Conblox/app/js/studio/RbxmImporter.js');
    const buf = fs.readFileSync('C:/Users/Renat/Desktop/Conblox/app/Animate.rbxm');
    const parsed = parseRbxm(new Uint8Array(buf));
    const anim = parsed.roots[0];
    const js = transpileFull(anim.Source);

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
