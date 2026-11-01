/**
 * Conblox Standard Instances
 * Model, Folder, Script, PointLight, SpotLight, Humanoid
 */

import { Instance } from './Instance.js';
import { Vector3, Color3, CFrame, nearestEulerYXZ } from './Math3D.js';
import { Signal } from './Signal.js';

export class Folder extends Instance {
    constructor() {
        super('Folder');
    }
}

export class Tool extends Instance {
    constructor() {
        super('Tool');
        this.requiresHandle = true;
        this._grip = null;
    }

    get RequiresHandle() { return this.requiresHandle; }
    set RequiresHandle(value) {
        this.requiresHandle = Boolean(value);
        this.Changed.Fire('RequiresHandle', this.requiresHandle);
    }

    get Handle() {
        const handle = this.FindFirstChild('Handle');
        return handle && handle.IsA('BasePart') ? handle : null;
    }

    get CanBeEquipped() {
        return !this.RequiresHandle || Boolean(this.Handle);
    }

    Equip(character) {
        const handle = this.Handle;
        if (!character || (this.RequiresHandle && !handle)) return false;
        const arm = character.FindFirstChild('Right Arm') || character.FindFirstChild('RightHand');
        if (!arm) return false;

        this.Unequip();
        if (!handle) return true;
        const grip = new Motor6D();
        grip.Name = 'RightGrip';
        grip.Part0 = arm;
        grip.Part1 = handle;
        grip.C0 = new CFrame(new Vector3(0, -0.75, -0.3));
        grip.Parent = arm;
        this._grip = {
            arm,
            handle,
            joint: grip,
            anchored: handle.Anchored,
            canCollide: handle.CanCollide
        };
        handle.Anchored = true;
        handle.CanCollide = false;
        this.updateGrip();
        return true;
    }

    updateGrip() {
        if (!this._grip) return;
        const { arm, handle, joint } = this._grip;
        if (!arm.Parent || !handle.Parent || !joint.Parent) {
            this.Unequip();
            return;
        }
        handle.Position = arm.CFrame.PointToWorldSpace(joint.C0.Position);
        handle.Orientation = arm.Orientation;
    }

    Unequip() {
        if (!this._grip) return;
        this._grip.joint.Destroy();
        this._grip.handle.Anchored = this._grip.anchored;
        this._grip.handle.CanCollide = this._grip.canCollide;
        this._grip = null;
    }

    serializeProperties() {
        return { requiresHandle: this.requiresHandle };
    }

    deserializeProperties(props) {
        if (props.requiresHandle !== undefined) this.requiresHandle = Boolean(props.requiresHandle);
    }
}

export class SpecialMesh extends Instance {
    constructor() {
        super('SpecialMesh');
        this.meshType = 'Head';
        this.scale = Vector3.one;
        this.offset = Vector3.zero;
        this.meshId = '';
        this.textureId = '';
        this.vertexColor = Vector3.one;
        this.meshData = null;
    }

    get MeshType() { return this.meshType; }
    set MeshType(value) {
        this.meshType = String(value || 'Brick');
        this.Changed.Fire('MeshType', this.meshType);
    }

    get Scale() { return this.scale; }
    set Scale(value) {
        this.scale = value instanceof Vector3 ? value : Vector3.fromJSON(value);
        this.Changed.Fire('Scale', this.scale);
    }

    get Offset() { return this.offset; }
    set Offset(value) {
        this.offset = value instanceof Vector3 ? value : Vector3.fromJSON(value);
        this.Changed.Fire('Offset', this.offset);
    }

    get MeshId() { return this.meshId; }
    set MeshId(value) {
        this.meshId = String(value || '');
        this.Changed.Fire('MeshId', this.meshId);
    }

    get TextureId() { return this.textureId; }
    set TextureId(value) {
        this.textureId = String(value || '');
        this.Changed.Fire('TextureId', this.textureId);
    }

    get VertexColor() { return this.vertexColor; }
    set VertexColor(value) {
        this.vertexColor = value instanceof Vector3 ? value : Vector3.fromJSON(value);
        this.Changed.Fire('VertexColor', this.vertexColor);
    }

    get MeshData() { return this.meshData; }
    set MeshData(value) {
        this.meshData = value;
        this.Changed.Fire('MeshData', this.meshData);
    }

    serializeProperties() {
        return {
            meshType: this.meshType,
            scale: this.scale.toJSON(),
            offset: this.offset.toJSON(),
            meshId: this.meshId,
            textureId: this.textureId,
            vertexColor: this.vertexColor.toJSON(),
            meshData: this.meshData
        };
    }

    deserializeProperties(props) {
        if (props.meshType !== undefined) this.meshType = props.meshType;
        if (props.scale) this.scale = Vector3.fromJSON(props.scale);
        if (props.offset) this.offset = Vector3.fromJSON(props.offset);
        if (props.meshId !== undefined) this.meshId = props.meshId;
        if (props.textureId !== undefined) this.textureId = props.textureId;
        if (props.vertexColor) this.vertexColor = Vector3.fromJSON(props.vertexColor);
        if (props.meshData !== undefined) this.meshData = props.meshData;
    }
}

export class CharacterMesh extends Instance {
    constructor() {
        super('CharacterMesh');
        this.meshId = '';
        this.bodyPart = 1; // 1 = Torso, 2 = LeftArm, 3 = RightArm, 4 = LeftLeg, 5 = RightLeg
        this.baseTextureId = '';
        this.overlayTextureId = '';
        this.meshData = null;
    }

    get MeshId() { return this.meshId; }
    set MeshId(val) {
        this.meshId = String(val ?? '');
        this.Changed.Fire('MeshId', this.meshId);
    }

    get BodyPart() { return this.bodyPart; }
    set BodyPart(val) {
        if (typeof val === 'string') {
            const map = {
                'head': 0, 'torso': 1,
                'leftarm': 2, 'left arm': 2,
                'rightarm': 3, 'right arm': 3,
                'leftleg': 4, 'left leg': 4,
                'rightleg': 5, 'right leg': 5
            };
            const mapped = map[val.toLowerCase().replace(/_/g, '')];
            this.bodyPart = mapped !== undefined ? mapped : 1;
        } else {
            this.bodyPart = Number(val) || 1;
        }
        this.Changed.Fire('BodyPart', this.bodyPart);
    }

    get BaseTextureId() { return this.baseTextureId; }
    set BaseTextureId(val) {
        this.baseTextureId = String(val ?? '');
        this.Changed.Fire('BaseTextureId', this.baseTextureId);
    }

    get OverlayTextureId() { return this.overlayTextureId; }
    set OverlayTextureId(val) {
        this.overlayTextureId = String(val ?? '');
        this.Changed.Fire('OverlayTextureId', this.overlayTextureId);
    }

    get MeshData() { return this.meshData; }
    set MeshData(val) {
        this.meshData = val;
        this.Changed.Fire('MeshData', this.meshData);
    }

    getTargetPartName() {
        switch (Number(this.bodyPart)) {
            case 1: return 'Torso';
            case 2: return 'Left Arm';
            case 3: return 'Right Arm';
            case 4: return 'Left Leg';
            case 5: return 'Right Leg';
            default: return 'Torso';
        }
    }

    serializeProperties() {
        return {
            meshId: this.meshId,
            bodyPart: this.bodyPart,
            baseTextureId: this.baseTextureId,
            overlayTextureId: this.overlayTextureId,
            meshData: this.meshData
        };
    }

    deserializeProperties(props) {
        if (!props) return;
        if (props.meshId !== undefined) this.meshId = props.meshId;
        if (props.bodyPart !== undefined) this.BodyPart = props.bodyPart;
        if (props.baseTextureId !== undefined) this.baseTextureId = props.baseTextureId;
        if (props.overlayTextureId !== undefined) this.overlayTextureId = props.overlayTextureId;
        if (props.meshData !== undefined) this.meshData = props.meshData;
    }
}

export class Clothing extends Instance {
    constructor(className = 'Clothing') {
        super(className);
        this.color3 = Color3.fromRGB(255, 255, 255);
    }

    get Color3() { return this.color3; }
    set Color3(v) {
        this.color3 = v instanceof Color3 ? v : Color3.fromRGB(255, 255, 255);
        this.Changed.Fire('Color3', this.color3);
    }
}

export class Shirt extends Clothing {
    constructor() {
        super('Shirt');
        this.shirtTemplate = '';
    }

    get ShirtTemplate() { return this.shirtTemplate; }
    set ShirtTemplate(val) {
        this.shirtTemplate = String(val ?? '');
        this.Changed.Fire('ShirtTemplate', this.shirtTemplate);
    }

    serializeProperties() {
        return {
            shirtTemplate: this.shirtTemplate,
            color3: this.color3.toJSON()
        };
    }

    deserializeProperties(props) {
        if (!props) return;
        if (props.shirtTemplate !== undefined) this.shirtTemplate = props.shirtTemplate;
        if (props.color3) this.color3 = Color3.fromJSON(props.color3);
    }
}

export class Pants extends Clothing {
    constructor() {
        super('Pants');
        this.pantsTemplate = '';
    }

    get PantsTemplate() { return this.pantsTemplate; }
    set PantsTemplate(val) {
        this.pantsTemplate = String(val ?? '');
        this.Changed.Fire('PantsTemplate', this.pantsTemplate);
    }

    serializeProperties() {
        return {
            pantsTemplate: this.pantsTemplate,
            color3: this.color3.toJSON()
        };
    }

