/**
 * Conblox ScriptRunner
 * Executes scripts in Play/Run mode with Roblox-compatible API & Output logging
 */

import { Vector3, Vector2, Color3, CFrame } from './Math3D.js';
import { Instance } from './Instance.js';
import { Enum } from './Services.js';

export class ScriptRunner {
    constructor(dataModel, outputConsole) {
        this.dataModel = dataModel;
        this.output = outputConsole;
        this.runningScripts = new Set();
        this.activeTimeouts = new Set();
        this.scheduledTasks = new Set();
        this.moduleCache = new Map();
        this.loadingModules = new Set();
        this.aborted = false;
        this.paused = false;
        this.serverSessionId = null;
    }

    scheduleTask(callback, delay = 0, onCancel = null) {
        const task = {
            callback,
            onCancel,
            remaining: Math.max(0, delay),
            startedAt: 0,
            timerId: null
        };
        this.scheduledTasks.add(task);
        this.startScheduledTask(task);
        return task;
    }

    startScheduledTask(task) {
        if (this.aborted || this.paused || !this.scheduledTasks.has(task)) return;
        task.startedAt = performance.now();
        task.timerId = setTimeout(() => {
            this.activeTimeouts.delete(task.timerId);
            task.timerId = null;
            if (!this.scheduledTasks.delete(task)) return;
            if (!this.aborted && !this.paused) task.callback();
        }, task.remaining);
        this.activeTimeouts.add(task.timerId);
    }

    cancelScheduledTask(task) {
        if (!task || !this.scheduledTasks.delete(task)) return;
        if (task.timerId !== null) {
            clearTimeout(task.timerId);
            this.activeTimeouts.delete(task.timerId);
            task.timerId = null;
        }
        if (task.onCancel) task.onCancel();
    }

    pause() {
        if (this.paused || this.aborted) return;
        this.paused = true;
        const now = performance.now();
        for (const task of this.scheduledTasks) {
            if (task.timerId === null) continue;
            clearTimeout(task.timerId);
            this.activeTimeouts.delete(task.timerId);
            task.timerId = null;
            task.remaining = Math.max(0, task.remaining - (now - task.startedAt));
        }
    }

    resume() {
        if (!this.paused || this.aborted) return;
        this.paused = false;
        for (const task of this.scheduledTasks) this.startScheduledTask(task);
    }

    isTemplateOrStorage(script) {
        let p = script.Parent;
        while (p) {
            if (p.ClassName === 'StarterCharacterScripts' || p.Name === 'StarterCharacterScripts') return true;
            if (p.ClassName === 'StarterPlayerScripts' || p.Name === 'StarterPlayerScripts') return true;
            if (p.ClassName === 'StarterPlayer' || p.Name === 'StarterPlayer') return true;
            if (p.ClassName === 'ServerStorage' || p.Name === 'ServerStorage') return true;
            if (p.ClassName === 'ReplicatedStorage' || p.Name === 'ReplicatedStorage') return true;
            p = p.Parent;
        }
        return false;
    }

    canRunLocalScript(script) {
        if (this.isTemplateOrStorage(script)) return false;
        let p = script.Parent;
        let inValidClientContainer = false;
        while (p) {
            if (p.ClassName === 'ServerScriptService' || p.Name === 'ServerScriptService') return false;
            if (p.Name === 'PlayerScripts' || p.ClassName === 'PlayerScriptsFolder') inValidClientContainer = true;
            if (p.Name === 'PlayerGui' || p.ClassName === 'PlayerGui') inValidClientContainer = true;
            if (p.ClassName === 'Model' && p.FindFirstChildOfClass && p.FindFirstChildOfClass('Humanoid')) inValidClientContainer = true;
            if (p.ClassName === 'ReplicatedFirst' || p.Name === 'ReplicatedFirst') inValidClientContainer = true;
            p = p.Parent;
        }
        return inValidClientContainer;
    }

    canRunServerScript(script) {
        if (this.isTemplateOrStorage(script)) return false;
        return true;
    }

