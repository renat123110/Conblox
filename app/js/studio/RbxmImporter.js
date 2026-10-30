import { RobloxFile } from '../vendor/rbxm-parser.js';
import { Instance } from '../engine/Instance.js';
import { Vector3, Color3, CFrame } from '../engine/Math3D.js';

function getProperty(source, name) {
    return source._props?.get(name)?.value;
}

function enumName(value) {
    if (typeof value === 'string') return value;
    return value?._name || '';
}

function toVector3(value) {
    if (!value) return new Vector3();
    return new Vector3(value.X ?? value.x, value.Y ?? value.y, value.Z ?? value.z);
}

function toCFrame(value) {
    if (!value) return new CFrame();
    const position = toVector3(value.Position);
    const matrix = value.Orientation;
    if (!Array.isArray(matrix) || matrix.length !== 9) return new CFrame(position);

    const x = Math.asin(Math.max(-1, Math.min(1, -matrix[5])));
    const cosX = Math.cos(x);
    let y;
    let z;
    if (Math.abs(cosX) > 1e-6) {
        y = Math.atan2(matrix[2], matrix[8]);
        z = Math.atan2(matrix[3], matrix[4]);
    } else {
        y = Math.atan2(-matrix[6], matrix[0]);
        z = 0;
    }
    const degrees = 180 / Math.PI;
    return new CFrame(position, new Vector3(x * degrees, y * degrees, z * degrees));
}

function createInstance(source) {
    const className = source.constructor.name;
    const constructor = Instance.classRegistry.get(className);
    const instance = constructor ? new constructor() : new Instance(className);
    instance.Name = getProperty(source, 'Name') || className;
    return instance;
}

function applyProperties(source, instance, importedInstances) {
    const className = source.constructor.name;

    if (instance.IsA('BasePart')) {
        const cframe = getProperty(source, 'CFrame');
        if (cframe) instance.CFrame = toCFrame(cframe);

        const size = getProperty(source, 'size') || getProperty(source, 'Size');
        if (size) instance.Size = toVector3(size);

        const color = getProperty(source, 'Color3uint8') || getProperty(source, 'Color3');
        if (color) instance.Color = new Color3(color.R, color.G, color.B);

        const material = getProperty(source, 'Material');
        if (material) instance.Material = enumName(material) || instance.Material;

        for (const [sourceName, targetName] of [
            ['Anchored', 'Anchored'],
            ['CanCollide', 'CanCollide'],
            ['CastShadow', 'CastShadow'],
            ['Locked', 'Locked'],
            ['Reflectance', 'Reflectance'],
            ['Transparency', 'Transparency']
        ]) {
            const value = getProperty(source, sourceName);
            if (value !== undefined) instance[targetName] = value;
        }

        const shape = enumName(getProperty(source, 'shape'));
        if (shape) instance.Shape = shape;

        const hasHeadMesh = instance.Name === 'Head' && Array.from(source._children || []).some(child =>
            child.constructor.name === 'SpecialMesh' && enumName(getProperty(child, 'MeshType')) === 'Head'
        );
        if (hasHeadMesh) {
            const orientation = instance.Orientation;
            instance.Orientation = new Vector3(-90, orientation.y, orientation.z);
        }
    }

    if (className === 'Decal' || className === 'Texture') {
        const sourceParent = source._parent;
        const isHeadFace = className === 'Decal'
            && getProperty(sourceParent, 'Name') === 'Head'
            && String(getProperty(source, 'Name') || '').toLowerCase() === 'face';
        const texture = getProperty(source, 'Texture');
        if (isHeadFace) instance.Texture = '/content/textures/face.png';
        else if (typeof texture === 'string') instance.Texture = texture;
        const face = enumName(getProperty(source, 'Face'));
        if (face) instance.Face = face;
        const transparency = getProperty(source, 'Transparency');
        if (transparency !== undefined) instance.Transparency = transparency;
    }

    if (className === 'ParticleEmitter') {
        const texture = getProperty(source, 'Texture');
        if (typeof texture === 'string') instance.Texture = texture;
    }

    if (className === 'SpecialMesh') {
        const meshType = enumName(getProperty(source, 'MeshType'));
        if (meshType) instance.MeshType = meshType;
        const scale = getProperty(source, 'Scale');
        if (scale) instance.Scale = toVector3(scale);
        const offset = getProperty(source, 'Offset');
        if (offset) instance.Offset = toVector3(offset);
        const vertexColor = getProperty(source, 'VertexColor');
        if (vertexColor) instance.VertexColor = toVector3(vertexColor);
        instance.MeshId = getProperty(source, 'MeshId') || '';
        instance.TextureId = getProperty(source, 'TextureId') || '';
    }

    if (className === 'Humanoid') {
        for (const property of ['Health', 'MaxHealth', 'WalkSpeed', 'JumpPower']) {
            const value = getProperty(source, property);
            if (value !== undefined) instance[property] = value;
        }
    }

    if (className === 'Motor6D' || className === 'Weld') {
        for (const property of ['C0', 'C1', 'Transform']) {
            const value = getProperty(source, property);
            if (value) instance[property] = toCFrame(value);
        }
        for (const property of ['Part0', 'Part1']) {
            const value = getProperty(source, property);
            if (value) instance[property] = importedInstances.get(value) || null;
        }
        const enabled = getProperty(source, 'Enabled');
        if (enabled !== undefined) instance.Enabled = enabled;
    }

    if (className === 'KeyframeSequence') {
        const loop = getProperty(source, 'Loop');
        if (loop !== undefined) instance.Loop = loop;
        const priority = enumName(getProperty(source, 'Priority'));
        if (priority) instance.Priority = priority;
    }

    if (className === 'Keyframe') {
        const time = getProperty(source, 'Time');
        if (time !== undefined) instance.Time = time;
        const cframe = getProperty(source, 'CFrame');
        if (cframe) instance.CFrame = toCFrame(cframe);
    }

    if (className === 'Pose') {
        const cframe = getProperty(source, 'CFrame');
        if (cframe) instance.CFrame = toCFrame(cframe);
        const weight = getProperty(source, 'Weight');
        if (weight !== undefined) instance.Weight = weight;
    }

    if (className === 'Model') {
        const primaryPart = getProperty(source, 'PrimaryPart');
        if (primaryPart) instance.PrimaryPart = importedInstances.get(primaryPart) || null;
    }
}

export function parseRbxm(buffer) {
    const bytes = buffer instanceof ArrayBuffer
        ? new Uint8Array(buffer)
        : (ArrayBuffer.isView(buffer)
            ? new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
            : buffer);
    const file = RobloxFile.ReadFromBuffer(bytes);
    if (!file) throw new Error('Invalid or unsupported RBXM file');

    const sourceInstances = [];
    const importedInstances = new Map();
    const buildTree = (source, parent = null) => {
        const instance = createInstance(source);
        importedInstances.set(source, instance);
        sourceInstances.push(source);
        if (parent) instance.Parent = parent;
        for (const child of source._children) buildTree(child, instance);
        return instance;
    };

    const roots = Array.from(file.Roots, root => buildTree(root));
    for (const source of sourceInstances) {
        applyProperties(source, importedInstances.get(source), importedInstances);
    }

    return { roots, instanceCount: sourceInstances.length };
}