    deserializeProperties(props) {
        if (!props) return;
        if (props.pantsTemplate !== undefined) this.pantsTemplate = props.pantsTemplate;
        if (props.color3) this.color3 = Color3.fromJSON(props.color3);
    }
}

export class Accessory extends Instance {
    constructor() {
        super('Accessory');
        this.accessoryType = 'Unknown';
        this.attachmentPoint = new CFrame();
    }

    get AccessoryType() { return this.accessoryType; }
    set AccessoryType(v) {
        this.accessoryType = String(v || 'Unknown');
        this.Changed.Fire('AccessoryType', this.accessoryType);
    }

    get AttachmentPoint() { return this.attachmentPoint; }
    set AttachmentPoint(v) {
        this.attachmentPoint = v instanceof CFrame ? v : (v ? CFrame.fromJSON(v) : new CFrame());
        this.Changed.Fire('AttachmentPoint', this.attachmentPoint);
    }

    get Handle() {
        return this.FindFirstChild ? this.FindFirstChild('Handle') : null;
    }

    serializeProperties() {
        return {
            ...super.serializeProperties(),
            accessoryType: this.accessoryType,
            attachmentPoint: this.attachmentPoint ? this.attachmentPoint.toJSON() : null
        };
    }

    deserializeProperties(props) {
        super.deserializeProperties(props);
        if (props.accessoryType !== undefined) this.accessoryType = String(props.accessoryType);
        if (props.attachmentPoint) this.attachmentPoint = CFrame.fromJSON(props.attachmentPoint);
    }
}

export class Model extends Instance {
    constructor() {
        super('Model');
        this.primaryPart = null;
    }

    get PrimaryPart() {
        return this.primaryPart;
    }

    set PrimaryPart(part) {
        this.primaryPart = part;
        this.Changed.Fire('PrimaryPart', part);
    }

    GetScale() {
        return 1.0;
    }

    ScaleTo(scale) {
        return 1.0;
    }

    MoveTo(targetPosition) {
        const parts = this.GetDescendants().filter(i => i.IsA('BasePart'));
        if (parts.length === 0) return;

        let center = new Vector3();
        if (this.primaryPart) {
            center = this.primaryPart.Position;
        } else {
            for (const p of parts) center = center.add(p.Position);
            center = center.div(parts.length);
        }

        const delta = targetPosition.sub(center);
        for (const p of parts) {
            p.Position = p.Position.add(delta);
        }
    }

    serializeProperties() {
        return {
            primaryPartId: this.primaryPart ? this.primaryPart.id : null,
            primaryPartName: this.primaryPart ? this.primaryPart.Name : null
        };
    }

    deserializeProperties(props) {
        if (!props) return;
        setTimeout(() => {
            if (props.primaryPartId) {
                this.primaryPart = this.GetDescendants().find(i => i.id === props.primaryPartId) || null;
            }
            if (!this.primaryPart && props.primaryPartName) {
                this.primaryPart = this.FindFirstChild(props.primaryPartName, true) || null;
            }
        }, 0);
    }
}

export class Script extends Instance {
    constructor() {
        super('Script');
        this.source = 'print("Hello world!")\n';
        this.enabled = true;
    }

    get Source() { return this.source; }
    set Source(val) {
        this.source = String(val);
        this.Changed.Fire('Source', this.source);
    }

    get Enabled() { return this.enabled; }
    set Enabled(val) {
        this.enabled = Boolean(val);
        this.Changed.Fire('Enabled', this.enabled);
    }

    serializeProperties() {
        return {
            source: this.source,
            enabled: this.enabled
        };
    }

    deserializeProperties(props) {
        if (props.source !== undefined) this.source = props.source;
        if (props.enabled !== undefined) this.enabled = props.enabled;
    }
}

export class LocalScript extends Script {
    constructor() {
        super();
        this.className = 'LocalScript';
        this._name = 'LocalScript';
        this.source = 'print("Hello world!")\n';
        this.enabled = true;
    }
}

export class ModuleScript extends Instance {
    constructor() {
        super('ModuleScript');
        this.source = 'local module = {}\n\nreturn module\n';
    }

    get Source() { return this.source; }
    set Source(val) {
        this.source = String(val);
        this.Changed.Fire('Source', this.source);
    }

    serializeProperties() {
        return {
            source: this.source
        };
    }

    deserializeProperties(props) {
        if (props.source !== undefined) this.source = props.source;
    }
}

class LightBase extends Instance {
    constructor(className) {
        super(className);
        this.color = Color3.fromRGB(255, 255, 255);
        this.brightness = 1;
        this.range = 16;
        this.shadows = false;
        this.enabled = true;
    }

    get Color() { return this.color; }
    set Color(val) {
        this.color = val instanceof Color3 ? val : Color3.fromJSON(val);
        this.Changed.Fire('Color', this.color);
    }

    get Brightness() { return this.brightness; }
    set Brightness(val) {
        this.brightness = Number(val) || 0;
        this.Changed.Fire('Brightness', this.brightness);
    }

    get Range() { return this.range; }
    set Range(val) {
        this.range = Math.max(0.1, Number(val) || 16);
        this.Changed.Fire('Range', this.range);
    }

    get Shadows() { return this.shadows; }
    set Shadows(val) {
        this.shadows = Boolean(val);
        this.Changed.Fire('Shadows', this.shadows);
    }

    get Enabled() { return this.enabled; }
    set Enabled(val) {
        this.enabled = Boolean(val);
        this.Changed.Fire('Enabled', this.enabled);
    }

    serializeProperties() {
        return {
            color: this.color.toJSON(),
            brightness: this.brightness,
            range: this.range,
            shadows: this.shadows,
            enabled: this.enabled
        };
    }

    deserializeProperties(props) {
        if (props.color) this.color = Color3.fromJSON(props.color);
        if (props.brightness !== undefined) this.brightness = props.brightness;
        if (props.range !== undefined) this.range = props.range;
        if (props.shadows !== undefined) this.shadows = props.shadows;
        if (props.enabled !== undefined) this.enabled = props.enabled;
    }
}

export class PointLight extends LightBase {
    constructor() {
        super('PointLight');
    }
}

class FaceLight extends LightBase {
    constructor(className, angle) {
        super(className);
        this.face = 'Front';
        this.angle = angle;
    }

    get Face() { return this.face; }
    set Face(value) {
        this.face = String(value || 'Front');
        this.Changed.Fire('Face', this.face);
    }

    get Angle() { return this.angle; }
    set Angle(value) {
        const angle = Number(value);
        this.angle = Number.isFinite(angle) ? Math.max(0, Math.min(180, angle)) : 45;
        this.Changed.Fire('Angle', this.angle);
    }

    serializeProperties() {
        return { ...super.serializeProperties(), face: this.face, angle: this.angle };
    }

    deserializeProperties(props) {
        super.deserializeProperties(props);
        if (props.face !== undefined) this.face = String(props.face);
        if (props.angle !== undefined) this.Angle = props.angle;
    }
}

export class SpotLight extends FaceLight {
    constructor() {
        super('SpotLight', 45);
    }
}

export class SurfaceLight extends FaceLight {
    constructor() {
        super('SurfaceLight', 90);
    }
}

export class Humanoid extends Instance {
    constructor() {
        super('Humanoid');
        this.health = 100;
        this.maxHealth = 100;
        this.walkSpeed = 16; // studs per second
        this.jumpPower = 50;
        this.hipHeight = 0;
        this.automaticScalingEnabled = true;
        this.Died = new Signal();
        this.HealthChanged = new Signal();
        this.Running = new Signal();
        this.Jumping = new Signal();
        this.Climbing = new Signal();
        this.FreeFalling = new Signal();
        this.FallingDown = new Signal();
        this.GettingUp = new Signal();
        this.Seated = new Signal();
        this.PlatformStanding = new Signal();
        this.Swimming = new Signal();
        this._activeAnimationTracks = new Set();
        const animator = new Animator();
        animator.Parent = this;
    }

    GetPlayingAnimationTracks() {
        return this._activeAnimationTracks ? Array.from(this._activeAnimationTracks) : [];
    }

    AddAccessory(accessory) {
        if (!accessory) return;
        const char = this.Parent;
        if (char) {
            accessory.Parent = char;
            Humanoid.attachAccessoryToCharacter(char, accessory);
        }
    }

    static attachAccessoryToCharacter(char, accessory) {
        if (!char || !accessory) return;
        const handle = accessory.FindFirstChild ? accessory.FindFirstChild('Handle') : null;
        if (!handle || !handle.IsA || !handle.IsA('BasePart')) return;

        handle.CanCollide = false;
        handle.Massless = true;

        let weld = handle.FindFirstChild ? handle.FindFirstChild('AccessoryWeld') : null;
        if (!weld) {
            const descWelds = accessory.GetDescendants ? accessory.GetDescendants().filter(x => (x.ClassName === 'Weld' || x.ClassName === 'ManualWeld') && (x.Name === 'AccessoryWeld' || x.Part0 === handle)) : [];
            if (descWelds.length > 0) weld = descWelds[0];
        }

        if (!weld) {
            weld = new Weld();
            weld.Name = 'AccessoryWeld';
            weld.Parent = handle;
        }

        weld.Part0 = handle;

        const handleAtt = handle.FindFirstChildOfClass ? handle.FindFirstChildOfClass('Attachment') : null;
        let matchedPart = null;
        let matchedAtt = null;

        if (handleAtt) {
            const parts = char.GetDescendants().filter(x => x.IsA && x.IsA('BasePart') && x !== handle);
            for (const p of parts) {
                const att = p.FindFirstChild ? p.FindFirstChild(handleAtt.Name) : null;
                if (att && att.IsA && att.IsA('Attachment')) {
                    matchedPart = p;
                    matchedAtt = att;
                    break;
                }
            }
        }

        if (matchedPart && matchedAtt) {
            weld.Part1 = matchedPart;
            if (!weld.C0 || (weld.C0.position.magnitude === 0 && weld.C0.orientation.magnitude === 0)) {
                weld.C0 = handleAtt.CFrame ? handleAtt.CFrame.clone() : new CFrame();
            }
            if (!weld.C1 || (weld.C1.position.magnitude === 0 && weld.C1.orientation.magnitude === 0)) {
                weld.C1 = matchedAtt.CFrame ? matchedAtt.CFrame.clone() : new CFrame();
            }
        } else if (!weld.Part1 || !char.IsAncestorOf(weld.Part1)) {
            const defaultTarget = char.FindFirstChild('Head') || char.FindFirstChild('Torso');
            if (defaultTarget) {
                weld.Part1 = defaultTarget;
                if (!weld.C0) weld.C0 = accessory.AttachmentPoint ? accessory.AttachmentPoint.clone() : new CFrame();
                if (!weld.C1) weld.C1 = new CFrame(0, 0.5, 0);
            }
        }
        weld.Enabled = true;
    }

