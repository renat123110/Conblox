import sys
import os

with open(r"C:\Users\Renat\Desktop\Conblox\WomanBody.rbxm", "rb") as f:
    data = f.read()

print("File size:", len(data))
print("First 200 bytes:", data[:200])
