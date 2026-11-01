import sys
sys.path.append(r"C:\Users\Renat\Desktop\Conblox")
import mesh_converter

with open(r"C:\Users\Renat\Desktop\Conblox\app\content\meshes\48112070.mesh", "rb") as f:
    data = f.read()

geom = mesh_converter.parse_roblox_mesh(data)
print("Mesh version:", geom.get("version"))
print("Positions count:", len(geom["positions"]) // 3)
pos = geom["positions"]
xs = pos[0::3]
ys = pos[1::3]
zs = pos[2::3]
print(f"X range: {min(xs)} to {max(xs)}")
print(f"Y range: {min(ys)} to {max(ys)}")
print(f"Z range: {min(zs)} to {max(zs)}")

# Look at first 10 vertices
for i in range(10):
    p = (pos[i*3], pos[i*3+1], pos[i*3+2])
    n = (geom["normals"][i*3], geom["normals"][i*3+1], geom["normals"][i*3+2])
    uv = (geom["uvs"][i*2], geom["uvs"][i*2+1])
    print(f"v{i}: p={p}, n={n}, uv={uv}")
