import sys
sys.path.append(r"C:\Users\Renat\Desktop\Conblox")
import mesh_converter

with open(r"C:\Users\Renat\Desktop\Conblox\app\content\meshes\48112070.mesh", "rb") as f:
    data = f.read()

geom = mesh_converter.parse_roblox_mesh(data)
pos = geom["positions"]
uvs = geom["uvs"]
norms = geom["normals"]

# Check bounding box of UVs for front faces (normal.z > 0.5) vs back faces (normal.z < -0.5) vs left/right
front_uvs = []
back_uvs = []
left_uvs = []
right_uvs = []
top_uvs = []
bottom_uvs = []

for i in range(geom["vertexCount"]):
    nx, ny, nz = norms[i*3], norms[i*3+1], norms[i*3+2]
    u, v = uvs[i*2], uvs[i*2+1]
    if nz > 0.5:
        front_uvs.append((u, v))
    elif nz < -0.5:
        back_uvs.append((u, v))
    elif nx > 0.5:
        right_uvs.append((u, v))
    elif nx < -0.5:
        left_uvs.append((u, v))
    elif ny > 0.5:
        top_uvs.append((u, v))
    elif ny < -0.5:
        bottom_uvs.append((u, v))

def uv_stats(name, lst):
    if not lst:
        print(f"{name}: empty")
        return
    us = [p[0] for p in lst]
    vs = [p[1] for p in lst]
    print(f"{name}: U=[{min(us):.3f}, {max(us):.3f}], V=[{min(vs):.3f}, {max(vs):.3f}], count={len(lst)}")

uv_stats("Front (+Z)", front_uvs)
uv_stats("Back (-Z)", back_uvs)
uv_stats("Right (+X)", right_uvs)
uv_stats("Left (-X)", left_uvs)
uv_stats("Top (+Y)", top_uvs)
uv_stats("Bottom (-Y)", bottom_uvs)
