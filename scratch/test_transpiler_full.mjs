import fs from 'fs';
import { parseRbxm } from '../app/js/studio/RbxmImporter.js';
import { Instance } from '../app/js/engine/Instance.js';
import { DataModel } from '../app/js/engine/DataModel.js';
import { ScriptRunner } from '../app/js/engine/ScriptRunner.js';

const buf = fs.readFileSync('app/Animate.rbxm');
const parsed = parseRbxm(new Uint8Array(buf));
const animScript = parsed.roots.find(r => r.Name === 'Animate') || parsed.roots[0];
const source = animScript.Source;

// Improved transpile function
export function transpileLuaImproved(code) {
    let js = code;

    // Comments: --[[ ... ]] -> /* ... */
    js = js.replace(/--\[\[[\s\S]*?\]\]/g, '/*$&*/');
    // Single line comments: -- comment -> // comment
    js = js.replace(/--.*$/gm, match => '//' + match.substring(2));

    // Luau ternary if: local x = if cond then val1 else val2 -> var x = (cond ? val1 : val2)
    js = js.replace(/=\s*if\s+(.+?)\s+then\s+(.+?)\s+else\s+([^\n;]+)/g, '= ($1 ? $2 : $3)');

    // Luau type statements
    js = js.replace(/^\s*(?:export\s+)?type\s+[a-zA-Z0-9_]+(?:\s*<.*?>)?\s*=.*$/gm, '');
    js = js.replace(/\s+as\s+[a-zA-Z0-9_<>?,|\s]+/g, '');
    js = js.replace(/(local\s+[a-zA-Z0-9_]+)\s*:\s*[a-zA-Z0-9_<>?,|\s]+(?=\s*=)/g, '$1');
    js = js.replace(/\)\s*:\s*[a-zA-Z0-9_<>?,|\s]+(?=\s*($|\n|do|then|\{))/gm, ')');
    js = js.replace(/(\bfunction(?:\s+[a-zA-Z0-9_.:]+)?\s*)\(([^)]*)\)/g, (match, fnHead, params) => {
        const cleaned = params.split(',').map(p => {
            return p.replace(/([a-zA-Z0-9_]+)\s*:\s*[^,]+/g, '$1').trim();
        }).join(', ');
        return fnHead + '(' + cleaned + ')';
    });

    // nil -> null
    js = js.replace(/~=\s*nil\b/g, '!= null');
    js = js.replace(/==\s*nil\b/g, '== null');
    js = js.replace(/\bnil\b/g, 'null');

    // string concatenation: .. -> +
    js = js.replace(/\s*\.\.\s*/g, ' + ');

    // Multiple local assignment: local a, b, c = v1, v2, v3
    js = js.replace(/\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)+)\s*=\s*([^;\n]+)/g, (match, left, right) => {
        const trimmed = right.trim();
        if (trimmed.includes('(') || !trimmed.includes(',')) {
            return `var [${left}] = ${trimmed}`;
        }
        return `var [${left}] = [${trimmed}]`;
    });

    // ── Table conversion ON RAW LUA (before functions/blocks introduce `{`) ──
    // Array of primitives: {"a", "b"} -> ["a", "b"]
    js = js.replace(/\{(\s*(?:'[^']*'|"[^"]*"|-?\d+(?:\.\d+)?|true|false)\s*(?:,\s*(?:'[^']*'|"[^"]*"|-?\d+(?:\.\d+)?|true|false)\s*)*)\}/g, '[$1]');

    // Table key = val syntax: ["key"] = val -> ["key"]: val
    js = js.replace(/(\[\s*(?:'[^']*'|"[^"]*"|\d+)\s*\])\s*=/g, '$1:');

    // Table key = val -> key: val inside table literals (preceded by { or ,)
    js = js.replace(/(?<=[{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?=[{\[\'\"a-zA-Z0-9_]|null)/g, (m, k) => {
        return `${k}: `;
    });

    // Array of objects: idle: { { ... }, { ... } } -> idle: [ { ... }, { ... } ]
    js = js.replace(/(:\s*)\{([\s\n]*\{)/g, '$1[$2');
    js = js.replace(/(\}\s*)\}([\s\n]*,)/g, '$1]$2');

    // local x = ... -> var x = ...
    js = js.replace(/\blocal\s+/g, 'var ');

    // ── Function declarations: check which functions have yielding calls (wait, task.wait, require, pcall, .Wait()) ──
    const lines = js.split('\n');
    const fnYieldMap = new Map();
    const blockStack = [];

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const clean = lines[lineIdx].replace(/\/\/.*$/, '');
        const fnMatch = clean.match(/\b(?:var\s+)?function\s+([a-zA-Z0-9_]+)\s*\(/);
        if (fnMatch) {
            const fnName = fnMatch[1];
            const entry = { name: fnName, hasYield: false };
            fnYieldMap.set(fnName, entry);
            blockStack.push({ type: 'fn', entry });
        }
        const ctrlMatch = clean.match(/\bif\b|\bwhile\b|\bfor\b/g);
        if (ctrlMatch) {
            for (let i = 0; i < ctrlMatch.length; i++) blockStack.push({ type: 'ctrl' });
        }
        if (/\b(?:wait|task\.wait|require|pcall|ypcall)\s*\(|\.Wait\(\)/.test(clean)) {
            for (const b of blockStack) {
                if (b.type === 'fn') b.entry.hasYield = true;
            }
        }
        const endMatch = clean.match(/\bend\b/g);
        if (endMatch) {
            for (let i = 0; i < endMatch.length; i++) {
                if (blockStack.length > 0) blockStack.pop();
            }
        }
    }

    // function table.method(...)
    js = js.replace(/\bfunction\s+([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)+)\s*\((.*?)\)/g, '$1 = function($2) {');
    // function table:method(...)
    js = js.replace(/\bfunction\s+([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*):([a-zA-Z0-9_]+)\s*\((.*?)\)/g, (m, obj, meth, args) => {
        const selfArgs = args && args.trim().length > 0 ? `self, ${args}` : 'self';
        return `${obj}.${meth} = function(${selfArgs}) {`;
    });

    // function / var function name(...) -> function name(...) or async function name(...)
    js = js.replace(/\b(?:var\s+)?function\s+([a-zA-Z0-9_]+)\s*\((.*?)\)/g, (m, name, args) => {
        const isAsync = fnYieldMap.get(name)?.hasYield;
        return `${isAsync ? 'async ' : ''}function ${name}(${args}) {`;
    });

    // anonymous function(...) -> async ($1) => {
    js = js.replace(/\bfunction\s*\((.*?)\)/g, 'async ($1) => {');

    // Lua length operator: #var -> _len(var)
    js = js.replace(/#([a-zA-Z_][a-zA-Z0-9_.]*)/g, '_len($1)');

    // not equal ~= -> !==
    js = js.replace(/~=/g, '!==');

    // and / or / not -> && / || / !
    js = js.replace(/\band\b/g, '&&');
    js = js.replace(/\bor\b/g, '||');
    js = js.replace(/\bnot\b/g, '!');

    // do ... end block -> {
    js = js.replace(/(?<!\bwhile\s+[^\n]+)(?<!\bfor\s+[^\n]+)\bdo\b/g, '{');

    // Connect: :Connect(function or .Connect(function
    js = js.replace(/[:.]Connect\(async\s*\((.*?)\)\s*=>/g, '.Connect(async ($1) =>');
    js = js.replace(/[:.]connect\(async\s*\((.*?)\)\s*=>/g, '.Connect(async ($1) =>');
    js = js.replace(/[:.]Connect\(function\s*\((.*?)\)/g, '.Connect(async ($1) =>');
    js = js.replace(/[:.]connect\(function\s*\((.*?)\)/g, '.Connect(async ($1) =>');

    // Lua colon method calls: obj:Method(...) -> obj.Method(...)
    js = js.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '.$1(');

    // while ... do -> while (...) {
    js = js.replace(/\bwhile\s+(.*?)\s+do\b/g, 'while ($1) {');

    // Numeric for loop: for i = start, finish [, step] do -> standard JS loop
    js = js.replace(/\bfor\s+([a-zA-Z0-9_]+)\s*=\s*([^,]+)\s*,\s*([^,]+)\s*(?:,\s*([^,]+))?\s+do\b/g, (match, varName, start, stop, step) => {
        const st = step ? step.trim() : '1';
        return `for (var ${varName} = ${start}; ${varName} <= ${stop}; ${varName} += ${st}) {`;
    });

    // Generic for loop with pairs/ipairs
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

    // require, pcall, ypcall, wait, task.wait, Wait
    js = js.replace(/(?<!await\s+)(?<![\.\w])\brequire\s*\(/g, 'await require(');
    js = js.replace(/(?<!await\s+)\bpcall\s*\(/g, 'await pcall(');
    js = js.replace(/(?<!await\s+)\bypcall\s*\(/g, 'await ypcall(');
    js = js.replace(/(?<!await\s+)\btask\.wait\s*\(/g, 'await task.wait(');
    js = js.replace(/(?<!await\s+)(?<![\.\w])\bwait\s*\(/g, 'await wait(');
    js = js.replace(/[:.]Wait\(\)/g, '.Wait()');
    js = js.replace(/(?<!await\s+)\b([a-zA-Z0-9_\.]+)\.Wait\(\)/g, 'await $1.Wait()');

    return js;
}

const transpiled = transpileLuaImproved(source);
fs.writeFileSync('scratch/animate_transpiled_improved.js', transpiled);
console.log('Improved transpile wrote scratch/animate_transpiled_improved.js');

// Now let's test running it!
const dm = new DataModel();
const ws = dm.GetService('Workspace');
const players = dm.GetService('Players');
const localPlayer = Instance.new('Player');
localPlayer.Name = 'Player';
localPlayer.Chatted = new (await import('../app/js/engine/Signal.js')).Signal();
localPlayer.Parent = players;
players.LocalPlayer = localPlayer;

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

// Preload animations into memory for test
const anim1 = Instance.new('KeyframeSequence');
anim1.Name = 'WalkAnim';

const runner = new ScriptRunner(dm, {
    log: (...args) => console.log('[STUDIO LOG]', ...args),
    warn: (...args) => console.warn('[STUDIO WARN]', ...args),
    error: (...args) => console.error('[STUDIO ERROR]', ...args)
});
runner.transpileLua = transpileLuaImproved;

console.log('Executing script with improved transpiler...');
runner.runScript(animScript);

setTimeout(() => {
    console.log('Firing Running event with 16...');
    hum.Running.Fire(16);
    console.log('Active tracks:');
    for (const t of hum._activeAnimationTracks || []) {
        console.log('  Track:', t.name, 'isPlaying:', t.isPlaying, 'timePos:', t.timePosition);
    }
}, 200);

setTimeout(() => {
    console.log('Firing Running event with 0 (stop)...');
    hum.Running.Fire(0);
    console.log('Active tracks:');
    for (const t of hum._activeAnimationTracks || []) {
        console.log('  Track:', t.name, 'isPlaying:', t.isPlaying, 'timePos:', t.timePosition);
    }
    process.exit(0);
}, 500);
