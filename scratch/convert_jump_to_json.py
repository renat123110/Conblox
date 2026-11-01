import xml.etree.ElementTree as ET
import json
import math

tree = ET.parse('app/content/animations/125750702.rbxm')
root = tree.getroot()

seq_item = root.find(".//Item[@class='KeyframeSequence']")
if not seq_item:
    for it in root.findall('Item'):
        if it.attrib.get('class') == 'KeyframeSequence':
            seq_item = it
            break

keyframes_children = []

for kf in seq_item.findall("Item[@class='Keyframe']"):
    props_elem = kf.find('Properties')
    kf_name = "Keyframe"
    kf_time = 0.0
    if props_elem is not None:
        for p in props_elem:
            if p.attrib.get('name') == 'Name':
                kf_name = p.text or 'Keyframe'
            elif p.attrib.get('name') == 'Time':
                kf_time = float(p.text or 0.0)

    poses_children = []
    def extract_poses(parent, target_list):
        for p in parent.findall("Item[@class='Pose']"):
            p_props = p.find('Properties')
            p_name = ''
            weight = 1.0
            pos = {"x": 0.0, "y": 0.0, "z": 0.0}
            rot = {"x": 0.0, "y": 0.0, "z": 0.0}
            if p_props is not None:
                for prop in p_props:
                    attr_name = prop.attrib.get('name')
                    if attr_name == 'Name':
                        p_name = prop.text or ''
                    elif attr_name == 'Weight':
                        weight = float(prop.text or 1.0)
                    elif attr_name == 'CFrame' and prop.tag == 'CoordinateFrame':
                        x = float(prop.find('X').text if prop.find('X') is not None else 0.0)
                        y = float(prop.find('Y').text if prop.find('Y') is not None else 0.0)
                        z = float(prop.find('Z').text if prop.find('Z') is not None else 0.0)
                        pos = {"x": x, "y": y, "z": z}
                        # 9 matrix elements
                        r = []
                        for row in range(3):
                            for col in range(3):
                                tag = f"R{row}{col}"
                                val = float(prop.find(tag).text if prop.find(tag) is not None else (1.0 if row == col else 0.0))
                                r.append(val)
                        # Convert 3x3 to Euler degrees
                        ang_x = math.asin(max(-1.0, min(1.0, -r[5])))
                        cosX = math.cos(ang_x)
                        if abs(cosX) > 1e-6:
                            ang_y = math.atan2(r[2], r[8])
                            ang_z = math.atan2(r[3], r[4])
                        else:
                            ang_y = math.atan2(-r[6], r[0])
                            ang_z = 0.0
                        deg = 180.0 / math.pi
                        rot = {"x": ang_x * deg, "y": ang_y * deg, "z": ang_z * deg}

            pose_node = {
                "className": "Pose",
                "name": p_name,
                "properties": {
                    "Weight": weight,
                    "CFrame": {
                        "position": pos,
                        "orientation": rot
                    }
                },
                "children": []
            }
            extract_poses(p, pose_node["children"])
            target_list.append(pose_node)

    extract_poses(kf, poses_children)
    keyframes_children.append({
        "className": "Keyframe",
        "name": kf_name,
        "properties": {
            "Time": kf_time
        },
        "children": poses_children
    })

keyframes_children.sort(key=lambda k: k["properties"]["Time"])
duration = keyframes_children[-1]["properties"]["Time"] if keyframes_children else 1.0

serialized_seq = {
    "className": "KeyframeSequence",
    "name": "jump",
    "properties": {
        "Loop": False,
        "Priority": "Core",
        "Duration": duration
    },
    "children": keyframes_children
}

with open('app/content/animations/125750702.json', 'w') as f:
    json.dump(serialized_seq, f, indent=2)

print('Wrote app/content/animations/125750702.json, keyframes:', len(keyframes_children), 'duration:', duration)