    LoadAnimation(animation) {
        if (!this._activeAnimationTracks) this._activeAnimationTracks = new Set();
        if (animation instanceof AnimationTrack) return animation;

        if (animation && animation.ClassName === 'KeyframeSequence') {
            return new AnimationTrack(this, animation, animation.Name);
        }

        let animId = '';
        if (animation && animation.AnimationId) animId = animation.AnimationId;
        else if (typeof animation === 'string') animId = animation;

        const match = String(animId).match(/\d{4,20}/);
        const numericId = match ? match[0] : null;

        const track = new AnimationTrack(this, null, (animation && animation.Name) || numericId || 'Animation');
        if (numericId && AnimationTrack._cachedSequences && AnimationTrack._cachedSequences.has(numericId)) {
            track.setSequence(AnimationTrack._cachedSequences.get(numericId));
            return track;
        }

        if (numericId) {
            const loadBuffer = async () => {
                let resp = await fetch(`/content/animations/${numericId}.json`);
                if (resp.ok) return await resp.arrayBuffer();
                resp = await fetch(`/content/animations/${numericId}.rbxm`);
                if (resp.ok) return await resp.arrayBuffer();
                resp = await fetch(`/api/roblox-animation?id=${numericId}`);
                if (resp.ok) return await resp.arrayBuffer();
                return null;
            };

            loadBuffer().then(async buf => {
                if (!buf) return;
                const uint8 = new Uint8Array(buf);
                let seq = null;
                if (uint8[0] === 123) { // JSON '{'
                    try {
                        const json = JSON.parse(new TextDecoder().decode(buf));
                        const seqData = json.serialized || json;
                        seq = Instance.deserialize(seqData);
                    } catch (e) {
                        console.warn('Could not parse animation JSON', numericId, e);
                    }
                } else {
                    try {
                        const { parseRbxm } = await import('../studio/RbxmImporter.js');
                        const parsed = parseRbxm(uint8);
                        seq = parsed.roots.find(r => r.ClassName === 'KeyframeSequence') || parsed.roots[0];
                    } catch (e) {
                        console.warn('Could not parse animation binary RBXM', numericId, e);
                    }
                }
                if (seq) {
                    if (AnimationTrack._cachedSequences) {
                        AnimationTrack._cachedSequences.set(numericId, seq);
                    }
                    track.setSequence(seq);
                }
            }).catch(err => console.warn('Could not load animation asset', numericId, err));
        }

        return track;
    }

    get HipHeight() { return this.hipHeight; }
    set HipHeight(val) {
        this.hipHeight = (val !== undefined && !isNaN(Number(val))) ? Number(val) : 0;
        this.Changed.Fire('HipHeight', this.hipHeight);
    }

    get AutomaticScalingEnabled() { return this.automaticScalingEnabled; }
    set AutomaticScalingEnabled(val) {
        this.automaticScalingEnabled = Boolean(val);
        this.Changed.Fire('AutomaticScalingEnabled', this.automaticScalingEnabled);
    }

    get Health() { return this.health; }
    set Health(val) {
        const old = this.health;
        this.health = Math.max(0, Math.min(this.maxHealth, Number(val) || 0));
        this.HealthChanged.Fire(this.health, old);
        this.Changed.Fire('Health', this.health);
        if (this.health <= 0 && old > 0) {
            this.Died.Fire();
        }
    }

    get MaxHealth() { return this.maxHealth; }
    set MaxHealth(val) {
        this.maxHealth = Math.max(1, Number(val) || 100);
        this.Changed.Fire('MaxHealth', this.maxHealth);
    }

    get WalkSpeed() { return this.walkSpeed; }
    set WalkSpeed(val) {
        this.walkSpeed = (val !== undefined && !isNaN(Number(val))) ? Math.max(0, Number(val)) : 16;
        this.Changed.Fire('WalkSpeed', this.walkSpeed);
    }

    get JumpPower() { return this.jumpPower; }
    set JumpPower(val) {
        this.jumpPower = (val !== undefined && !isNaN(Number(val))) ? Math.max(0, Number(val)) : 50;
        this.Changed.Fire('JumpPower', this.jumpPower);
    }

    TakeDamage(amount) {
        this.Health = this.Health - amount;
    }

    serializeProperties() {
        return {
            health: this.health,
            maxHealth: this.maxHealth,
            walkSpeed: this.walkSpeed,
            jumpPower: this.jumpPower,
            hipHeight: this.hipHeight,
            automaticScalingEnabled: this.automaticScalingEnabled
        };
    }

    deserializeProperties(props) {
        if (props.health !== undefined) this.health = props.health;
        if (props.maxHealth !== undefined) this.maxHealth = props.maxHealth;
        if (props.walkSpeed !== undefined) this.walkSpeed = props.walkSpeed;
        if (props.jumpPower !== undefined) this.jumpPower = props.jumpPower;
        if (props.hipHeight !== undefined) this.hipHeight = Number(props.hipHeight) || 0;
        if (props.automaticScalingEnabled !== undefined) this.automaticScalingEnabled = Boolean(props.automaticScalingEnabled);
    }
}

export class AnimationTrack {
    static _cachedSequences = new Map();

    static async preloadStandardAnimations() {
        if (!AnimationTrack._cachedSequences) AnimationTrack._cachedSequences = new Map();
        const ids = ['180435571', '180426354', '125750702', '180436148', '180436334', '178130996', '182393478', '180435792'];
        for (const id of ids) {
            if (AnimationTrack._cachedSequences.has(id)) continue;
            try {
                let resp = await fetch(`/content/animations/${id}.json`);
                let buf = resp.ok ? await resp.arrayBuffer() : null;
                if (!buf) {
                    resp = await fetch(`/content/animations/${id}.rbxm`);
                    if (resp.ok) buf = await resp.arrayBuffer();
                }
                if (!buf) continue;
                const uint8 = new Uint8Array(buf);
                let seq = null;
                if (uint8[0] === 123) {
                    const json = JSON.parse(new TextDecoder().decode(buf));
                    seq = Instance.deserialize(json.serialized || json);
                } else {
                    const { parseRbxm } = await import('../studio/RbxmImporter.js');
                    const parsed = parseRbxm(uint8);
                    seq = parsed.roots.find(r => r.ClassName === 'KeyframeSequence') || parsed.roots[0];
                }
                if (seq) {
                    AnimationTrack._cachedSequences.set(id, seq);
                }
            } catch (e) {
                // Ignore background preload error
            }
        }
    }

    constructor(humanoid, sequence = null, name = 'Animation') {
        this.humanoid = humanoid;
        this.sequence = sequence;
        this.name = name || (sequence ? sequence.Name : 'Animation');
        this.isPlaying = false;
        this.isStopping = false;
        this.timePosition = 0;
        this.speed = 1.0;
        this.weight = 1.0;
        this.fadeDuration = 0;
        this.fadeElapsed = 0;
        this.fadeStartWeight = 1.0;
        this.fadeTargetWeight = 1.0;
        this.priority = sequence ? sequence.Priority : 'Core';
        this.looped = sequence ? Boolean(sequence.Loop) : true;
        this.length = sequence ? sequence.Length : 1.0;

        this.KeyframeReached = new Signal();
        this.DidLoop = new Signal();
        this.Stopped = new Signal();

        this._samples = [];
        this._keyframes = [];
        if (sequence) {
            this.setSequence(sequence);
        }
    }

    setSequence(sequence) {
        this.sequence = sequence;
        if (!sequence) return;
        this.length = Math.max(0.1, sequence.Length || sequence.Duration || 1.0);
        this.looped = Boolean(sequence.Loop);
        this._samples = [];
        const kfs = (sequence.GetKeyframes ? sequence.GetKeyframes() : []).sort((a, b) => a.Time - b.Time);
        for (const kf of kfs) {
            const sample = { time: kf.Time, name: kf.Name, poses: new Map() };
            const poses = kf.GetDescendants ? kf.GetDescendants().filter(i => i.ClassName === 'Pose') : [];
            for (const pose of poses) {
                if (pose.CFrame) sample.poses.set(pose.Name, pose.CFrame);
            }
            this._samples.push(sample);
        }
        if (this._samples.length > 0) {
            this.length = Math.max(this.length, this._samples[this._samples.length - 1].time, 0.1);
        }
    }

