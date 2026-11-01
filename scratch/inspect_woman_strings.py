import sys
sys.path.append(r"C:\Users\Renat\Desktop\Conblox")

# Let's inspect WomanBody.rbxm using python
with open(r"C:\Users\Renat\Desktop\Conblox\WomanBody.rbxm", "rb") as f:
    raw = f.read()

# Let's search strings in raw
import re
print("Strings in WomanBody.rbxm:")
for s in re.findall(rb'[a-zA-Z0-9_/.:-]{3,}', raw):
    print(s.decode('latin1'))
