import { RobloxFile } from '../vendor/rbxm-parser.js';
import { Instance } from '../engine/Instance.js';
import { Vector3, Color3, CFrame } from '../engine/Math3D.js';
import { DataModel } from '../engine/DataModel.js';

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
    }

    if (className === 'Script' || className === 'LocalScript' || className === 'ModuleScript') {
        const sourceCode = getProperty(source, 'Source');
        if (typeof sourceCode === 'string') instance.Source = sourceCode;
        if (className !== 'ModuleScript') {
            const disabled = getProperty(source, 'Disabled');
            const enabled = getProperty(source, 'Enabled');
            if (disabled !== undefined) instance.Enabled = !disabled;
            else if (enabled !== undefined) instance.Enabled = Boolean(enabled);
        }
    }

    if (className === 'Lighting') {
        const ambient = getProperty(source, 'Ambient');
        if (ambient) instance.Ambient = new Color3(ambient.R, ambient.G, ambient.B);
        const outdoorAmbient = getProperty(source, 'OutdoorAmbient');
        if (outdoorAmbient) instance.OutdoorAmbient = new Color3(outdoorAmbient.R, outdoorAmbient.G, outdoorAmbient.B);
        const brightness = getProperty(source, 'Brightness');
        if (brightness !== undefined) instance.Brightness = brightness;
        const clockTime = getProperty(source, 'ClockTime');
        if (clockTime !== undefined) instance.ClockTime = clockTime;
        else {
            const timeOfDay = getProperty(source, 'TimeOfDay');
            if (typeof timeOfDay === 'string') {
                const parts = timeOfDay.split(':').map(Number);
                if (parts.length >= 2) instance.ClockTime = parts[0] + parts[1] / 60 + (parts[2] || 0) / 3600;
            }
        }
        const fogColor = getProperty(source, 'FogColor');
        if (fogColor) instance.FogColor = new Color3(fogColor.R, fogColor.G, fogColor.B);
        const fogStart = getProperty(source, 'FogStart');
        if (fogStart !== undefined) instance.FogStart = fogStart;
        const fogEnd = getProperty(source, 'FogEnd');
        if (fogEnd !== undefined) instance.FogEnd = fogEnd;
    }

    if (className === 'Camera') {
        const cframe = getProperty(source, 'CFrame');
        if (cframe) instance.CFrame = toCFrame(cframe);
        const fov = getProperty(source, 'FieldOfView');
        if (fov !== undefined && instance.FieldOfView !== undefined) instance.FieldOfView = fov;
    }

    if (className === 'SpawnLocation') {
        const enabled = getProperty(source, 'Enabled');
        if (enabled !== undefined) instance.Enabled = enabled;
        const duration = getProperty(source, 'Duration');
        if (duration !== undefined) instance.Duration = duration;
        const neutral = getProperty(source, 'Neutral');
        if (neutral !== undefined) instance.Neutral = neutral;
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

    if (className === 'CharacterMesh') {
        const meshId = getProperty(source, 'MeshId');
        if (meshId !== undefined) instance.MeshId = String(meshId);
        const bodyPart = enumName(getProperty(source, 'BodyPart')) || getProperty(source, 'BodyPart');
        if (bodyPart !== undefined) instance.BodyPart = bodyPart;
        const baseTex = getProperty(source, 'BaseTextureId');
        if (baseTex !== undefined) instance.BaseTextureId = String(baseTex);
        const overTex = getProperty(source, 'OverlayTextureId');
        if (overTex !== undefined) instance.OverlayTextureId = String(overTex);
    }

    if (className === 'Shirt') {
        const template = getProperty(source, 'ShirtTemplate');
        if (template !== undefined) instance.ShirtTemplate = String(template);
        const color = getProperty(source, 'Color3');
        if (color) instance.Color3 = new Color3(color.R, color.G, color.B);
    }

    if (className === 'Pants') {
        const template = getProperty(source, 'PantsTemplate');
        if (template !== undefined) instance.PantsTemplate = String(template);
        const color = getProperty(source, 'Color3');
        if (color) instance.Color3 = new Color3(color.R, color.G, color.B);
    }

    if (className === 'Humanoid') {
        for (const property of ['Health', 'MaxHealth', 'WalkSpeed', 'JumpPower']) {
            const value = getProperty(source, property);
            if (value !== undefined) instance[property] = value;
        }
    }

    if (className === 'Accessory' || className === 'Accoutrement') {
        const attPoint = getProperty(source, 'AttachmentPoint');
        if (attPoint) instance.AttachmentPoint = toCFrame(attPoint);
        const accType = enumName(getProperty(source, 'AccessoryType'));
        if (accType) instance.AccessoryType = accType;
    }

    if (className === 'Motor6D' || className === 'Weld' || className === 'ManualWeld') {
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

    if (className === 'WeldConstraint') {
        for (const property of ['Part0', 'Part1']) {
            const value = getProperty(source, property);
            if (value) instance[property] = importedInstances.get(value) || null;
        }
        const enabled = getProperty(source, 'Enabled');
        if (enabled !== undefined) instance.Enabled = enabled;
    }

    if (className === 'Sound') {
        const soundId = getProperty(source, 'SoundId');
        if (soundId) instance.SoundId = soundId;
        const volume = getProperty(source, 'Volume');
        if (volume !== undefined) instance.Volume = volume;
        const playbackSpeed = getProperty(source, 'PlaybackSpeed') ?? getProperty(source, 'Pitch');
        if (playbackSpeed !== undefined) instance.PlaybackSpeed = playbackSpeed;
        const looped = getProperty(source, 'Looped');
        if (looped !== undefined) instance.Looped = looped;
    }

    if (className === 'Animation') {
        const animId = getProperty(source, 'AnimationId');
        if (animId) instance.AnimationId = animId;
    }

    if (instance.IsA && instance.IsA('ValueBase')) {
        const val = getProperty(source, 'Value');
        if (val !== undefined) instance.Value = val;
    }

    if (className === 'Attachment') {
        const cframe = getProperty(source, 'CFrame');
        if (cframe) instance.CFrame = toCFrame(cframe);
        const visible = getProperty(source, 'Visible');
        if (visible !== undefined) instance.Visible = visible;
    }

    if (className === 'MeshPart') {
        const meshId = getProperty(source, 'MeshId');
        if (meshId) instance.MeshId = meshId;
        const textureID = getProperty(source, 'TextureID');
        if (textureID) instance.TextureID = textureID;
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

export function parseRbxl(buffer) {
    const bytes = buffer instanceof ArrayBuffer
        ? new Uint8Array(buffer)
        : (ArrayBuffer.isView(buffer)
            ? new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
            : buffer);
    const file = RobloxFile.ReadFromBuffer(bytes);
    if (!file) throw new Error('Invalid or unsupported RBXL file');

    const dataModel = new DataModel();
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

    // Integrate roots into the DataModel services
    for (const root of roots) {
        const name = root.Name;
        const className = root.ClassName;
        const existingService = dataModel.GetService(name) || dataModel.GetService(className);

        if (existingService) {
            // Transfer properties
            if (className === 'Lighting') {
                for (const prop of ['Ambient', 'OutdoorAmbient', 'Brightness', 'ClockTime', 'FogColor', 'FogStart', 'FogEnd']) {
                    if (root[prop] !== undefined) existingService[prop] = root[prop];
                }
            } else if (className === 'Workspace') {
                if (root.Gravity !== undefined) existingService.Gravity = root.Gravity;
            }

            // Transfer children
            const children = root.GetChildren();
            for (const child of children) {
                if (existingService.ClassName === 'Workspace') {
                    if (child.ClassName === 'Camera') {
                        if (existingService.CurrentCamera) {
                            existingService.CurrentCamera.CFrame = child.CFrame;
                        } else {
                            child.Parent = existingService;
                            existingService.CurrentCamera = child;
                        }
                        continue;
                    }
                    if (child.ClassName === 'Terrain') {
                        const existingTerrain = existingService.Terrain;
                        if (existingTerrain) {
                            for (const tChild of child.GetChildren()) tChild.Parent = existingTerrain;
                        } else {
                            child.Parent = existingService;
                        }
                        continue;
                    }
                }

                if (existingService.ClassName === 'StarterPlayer') {
                    if (child.Name === 'StarterPlayerScripts' || child.ClassName === 'StarterPlayerScripts') {
                        for (const sc of child.GetChildren()) sc.Parent = existingService.StarterPlayerScripts;
                        continue;
                    }
                    if (child.Name === 'StarterCharacterScripts' || child.ClassName === 'StarterCharacterScripts') {
                        for (const sc of child.GetChildren()) sc.Parent = existingService.StarterCharacterScripts;
                        continue;
                    }
                }

                child.Parent = existingService;
            }
        } else {
            // Custom or non-default services / top-level containers
            root.Parent = dataModel;
            dataModel.services.set(name, root);
        }
    }

    return { dataModel, instanceCount: sourceInstances.length };
}