    get IsPlaying() { return this.isPlaying; }
    get Length() { return this.length; }
    get Looped() { return this.looped; }
    set Looped(v) { this.looped = Boolean(v); }
    get Priority() { return this.priority; }
    set Priority(v) { this.priority = String(v); }
    get TimePosition() { return this.timePosition; }
    set TimePosition(v) { this.timePosition = Number(v) || 0; }
    get Speed() { return this.speed; }
    set Speed(v) { this.speed = Number(v) || 0; }
    get Weight() { return this.weight; }
    set Weight(v) { this.weight = Number(v) || 0; }

    Play(transitionTime = 0.1, weight = 1.0, speed = 1.0) {
        this.isPlaying = true;
        this.isStopping = false;
        this.timePosition = 0;
        this.speed = Number(speed) || 1.0;
        const targetW = Math.max(0, Number(weight) || 1.0);
        const trans = Number(transitionTime);
        if (trans > 0) {
            this.fadeDuration = trans;
            this.fadeElapsed = 0;
            this.fadeStartWeight = 0.0;
            this.fadeTargetWeight = targetW;
            this.weight = 0.0;
        } else {
            this.fadeDuration = 0;
            this.fadeStartWeight = targetW;
            this.fadeTargetWeight = targetW;
            this.weight = targetW;
        }
        if (this.humanoid && this.humanoid._activeAnimationTracks) {
            this.humanoid._activeAnimationTracks.add(this);
        }
    }

    Stop(transitionTime = 0.1) {
        if (!this.isPlaying || this.isStopping) return;
        const trans = Number(transitionTime);
        if (trans > 0 && this.weight > 0.001) {
            this.isStopping = true;
            this.fadeDuration = trans;
            this.fadeElapsed = 0;
            this.fadeStartWeight = this.weight;
            this.fadeTargetWeight = 0.0;
        } else {
            this._doStop();
        }
    }

    _doStop() {
        this.isPlaying = false;
        this.isStopping = false;
        this.weight = 0;
        this.fadeDuration = 0;
        if (this.humanoid && this.humanoid._activeAnimationTracks) {
            this.humanoid._activeAnimationTracks.delete(this);
        }
        this.Stopped.Fire();
    }

    AdjustSpeed(speed = 1.0) {
        this.speed = Number(speed) || 0;
    }

    AdjustWeight(weight = 1.0, transitionTime = 0.1) {
        const targetW = Math.max(0, Number(weight) || 0);
        const trans = Number(transitionTime);
        if (trans > 0) {
            this.fadeDuration = trans;
            this.fadeElapsed = 0;
            this.fadeStartWeight = this.weight;
            this.fadeTargetWeight = targetW;
        } else {
            this.fadeDuration = 0;
            this.weight = targetW;
            this.fadeTargetWeight = targetW;
        }
    }

    Destroy() {
        this._doStop();
    }

    step(dt) {
        if (!this.isPlaying) return;

        if (this.fadeDuration > 0) {
            this.fadeElapsed += dt;
            const progress = Math.min(1.0, this.fadeElapsed / this.fadeDuration);
            this.weight = this.fadeStartWeight + (this.fadeTargetWeight - this.fadeStartWeight) * progress;
            if (progress >= 1.0) {
                this.fadeDuration = 0;
                this.weight = this.fadeTargetWeight;
                if (this.isStopping && this.weight <= 0.001) {
                    this._doStop();
                    return;
                }
            }
        }

        if (!this._samples.length) return;
        const prevTime = this.timePosition;
        this.timePosition += dt * this.speed;

        for (const sample of this._samples) {
            if (sample.time > prevTime && sample.time <= this.timePosition) {
                if (sample.name) this.KeyframeReached.Fire(sample.name);
            }
        }

        if (this.timePosition >= this.length) {
            if (this.looped) {
                this.timePosition = this.timePosition % this.length;
                this.DidLoop.Fire();
            } else {
                this.Stop(0.1);
            }
        }
    }

    poseAt(trackName, time) {
        const keys = this._samples.filter(s => s.poses.has(trackName));
        if (!keys.length) return null;
        if (time <= keys[0].time) return keys[0].poses.get(trackName);
        if (time >= keys[keys.length - 1].time) return keys[keys.length - 1].poses.get(trackName);
        const nextIndex = keys.findIndex(s => s.time >= time);
        if (nextIndex <= 0) return keys[0].poses.get(trackName);
        const prev = keys[nextIndex - 1];
        const next = keys[nextIndex];
        const alpha = (time - prev.time) / Math.max(1e-6, next.time - prev.time);
        return this._interpolateCFrame(prev.poses.get(trackName), next.poses.get(trackName), alpha);
    }

    _interpolateCFrame(a, b, alpha) {
        if (!a) return b ? b.clone() : new CFrame();
        if (!b) return a ? a.clone() : new CFrame();
        const pos = a.position.lerp(b.position, alpha);
        if (typeof THREE !== 'undefined') {
            const qa = new THREE.Quaternion().setFromEuler(new THREE.Euler(
                (a.orientation.x * Math.PI) / 180,
                (a.orientation.y * Math.PI) / 180,
                (a.orientation.z * Math.PI) / 180,
                'YXZ'
            ));
            const qb = new THREE.Quaternion().setFromEuler(new THREE.Euler(
                (b.orientation.x * Math.PI) / 180,
                (b.orientation.y * Math.PI) / 180,
                (b.orientation.z * Math.PI) / 180,
                'YXZ'
            ));
            const q = qa.slerp(qb, alpha);
            const euler = new THREE.Euler().setFromQuaternion(q, 'YXZ');
            return new CFrame(pos, nearestEulerYXZ(euler, a.orientation));
        }
        return new CFrame(pos, a.orientation.lerp(b.orientation, alpha));
    }
}


export class BloomEffect extends Instance {
    constructor() {
        super('BloomEffect');
        this.enabled = true;
        this.intensity = 1.0;
        this.size = 24;
        this.threshold = 1.4;
    }

    get Enabled() { return this.enabled; }
    set Enabled(v) {
        this.enabled = Boolean(v);
        this.Changed.Fire('Enabled', this.enabled);
    }

    get Intensity() { return this.intensity; }
    set Intensity(v) {
        this.intensity = Math.max(0, Number(v) || 0);
        this.Changed.Fire('Intensity', this.intensity);
    }

    get Size() { return this.size; }
    set Size(v) {
        this.size = Math.max(0, Math.min(56, Number(v) || 0));
        this.Changed.Fire('Size', this.size);
    }

    get Threshold() { return this.threshold; }
    set Threshold(v) {
        this.threshold = Math.max(0, Number(v) || 0);
        this.Changed.Fire('Threshold', this.threshold);
    }

    serializeProperties() {
        return {
            enabled: this.enabled,
            intensity: this.intensity,
            size: this.size,
            threshold: this.threshold
        };
    }

    deserializeProperties(props) {
        if (props.enabled !== undefined) this.enabled = props.enabled;
        if (props.intensity !== undefined) this.intensity = props.intensity;
        if (props.size !== undefined) this.size = props.size;
        if (props.threshold !== undefined) this.threshold = props.threshold;
    }
}

export class Atmosphere extends Instance {
    constructor() {
        super('Atmosphere');
        this.density = 0.395;
        this.offset = 0.25;
        this.color = Color3.fromRGB(199, 212, 229);
        this.decay = Color3.fromRGB(106, 124, 147);
        this.glare = 0.4;
        this.haze = 1.0;
    }

    get Density() { return this.density; }
    set Density(v) {
        this.density = Math.max(0, Math.min(1, Number(v) || 0));
        this.Changed.Fire('Density', this.density);
    }

    get Offset() { return this.offset; }
    set Offset(v) {
        this.offset = Math.max(0, Math.min(1, Number(v) || 0));
        this.Changed.Fire('Offset', this.offset);
    }

    get Color() { return this.color; }
    set Color(v) {
        this.color = v instanceof Color3 ? v : Color3.fromJSON(v);
        this.Changed.Fire('Color', this.color);
    }

    get Decay() { return this.decay; }
    set Decay(v) {
        this.decay = v instanceof Color3 ? v : Color3.fromJSON(v);
        this.Changed.Fire('Decay', this.decay);
    }

    get Glare() { return this.glare; }
    set Glare(v) {
        this.glare = Math.max(0, Math.min(1, Number(v) || 0));
        this.Changed.Fire('Glare', this.glare);
    }

    get Haze() { return this.haze; }
    set Haze(v) {
        this.haze = Math.max(0, Math.min(10, Number(v) || 0));
        this.Changed.Fire('Haze', this.haze);
    }

    serializeProperties() {
        return {
            density: this.density,
            offset: this.offset,
            color: this.color.toJSON(),
            decay: this.decay.toJSON(),
            glare: this.glare,
            haze: this.haze
        };
    }

    deserializeProperties(props) {
        if (props.density !== undefined) this.density = props.density;
        if (props.offset !== undefined) this.offset = props.offset;
        if (props.color) this.color = Color3.fromJSON(props.color);
        if (props.decay) this.decay = Color3.fromJSON(props.decay);
        if (props.glare !== undefined) this.glare = props.glare;
        if (props.haze !== undefined) this.haze = props.haze;
    }
}

export class DepthOfFieldEffect extends Instance {
    constructor() {
        super('DepthOfFieldEffect');
        this.enabled = true;
        this.focusDistance = 25;
        this.inFocusRadius = 15;
        this.nearIntensity = 0.5;
        this.farIntensity = 0.5;
    }

