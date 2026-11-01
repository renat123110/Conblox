import sys
import struct

with open(r"C:\Users\Renat\Desktop\Conblox\WomanBody.rbxm", "rb") as f:
    raw = f.read()

# Let's find PROP tags and read property names and values
pos = 0
while True:
    idx = raw.find(b'PROP', pos)
    if idx == -1:
        break
    # print slice around idx
    prop_slice = raw[idx:idx+120]
    print("Found PROP at", idx, ":", repr(prop_slice[:60]))
    pos = idx + 4
