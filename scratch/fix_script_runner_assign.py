path = r'C:\Users\Renat\Desktop\Conblox\app\js\engine\ScriptRunner.js'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

t = '''        // Multiple local assignment: local a, b, c = v1, v2, v3
        js = js.replace(/\\blocal\\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\\s*,\\s*[a-zA-Z_][a-zA-Z0-9_]*)+)\\s*=\\s*([^;\\n]+)/g, (match, left, right) => {
            const trimmed = right.trim();
            if (trimmed.includes('pcall') || (!trimmed.includes(',') && trimmed.includes('('))) {
                return `var [${left}] = (await ${trimmed})`;
            }
            return `var [${left}] = [${trimmed}]`;
        });'''

r = '''        // Multiple local assignment: local a, b, c = v1, v2, v3
        js = js.replace(/\\blocal\\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\\s*,\\s*[a-zA-Z_][a-zA-Z0-9_]*)+)\\s*=\\s*([^;\\n]+)/g, (match, left, right) => {
            const trimmed = right.trim();
            if (trimmed.includes('(') || !trimmed.includes(',')) {
                return `var [${left}] = ${trimmed}`;
            }
            return `var [${left}] = [${trimmed}]`;
        });'''

assert t in code, 't not found'
code = code.replace(t, r, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)

print('Updated ScriptRunner.js multiple local assignment')