    get Enabled() { return this.enabled; }
    set Enabled(v) {
        this.enabled = Boolean(v);
        this.Changed.Fire('Enabled', this.enabled);
    }

    get FocusDistance() { return this.focusDistance; }
    set FocusDistance(v) {
        this.focusDistance = Math.max(0, Number(v) || 0);
        this.Changed.Fire('FocusDistance', this.focusDistance);
    }

    get InFocusRadius() { return this.inFocusRadius; }
    set InFocusRadius(v) {
        this.inFocusRadius = Math.max(0, Number(v) || 0);
        this.Changed.Fire('InFocusRadius', this.inFocusRadius);
    }

    get NearIntensity() { return this.nearIntensity; }
    set NearIntensity(v) {
        this.nearIntensity = Math.max(0, Math.min(1, Number(v) || 0));
        this.Changed.Fire('NearIntensity', this.nearIntensity);
    }

    get FarIntensity() { return this.farIntensity; }
    set FarIntensity(v) {
        this.farIntensity = Math.max(0, Math.min(1, Number(v) || 0));
        this.Changed.Fire('FarIntensity', this.farIntensity);
    }

    serializeProperties() {
        return {
            enabled: this.enabled,
            focusDistance: this.focusDistance,
            inFocusRadius: this.inFocusRadius,
            nearIntensity: this.nearIntensity,
            farIntensity: this.farIntensity
        };
    }

    deserializeProperties(props) {
        if (props.enabled !== undefined) this.enabled = props.enabled;
        if (props.focusDistance !== undefined) this.focusDistance = props.focusDistance;
        if (props.inFocusRadius !== undefined) this.inFocusRadius = props.inFocusRadius;
        if (props.nearIntensity !== undefined) this.nearIntensity = props.nearIntensity;
        if (props.farIntensity !== undefined) this.farIntensity = props.farIntensity;
    }
}

export class SunRaysEffect extends Instance {
    constructor() {
        super('SunRaysEffect');
        this.enabled = true;
        this.intensity = 0.25;
        this.spread = 0.75;
    }

    get Enabled() { return this.enabled; }
    set Enabled(v) {
        this.enabled = Boolean(v);
        this.Changed.Fire('Enabled', this.enabled);
    }

    get Intensity() { return this.intensity; }
    set Intensity(v) {
        this.intensity = Math.max(0, Math.min(1, Number(v) || 0));
        this.Changed.Fire('Intensity', this.intensity);
    }

    get Spread() { return this.spread; }
    set Spread(v) {
        this.spread = Math.max(0, Math.min(1, Number(v) || 0));
        this.Changed.Fire('Spread', this.spread);
    }

    serializeProperties() {
        return {
            enabled: this.enabled,
            intensity: this.intensity,
            spread: this.spread
        };
    }

    deserializeProperties(props) {
        if (props.enabled !== undefined) this.enabled = props.enabled;
        if (props.intensity !== undefined) this.intensity = props.intensity;
        if (props.spread !== undefined) this.spread = props.spread;
    }
}

export class Sky extends Instance {
    constructor(className = 'Sky') {
        super(className);
        this.celestialBodiesShown = true;
        this.sunAngularSize = 21;
        this.moonAngularSize = 11;
        this.starCount = 3000;
        this.preset = 'Classic Roblox';
        this.skyboxBk = '';
        this.skyboxDn = '';
        this.skyboxFt = '';
        this.skyboxLf = '';
        this.skyboxRt = '';
        this.skyboxUp = '';
    }

    get CelestialBodiesShown() { return this.celestialBodiesShown; }
    set CelestialBodiesShown(v) {
        this.celestialBodiesShown = Boolean(v);
        this.Changed.Fire('CelestialBodiesShown', this.celestialBodiesShown);
    }

    get SunAngularSize() { return this.sunAngularSize; }
    set SunAngularSize(v) {
        this.sunAngularSize = Math.max(0, Math.min(60, Number(v) || 21));
        this.Changed.Fire('SunAngularSize', this.sunAngularSize);
    }

    get MoonAngularSize() { return this.moonAngularSize; }
    set MoonAngularSize(v) {
        this.moonAngularSize = Math.max(0, Math.min(60, Number(v) || 11));
        this.Changed.Fire('MoonAngularSize', this.moonAngularSize);
    }

    get StarCount() { return this.starCount; }
    set StarCount(v) {
        this.starCount = Math.max(0, Math.min(10000, Number(v) || 3000));
        this.Changed.Fire('StarCount', this.starCount);
    }

    get Preset() { return this.preset; }
    set Preset(v) {
        this.preset = String(v || 'Classic Roblox');
        this.Changed.Fire('Preset', this.preset);
    }

    get SkyboxBk() { return this.skyboxBk; }
    set SkyboxBk(v) { this.skyboxBk = String(v); this.Changed.Fire('SkyboxBk', this.skyboxBk); }

    get SkyboxDn() { return this.skyboxDn; }
    set SkyboxDn(v) { this.skyboxDn = String(v); this.Changed.Fire('SkyboxDn', this.skyboxDn); }

    get SkyboxFt() { return this.skyboxFt; }
    set SkyboxFt(v) { this.skyboxFt = String(v); this.Changed.Fire('SkyboxFt', this.skyboxFt); }

    get SkyboxLf() { return this.skyboxLf; }
    set SkyboxLf(v) { this.skyboxLf = String(v); this.Changed.Fire('SkyboxLf', this.skyboxLf); }

    get SkyboxRt() { return this.skyboxRt; }
    set SkyboxRt(v) { this.skyboxRt = String(v); this.Changed.Fire('SkyboxRt', this.skyboxRt); }

    get SkyboxUp() { return this.skyboxUp; }
    set SkyboxUp(v) { this.skyboxUp = String(v); this.Changed.Fire('SkyboxUp', this.skyboxUp); }

    serializeProperties() {
        return {
            celestialBodiesShown: this.celestialBodiesShown,
            sunAngularSize: this.sunAngularSize,
            moonAngularSize: this.moonAngularSize,
            starCount: this.starCount,
            preset: this.preset,
            skyboxBk: this.skyboxBk,
            skyboxDn: this.skyboxDn,
            skyboxFt: this.skyboxFt,
            skyboxLf: this.skyboxLf,
            skyboxRt: this.skyboxRt,
            skyboxUp: this.skyboxUp
        };
    }

    deserializeProperties(props) {
        if (props.celestialBodiesShown !== undefined) this.celestialBodiesShown = props.celestialBodiesShown;
        if (props.sunAngularSize !== undefined) this.sunAngularSize = props.sunAngularSize;
        if (props.moonAngularSize !== undefined) this.moonAngularSize = props.moonAngularSize;
        if (props.starCount !== undefined) this.starCount = props.starCount;
        if (props.preset !== undefined) this.preset = props.preset;
        if (props.skyboxBk !== undefined) this.skyboxBk = props.skyboxBk;
        if (props.skyboxDn !== undefined) this.skyboxDn = props.skyboxDn;
        if (props.skyboxFt !== undefined) this.skyboxFt = props.skyboxFt;
        if (props.skyboxLf !== undefined) this.skyboxLf = props.skyboxLf;
        if (props.skyboxRt !== undefined) this.skyboxRt = props.skyboxRt;
        if (props.skyboxUp !== undefined) this.skyboxUp = props.skyboxUp;
    }
}

export class SkyBox extends Sky {
    constructor() {
        super('SkyBox');
    }
}

export class Clouds extends Instance {
    constructor() {
        super('Clouds');
        this.enabled = true;
        this.cover = 0.5;
        this.density = 0.7;
        this.speed = 1.0;
        this.color = Color3.fromRGB(255, 255, 255);
    }

    get Enabled() { return this.enabled; }
    set Enabled(v) {
        this.enabled = Boolean(v);
        this.Changed.Fire('Enabled', this.enabled);
    }

    get Cover() { return this.cover; }
    set Cover(v) {
        this.cover = Math.max(0, Math.min(1, Number(v) || 0));
        this.Changed.Fire('Cover', this.cover);
    }

    get Density() { return this.density; }
    set Density(v) {
        this.density = Math.max(0, Math.min(1, Number(v) || 0));
        this.Changed.Fire('Density', this.density);
    }

    get Speed() { return this.speed; }
    set Speed(v) {
        this.speed = (v !== undefined && !isNaN(Number(v))) ? Math.max(0, Math.min(20, Number(v))) : 1.0;
        this.Changed.Fire('Speed', this.speed);
    }

    get Color() { return this.color; }
    set Color(v) {
        this.color = v instanceof Color3 ? v : Color3.fromJSON(v);
        this.Changed.Fire('Color', this.color);
    }

    serializeProperties() {
        return {
            enabled: this.enabled,
            cover: this.cover,
            density: this.density,
            speed: this.speed,
            color: this.color.toJSON()
        };
    }

    deserializeProperties(props) {
        if (props.enabled !== undefined) this.enabled = props.enabled;
        if (props.cover !== undefined) this.cover = props.cover;
        if (props.density !== undefined) this.density = props.density;
        if (props.speed !== undefined) this.speed = props.speed;
        if (props.color) this.color = Color3.fromJSON(props.color);
    }
}

export class Decal extends Instance {
    constructor(className = 'Decal') {
        super(className);
        this.texture = '';
        this.face = 'Front';
        this.transparency = 0;
        this.color = Color3.fromRGB(255, 255, 255);
    }

    get Texture() { return this.texture; }
    set Texture(v) { this.texture = String(v || ''); this.Changed.Fire('Texture', this.texture); }

