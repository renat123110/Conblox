/**
 * Roblox Mesh Parser and Geometry utilities for Conblox Studio.
 * Handles Roblox .mesh versions (v1, v2, v3, v4, v5) and Wavefront .obj.
 */

export function extractRobloxAssetId(value) {
    if (!value) return null;
    const str = String(value).trim();
    if (/^\d+$/.test(str)) return str;
    const match = str.match(/(?:assetId[=/]|id[=/]|catalog\/|library\/|rbxassetid:\/\/|^)(\d{1,20})/i);
    return match ? match[1] : null;
}

export function parseRobloxMeshBuffer(buffer) {
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);

    // Find first newline
    let newlineIdx = -1;
    for (let i = 0; i < Math.min(bytes.length, 30); i++) {
        if (bytes[i] === 0x0A) { // '\n'
            newlineIdx = i;
            break;
        }
    }

    if (newlineIdx === -1) {
        throw new Error('Invalid mesh: header newline not found');
    }

    const header = new TextDecoder('ascii').decode(bytes.subarray(0, newlineIdx)).trim();

    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    if (header === 'version 1.00' || header === 'version 1.01') {
        const scale = header === 'version 1.00' ? 0.5 : 1.0;
        const text = new TextDecoder('ascii').decode(bytes);
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) throw new Error('Malformed v1 mesh');

        const numFaces = parseInt(lines[1], 10);
        const content = lines.slice(2).join('');
        const regex = /\[([^\]]+)\]\[([^\]]+)\]\[([^\]]+)\]/g;
        let match;
        let vertIdx = 0;

        while ((match = regex.exec(content)) !== null) {
            const pParts = match[1].split(',').map(s => parseFloat(s.trim()) * scale);
            const nParts = match[2].split(',').map(s => parseFloat(s.trim()));
            const uvParts = match[3].split(',').map(s => parseFloat(s.trim()));

            positions.push(pParts[0] || 0, pParts[1] || 0, pParts[2] || 0);
            normals.push(nParts[0] || 0, nParts[1] || 0, nParts[2] || 0);
            uvs.push(uvParts[0] || 0, 1.0 - (uvParts[1] || 0));
            indices.push(vertIdx++);
        }
    } else if (header === 'version 2.00') {
        let offset = newlineIdx + 1;
        const sizeofHeader = view.getUint16(offset, true);
        const sizeofVertex = view.getUint8(offset + 2);
        const sizeofFace = view.getUint8(offset + 3);
        const numVertices = view.getUint32(offset + 4, true);
        const numFaces = view.getUint32(offset + 8, true);

        const vOffset = offset + sizeofHeader;
        for (let i = 0; i < numVertices; i++) {
            const curr = vOffset + i * sizeofVertex;
            positions.push(view.getFloat32(curr, true), view.getFloat32(curr + 4, true), view.getFloat32(curr + 8, true));
            normals.push(view.getFloat32(curr + 12, true), view.getFloat32(curr + 16, true), view.getFloat32(curr + 20, true));
            uvs.push(view.getFloat32(curr + 24, true), 1.0 - view.getFloat32(curr + 28, true));
        }

        const fOffset = vOffset + numVertices * sizeofVertex;
        for (let i = 0; i < numFaces; i++) {
            const curr = fOffset + i * 12;
            indices.push(view.getUint32(curr, true), view.getUint32(curr + 4, true), view.getUint32(curr + 8, true));
        }
    } else if (header === 'version 3.00' || header === 'version 3.01') {
        let offset = newlineIdx + 1;
        const sizeofHeader = view.getUint16(offset, true);
        const sizeofVertex = view.getUint8(offset + 2);
        const sizeofFace = view.getUint8(offset + 3);
        const sizeofLod = view.getUint16(offset + 4, true);
        const numLods = view.getUint16(offset + 6, true);
        const numVertices = view.getUint32(offset + 8, true);
        const numFaces = view.getUint32(offset + 12, true);

        const vOffset = offset + sizeofHeader;
        for (let i = 0; i < numVertices; i++) {
            const curr = vOffset + i * sizeofVertex;
            positions.push(view.getFloat32(curr, true), view.getFloat32(curr + 4, true), view.getFloat32(curr + 8, true));
            normals.push(view.getFloat32(curr + 12, true), view.getFloat32(curr + 16, true), view.getFloat32(curr + 20, true));
            uvs.push(view.getFloat32(curr + 24, true), 1.0 - view.getFloat32(curr + 28, true));
        }

        const fOffset = vOffset + numVertices * sizeofVertex;
        let faceCountToLoad = numFaces;
        if (numLods > 1) {
            const lodOffset = fOffset + numFaces * sizeofFace;
            if (lodOffset + 8 <= buffer.byteLength) {
                const lod0Count = view.getUint32(lodOffset + 4, true);
                if (lod0Count > 0 && lod0Count <= numFaces) {
                    faceCountToLoad = lod0Count;
                }
            }
        }

        for (let i = 0; i < faceCountToLoad; i++) {
            const curr = fOffset + i * sizeofFace;
            indices.push(view.getUint32(curr, true), view.getUint32(curr + 4, true), view.getUint32(curr + 8, true));
        }
    } else if (header === 'version 4.00' || header === 'version 4.01' || header === 'version 5.00') {
        let offset = newlineIdx + 1;
        const sizeofHeader = view.getUint16(offset, true);
        const lodType = view.getUint16(offset + 2, true);
        const numVertices = view.getUint32(offset + 4, true);
        const numFaces = view.getUint32(offset + 8, true);
        const numLods = view.getUint16(offset + 12, true);
        const numBones = view.getUint16(offset + 14, true);

        const vOffset = offset + sizeofHeader;
        const sizeofVertex = 40;

        for (let i = 0; i < numVertices; i++) {
            const curr = vOffset + i * sizeofVertex;
            positions.push(view.getFloat32(curr, true), view.getFloat32(curr + 4, true), view.getFloat32(curr + 8, true));
            normals.push(view.getFloat32(curr + 12, true), view.getFloat32(curr + 16, true), view.getFloat32(curr + 20, true));
            uvs.push(view.getFloat32(curr + 24, true), 1.0 - view.getFloat32(curr + 28, true));
        }

        const envSize = numBones > 0 ? 8 * numVertices : 0;
        const fOffset = vOffset + numVertices * sizeofVertex + envSize;
        const sizeofFace = 12;
        let faceCountToLoad = numFaces;
        if (numLods > 1) {
            const lodOffset = fOffset + numFaces * sizeofFace;
            if (lodOffset + 8 <= buffer.byteLength) {
                const lod0Count = view.getUint32(lodOffset + 4, true);
                if (lod0Count > 0 && lod0Count <= numFaces) {
                    faceCountToLoad = lod0Count;
                }
            }
        }

        for (let i = 0; i < faceCountToLoad; i++) {
            const curr = fOffset + i * sizeofFace;
            indices.push(view.getUint32(curr, true), view.getUint32(curr + 4, true), view.getUint32(curr + 8, true));
        }
    } else {
        throw new Error(`Unsupported Roblox mesh version: ${header}`);
    }

    return {
        version: header,
        positions,
        normals,
        uvs,
        indices,
        vertexCount: positions.length / 3,
        faceCount: indices.length / 3
    };
}

