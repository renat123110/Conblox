from PIL import Image, ImageDraw
import struct

im = Image.open('scratch/composite_torso.png').convert('RGB')
w, h = im.size

with open('app/content/meshes/48112070.mesh', 'rb') as f:
    raw = f.read()

offset = raw.find(b'\n') + 1
sizeof_header, sizeof_vertex, sizeof_face = struct.unpack('<HBB', raw[offset:offset + 4])
num_vertices, num_faces = struct.unpack('<II', raw[offset + 4:offset + 12])
v_offset = offset + sizeof_header

verts = []
for i in range(num_vertices):
    curr = v_offset + i * sizeof_vertex
    px, py, pz, nx, ny, nz, u, v, _ = struct.unpack('<9f', raw[curr:curr + 36])
    verts.append(((px, py, pz), (nx, ny, nz)))

f_offset = v_offset + num_vertices * sizeof_vertex
faces = []
for i in range(num_faces):
    curr = f_offset + i * sizeof_face
    faces.append(struct.unpack('<III', raw[curr:curr + 12]))

rects = {
    'right':  (165, 74, 64, 128),
    'left':   (361, 74, 64, 128),
    'top':    (231, 8, 128, 64),
    'bottom': (231, 204, 128, 64),
    'back':   (427, 74, 128, 128),
    'front':  (231, 74, 128, 128)
}

halfX = 1.0
halfY = 1.0
halfZ = 0.5

projected_uvs = []
for (px, py, pz), (nx, ny, nz) in verts:
    nxa, nya, nza = abs(nx), abs(ny), abs(nz)
    if nza >= nxa and nza >= nya:
        if nz <= 0: # Front (-Z)
            rx, ry, rw, rh = rects['front']
            fu = (1.0 - px / halfX) * 0.5
            fv = (1.0 - py / halfY) * 0.5
        else: # Back (+Z)
            rx, ry, rw, rh = rects['back']
            fu = (px / halfX + 1.0) * 0.5
            fv = (1.0 - py / halfY) * 0.5
    elif nxa >= nya:
        if nx >= 0: # Right (+X)
            rx, ry, rw, rh = rects['right']
            fu = (pz / halfZ + 1.0) * 0.5
            fv = (1.0 - py / halfY) * 0.5
        else: # Left (-X)
            rx, ry, rw, rh = rects['left']
            fu = (1.0 - pz / halfZ) * 0.5
            fv = (1.0 - py / halfY) * 0.5
    else:
        if ny >= 0: # Top (+Y)
            rx, ry, rw, rh = rects['top']
            fu = (1.0 - px / halfX) * 0.5
            fv = (1.0 - pz / halfZ) * 0.5
        else: # Bottom (-Y)
            rx, ry, rw, rh = rects['bottom']
            fu = (1.0 - px / halfX) * 0.5
            fv = (pz / halfZ + 1.0) * 0.5

    fu = max(0.0, min(1.0, fu))
    fv = max(0.0, min(1.0, fv))
    px_u = (rx + fu * rw) / w
    px_v = (ry + fv * rh) / h
    projected_uvs.append((px_u, px_v))

draw = ImageDraw.Draw(im)
for i0, i1, i2 in faces:
    p0 = (int(projected_uvs[i0][0] * w), int(projected_uvs[i0][1] * h))
    p1 = (int(projected_uvs[i1][0] * w), int(projected_uvs[i1][1] * h))
    p2 = (int(projected_uvs[i2][0] * w), int(projected_uvs[i2][1] * h))
    draw.line([p0, p1, p2, p0], fill=(0, 255, 255), width=1)

im.save('scratch/fixed_projected_torso_wire.png')
print('Successfully saved scratch/fixed_projected_torso_wire.png')
