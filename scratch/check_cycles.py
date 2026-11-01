import os
import re

app_root = r'C:\Users\Renat\Desktop\Conblox\app'

def find_imports(file_path):
    if not os.path.exists(file_path):
        return []
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    # Match: import ... from '...'; or import '...';
    pattern = r'''(?:import|export)\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]'''
    imports = re.findall(pattern, content)
    resolved = []
    base_dir = os.path.dirname(file_path)
    for imp in imports:
        if imp.startswith('.'):
            target = os.path.normpath(os.path.join(base_dir, imp))
            if not target.endswith('.js') and os.path.exists(target + '.js'):
                target = target + '.js'
            resolved.append(target)
    return resolved

visited = {}
cycles = []

def dfs(node, path):
    if node in path:
        cycle_start = path.index(node)
        cycle = path[cycle_start:] + [node]
        cycles.append(cycle)
        return
    if node in visited:
        return
    visited[node] = True
    for dep in find_imports(node):
        dfs(dep, path + [node])

dfs(os.path.join(app_root, 'js', 'studio', 'StudioApp.js'), [])

if cycles:
    print(f'Found {len(cycles)} cycles:')
    for c in cycles:
        print(' -> '.join(os.path.relpath(x, app_root) for x in c))
else:
    print('No cycles found starting from StudioApp.js')
