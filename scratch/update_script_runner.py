path = r'C:\Users\Renat\Desktop\Conblox\app\js\engine\ScriptRunner.js'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update transpileLua
t1 = '''        // Multiple local assignment: local a, b, c = v1, v2, v3
        js = js.replace(/\\blocal\\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\\s*,\\s*[a-zA-Z_][a-zA-Z0-9_]*)+)\\s*=\\s*([^;\\n]+)/g, (match, left, right) => {
            return `var [${left}] = [${right}]`;
        });'''

r1 = '''        // do ... end block (not preceded by while/for on same line) -> {
        js = js.replace(/(?<!\\bwhile\\s+[^\\n]+)(?<!\\bfor\\s+[^\\n]+)\\bdo\\b/g, '{');

        // pcall(...) -> await pcall(...)
        js = js.replace(/(?<!await\\s+)\\bpcall\\s*\\(/g, 'await pcall(');

        // Multiple local assignment: local a, b, c = v1, v2, v3
        js = js.replace(/\\blocal\\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\\s*,\\s*[a-zA-Z_][a-zA-Z0-9_]*)+)\\s*=\\s*([^;\\n]+)/g, (match, left, right) => {
            const trimmed = right.trim();
            if (trimmed.includes('pcall') || (!trimmed.includes(',') && trimmed.includes('('))) {
                return `var [${left}] = (await ${trimmed})`;
            }
            return `var [${left}] = [${trimmed}]`;
        });'''

assert t1 in code, 't1 not found'
code = code.replace(t1, r1, 1)

# 2. Update env
t2 = '''            _iterate: (t) => this._iterate(t),
            _iterateVals: (t) => this._iterateVals(t)
        };'''

r2 = '''            _iterate: (t) => this._iterate(t),
            _iterateVals: (t) => this._iterateVals(t),
            pcall: async (fn, ...args) => {
                try {
                    const r = await fn(...args);
                    return [true, r];
                } catch (e) {
                    return [false, e];
                }
            },
            ypcall: async (fn, ...args) => {
                try {
                    const r = await fn(...args);
                    return [true, r];
                } catch (e) {
                    return [false, e];
                }
            },
            UserSettings: () => ({
                IsUserFeatureEnabled: () => false,
                GetUserFeature: () => false
            }),
            math: Math,
            string: String,
            table: {
                insert: (t, ...args) => {
                    if (!t) return;
                    if (args.length === 1) t.push(args[0]);
                    else t.splice(args[0] - 1, 0, args[1]);
                },
                remove: (t, pos) => t ? t.splice((pos || t.length) - 1, 1)[0] : null,
                find: (t, v) => { if (!t) return null; const idx = t.indexOf(v); return idx >= 0 ? idx + 1 : null; },
                sort: (t, fn) => t ? t.sort(fn) : t
            }
        };'''

assert t2 in code, 't2 not found'
code = code.replace(t2, r2, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)

print('Updated ScriptRunner.js successfully')