    get Face() { return this.face; }
    set Face(v) { this.face = String(v || 'Front'); this.Changed.Fire('Face', this.face); }

    get Transparency() { return this.transparency; }
    set Transparency(v) {
        this.transparency = Math.max(0, Math.min(1, Number(v) || 0));
        this.Changed.Fire('Transparency', this.transparency);
    }

    get Color() { return this.color; }
    set Color(v) {
        this.color = v instanceof Color3 ? v : Color3.fromJSON(v);
        this.Changed.Fire('Color', this.color);
    }

    serializeProperties() {
        return {
            texture: this.texture,
            face: this.face,
            transparency: this.transparency,
            color: this.color.toJSON()
        };
    }

    deserializeProperties(props) {
        if (props.texture !== undefined) this.texture = props.texture;
        if (props.face !== undefined) this.face = props.face;
        if (props.transparency !== undefined) this.transparency = props.transparency;
        if (props.color) this.color = Color3.fromJSON(props.color);
    }
}

export class ParticleEmitter extends Instance {
    constructor() {
        super('ParticleEmitter');
        this.texture = '';
    }

    get Texture() { return this.texture; }
    set Texture(value) {
        this.texture = String(value || '');
        this.Changed.Fire('Texture', this.texture);
    }

    serializeProperties() {
        return { texture: this.texture };
    }

    deserializeProperties(props) {
        if (props.texture !== undefined) this.texture = props.texture;
    }
}

export class Texture extends Decal {
    constructor() {
        super('Texture');
        this.studsPerTileU = 2;
        this.studsPerTileV = 2;
    }

    get StudsPerTileU() { return this.studsPerTileU; }
    set StudsPerTileU(v) {
        this.studsPerTileU = Math.max(0.1, Number(v) || 2);
        this.Changed.Fire('StudsPerTileU', this.studsPerTileU);
    }

    get StudsPerTileV() { return this.studsPerTileV; }
    set StudsPerTileV(v) {
        this.studsPerTileV = Math.max(0.1, Number(v) || 2);
        this.Changed.Fire('StudsPerTileV', this.studsPerTileV);
    }

    serializeProperties() {
        return {
            ...super.serializeProperties(),
            studsPerTileU: this.studsPerTileU,
            studsPerTileV: this.studsPerTileV
        };
    }

    deserializeProperties(props) {
        super.deserializeProperties(props);
        if (props.studsPerTileU !== undefined) this.studsPerTileU = props.studsPerTileU;
        if (props.studsPerTileV !== undefined) this.studsPerTileV = props.studsPerTileV;
    }
}

export class Sound extends Instance {
    constructor() {
        super('Sound');
        this.soundId = '';
        this.volume = 0.5;
        this.playbackSpeed = 1.0;
        this.looped = false;
        this.playing = false;
        this.timePosition = 0;

        // Signals
        this.Played = new Signal();
        this.Paused = new Signal();
        this.Stopped = new Signal();
        this.Ended = new Signal();

        // Browser audio instance
        this._audio = null;
        this._setupAudio();
    }

    _setupAudio() {
        if (typeof Audio === 'undefined') return;
        this._audio = new Audio();
        this._audio.volume = Math.max(0, Math.min(1, this.volume));
        this._audio.loop = this.looped;
        this._audio.playbackRate = this.playbackSpeed;

        this._audio.addEventListener('ended', () => {
            this.playing = false;
            this.Changed.Fire('Playing', false);
            this.Ended.Fire();
        });
    }

    get SoundId() { return this.soundId; }
    set SoundId(v) {
        this.soundId = String(v || '');
        if (this._audio) {
            this._audio.src = this.soundId;
            if (this.playing) {
                this._audio.play().catch(() => {});
            }
        }
        this.Changed.Fire('SoundId', this.soundId);
    }

    get Volume() { return this.volume; }
    set Volume(v) {
        const num = Number(v);
        this.volume = !isNaN(num) ? Math.max(0, Math.min(1, num)) : 0.5;
        if (this._audio) this._audio.volume = this.volume;
        this.Changed.Fire('Volume', this.volume);
    }

    get PlaybackSpeed() { return this.playbackSpeed; }
    set PlaybackSpeed(v) {
        const num = Number(v);
        this.playbackSpeed = !isNaN(num) ? Math.max(0.1, Math.min(16, num)) : 1.0;
        if (this._audio) this._audio.playbackRate = this.playbackSpeed;
        this.Changed.Fire('PlaybackSpeed', this.playbackSpeed);
    }

    get Looped() { return this.looped; }
    set Looped(v) {
        this.looped = Boolean(v);
        if (this._audio) this._audio.loop = this.looped;
        this.Changed.Fire('Looped', this.looped);
    }

    get Playing() { return this.playing; }
    set Playing(v) {
        const b = Boolean(v);
        if (this.playing === b) return;
        if (b) this.Play();
        else this.Stop();
    }

    get TimePosition() {
        return this._audio ? this._audio.currentTime : this.timePosition;
    }
    set TimePosition(v) {
        this.timePosition = Math.max(0, Number(v) || 0);
        if (this._audio) this._audio.currentTime = this.timePosition;
        this.Changed.Fire('TimePosition', this.timePosition);
    }

    get IsPlaying() {
        return this.playing;
    }

    Play() {
        this.playing = true;
        if (this._audio && this.soundId) {
            if (this._audio.src !== this.soundId && !this._audio.src.endsWith(this.soundId)) {
                this._audio.src = this.soundId;
            }
            this._audio.play().catch(() => {});
        }
        this.Played.Fire();
        this.Changed.Fire('Playing', true);
    }

    Pause() {
        this.playing = false;
        if (this._audio) this._audio.pause();
        this.Paused.Fire();
        this.Changed.Fire('Playing', false);
    }

    Stop() {
        this.playing = false;
        if (this._audio) {
            this._audio.pause();
            this._audio.currentTime = 0;
        }
        this.Stopped.Fire();
        this.Changed.Fire('Playing', false);
    }

    Resume() {
        this.Play();
    }

    Destroy() {
        if (this._audio) {
            this._audio.pause();
            this._audio.src = '';
            this._audio = null;
        }
        super.Destroy();
    }

    serializeProperties() {
        return {
            soundId: this.soundId,
            volume: this.volume,
            playbackSpeed: this.playbackSpeed,
            looped: this.looped,
            playing: this.playing
        };
    }

    deserializeProperties(props) {
        if (props.soundId !== undefined) this.SoundId = props.soundId;
        if (props.volume !== undefined) this.Volume = props.volume;
        if (props.playbackSpeed !== undefined) this.PlaybackSpeed = props.playbackSpeed;
        if (props.looped !== undefined) this.Looped = props.looped;
        if (props.playing !== undefined && props.playing) this.Play();
    }
}

// ── Joint & Constraint Instances (Roblox Physics & Rigging) ──

export class JointInstance extends Instance {
    constructor(className = 'JointInstance') {
        super(className);
        this.part0 = null;
        this.part1 = null;
        this.c0 = new CFrame();
        this.c1 = new CFrame();
        this.enabled = true;
    }

    get Part0() { return this.part0; }
    set Part0(p) {
        this.part0 = p;
        this.Changed.Fire('Part0', p);
    }

    get Part1() { return this.part1; }
    set Part1(p) {
        this.part1 = p;
        this.Changed.Fire('Part1', p);
    }

    get C0() { return this.c0; }
    set C0(v) {
        this.c0 = v instanceof CFrame ? v : CFrame.fromJSON(v);
        this.Changed.Fire('C0', this.c0);
    }

    get C1() { return this.c1; }
    set C1(v) {
        this.c1 = v instanceof CFrame ? v : CFrame.fromJSON(v);
        this.Changed.Fire('C1', this.c1);
    }

    get Enabled() { return this.enabled; }
    set Enabled(v) {
        this.enabled = Boolean(v);
        this.Changed.Fire('Enabled', this.enabled);
    }

    getRootInstance() {
        let root = this;
        while (root.Parent) root = root.Parent;
        return root;
    }

    serializeProperties() {
        return {
            part0Id: this.part0?.id || null,
            part0Name: this.part0?.Name || null,
            part1Id: this.part1?.id || null,
            part1Name: this.part1?.Name || null,
            c0: this.c0 ? this.c0.toJSON() : null,
            c1: this.c1 ? this.c1.toJSON() : null,
            enabled: this.enabled
        };
    }

    deserializeProperties(props) {
        if (props.enabled !== undefined) this.enabled = Boolean(props.enabled);
        if (props.c0) this.c0 = CFrame.fromJSON(props.c0);
        if (props.c1) this.c1 = CFrame.fromJSON(props.c1);
        this._pendingPart0Id = props.part0Id || null;
        this._pendingPart0Name = props.part0Name || null;
        this._pendingPart1Id = props.part1Id || null;
        this._pendingPart1Name = props.part1Name || null;
        if (props.part0Id || props.part0Name || props.part1Id || props.part1Name) {
            this.resolveReferences();
            setTimeout(() => {
                if (!this.Part0 || !this.Part1) {
                    this.resolveReferences();
                }
            }, 0);
        }
    }

