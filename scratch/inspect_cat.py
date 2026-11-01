import re

with open(r"C:\Users\Renat\Desktop\Conblox\R6TemplateCat.rbxm", "rb") as f:
    raw = f.read()

print("Strings in R6TemplateCat.rbxm:")
for s in set(re.findall(rb'[a-zA-Z0-9_/.:-]{3,}', raw)):
    st = s.decode('latin1')
    if any(k in st.lower() for k in ['shirt', 'pants', 'torso', 'texture', 'mesh']):
        print(st)
