"""
Roblox .mesh file parser and converter for Conblox Studio.
Supports:
- version 1.00 & 1.01 (ASCII text format)
- version 2.00 (Binary format)
- version 3.00 & 3.01 (Binary format with LODs)
- version 4.00 & 4.01 (Binary format with bones and LODs)
- version 5.00 (Binary format with FACS and bone envelopes)
"""

import gzip
import re
import struct


def decompress_mesh_payload(raw_bytes):
    """Decompresses gzip or zstd if applicable."""
    if raw_bytes.startswith(b"\x1f\x8b"):
        try:
            return gzip.decompress(raw_bytes)
        except Exception:
            pass

    # Check for zstandard magic number 0x28B52FFD
    if raw_bytes.startswith(b"(\xb5/\xfd"):
        try:
            import zstandard
            return zstandard.ZstdDecompressor().decompress(raw_bytes)
        except Exception:
            pass

    return raw_bytes


def parse_roblox_mesh(raw_bytes):
    """
    Parses raw bytes of a Roblox .mesh file.
    Returns:
        dict: {
            "version": str,
            "positions": list of float (x, y, z, ...),
            "normals": list of float (nx, ny, nz, ...),
            "uvs": list of float (u, v, ...),
            "indices": list of int (i0, i1, i2, ...),
            "vertexCount": int,
            "faceCount": int
        }
    """
    raw = decompress_mesh_payload(raw_bytes)

    first_line_end = raw.find(b"\n")
    if first_line_end == -1:
        raise ValueError("Invalid Roblox mesh: header line not found")

    header_line = raw[:first_line_end].decode("ascii", errors="ignore").strip()

    positions = []
    normals = []
    uvs = []
    indices = []

    if header_line in ("version 1.00", "version 1.01"):
        scale = 0.5 if header_line == "version 1.00" else 1.0
        text = raw.decode("ascii", errors="ignore")
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        if len(lines) < 2:
            raise ValueError("Malformed version 1.00 mesh: missing face count")

        num_faces = int(lines[1])
        content = "".join(lines[2:])
        pattern = re.compile(r"\[([^\]]+)\]\[([^\]]+)\]\[([^\]]+)\]")
        matches = pattern.findall(content)

        for i, (p_str, n_str, uv_str) in enumerate(matches):
            p_parts = [float(x.strip()) * scale for x in p_str.split(",")]
            n_parts = [float(x.strip()) for x in n_str.split(",")]
            uv_parts = [float(x.strip()) for x in uv_str.split(",")]

            positions.extend(p_parts[:3])
            normals.extend(n_parts[:3])
            # In Roblox v1, v coordinate is flipped for standard OpenGL/Three.js UV mapping
            u_coord = uv_parts[0] if len(uv_parts) > 0 else 0.0
            v_coord = (1.0 - uv_parts[1]) if len(uv_parts) > 1 else 0.0
            uvs.extend([u_coord, v_coord])
            indices.append(i)

    elif header_line == "version 2.00":
        offset = first_line_end + 1
        sizeof_header, sizeof_vertex, sizeof_face = struct.unpack("<HBB", raw[offset:offset + 4])
        num_vertices, num_faces = struct.unpack("<II", raw[offset + 4:offset + 12])
        v_offset = offset + sizeof_header

        for i in range(num_vertices):
            curr = v_offset + i * sizeof_vertex
            px, py, pz, nx, ny, nz, u, v = struct.unpack("<ffffff", raw[curr:curr + 24]) + struct.unpack("<ff", raw[curr + 24:curr + 32])
            positions.extend([px, py, pz])
            normals.extend([nx, ny, nz])
            uvs.extend([u, 1.0 - v])

        f_offset = v_offset + num_vertices * sizeof_vertex
        for i in range(num_faces):
            curr = f_offset + i * 12
            i0, i1, i2 = struct.unpack("<III", raw[curr:curr + 12])
            indices.extend([i0, i1, i2])

    elif header_line in ("version 3.00", "version 3.01"):
        offset = first_line_end + 1
        sizeof_header, sizeof_vertex, sizeof_face, sizeof_lod = struct.unpack("<HBBH", raw[offset:offset + 6])
        num_lods, num_vertices, num_faces = struct.unpack("<HII", raw[offset + 6:offset + 16])
        v_offset = offset + sizeof_header

        for i in range(num_vertices):
            curr = v_offset + i * sizeof_vertex
            px, py, pz, nx, ny, nz, u, v = struct.unpack("<ffffff", raw[curr:curr + 24]) + struct.unpack("<ff", raw[curr + 24:curr + 32])
            positions.extend([px, py, pz])
            normals.extend([nx, ny, nz])
            uvs.extend([u, 1.0 - v])

        f_offset = v_offset + num_vertices * sizeof_vertex
        face_count_to_load = num_faces
        if num_lods > 1:
            lod_offset = f_offset + num_faces * sizeof_face
            if lod_offset + 8 <= len(raw):
                lod0_count = struct.unpack("<I", raw[lod_offset + 4:lod_offset + 8])[0]
                if 0 < lod0_count <= num_faces:
                    face_count_to_load = lod0_count

        for i in range(face_count_to_load):
            curr = f_offset + i * sizeof_face
            i0, i1, i2 = struct.unpack("<III", raw[curr:curr + 12])
            indices.extend([i0, i1, i2])

    elif header_line in ("version 4.00", "version 4.01"):
        offset = first_line_end + 1
        sizeof_header, lod_type = struct.unpack("<HH", raw[offset:offset + 4])
        num_vertices, num_faces, num_lods, num_bones = struct.unpack("<IIHH", raw[offset + 4:offset + 16])
        v_offset = offset + sizeof_header
        sizeof_vertex = 40

        for i in range(num_vertices):
            curr = v_offset + i * sizeof_vertex
            px, py, pz, nx, ny, nz, u, v = struct.unpack("<ffffff", raw[curr:curr + 24]) + struct.unpack("<ff", raw[curr + 24:curr + 32])
            positions.extend([px, py, pz])
            normals.extend([nx, ny, nz])
            uvs.extend([u, 1.0 - v])

        env_size = 8 * num_vertices if num_bones > 0 else 0
        f_offset = v_offset + num_vertices * sizeof_vertex + env_size
        sizeof_face = 12
        face_count_to_load = num_faces
        if num_lods > 1:
            lod_offset = f_offset + num_faces * sizeof_face
            if lod_offset + 8 <= len(raw):
                lod0_count = struct.unpack("<I", raw[lod_offset + 4:lod_offset + 8])[0]
                if 0 < lod0_count <= num_faces:
                    face_count_to_load = lod0_count

        for i in range(face_count_to_load):
            curr = f_offset + i * sizeof_face
            i0, i1, i2 = struct.unpack("<III", raw[curr:curr + 12])
            indices.extend([i0, i1, i2])

    elif header_line == "version 5.00":
        offset = first_line_end + 1
        sizeof_header, lod_type = struct.unpack("<HH", raw[offset:offset + 4])
        num_vertices, num_faces, num_lods, num_bones = struct.unpack("<IIHH", raw[offset + 4:offset + 16])
        v_offset = offset + sizeof_header
        sizeof_vertex = 40

        for i in range(num_vertices):
            curr = v_offset + i * sizeof_vertex
            px, py, pz, nx, ny, nz, u, v = struct.unpack("<ffffff", raw[curr:curr + 24]) + struct.unpack("<ff", raw[curr + 24:curr + 32])
            positions.extend([px, py, pz])
            normals.extend([nx, ny, nz])
            uvs.extend([u, 1.0 - v])

        env_size = 8 * num_vertices if num_bones > 0 else 0
        f_offset = v_offset + num_vertices * sizeof_vertex + env_size
        sizeof_face = 12
        face_count_to_load = num_faces
        if num_lods > 1:
            lod_offset = f_offset + num_faces * sizeof_face
            if lod_offset + 8 <= len(raw):
                lod0_count = struct.unpack("<I", raw[lod_offset + 4:lod_offset + 8])[0]
                if 0 < lod0_count <= num_faces:
                    face_count_to_load = lod0_count

        for i in range(face_count_to_load):
            curr = f_offset + i * sizeof_face
            i0, i1, i2 = struct.unpack("<III", raw[curr:curr + 12])
            indices.extend([i0, i1, i2])

    else:
        raise ValueError(f"Unsupported Roblox mesh revision: {header_line}")

    return {
        "version": header_line,
        "positions": positions,
        "normals": normals,
        "uvs": uvs,
        "indices": indices,
        "vertexCount": len(positions) // 3,
        "faceCount": len(indices) // 3,
    }