    resolveReferences(idMap = null) {
        const root = this.getRootInstance();
        const all = root ? [root, ...root.GetDescendants()] : [];
        if (!this.Part0) {
            if (this._pendingPart0Id && idMap && idMap.has(this._pendingPart0Id)) {
                this.Part0 = idMap.get(this._pendingPart0Id);
            } else if (this._pendingPart0Id || this._pendingPart0Name) {
                this.Part0 = all.find(i => (this._pendingPart0Id && i.id === this._pendingPart0Id) || (this._pendingPart0Name && i.Name === this._pendingPart0Name)) || null;
            }
        }
        if (!this.Part1) {
            if (this._pendingPart1Id && idMap && idMap.has(this._pendingPart1Id)) {
                this.Part1 = idMap.get(this._pendingPart1Id);
            } else if (this._pendingPart1Id || this._pendingPart1Name) {
                this.Part1 = all.find(i => (this._pendingPart1Id && i.id === this._pendingPart1Id) || (this._pendingPart1Name && i.Name === this._pendingPart1Name)) || null;
            }
        }
    }
}

export class Weld extends JointInstance {
    constructor() {
        super('Weld');
    }
}

export class Motor6D extends JointInstance {
    constructor() {
        super('Motor6D');
        this.transform = new CFrame();
        this.currentAngle = 0;
        this.desiredAngle = 0;
        this.maxVelocity = 0.05;
    }

    get Transform() { return this.transform; }
    set Transform(v) {
        this.transform = v instanceof CFrame ? v : CFrame.fromJSON(v);
        this.Changed.Fire('Transform', this.transform);
    }

    get CurrentAngle() { return this.currentAngle; }
    set CurrentAngle(v) {
        const angle = Number(v);
        this.currentAngle = Number.isFinite(angle) ? angle : 0;
        this.Changed.Fire('CurrentAngle', this.currentAngle);
    }

    get DesiredAngle() { return this.desiredAngle; }
    set DesiredAngle(v) {
        const angle = Number(v);
        this.desiredAngle = Number.isFinite(angle) ? angle : 0;
        this.Changed.Fire('DesiredAngle', this.desiredAngle);
    }

    get MaxVelocity() { return this.maxVelocity; }
    set MaxVelocity(v) {
        const velocity = Number(v);
        this.maxVelocity = Number.isFinite(velocity) ? Math.max(0, velocity) : 0.05;
        this.Changed.Fire('MaxVelocity', this.maxVelocity);
    }

    SetDesiredAngle(v) {
        this.DesiredAngle = v;
    }

    setDesiredAngle(v) {
        this.DesiredAngle = v;
    }

    setCurrentAngle(v) {
        this.CurrentAngle = v;
    }

    serializeProperties() {
        return {
            ...super.serializeProperties(),
            transform: this.transform ? this.transform.toJSON() : null,
            currentAngle: this.currentAngle,
            desiredAngle: this.desiredAngle,
            maxVelocity: this.maxVelocity
        };
    }

    deserializeProperties(props) {
        super.deserializeProperties(props);
        if (props.transform) this.Transform = CFrame.fromJSON(props.transform);
        if (props.currentAngle !== undefined) this.CurrentAngle = props.currentAngle;
        if (props.desiredAngle !== undefined) this.DesiredAngle = props.desiredAngle;
        if (props.maxVelocity !== undefined) this.MaxVelocity = props.maxVelocity;
    }
}

export class Keyframe extends Instance {
    constructor() {
        super('Keyframe');
        this.time = 0;
        this.cframe = new CFrame();
    }

    get Time() { return this.time; }
    set Time(value) {
        const time = Number(value);
        this.time = Number.isFinite(time) ? Math.max(0, time) : 0;
        this.Changed.Fire('Time', this.time);
    }

    get CFrame() { return this.cframe; }
    set CFrame(value) {
        this.cframe = value instanceof CFrame ? value : CFrame.fromJSON(value);
        this.Changed.Fire('CFrame', this.cframe);
    }

    get Position() { return this.cframe.position; }
    get Orientation() { return this.cframe.orientation; }

    serializeProperties() {
        return { time: this.time, cframe: this.cframe.toJSON() };
    }

    deserializeProperties(props) {
        if (!props) return;
        const timeVal = props.time !== undefined ? props.time : props.Time;
        if (timeVal !== undefined) this.Time = timeVal;
        const cfVal = props.cframe || props.CFrame;
        if (cfVal) this.CFrame = CFrame.fromJSON(cfVal);
    }
}

export class KeyframeSequence extends Instance {
    constructor() {
        super('KeyframeSequence');
        this.loop = false;
        this.priority = 'Action';
        this.duration = 0;
    }

    get Loop() { return this.loop; }
    set Loop(value) {
        this.loop = Boolean(value);
        this.Changed.Fire('Loop', this.loop);
    }

    get Priority() { return this.priority; }
    set Priority(value) {
        this.priority = String(value || 'Action');
        this.Changed.Fire('Priority', this.priority);
    }

    get Length() {
        return Math.max(this.duration, this.GetKeyframes().reduce((length, keyframe) => Math.max(length, keyframe.Time), 0));
    }

    get Duration() { return this.duration; }
    set Duration(value) {
        const duration = Number(value);
        this.duration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
        this.Changed.Fire('Duration', this.duration);
    }

    GetKeyframes() {
        return this.GetDescendants().filter(instance => instance.ClassName === 'Keyframe');
    }

    serializeProperties() {
        return { loop: this.loop, priority: this.priority, duration: this.duration };
    }

    deserializeProperties(props) {
        if (props.loop !== undefined) this.Loop = props.loop;
        if (props.priority !== undefined) this.Priority = props.priority;
        if (props.duration !== undefined) this.Duration = props.duration;
    }
}

export class Pose extends Instance {
    constructor() {
        super('Pose');
        this.cframe = new CFrame();
        this.weight = 1;
    }

    get CFrame() { return this.cframe; }
    set CFrame(value) {
        this.cframe = value instanceof CFrame ? value : CFrame.fromJSON(value);
        this.Changed.Fire('CFrame', this.cframe);
    }

    get Weight() { return this.weight; }
    set Weight(value) {
        const weight = Number(value);
        this.weight = Number.isFinite(weight) ? Math.max(0, weight) : 1;
        this.Changed.Fire('Weight', this.weight);
    }

    serializeProperties() {
        return { cframe: this.cframe.toJSON(), weight: this.weight };
    }

    deserializeProperties(props) {
        if (!props) return;
        const cfVal = props.cframe || props.CFrame;
        if (cfVal) this.CFrame = CFrame.fromJSON(cfVal);
        const weightVal = props.weight !== undefined ? props.weight : props.Weight;
        if (weightVal !== undefined) this.Weight = weightVal;
    }
}

export class WeldConstraint extends Instance {
    constructor(className = 'WeldConstraint') {
        super(className);
        this.part0 = null;
        this.part1 = null;
        this.enabled = true;
    }

    get Part0() { return this.part0; }
    set Part0(p) {
        this.part0 = p;
        this.Changed.Fire('Part0', p);
    }

    get Part1() { return this.part1; }
    set Part1(p) {
        this.part1 = p;
        this.Changed.Fire('Part1', p);
    }

    get Enabled() { return this.enabled; }
    set Enabled(v) {
        this.enabled = Boolean(v);
        this.Changed.Fire('Enabled', this.enabled);
    }

    serializeProperties() {
        return {
            part0Id: this.part0?.id || null,
            part0Name: this.part0?.Name || null,
            part1Id: this.part1?.id || null,
            part1Name: this.part1?.Name || null,
            enabled: this.enabled
        };
    }

    deserializeProperties(props) {
        if (props.enabled !== undefined) this.enabled = Boolean(props.enabled);
        if (props.part0Id || props.part0Name) {
            setTimeout(() => {
                const root = this.GetRoot ? this.GetRoot() : null;
                if (root && root.GetDescendants) {
                    const all = root.GetDescendants();
                    this.part0 = all.find(i => i.id === props.part0Id || i.Name === props.part0Name) || null;
                }
            }, 0);
        }
        if (props.part1Id || props.part1Name) {
            setTimeout(() => {
                const root = this.GetRoot ? this.GetRoot() : null;
                if (root && root.GetDescendants) {
                    const all = root.GetDescendants();
                    this.part1 = all.find(i => i.id === props.part1Id || i.Name === props.part1Name) || null;
                }
            }, 0);
        }
    }
}

export class WeldConstant extends WeldConstraint {
    constructor() {
        super('WeldConstant');
    }
}

// ── Camera Instance (Roblox Workspace Camera) ─────────────────
export class Camera extends Instance {
    constructor() {
        super('Camera');
        this.Name = 'Camera';
        this.cframe = new CFrame();
        this.focus = new CFrame();
        this.fieldOfView = 70;
        this.cameraType = 'Custom';
        this.cameraSubject = null;
        this.headLocked = true;
        this.viewportSize = new Vector3(1280, 720, 0);
    }

    get CFrame() { return this.cframe; }
    set CFrame(v) {
        this.cframe = v instanceof CFrame ? v : CFrame.fromJSON(v);
        this.Changed.Fire('CFrame', this.cframe);
        this.Changed.Fire('Position', this.Position);
        this.Changed.Fire('Orientation', this.Orientation);
    }

    get Position() {
        return this.cframe && this.cframe.position ? this.cframe.position : new Vector3();
    }
    set Position(v) {
        const pos = v instanceof Vector3 ? v : Vector3.fromJSON(v);
        const ori = this.cframe && this.cframe.orientation ? this.cframe.orientation : new Vector3();
        this.CFrame = new CFrame(pos, ori);
    }

    get Orientation() {
        return this.cframe && this.cframe.orientation ? this.cframe.orientation : new Vector3();
    }
    set Orientation(v) {
        const ori = v instanceof Vector3 ? v : Vector3.fromJSON(v);
        const pos = this.cframe && this.cframe.position ? this.cframe.position : new Vector3();
        this.CFrame = new CFrame(pos, ori);
    }

