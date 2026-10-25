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

    // Helper: basic Lua to JS transpiler for common Roblox scripts
    transpileLua(code) {
        let js = code;

        // Comments: --[[ ... ]] -> /* ... */
        js = js.replace(/--\[\[[\s\S]*?\]\]/g, '/*$&*/');
        // Single line comments: -- comment -> // comment
        js = js.replace(/--.*$/gm, match => '//' + match.substring(2));

        // nil -> null
        js = js.replace(/\bnil\b/g, 'null');

        // string concatenation: .. -> +
        js = js.replace(/\s*\.\.\s*/g, ' + ');

        // local function name(...) -> async function name(...) {
        js = js.replace(/\blocal\s+function\s+([a-zA-Z0-9_]+)\s*\((.*?)\)/g, 'async function $1($2) {');

        // function name(...) -> async function name(...) {
        js = js.replace(/\bfunction\s+([a-zA-Z0-9_]+)\s*\((.*?)\)/g, 'async function $1($2) {');

        // anonymous function(...) -> async ($1) => {
        js = js.replace(/\bfunction\s*\((.*?)\)/g, 'async ($1) => {');

        // Multiple local assignment: local a, b, c = v1, v2, v3
        js = js.replace(/\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)+)\s*=\s*([^;\n]+)/g, (match, left, right) => {
            return `var [${left}] = [${right}]`;
        });

        // local x = ... -> var x = ...
        js = js.replace(/\blocal\s+/g, 'var ');

        // not equal ~= -> !==
        js = js.replace(/~=/g, '!==');

        // and / or / not -> && / || / !
        js = js.replace(/\band\b/g, '&&');
        js = js.replace(/\bor\b/g, '||');
        js = js.replace(/\bnot\b/g, '!');

        // Connect: :Connect(function or .Connect(function
        js = js.replace(/[:.]Connect\(async\s*\((.*?)\)\s*=>/g, '.Connect(async ($1) =>');
        js = js.replace(/[:.]connect\(async\s*\((.*?)\)\s*=>/g, '.Connect(async ($1) =>');
        js = js.replace(/[:.]Connect\(function\s*\((.*?)\)/g, '.Connect(async ($1) =>');
        js = js.replace(/[:.]connect\(function\s*\((.*?)\)/g, '.Connect(async ($1) =>');

        // Lua colon method calls: obj:Method(...) -> obj.Method(...)
        js = js.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '.$1(');

        // while ... do -> while (...) {
        js = js.replace(/\bwhile\s+(.*?)\s+do\b/g, 'while ($1) {');

        // for i = start, finish [, step] do -> standard JS loop
        js = js.replace(/\bfor\s+([a-zA-Z0-9_]+)\s*=\s*([^,]+)\s*,\s*([^,]+)\s*(?:,\s*([^,]+))?\s+do\b/g, (match, varName, start, stop, step) => {
            const st = step ? step.trim() : '1';
            return `for (var ${varName} = ${start}; ${varName} <= ${stop}; ${varName} += ${st}) {`;
        });

        // if ... then -> if (...) {
        js = js.replace(/\bif\s+(.*?)\s+then\b/g, 'if ($1) {');
        js = js.replace(/\belseif\s+(.*?)\s+then\b/g, '} else if ($1) {');
        js = js.replace(/\belse\b/g, '} else {');

        // end -> }
        js = js.replace(/\bend\b/g, '}');

        // task.wait(t) -> await task.wait(t) (MUST be processed before wait)
        js = js.replace(/(?<!await\s+)\btask\.wait\s*\(/g, 'await task.wait(');

        // wait(t) -> await wait(t) (ensuring no preceding dot or word character)
        js = js.replace(/(?<!await\s+)(?<![\.\w])\bwait\s*\(/g, 'await wait(');

        // Signal:Wait() or obj.Wait() -> await obj.Wait()
        js = js.replace(/[:.]Wait\(\)/g, '.Wait()');
        js = js.replace(/(?<!await\s+)\b([a-zA-Z0-9_\.]+)\.Wait\(\)/g, 'await $1.Wait()');

        return js;
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
            if (this.aborted) return Promise.resolve(0);
            const ms = Math.max(10, (seconds || 0.03) * 1000);
            return new Promise((resolve) => {
                this.scheduleTask(() => resolve(this.aborted ? 0 : seconds), ms, () => resolve(0));
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
            error: error
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
            error: error
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
