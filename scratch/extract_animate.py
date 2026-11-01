with open('app/content/Animate.rbxm', 'rb') as f:
    data = f.read()
import re
m = re.findall(rb'<ProtectedString name="Source">(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</ProtectedString>', data, re.DOTALL)
if m:
    print('Found', len(m), 'scripts')
    with open('scratch/animate_source.lua', 'wb') as out:
        out.write(m[0])
    print('Wrote scratch/animate_source.lua, len =', len(m[0]))
else:
    print('Not found')