export function parseObjString(text) {
    const lines = text.split('\n');
    const positions = [];
    const normals = [];
    const uvs = [];

    const rawPos = [];
    const rawNorm = [];
    const rawUv = [];
    const indices = [];

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;

        const parts = line.split(/\s+/);
        const type = parts[0];

        if (type === 'v') {
            rawPos.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
        } else if (type === 'vn') {
            rawNorm.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
        } else if (type === 'vt') {
            rawUv.push(parseFloat(parts[1]), parseFloat(parts[2]));
        } else if (type === 'f') {
            const faceVerts = parts.slice(1);
            if (faceVerts.length >= 3) {
                // Triangulate fan
                for (let i = 1; i < faceVerts.length - 1; i++) {
                    const tri = [faceVerts[0], faceVerts[i], faceVerts[i + 1]];
                    for (const vStr of tri) {
                        const sub = vStr.split('/');
                        const pi = (parseInt(sub[0], 10) - 1) * 3;
                        const ti = sub[1] ? (parseInt(sub[1], 10) - 1) * 2 : -1;
                        const ni = sub[2] ? (parseInt(sub[2], 10) - 1) * 3 : -1;

                        const idx = positions.length / 3;
                        positions.push(rawPos[pi] || 0, rawPos[pi + 1] || 0, rawPos[pi + 2] || 0);
                        if (ni >= 0) {
                            normals.push(rawNorm[ni] || 0, rawNorm[ni + 1] || 0, rawNorm[ni + 2] || 0);
                        } else {
                            normals.push(0, 1, 0);
                        }
                        if (ti >= 0) {
                            uvs.push(rawUv[ti] || 0, rawUv[ti + 1] || 0);
                        } else {
                            uvs.push(0, 0);
                        }
                        indices.push(idx);
                    }
                }
            }
        }
    }

    return {
        positions,
        normals,
        uvs,
        indices,
        vertexCount: positions.length / 3,
        faceCount: indices.length / 3
    };
}

