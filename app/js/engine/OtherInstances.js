/**
 * Conblox Standard Instances
 * Model, Folder, Script, PointLight, SpotLight, Humanoid
 */

import { Instance } from './Instance.js';
import { Vector3, Color3, CFrame } from './Math3D.js';
import { Signal } from './Signal.js';

export class Folder extends Instance {
    constructor() {
        super('Folder');
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

export class PointLight extends Instance {
    constructor() {
        super('PointLight');
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

export class Humanoid extends Instance {
    constructor() {
        super('Humanoid');
        this.health = 100;
        this.maxHealth = 100;
        this.walkSpeed = 16; // studs per second
        this.jumpPower = 50;
        this.Died = new Signal();
        this.HealthChanged = new Signal();
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
            jumpPower: this.jumpPower
        };
    }

    deserializeProperties(props) {
        if (props.health !== undefined) this.health = props.health;
        if (props.maxHealth !== undefined) this.maxHealth = props.maxHealth;
        if (props.walkSpeed !== undefined) this.walkSpeed = props.walkSpeed;
        if (props.jumpPower !== undefined) this.jumpPower = props.jumpPower;
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
        this.currentAngle = Number(v) || 0;
        this.Changed.Fire('CurrentAngle', this.currentAngle);
    }

    get DesiredAngle() { return this.desiredAngle; }
    set DesiredAngle(v) {
        this.desiredAngle = Number(v) || 0;
        this.Changed.Fire('DesiredAngle', this.desiredAngle);
    }

    get MaxVelocity() { return this.maxVelocity; }
    set MaxVelocity(v) {
        this.maxVelocity = Number(v) || 0.05;
        this.Changed.Fire('MaxVelocity', this.maxVelocity);
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
        if (props.transform) this.transform = CFrame.fromJSON(props.transform);
        if (props.currentAngle !== undefined) this.currentAngle = Number(props.currentAngle) || 0;
        if (props.desiredAngle !== undefined) this.desiredAngle = Number(props.desiredAngle) || 0;
        if (props.maxVelocity !== undefined) this.maxVelocity = Number(props.maxVelocity) || 0.05;
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

Instance.register('Folder', Folder);
Instance.register('Model', Model);
Instance.register('Script', Script);
Instance.register('LocalScript', LocalScript);
Instance.register('PointLight', PointLight);
Instance.register('Humanoid', Humanoid);
Instance.register('BloomEffect', BloomEffect);
Instance.register('Atmosphere', Atmosphere);
Instance.register('DepthOfFieldEffect', DepthOfFieldEffect);
Instance.register('SunRaysEffect', SunRaysEffect);
Instance.register('Sky', Sky);
Instance.register('SkyBox', SkyBox);
Instance.register('Clouds', Clouds);
Instance.register('Decal', Decal);
Instance.register('Texture', Texture);
Instance.register('Sound', Sound);
Instance.register('JointInstance', JointInstance);
Instance.register('Weld', Weld);
Instance.register('Motor6D', Motor6D);
Instance.register('WeldConstraint', WeldConstraint);
Instance.register('WeldConstant', WeldConstant);
Instance.register('Camera', Camera);
Instance.register('Terrain', Terrain);
