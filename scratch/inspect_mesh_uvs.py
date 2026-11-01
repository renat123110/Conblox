import sys
sys.path.append(r"C:\Users\Renat\Desktop\Conblox")
import mesh_converter

with open(r"C:\Users\Renat\Desktop\Conblox\app\content\meshes\48112070.mesh", "rb") as f:
    data = f.read()

geom = mesh_converter.parse_roblox_mesh(data)
uvs = geom["uvs"]
u_vals = [uvs[i] for i in range(0, len(uvs), 2)]
v_vals = [uvs[i] for i in range(1, len(uvs), 2)]

print("Total vertices:", geom["vertexCount"])
print("U range:", min(u_vals), max(u_vals))
print("V range:", min(v_vals), max(v_vals))
print("Sample UVs:", list(zip(u_vals[:10], v_vals[:10])))
