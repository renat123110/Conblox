"""
Verification of Roblox clothing template coordinates and BoxGeometry UV mapping.

Roblox Coordinate Convention:
- Forward (Front face) = -Z
- Backward (Back face) = +Z
- Up (Top face) = +Y
- Down (Bottom face) = -Y
- Right (+X) = Character's right side (Right Arm side)
- Left (-X) = Character's left side (Left Arm side)

Three.js BoxGeometry face index order:
- Face 0 = +X (Right in character coords)
- Face 1 = -X (Left in character coords)
- Face 2 = +Y (Top in character coords)
- Face 3 = -Y (Bottom in character coords)
- Face 4 = +Z (Back in character coords)
- Face 5 = -Z (Front in character coords)
"""

# Let's verify Torso:
torso_rects = {
    'right':  {'x': 165, 'y': 74,  'w': 64,  'h': 128}, # +X (faces right arm)
    'left':   {'x': 361, 'y': 74,  'w': 64,  'h': 128}, # -X (faces left arm)
    'top':    {'x': 231, 'y': 8,   'w': 128, 'h': 64 }, # +Y (neck/shoulders)
    'bottom': {'x': 231, 'y': 204, 'w': 128, 'h': 64 }, # -Y (waist)
    'front':  {'x': 231, 'y': 74,  'w': 128, 'h': 128}, # -Z (chest / front print PUR 03)
    'back':   {'x': 427, 'y': 74,  'w': 128, 'h': 128}  # +Z (back / OwO)
}

# Right Arm & Right Leg (Block A: x in [19, 281]):
# Col 1 (19..83, w=64): Outer side (+X on right side) -> 'right'
# Col 2 (85..149, w=64): Front (-Z, knee pad) -> 'front'
# Col 3 (151..215, w=64): Inner side (-X on right side, towards torso) -> 'left'
# Col 4 (217..281, w=64): Back (+Z, panel) -> 'back'
# Top (217..281, y=289..353, w=64, h=64): +Y -> 'top'
# Bottom (217..281, y=485..549, w=64, h=64): -Y -> 'bottom'
right_limb_rects = {
    'right':  {'x': 19,  'y': 355, 'w': 64, 'h': 128}, # +X (outer)
    'front':  {'x': 85,  'y': 355, 'w': 64, 'h': 128}, # -Z (front / knee pad)
    'left':   {'x': 151, 'y': 355, 'w': 64, 'h': 128}, # -X (inner)
    'back':   {'x': 217, 'y': 355, 'w': 64, 'h': 128}, # +Z (back / panel)
    'top':    {'x': 217, 'y': 289, 'w': 64, 'h': 64 }, # +Y (shoulder / top of leg)
    'bottom': {'x': 217, 'y': 485, 'w': 64, 'h': 64 }  # -Y (hand / foot)
}

# Left Arm & Left Leg (Block B: x in [307, 569]):
# Col 1 (307..371, w=64): Back (+Z, panel) -> 'back'
# Col 2 (373..437, w=64): Inner side (+X on left side, towards torso) -> 'right'
# Col 3 (439..503, w=64): Front (-Z, knee pad) -> 'front'
# Col 4 (505..569, w=64): Outer side (-X on left side) -> 'left'
# Top (307..371, y=289..353, w=64, h=64): +Y -> 'top'
# Bottom (307..371, y=485..549, w=64, h=64): -Y -> 'bottom'
left_limb_rects = {
    'right':  {'x': 373, 'y': 355, 'w': 64, 'h': 128}, # +X (inner)
    'front':  {'x': 439, 'y': 355, 'w': 64, 'h': 128}, # -Z (front / knee pad)
    'left':   {'x': 505, 'y': 355, 'w': 64, 'h': 128}, # -X (outer)
    'back':   {'x': 307, 'y': 355, 'w': 64, 'h': 128}, # +Z (back / panel)
    'top':    {'x': 307, 'y': 289, 'w': 64, 'h': 64 }, # +Y (shoulder / top of leg)
    'bottom': {'x': 307, 'y': 485, 'w': 64, 'h': 64 }  # -Y (hand / foot)
}

print("Validated rects!")
