import numpy as np

# Read head.obj
verts = []
uvs = []
normals = []
faces = []

with open('head.obj') as f:
    for line in f:
        line = line.strip()
        if line.startswith('v '):
            verts.append([float(x) for x in line.split()[1:4]])
        elif line.startswith('vt '):
            uvs.append([float(x) for x in line.split()[1:3]])
        elif line.startswith('vn '):
            normals.append([float(x) for x in line.split()[1:4]])
        elif line.startswith('f '):
            faces.append(line.split()[1:])

print(f"Loaded head.obj: {len(verts)} vertices, {len(uvs)} uvs, {len(normals)} normals, {len(faces)} faces")

# Find top of head vs bottom of head
verts = np.array(verts)
print("Center:", verts.mean(axis=0))
print("Y range:", verts[:,1].min(), verts[:,1].max())
print("Z range:", verts[:,2].min(), verts[:,2].max())
print("X range:", verts[:,0].min(), verts[:,0].max())

# Where is the iconic top bevel or stud or chin?
# In Roblox R6 head, the top is rounded with a neck hole or stud at top?
# Wait! In Roblox, the neck is at Y = -0.5 (connecting to torso at Y = +1).
# Torso top is at Y = +1 (or neck joint).
# Head bottom has a hole for the neck / inlet.
# Look at rbxm props:
# BottomSurface: "Inlet"
# TopSurface: "Smooth"