export function createBufferGeometryFromMeshData(meshData) {
    if (!meshData || !meshData.positions || meshData.positions.length === 0) return null;
    const THREE = window.THREE;
    if (!THREE) return null;

    const geo = new THREE.BufferGeometry();
    const vertCount = Math.floor(meshData.positions.length / 3);

    // Sanitize positions
    const posArr = new Float32Array(vertCount * 3);
    for (let i = 0; i < posArr.length; i++) {
        const val = meshData.positions[i];
        posArr[i] = (typeof val === 'number' && Number.isFinite(val)) ? val : 0;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

    // Sanitize normals
    let hasValidNormals = Boolean(meshData.normals && meshData.normals.length === meshData.positions.length);
    if (hasValidNormals) {
        const normArr = new Float32Array(vertCount * 3);
        for (let i = 0; i < normArr.length; i++) {
            const val = meshData.normals[i];
            if (typeof val !== 'number' || !Number.isFinite(val)) {
                hasValidNormals = false;
                break;
            }
            normArr[i] = val;
        }
        if (hasValidNormals) {
            geo.setAttribute('normal', new THREE.BufferAttribute(normArr, 3));
        }
    }
    if (!hasValidNormals) {
        geo.computeVertexNormals();
    }

    // Sanitize UV coordinates
    if (meshData.uvs && meshData.uvs.length >= vertCount * 2) {
        const uvArr = new Float32Array(vertCount * 2);
        for (let i = 0; i < uvArr.length; i++) {
            const val = meshData.uvs[i];
            uvArr[i] = (typeof val === 'number' && Number.isFinite(val)) ? val : 0;
        }
        geo.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2));
    }

    if (meshData.indices && meshData.indices.length > 0) {
        const idxArr = new Uint32Array(meshData.indices.length);
        for (let i = 0; i < idxArr.length; i++) {
            idxArr[i] = meshData.indices[i] >>> 0;
        }
        geo.setIndex(new THREE.BufferAttribute(idxArr, 1));
    }

    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
}

export async function fetchRobloxMeshData(assetId, force = false) {
    const url = `/api/roblox-mesh?id=${encodeURIComponent(assetId)}${force ? '&force=1' : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
        let errJson = {};
        try {
            errJson = await response.json();
        } catch (_) {}
        const msg = errJson.error || `Roblox mesh ${assetId} request failed (${response.status})`;
        const err = new Error(msg);
        err.status = response.status;
        err.authRequired = Boolean(errJson.authRequired || response.status === 401 || msg.toLowerCase().includes('authentication required'));
        throw err;
    }
    const data = await response.json();
    return data;
}