    start() {
        this.aborted = false;
        this.paused = false;
        this.runningScripts.clear();
        this.activeTimeouts.clear();
        this.scheduledTasks.clear();
        this.moduleCache.clear();
        this.loadingModules.clear();

        // 1. Initialize dedicated server session asynchronously on Python Server
        fetch('/api/server/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timestamp: Date.now() })
        }).then(res => res.json()).then(data => {
            this.serverSessionId = data.sessionId;
            if (this.output) this.output.log('info', `[Server] Dedicated Server session started (${data.sessionId})`);
        }).catch(() => {
            this.serverSessionId = 'local_' + Date.now();
        });

        // 2. Discover all active scripts that can run at start (excluding templates/storage)
        const scripts = this.dataModel.GetDescendants().filter(i => 
            (i.ClassName === 'Script' || i.ClassName === 'LocalScript') && i.Enabled
        );
        for (const script of scripts) {
            this.runScript(script);
        }
    }

    async stop() {
        this.aborted = true;
        for (const task of [...this.scheduledTasks]) this.cancelScheduledTask(task);
        this.activeTimeouts.clear();
        this.paused = false;
        this.runningScripts.clear();
        this.moduleCache.clear();
        this.loadingModules.clear();

        if (this.serverSessionId) {
            try {
                await fetch('/api/server/stop', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId: this.serverSessionId })
                });
            } catch (e) {}
            this.serverSessionId = null;
        }
    }

    formatArg(a) {
        if (a === null || a === undefined) return 'nil';
        if (typeof a === 'object') {
            if (a instanceof Vector3 || a instanceof Color3 || a instanceof CFrame) {
                return a.toString();
            }
            if (a.ClassName && a.Name) {
                return a.Name;
            }
            if (typeof a.toString === 'function' && a.toString !== Object.prototype.toString) {
                return a.toString();
            }
            try {
                return JSON.stringify(a);
            } catch (e) {
                return String(a);
            }
        }
        return String(a);
    }

    pairs(t) {
        if (!t) return [];
        if (Array.isArray(t)) return t.map((v, i) => [i + 1, v]);
        if (typeof t.entries === 'function') return Array.from(t.entries());
        return Object.entries(t);
    }

    ipairs(t) {
        if (!t) return [];
        if (Array.isArray(t)) return t.map((v, i) => [i + 1, v]);
        return Object.entries(t).map(([k, v]) => [Number(k), v]);
    }

    _iterate(t) {
        if (!t) return [];
        if (Array.isArray(t)) return t.map((v, i) => [i + 1, v]);
        if (typeof t.entries === 'function') return Array.from(t.entries());
        if (typeof t[Symbol.iterator] === 'function') {
            const arr = [];
            let i = 1;
            for (const item of t) arr.push(Array.isArray(item) ? item : [i++, item]);
            return arr;
        }
        return Object.entries(t);
    }

    _iterateVals(t) {
        if (!t) return [];
        if (Array.isArray(t)) return t;
        if (typeof t.values === 'function') return Array.from(t.values());
        if (typeof t[Symbol.iterator] === 'function') return Array.from(t);
        return Object.values(t);
    }

    // Helper: Lua to JS transpiler supporting Luau & Roblox ModuleScripts
    transpileLua(code) {
        let js = code;

        // Comments: --[[ ... ]] -> /* ... */
        js = js.replace(/--\[\[[\s\S]*?\]\]/g, '/*$&*/');
        // Single line comments: -- comment -> // comment
        js = js.replace(/--.*$/gm, match => '//' + match.substring(2));

        // Luau ternary if: local x = if cond then val1 else val2 -> var x = (cond ? val1 : val2)
        js = js.replace(/=\s*if\s+(.+?)\s+then\s+(.+?)\s+else\s+([^\n;]+)/g, '= ($1 ? $2 : $3)');

        // Luau type statements: type Foo = ... or export type Foo = ...
        js = js.replace(/^\s*(?:export\s+)?type\s+[a-zA-Z0-9_]+(?:\s*<.*?>)?\s*=.*$/gm, '');

        // Luau 'as Type' cast
        js = js.replace(/\s+as\s+[a-zA-Z0-9_<>?,|\s]+/g, '');

        // Luau variable type annotations: local x : Type = y -> local x = y
        js = js.replace(/(local\s+[a-zA-Z0-9_]+)\s*:\s*[a-zA-Z0-9_<>?,|\s]+(?=\s*=)/g, '$1');

        // Luau function return type annotation: ) : Type
        js = js.replace(/\)\s*:\s*[a-zA-Z0-9_<>?,|\s]+(?=\s*($|\n|do|then|\{))/gm, ')');

        // Luau function param type annotations only on function definitions: function foo(a: Type, b: Type)
        js = js.replace(/(\bfunction(?:\s+[a-zA-Z0-9_.:]+)?\s*)\(([^)]*)\)/g, (match, fnHead, params) => {
            const cleaned = params.split(',').map(p => {
                return p.replace(/([a-zA-Z0-9_]+)\s*:\s*[^,]+/g, '$1').trim();
            }).join(', ');
            return fnHead + '(' + cleaned + ')';
        });

        // nil comparison: ~= nil -> != null, == nil -> == null
        js = js.replace(/~=\s*nil\b/g, '!= null');
        js = js.replace(/==\s*nil\b/g, '== null');

        // nil -> null
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
        // Array of primitives: {"a", "b"} or {1, 2, 3} -> ["a", "b"]
        js = js.replace(/\{(\s*(?:'[^']*'|"[^"]*"|-?\d+(?:\.\d+)?|true|false)\s*(?:,\s*(?:'[^']*'|"[^"]*"|-?\d+(?:\.\d+)?|true|false)\s*)*)\}/g, '[$1]');

        // Table key = value syntax: ["key"] = val -> ["key"]: val, or [number] = val -> [number]: val
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

        // do ... end block (not preceded by while/for on same line) -> {
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

        // Generic for loop with pairs/ipairs: for k, v in pairs(...) do
        js = js.replace(/\bfor\s+([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s+in\s+pairs\s*\((.*?)\)\s*do\b/g, 'for (var [$1, $2] of pairs($3)) {');
        js = js.replace(/\bfor\s+([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s+in\s+ipairs\s*\((.*?)\)\s*do\b/g, 'for (var [$1, $2] of ipairs($3)) {');
        // Generic for loop (Luau iteration): for k, v in expr do
        js = js.replace(/\bfor\s+([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s+in\s+(.*?)\s+do\b/g, 'for (var [$1, $2] of _iterate($3)) {');
        // Single var generic for loop: for v in expr do
        js = js.replace(/\bfor\s+([a-zA-Z0-9_]+)\s+in\s+(.*?)\s+do\b/g, 'for (var $1 of _iterateVals($2)) {');

        // if ... then / elseif / else
        js = js.replace(/\bif\s+(.*?)\s+then\b/g, 'if ($1) {');
        js = js.replace(/\belseif\s+(.*?)\s+then\b/g, '__ELSE_IF_BLOCK__ ($1) {');
        js = js.replace(/\belse\b/g, '} else {');
        js = js.replace(/__ELSE_IF_BLOCK__/g, '} else if');

        // end -> }
        js = js.replace(/\bend\b/g, '}');

        // require(...) -> await require(...)
        js = js.replace(/(?<!await\s+)(?<![\.\w])\brequire\s*\(/g, 'await require(');

        // pcall / ypcall
        js = js.replace(/(?<!await\s+)\bpcall\s*\(/g, 'await pcall(');
        js = js.replace(/(?<!await\s+)\bypcall\s*\(/g, 'await ypcall(');

        // task.wait(t) -> await task.wait(t) (MUST be processed before wait)
        js = js.replace(/(?<!await\s+)\btask\.wait\s*\(/g, 'await task.wait(');

        // wait(t) -> await wait(t) (ensuring no preceding dot or word character)
        js = js.replace(/(?<!await\s+)(?<![\.\w])\bwait\s*\(/g, 'await wait(');

        // Signal:Wait() or obj.Wait() -> await obj.Wait()
        js = js.replace(/[:.]Wait\(\)/g, '.Wait()');
        js = js.replace(/(?<!await\s+)\b([a-zA-Z0-9_\.]+)\.Wait\(\)/g, 'await $1.Wait()');

        return js;
    }

    async requireModule(moduleScript, callerScript = null) {
        if (!moduleScript) {
            throw new Error('Attempted to call require with nil');
        }
        if (typeof moduleScript === 'string') {
            const found = this.dataModel.FindFirstChild(moduleScript, true);
            if (found) moduleScript = found;
            else throw new Error(`ModuleScript "${moduleScript}" not found`);
        }
        if (!moduleScript || moduleScript.ClassName !== 'ModuleScript') {
            throw new Error(`Attempted to call require with invalid argument(s). ModuleScript expected, got ${moduleScript ? (moduleScript.ClassName || typeof moduleScript) : 'nil'}`);
        }

        if (this.moduleCache.has(moduleScript)) {
            return this.moduleCache.get(moduleScript);
        }

        if (this.loadingModules.has(moduleScript)) {
            throw new Error(`Requested module "${moduleScript.Name}" experienced a circular dependency error`);
        }

        this.loadingModules.add(moduleScript);

        try {
            const tag = callerScript && callerScript.ClassName === 'LocalScript' ? '[Client]' : '[Server]';
            const formatArg = (a) => this.formatArg(a);
            const print = (...args) => {
                const msg = `${tag} [${moduleScript.Name}] ` + args.map(formatArg).join(' ');
                if (this.output) this.output.log('info', msg);
                else console.log(msg);
            };
            const warn = (...args) => {
                const msg = `${tag} [${moduleScript.Name}] ` + args.map(formatArg).join(' ');
                if (this.output) this.output.log('warn', msg);
                else console.warn(msg);
            };
            const error = (...args) => {
                const msg = `${tag} [${moduleScript.Name}] ` + args.map(formatArg).join(' ');
                if (this.output) this.output.log('error', msg);
                else console.error(msg);
            };

            const wait = (seconds = 0.03) => {
                if (this.aborted) {
                    const res = [0, performance.now() / 1000];
                    res.valueOf = () => 0;
                    return Promise.resolve(res);
                }
                const ms = Math.max(10, (seconds || 0.03) * 1000);
                const startTime = performance.now();
                return new Promise((resolve) => {
                    this.scheduleTask(() => {
                        const elapsed = (performance.now() - startTime) / 1000;
                        const res = [elapsed, performance.now() / 1000];
                        res.valueOf = () => elapsed;
                        resolve(res);
                    }, ms, () => {
                        const res = [0, performance.now() / 1000];
                        res.valueOf = () => 0;
                        resolve(res);
                    });
                });
            };

            const task = {
                wait: wait,
                spawn: (fn) => this.scheduleTask(() => { if (typeof fn === 'function') fn(); }),
                delay: (sec, fn) => this.scheduleTask(() => { if (typeof fn === 'function') fn(); }, Math.max(0, (sec || 0) * 1000)),
                defer: (fn) => this.scheduleTask(() => { if (typeof fn === 'function') fn(); }),
                cancel: (scheduledTask) => this.cancelScheduledTask(scheduledTask)
            };

            const require = (target) => this.requireModule(target, moduleScript);

            const env = {
                game: this.dataModel,
                workspace: this.dataModel.Workspace,
                script: moduleScript,
                require: require,
                UserInputService: this.dataModel.GetService('UserInputService') || this.dataModel.UserInputService,
                RunService: this.dataModel.GetService('RunService') || this.dataModel.RunService,
                Enum: Enum,
                Vector3: Vector3,
                Vector2: Vector2,
                Color3: Color3,
                CFrame: CFrame,
                Instance: Instance,
                wait: wait,
                task: task,
                print: print,
                warn: warn,
                error: error,
                pairs: (t) => this.pairs(t),
                ipairs: (t) => this.ipairs(t),
                _iterate: (t) => this._iterate(t),
                _iterateVals: (t) => this._iterateVals(t),
                _len: (v) => (v ? (v.length !== undefined ? v.length : (typeof v === 'object' ? Object.keys(v).length : 0)) : 0),
                tick: () => performance.now() / 1000,
                time: () => performance.now() / 1000,
                delay: (sec, fn) => task.delay(sec, fn),
                spawn: (fn) => task.spawn(fn),
                pcall: (fn, ...args) => {
                    try {
                        const r = fn(...args);
                        if (r && typeof r.then === 'function') {
                            return r.then(val => [true, val]).catch(err => [false, err]);
                        }
                        return [true, r];
                    } catch (e) {
                        return [false, e];
                    }
                },
                ypcall: (fn, ...args) => {
                    try {
                        const r = fn(...args);
                        if (r && typeof r.then === 'function') {
                            return r.then(val => [true, val]).catch(err => [false, err]);
                        }
                        return [true, r];
                    } catch (e) {
                        return [false, e];
                    }
                },
                UserSettings: () => ({
                    IsUserFeatureEnabled: () => false,
                    GetUserFeature: () => false
                }),
                math: {
                    ...Math,
                    pi: Math.PI,
                    huge: Infinity,
                    random: (a, b) => {
                        if (a === undefined) return Math.random();
                        if (b === undefined) return Math.floor(Math.random() * a) + 1;
                        return Math.floor(Math.random() * (b - a + 1)) + a;
                    },
                    rad: (d) => (d * Math.PI) / 180,
                    deg: (r) => (r * 180) / Math.PI,
                    clamp: (x, min, max) => Math.max(min, Math.min(max, x))
                },
                string: {
                    ...String,
                    sub: (s, i, j) => {
                        if (typeof s !== 'string') s = String(s || '');
                        const start = i > 0 ? i - 1 : (i < 0 ? s.length + i : 0);
                        const end = j !== undefined ? (j > 0 ? j : s.length + j + 1) : undefined;
                        return s.slice(start, end);
                    },
                    len: (s) => (s ? String(s).length : 0),
                    lower: (s) => (s ? String(s).toLowerCase() : ''),
                    upper: (s) => (s ? String(s).toUpperCase() : ''),
                    find: (s, pattern) => {
                        if (!s) return null;
                        const idx = String(s).indexOf(pattern);
                        return idx >= 0 ? [idx + 1, idx + pattern.length] : null;
                    },
                    format: (fmt, ...args) => {
                        let i = 0;
                        return String(fmt).replace(/%[sfd]/g, () => args[i++] ?? '');
                    },
                    match: (s, pattern) => {
                        if (!s) return null;
                        const m = String(s).match(new RegExp(pattern));
                        return m ? m[0] : null;
                    }
                },
                table: {
                    insert: (t, ...args) => {
                        if (!t) return;
                        if (Array.isArray(t)) {
                            if (args.length === 1) t.push(args[0]);
                            else t.splice(args[0] - 1, 0, args[1]);
                        } else if (typeof t === 'object') {
                            if (args.length === 1) {
                                let maxIdx = 0;
                                for (const k of Object.keys(t)) {
                                    const n = Number(k);
                                    if (!isNaN(n) && n > maxIdx) maxIdx = n;
                                }
                                t[maxIdx + 1] = args[0];
                            } else {
                                t[args[0]] = args[1];
                            }
                        }
                    },
                    remove: (t, pos) => {
                        if (!t) return null;
                        if (Array.isArray(t)) {
                            return t.splice((pos || t.length) - 1, 1)[0];
                        } else if (typeof t === 'object') {
                            const target = pos || Object.keys(t).length;
                            const val = t[target];
                            delete t[target];
                            return val;
                        }
                        return null;
                    },
                    find: (t, v) => {
                        if (!t) return null;
                        if (Array.isArray(t)) {
                            const idx = t.indexOf(v);
                            return idx >= 0 ? idx + 1 : null;
                        }
                        for (const [k, val] of Object.entries(t)) {
                            if (val === v) return isNaN(Number(k)) ? k : Number(k);
                        }
                        return null;
                    },
                    sort: (t, fn) => (Array.isArray(t) ? t.sort(fn) : t)
                }
            };

            const isValidIdentifier = (name) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
            if (moduleScript.Parent && moduleScript.Parent.GetChildren) {
                for (const child of moduleScript.Parent.GetChildren()) {
                    if (child !== moduleScript && isValidIdentifier(child.Name) && !(child.Name in env)) {
                        env[child.Name] = child;
                    }
                }
            }
            if (moduleScript.GetChildren) {
                for (const child of moduleScript.GetChildren()) {
                    if (isValidIdentifier(child.Name) && !(child.Name in env)) {
                        env[child.Name] = child;
                    }
                }
            }

            let code = moduleScript.Source || '';
            try {
                code = this.transpileLua(code);
            } catch (err) {
                error('Transpile error: ' + err.message);
                throw err;
            }

            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
            const paramNames = Object.keys(env);
            const paramValues = Object.values(env);

            const fn = new AsyncFunction(...paramNames, code);
            const result = await fn(...paramValues);

            if (result === undefined) {
                const err = new Error(`ModuleScript "${moduleScript.Name}" did not return exactly one value`);
                error(err.message);
                throw err;
            }

            this.moduleCache.set(moduleScript, result);
            return result;
        } finally {
            this.loadingModules.delete(moduleScript);
        }
    }

    async runScript(script) {
        if (!script || !script.Enabled || this.aborted) return;
        if (this.runningScripts.has(script)) return;

        // Verify script execution rules
        if (this.isTemplateOrStorage(script)) return;

        const isServerScript = (script.ClassName === 'Script');
        const isClientScript = (script.ClassName === 'LocalScript');

        if (isClientScript && !this.canRunLocalScript(script)) return;
        if (isServerScript && !this.canRunServerScript(script)) return;

        const tag = isServerScript ? '[Server]' : '[Client]';

        // If server script, notify dedicated server
        if (isServerScript) {
            try {
                fetch('/api/server/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: this.serverSessionId || 'default',
                        name: script.Name,
                        source: script.Source || '',
                        scriptId: script.id
                    })
                }).catch(() => {});
            } catch (e) {}
        }

        const formatArg = (a) => this.formatArg(a);

        const print = (...args) => {
            const msg = `${tag} [${script.Name}] ` + args.map(formatArg).join(' ');
            if (this.output) this.output.log('info', msg);
            else console.log(msg);
        };

        const warn = (...args) => {
            const msg = `${tag} [${script.Name}] ` + args.map(formatArg).join(' ');
            if (this.output) this.output.log('warn', msg);
            else console.warn(msg);
        };

        const error = (...args) => {
            const msg = `${tag} [${script.Name}] ` + args.map(formatArg).join(' ');
            if (this.output) this.output.log('error', msg);
            else console.error(msg);
        };

        const wait = (seconds = 0.03) => {
            if (this.aborted) {
                const res = [0, performance.now() / 1000];
                res.valueOf = () => 0;
                return Promise.resolve(res);
            }
            const ms = Math.max(10, (seconds || 0.03) * 1000);
            const startTime = performance.now();
            return new Promise((resolve) => {
                this.scheduleTask(() => {
                    const elapsed = (performance.now() - startTime) / 1000;
                    const res = [elapsed, performance.now() / 1000];
                    res.valueOf = () => elapsed;
                    resolve(res);
                }, ms, () => {
                    const res = [0, performance.now() / 1000];
                    res.valueOf = () => 0;
                    resolve(res);
                });
            });
        };

        const task = {
            wait: wait,
            spawn: (fn) => this.scheduleTask(() => {
                if (typeof fn === 'function') fn();
            }),
            delay: (sec, fn) => this.scheduleTask(() => {
                if (typeof fn === 'function') fn();
            }, Math.max(0, (sec || 0) * 1000)),
            defer: (fn) => this.scheduleTask(() => {
                if (typeof fn === 'function') fn();
            }),
            cancel: (scheduledTask) => this.cancelScheduledTask(scheduledTask)
        };

        const env = {
            game: this.dataModel,
            workspace: this.dataModel.Workspace,
            script: script,
            require: (target) => this.requireModule(target, script),
            UserInputService: this.dataModel.GetService('UserInputService') || this.dataModel.UserInputService,
            RunService: this.dataModel.GetService('RunService') || this.dataModel.RunService,
            Enum: Enum,
            Vector3: Vector3,
            Vector2: Vector2,
            Color3: Color3,
            CFrame: CFrame,
            Instance: Instance,
            wait: wait,
            task: task,
            print: print,
            warn: warn,
            error: error,
            pairs: (t) => this.pairs(t),
            ipairs: (t) => this.ipairs(t),
            _iterate: (t) => this._iterate(t),
            _iterateVals: (t) => this._iterateVals(t),
            _len: (v) => (v ? (v.length !== undefined ? v.length : (typeof v === 'object' ? Object.keys(v).length : 0)) : 0),
            tick: () => performance.now() / 1000,
            time: () => performance.now() / 1000,
            delay: (sec, fn) => task.delay(sec, fn),
            spawn: (fn) => task.spawn(fn),
            pcall: (fn, ...args) => {
                try {
                    const r = fn(...args);
                    if (r && typeof r.then === 'function') {
                        return r.then(val => [true, val]).catch(err => [false, err]);
                    }
                    return [true, r];
                } catch (e) {
                    return [false, e];
                }
            },
            ypcall: (fn, ...args) => {
                try {
                    const r = fn(...args);
                    if (r && typeof r.then === 'function') {
                        return r.then(val => [true, val]).catch(err => [false, err]);
                    }
                    return [true, r];
                } catch (e) {
                    return [false, e];
                }
            },
            UserSettings: () => ({
                IsUserFeatureEnabled: () => false,
                GetUserFeature: () => false
            }),
            math: {
                ...Math,
                pi: Math.PI,
                huge: Infinity,
                random: (a, b) => {
                    if (a === undefined) return Math.random();
                    if (b === undefined) return Math.floor(Math.random() * a) + 1;
                    return Math.floor(Math.random() * (b - a + 1)) + a;
                },
                rad: (d) => (d * Math.PI) / 180,
                deg: (r) => (r * 180) / Math.PI,
                clamp: (x, min, max) => Math.max(min, Math.min(max, x))
            },
            string: {
                ...String,
                sub: (s, i, j) => {
                    if (typeof s !== 'string') s = String(s || '');
                    const start = i > 0 ? i - 1 : (i < 0 ? s.length + i : 0);
                    const end = j !== undefined ? (j > 0 ? j : s.length + j + 1) : undefined;
                    return s.slice(start, end);
                },
                len: (s) => (s ? String(s).length : 0),
                lower: (s) => (s ? String(s).toLowerCase() : ''),
                upper: (s) => (s ? String(s).toUpperCase() : ''),
                find: (s, pattern) => {
                    if (!s) return null;
                    const idx = String(s).indexOf(pattern);
                    return idx >= 0 ? [idx + 1, idx + pattern.length] : null;
                },
                format: (fmt, ...args) => {
                    let i = 0;
                    return String(fmt).replace(/%[sfd]/g, () => args[i++] ?? '');
                },
                match: (s, pattern) => {
                    if (!s) return null;
                    const m = String(s).match(new RegExp(pattern));
                    return m ? m[0] : null;
                }
            },
            table: {
                insert: (t, ...args) => {
                    if (!t) return;
                    if (Array.isArray(t)) {
                        if (args.length === 1) t.push(args[0]);
                        else t.splice(args[0] - 1, 0, args[1]);
                    } else if (typeof t === 'object') {
                        if (args.length === 1) {
                            let maxIdx = 0;
                            for (const k of Object.keys(t)) {
                                const n = Number(k);
                                if (!isNaN(n) && n > maxIdx) maxIdx = n;
                            }
                            t[maxIdx + 1] = args[0];
                        } else {
                            t[args[0]] = args[1];
                        }
                    }
                },
                remove: (t, pos) => {
                    if (!t) return null;
                    if (Array.isArray(t)) {
                        return t.splice((pos || t.length) - 1, 1)[0];
                    } else if (typeof t === 'object') {
                        const target = pos || Object.keys(t).length;
                        const val = t[target];
                        delete t[target];
                        return val;
                    }
                    return null;
                },
                find: (t, v) => {
                    if (!t) return null;
                    if (Array.isArray(t)) {
                        const idx = t.indexOf(v);
                        return idx >= 0 ? idx + 1 : null;
                    }
                    for (const [k, val] of Object.entries(t)) {
                        if (val === v) return isNaN(Number(k)) ? k : Number(k);
                    }
                    return null;
                },
                sort: (t, fn) => (Array.isArray(t) ? t.sort(fn) : t)
            }
        };

        const isValidIdentifier = (name) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);

        // Expose direct children of script.Parent (e.g. Humanoid, Head, Torso in Character, or siblings in Model)
        if (script.Parent && script.Parent.GetChildren) {
            for (const child of script.Parent.GetChildren()) {
                if (child !== script && isValidIdentifier(child.Name) && !(child.Name in env)) {
                    env[child.Name] = child;
                }
            }
        }

        // Expose Humanoid if not already in scope (e.g. print(Humanoid.Health))
        if (!env.Humanoid) {
            const h = (script.Parent && script.Parent.FindFirstChildOfClass)
                ? script.Parent.FindFirstChildOfClass('Humanoid')
                : (this.dataModel.Workspace ? this.dataModel.Workspace.FindFirstChildOfClass('Humanoid', true) : null);
            if (h) env.Humanoid = h;
        }

        let code = script.Source || '';

        try {
            code = this.transpileLua(code);
        } catch (err) {
            error('Transpile error: ' + err.message);
        }

        try {
            // Async Function constructor
            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
            const paramNames = Object.keys(env);
            const paramValues = Object.values(env);

            const fn = new AsyncFunction(...paramNames, code);
            this.runningScripts.add(script);

            fn(...paramValues).catch((err) => {
                if (!this.aborted) {
                    error(err.message);
                }
            }).finally(() => {
                this.runningScripts.delete(script);
            });
        } catch (err) {
            error('Compile error: ' + err.message);
        }
    }

    // Execute arbitrary string in command bar
    executeCommand(code) {
        const formatArg = (a) => this.formatArg(a);

        const print = (...args) => {
            if (this.output) this.output.log('info', args.map(formatArg).join(' '));
            else console.log(...args);
        };

        const warn = (...args) => {
            if (this.output) this.output.log('warn', args.map(formatArg).join(' '));
            else console.warn(...args);
        };

        const error = (...args) => {
            if (this.output) this.output.log('error', args.map(formatArg).join(' '));
            else console.error(...args);
        };

        const wait = (seconds = 0.03) => new Promise(r => setTimeout(r, Math.max(10, (seconds || 0.03) * 1000)));

        const task = {
            wait: wait,
            spawn: (fn) => setTimeout(fn, 0),
            delay: (sec, fn) => setTimeout(fn, Math.max(0, (sec || 0) * 1000)),
            defer: (fn) => setTimeout(fn, 0)
        };

        const env = {
            game: this.dataModel,
            workspace: this.dataModel.Workspace,
            require: (target) => this.requireModule(target, null),
            UserInputService: this.dataModel.GetService('UserInputService') || this.dataModel.UserInputService,
            RunService: this.dataModel.GetService('RunService') || this.dataModel.RunService,
            Enum: Enum,
            Vector3: Vector3,
            Vector2: Vector2,
            Color3: Color3,
            CFrame: CFrame,
            Instance: Instance,
            wait: wait,
            task: task,
            print: print,
            warn: warn,
            error: error,
            pairs: (t) => this.pairs(t),
            ipairs: (t) => this.ipairs(t),
            _iterate: (t) => this._iterate(t),
            _iterateVals: (t) => this._iterateVals(t)
        };

        // If Humanoid is in Workspace, expose it directly so print(Humanoid.Health) works in command bar
        if (!env.Humanoid && this.dataModel.Workspace) {
            const h = this.dataModel.Workspace.FindFirstChildOfClass('Humanoid', true);
            if (h) env.Humanoid = h;
        }

        let processed = code;
        try {
            processed = this.transpileLua(code);
        } catch (e) {
            // Keep original if failed
        }

        try {
            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
            const paramNames = Object.keys(env);
            const paramValues = Object.values(env);
            const fn = new AsyncFunction(...paramNames, `return (${processed})`);
            fn(...paramValues).then((res) => {
                if (res !== undefined) print(res);
            }).catch((err) => {
                // Try as statement if return expr failed
                try {
                    const fn2 = new AsyncFunction(...paramNames, processed);
                    fn2(...paramValues).catch(e => error(e.message));
                } catch (e2) {
                    error(err.message);
                }
            });
        } catch (err) {
            error(err.message);
        }
    }
}
