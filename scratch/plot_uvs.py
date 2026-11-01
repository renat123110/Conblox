from PIL import Image, ImageDraw
import struct

# Load raw mesh
with open('C:/Users/Renat/Desktop/Conblox/app/content/meshes/18732318728.mesh', 'rb') as f:
    raw = f.read()

nl = raw.find(b'\n')
sizeof_header = struct.unpack('<H', raw[nl+1:nl+3])[0]
num_verts = struct.unpack('<I', raw[nl+5:nl+9])[0]
num_faces = struct.unpack('<I', raw[nl+9:nl+13])[0]
v_offset = nl + 1 + sizeof_header
f_offset = v_offset + num_verts * 40

raw_uvs = []
for i in range(num_verts):
    curr = v_offset + i * 40
    u, v = struct.unpack('<ff', raw[curr+24:curr+32])
    raw_uvs.append((u, v))

faces = []
for i in range(num_faces):
    curr = f_offset + i * 12
    i0, i1, i2 = struct.unpack('<III', raw[curr:curr+12])
    faces.append((i0, i1, i2))

# Load texture
im = Image.open('C:/Users/Renat/Desktop/Conblox/app/content/textures/roblox/18732318940.png').convert('RGB')
w, h = im.size

# Test 4 mappings:
# A: u, v (with image coordinates where Y=0 is top, so pixel_y = v * h)
# B: u, 1-v (pixel_y = (1-v) * h)
# C: 1-u, v
# D: 1-u, 1-v

def draw_uv_on_texture(uv_func, filename):
    out = im.copy()
    draw = ImageDraw.Draw(out)
    for i0, i1, i2 in faces[::2]: # Draw every 2nd face for speed
        u0, v0 = uv_func(raw_uvs[i0][0], raw_uvs[i0][1])
        u1, v1 = uv_func(raw_uvs[i1][0], raw_uvs[i1][1])
        u2, v2 = uv_func(raw_uvs[i2][0], raw_uvs[i2][1])
        p0 = (int(u0 * w), int(v0 * h))
        p1 = (int(u1 * w), int(v1 * h))
        p2 = (int(u2 * w), int(v2 * h))
        draw.line([p0, p1, p2, p0], fill=(255, 0, 0, 180), width=1)
    out.save(filename)
    print(f'Saved {filename}')

draw_uv_on_texture(lambda u, v: (u, v), 'C:/Users/Renat/.gemini/antigravity/brain/befa1e62-90eb-4429-bea7-6560ccf27932/uv_wire_A.png')
draw_uv_on_texture(lambda u, v: (u, 1-v), 'C:/Users/Renat/.gemini/antigravity/brain/befa1e62-90eb-4429-bea7-6560ccf27932/uv_wire_B.png')
draw_uv_on_texture(lambda u, v: (1-u, v), 'C:/Users/Renat/.gemini/antigravity/brain/befa1e62-90eb-4429-bea7-6560ccf27932/uv_wire_C.png')
draw_uv_on_texture(lambda u, v: (1-u, 1-v), 'C:/Users/Renat/.gemini/antigravity/brain/befa1e62-90eb-4429-bea7-6560ccf27932/uv_wire_D.png')