def mesh_to_obj_string(mesh_data):
    """
    Converts parsed mesh data dictionary into a Wavefront OBJ string.
    """
    positions = mesh_data.get("positions", [])
    normals = mesh_data.get("normals", [])
    uvs = mesh_data.get("uvs", [])
    indices = mesh_data.get("indices", [])

    lines = [f"# Conblox Studio converted OBJ from Roblox mesh ({mesh_data.get('version', 'unknown')})\n"]

    for i in range(0, len(positions), 3):
        lines.append(f"v {positions[i]:.6f} {positions[i+1]:.6f} {positions[i+2]:.6f}\n")

    has_normals = len(normals) >= len(positions)
    if has_normals:
        for i in range(0, len(normals), 3):
            lines.append(f"vn {normals[i]:.6f} {normals[i+1]:.6f} {normals[i+2]:.6f}\n")

    has_uvs = len(uvs) >= (len(positions) // 3) * 2
    if has_uvs:
        for i in range(0, len(uvs), 2):
            lines.append(f"vt {uvs[i]:.6f} {uvs[i+1]:.6f}\n")

    for i in range(0, len(indices), 3):
        i0 = indices[i] + 1
        i1 = indices[i + 1] + 1
        i2 = indices[i + 2] + 1
        if has_uvs and has_normals:
            lines.append(f"f {i0}/{i0}/{i0} {i1}/{i1}/{i1} {i2}/{i2}/{i2}\n")
        elif has_normals:
            lines.append(f"f {i0}//{i0} {i1}//{i1} {i2}//{i2}\n")
        else:
            lines.append(f"f {i0} {i1} {i2}\n")

    return "".join(lines)