    get Focus() { return this.focus; }
    set Focus(v) {
        this.focus = v instanceof CFrame ? v : CFrame.fromJSON(v);
        this.Changed.Fire('Focus', this.focus);
    }

    get FieldOfView() { return this.fieldOfView; }
    set FieldOfView(v) {
        this.fieldOfView = Math.max(1, Math.min(120, Number(v) || 70));
        this.Changed.Fire('FieldOfView', this.fieldOfView);
    }

    get CameraType() { return this.cameraType; }
    set CameraType(v) {
        this.cameraType = String(v);
        this.Changed.Fire('CameraType', this.cameraType);
    }

    get CameraSubject() { return this.cameraSubject; }
    set CameraSubject(v) {
        this.cameraSubject = v;
        this.Changed.Fire('CameraSubject', this.cameraSubject);
    }

    get HeadLocked() { return this.headLocked; }
    set HeadLocked(v) {
        this.headLocked = Boolean(v);
        this.Changed.Fire('HeadLocked', this.headLocked);
    }

    get ViewportSize() { return this.viewportSize; }
    set ViewportSize(v) {
        this.viewportSize = v;
        this.Changed.Fire('ViewportSize', this.viewportSize);
    }

    GetRoll() {
        return (this.cframe.orientation ? (this.cframe.orientation.z * Math.PI) / 180 : 0);
    }

    ScreenPointToRay(x, y, depth = 0) {
        const origin = this.cframe.position || new Vector3();
        const dir = new Vector3(0, 0, -1);
        return { Origin: origin, Direction: dir };
    }

    ViewportPointToRay(x, y, depth = 0) {
        return this.ScreenPointToRay(x, y, depth);
    }

    WorldToScreenPoint(worldPos) {
        return [new Vector3(0, 0, 0), true];
    }

    WorldToViewportPoint(worldPos) {
        return [new Vector3(0, 0, 0), true];
    }

    serializeProperties() {
        return {
            cframe: this.cframe ? this.cframe.toJSON() : null,
            focus: this.focus ? this.focus.toJSON() : null,
            fieldOfView: this.fieldOfView,
            cameraType: this.cameraType,
            cameraSubjectId: this.cameraSubject ? this.cameraSubject.id : null,
            cameraSubjectName: this.cameraSubject ? this.cameraSubject.Name : null,
            headLocked: this.headLocked
        };
    }

    deserializeProperties(props) {
        if (props.cframe) this.cframe = CFrame.fromJSON(props.cframe);
        if (props.focus) this.focus = CFrame.fromJSON(props.focus);
        if (props.fieldOfView !== undefined) this.fieldOfView = Number(props.fieldOfView) || 70;
        if (props.cameraType !== undefined) this.cameraType = String(props.cameraType);
        if (props.headLocked !== undefined) this.headLocked = Boolean(props.headLocked);
        if (props.cameraSubjectId || props.cameraSubjectName) {
            setTimeout(() => {
                const root = this.GetRoot ? this.GetRoot() : null;
                if (root && root.GetDescendants) {
                    this.cameraSubject = root.GetDescendants().find(i => i.id === props.cameraSubjectId || i.Name === props.cameraSubjectName) || null;
                }
            }, 0);
        }
    }
}

// ─── Terrain Instance (Roblox Workspace Terrain Singleton) ───
export class Terrain extends Instance {
    constructor() {
        super('Terrain');
        this.Name = 'Terrain';
    }

    Destroy() {
        // Roblox Workspace.Terrain cannot be destroyed
        console.warn('[Terrain] Workspace.Terrain cannot be destroyed');
    }
}

export class Animation extends Instance {
    constructor() {
        super('Animation');
        this.animationId = '';
    }

    get AnimationId() { return this.animationId; }
    set AnimationId(val) {
        this.animationId = String(val);
        this.Changed.Fire('AnimationId', this.animationId);
    }

    serializeProperties() {
        return { animationId: this.animationId };
    }

    deserializeProperties(props) {
        if (props.animationId !== undefined) this.animationId = props.animationId;
    }
}

export class RemoteEvent extends Instance {
    constructor() {
        super('RemoteEvent');
        this.OnServerEvent = new Signal();
        this.OnClientEvent = new Signal();
    }

    FireServer(...args) {
        this.OnServerEvent.Fire(...args);
    }

    FireClient(player, ...args) {
        this.OnClientEvent.Fire(...args);
    }

    FireAllClients(...args) {
        this.OnClientEvent.Fire(...args);
    }
}

export class Attachment extends Instance {
    constructor() {
        super('Attachment');
        this.cframe = new CFrame();
        this.visible = false;
    }

    get CFrame() { return this.cframe; }
    set CFrame(cf) {
        this.cframe = cf;
        this.Changed.Fire('CFrame', this.cframe);
    }

    get Position() { return this.cframe.Position; }
    get Visible() { return this.visible; }
    set Visible(v) {
        this.visible = Boolean(v);
        this.Changed.Fire('Visible', this.visible);
    }

    serializeProperties() {
        return {
            cframe: this.cframe ? this.cframe.toJSON() : null,
            visible: this.visible
        };
    }

    deserializeProperties(props) {
        if (props.cframe) this.cframe = CFrame.fromJSON(props.cframe);
        if (props.visible !== undefined) this.visible = props.visible;
    }
}

export class ValueBase extends Instance {
    constructor(className = 'ValueBase', defaultValue = null) {
        super(className);
        this.value = defaultValue;
    }

    get Value() { return this.value; }
    set Value(val) {
        this.value = val;
        this.Changed.Fire('Value', this.value);
    }

    serializeProperties() {
        return { value: this.value };
    }

    deserializeProperties(props) {
        if (props.value !== undefined) this.value = props.value;
    }
}

export class StringValue extends ValueBase { constructor() { super('StringValue', ''); } }
export class BoolValue extends ValueBase { constructor() { super('BoolValue', false); } }
export class NumberValue extends ValueBase { constructor() { super('NumberValue', 0); } }
export class IntValue extends ValueBase { constructor() { super('IntValue', 0); } }
export class ObjectValue extends ValueBase { constructor() { super('ObjectValue', null); } }

export class Animator extends Instance {
    constructor() {
        super('Animator');
    }
    LoadAnimation(animation) {
        if (this.Parent && this.Parent.LoadAnimation) {
            return this.Parent.LoadAnimation(animation);
        }
        return null;
    }
    GetPlayingAnimationTracks() {
        if (this.Parent && this.Parent.GetPlayingAnimationTracks) {
            return this.Parent.GetPlayingAnimationTracks();
        }
        return [];
    }
}

export class BindableFunction extends Instance {
    constructor() {
        super('BindableFunction');
        this.onInvoke = null;
    }

    get OnInvoke() { return this.onInvoke; }
    set OnInvoke(fn) { this.onInvoke = fn; }

    Invoke(...args) {
        if (typeof this.onInvoke === 'function') {
            return this.onInvoke(...args);
        }
        return undefined;
    }
}

export class BindableEvent extends Instance {
    constructor() {
        super('BindableEvent');
        this.Event = new Signal();
    }

    Fire(...args) {
        this.Event.Fire(...args);
    }
}

Instance.register('Folder', Folder);
Instance.register('Tool', Tool);
Instance.register('SpecialMesh', SpecialMesh);
Instance.register('CharacterMesh', CharacterMesh);
Instance.register('Clothing', Clothing);
Instance.register('Shirt', Shirt);
Instance.register('Pants', Pants);
Instance.register('Model', Model);
Instance.register('Script', Script);
Instance.register('LocalScript', LocalScript);
Instance.register('ModuleScript', ModuleScript);
Instance.register('PointLight', PointLight);
Instance.register('SpotLight', SpotLight);
Instance.register('SurfaceLight', SurfaceLight);
Instance.register('Humanoid', Humanoid);
Instance.register('BloomEffect', BloomEffect);
Instance.register('Atmosphere', Atmosphere);
Instance.register('DepthOfFieldEffect', DepthOfFieldEffect);
Instance.register('SunRaysEffect', SunRaysEffect);
Instance.register('Sky', Sky);
Instance.register('SkyBox', SkyBox);
Instance.register('Clouds', Clouds);
Instance.register('Decal', Decal);
Instance.register('ParticleEmitter', ParticleEmitter);
Instance.register('Texture', Texture);
Instance.register('Sound', Sound);
Instance.register('JointInstance', JointInstance);
Instance.register('Weld', Weld);
Instance.register('ManualWeld', Weld);
Instance.register('Motor6D', Motor6D);
Instance.register('Keyframe', Keyframe);
Instance.register('KeyframeSequence', KeyframeSequence);
Instance.register('Pose', Pose);
Instance.register('WeldConstraint', WeldConstraint);
Instance.register('WeldConstant', WeldConstant);
Instance.register('Camera', Camera);
Instance.register('Terrain', Terrain);
Instance.register('Animation', Animation);
Instance.register('RemoteEvent', RemoteEvent);
Instance.register('Attachment', Attachment);
Instance.register('StringValue', StringValue);
Instance.register('BoolValue', BoolValue);
Instance.register('NumberValue', NumberValue);
Instance.register('IntValue', IntValue);
Instance.register('ObjectValue', ObjectValue);

Instance.register('Accessory', Accessory);
Instance.register('Accoutrement', Accessory);
Instance.register('AnimationTrack', AnimationTrack);
Instance.register('Animator', Animator);
Instance.register('BindableFunction', BindableFunction);
Instance.register('BindableEvent', BindableEvent);
