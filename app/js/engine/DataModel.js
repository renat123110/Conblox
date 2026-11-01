/**
 * Conblox DataModel & Core Services
 * Root `game` container
 */

import { Instance } from './Instance.js';
import { Signal } from './Signal.js';
import { Vector3, Color3 } from './Math3D.js';
import { Part } from './BasePart.js';
import { BloomEffect, Atmosphere, SunRaysEffect, DepthOfFieldEffect, Sky, Clouds, Camera, Terrain } from './OtherInstances.js';
import { UserInputService, RunService } from './Services.js';

export class WorkspaceService extends Instance {
    constructor() {
        super('Workspace');
        this.Name = 'Workspace';
        this.gravity = 196.2; // Roblox standard studs/s^2 (scaled for physics)
        this.currentCamera = null;
    }

    get Gravity() { return this.gravity; }
    set Gravity(val) {
        this.gravity = Number(val) || 196.2;
        this.Changed.Fire('Gravity', this.gravity);
    }

    get CurrentCamera() { return this.currentCamera; }
    set CurrentCamera(val) {
        this.currentCamera = val;
        this.Changed.Fire('CurrentCamera', val);
    }

    get Terrain() {
        return this.FindFirstChild('Terrain');
    }
}

export class LightingService extends Instance {
    constructor() {
        super('Lighting');
        this.Name = 'Lighting';
        this.ambient = Color3.fromRGB(128, 128, 128);
        this.outdoorAmbient = Color3.fromRGB(128, 128, 128);
        this.brightness = 2;
        this.clockTime = 14; // 14:00 (2 PM)
        this.fogColor = Color3.fromRGB(192, 214, 237);
        this.fogStart = 0;
        this.fogEnd = 1000;
    }

    get Ambient() { return this.ambient; }
    set Ambient(val) {
        this.ambient = val instanceof Color3 ? val : Color3.fromJSON(val);
        this.Changed.Fire('Ambient', this.ambient);
    }

    get OutdoorAmbient() { return this.outdoorAmbient; }
    set OutdoorAmbient(val) {
        this.outdoorAmbient = val instanceof Color3 ? val : Color3.fromJSON(val);
        this.Changed.Fire('OutdoorAmbient', this.outdoorAmbient);
    }

    get Brightness() { return this.brightness; }
    set Brightness(val) {
        const num = Number(val);
        this.brightness = !isNaN(num) ? Math.max(0, num) : 2;
        this.Changed.Fire('Brightness', this.brightness);
    }

    get ClockTime() { return this.clockTime; }
    set ClockTime(val) {
        const num = Number(val);
        this.clockTime = !isNaN(num) ? Math.max(0, Math.min(24, num)) : 14;
        this.Changed.Fire('ClockTime', this.clockTime);
    }

    get FogColor() { return this.fogColor; }
    set FogColor(val) {
        this.fogColor = val instanceof Color3 ? val : Color3.fromJSON(val);
        this.Changed.Fire('FogColor', this.fogColor);
    }

    get FogStart() { return this.fogStart; }
    set FogStart(val) {
        const num = Number(val);
        this.fogStart = !isNaN(num) ? Math.max(0, num) : 0;
        this.Changed.Fire('FogStart', this.fogStart);
    }

    get FogEnd() { return this.fogEnd; }
    set FogEnd(val) {
        const num = Number(val);
        this.fogEnd = !isNaN(num) ? Math.max(0, num) : 1000;
        this.Changed.Fire('FogEnd', this.fogEnd);
    }

    serializeProperties() {
        return {
            ambient: this.ambient.toJSON(),
            outdoorAmbient: this.outdoorAmbient.toJSON(),
            brightness: this.brightness,
            clockTime: this.clockTime,
            fogColor: this.fogColor.toJSON(),
            fogStart: this.fogStart,
            fogEnd: this.fogEnd
        };
    }

    deserializeProperties(props) {
        if (props.ambient) this.ambient = Color3.fromJSON(props.ambient);
        if (props.outdoorAmbient) this.outdoorAmbient = Color3.fromJSON(props.outdoorAmbient);
        if (props.brightness !== undefined) this.brightness = props.brightness;
        if (props.clockTime !== undefined) this.clockTime = props.clockTime;
        if (props.fogColor) this.fogColor = Color3.fromJSON(props.fogColor);
        if (props.fogStart !== undefined) this.fogStart = props.fogStart;
        if (props.fogEnd !== undefined) this.fogEnd = props.fogEnd;
    }
}

export class PlayersService extends Instance {
    constructor() {
        super('Players');
        this.Name = 'Players';
        this._localPlayer = null;
    }

    get LocalPlayer() {
        if (!this._localPlayer) {
            this._localPlayer = new Instance('Player');
            this._localPlayer.Name = 'Player';
            this._localPlayer.CharacterAdded = new Signal();
            this._localPlayer.Chatted = new Signal();
            this._localPlayer.Parent = this;
        }
        return this._localPlayer;
    }

    set LocalPlayer(val) {
        this._localPlayer = val;
    }
}

export class ReplicatedStorageService extends Instance {
    constructor() {
        super('ReplicatedStorage');
        this.Name = 'ReplicatedStorage';
    }
}

export class ServerScriptServiceService extends Instance {
    constructor() {
        super('ServerScriptService');
        this.Name = 'ServerScriptService';
    }
}

export class StarterGuiService extends Instance {
    constructor() {
        super('StarterGui');
        this.Name = 'StarterGui';
    }
}

export class MaterialServiceService extends Instance {
    constructor() {
        super('MaterialService');
        this.Name = 'MaterialService';
    }
}

export class ReplicatedFirstService extends Instance {
    constructor() {
        super('ReplicatedFirst');
        this.Name = 'ReplicatedFirst';
    }
}

export class ServerStorageService extends Instance {
    constructor() {
        super('ServerStorage');
        this.Name = 'ServerStorage';
    }
}

export class StarterPackService extends Instance {
    constructor() {
        super('StarterPack');
        this.Name = 'StarterPack';
    }
}

export class StarterCharacterScriptsFolder extends Instance {
    constructor() {
        super('StarterCharacterScripts');
        this.Name = 'StarterCharacterScripts';
    }
}

export class StarterPlayerScriptsFolder extends Instance {
    constructor() {
        super('StarterPlayerScripts');
        this.Name = 'StarterPlayerScripts';
    }
}

export class StarterPlayerService extends Instance {
    constructor() {
        super('StarterPlayer');
        this.Name = 'StarterPlayer';
        this.StarterCharacterScripts = new StarterCharacterScriptsFolder();
        this.StarterCharacterScripts.Parent = this;
        this.StarterPlayerScripts = new StarterPlayerScriptsFolder();
        this.StarterPlayerScripts.Parent = this;
    }
}

export class TeamsService extends Instance {
    constructor() {
        super('Teams');
        this.Name = 'Teams';
    }
}

export class SoundServiceService extends Instance {
    constructor() {
        super('SoundService');
        this.Name = 'SoundService';
    }
}

export class TextChatServiceService extends Instance {
    constructor() {
        super('TextChatService');
        this.Name = 'TextChatService';
    }
}

export class DataModel extends Instance {
    constructor() {
        super('DataModel');
        this.Name = 'game';
        this.services = new Map();

        // 1) Workspace
        this.Workspace = new WorkspaceService();
        this.Workspace.Parent = this;
        this.services.set('Workspace', this.Workspace);

        // Standard Roblox Workspace Terrain & Camera
        const terrain = new Terrain();
        terrain.Parent = this.Workspace;

        const cam = new Camera();
        cam.Name = 'Camera';
        cam.Parent = this.Workspace;
        this.Workspace.CurrentCamera = cam;

        // 2) Players
        this.Players = new PlayersService();
        this.Players.Parent = this;
        this.services.set('Players', this.Players);

        // 3) Lighting
        this.Lighting = new LightingService();
        this.Lighting.Parent = this;
        this.services.set('Lighting', this.Lighting);

        // 4) MaterialService
        this.MaterialService = new MaterialServiceService();
        this.MaterialService.Parent = this;
        this.services.set('MaterialService', this.MaterialService);

        // 5) ReplicatedFirst
        this.ReplicatedFirst = new ReplicatedFirstService();
        this.ReplicatedFirst.Parent = this;
        this.services.set('ReplicatedFirst', this.ReplicatedFirst);

        // 6) ReplicatedStorage
        this.ReplicatedStorage = new ReplicatedStorageService();
        this.ReplicatedStorage.Parent = this;
        this.services.set('ReplicatedStorage', this.ReplicatedStorage);

        // 7) ServerScriptService
        this.ServerScriptService = new ServerScriptServiceService();
        this.ServerScriptService.Parent = this;
        this.services.set('ServerScriptService', this.ServerScriptService);

        // 8) ServerStorage
        this.ServerStorage = new ServerStorageService();
        this.ServerStorage.Parent = this;
        this.services.set('ServerStorage', this.ServerStorage);

        // 9) StarterGui
        this.StarterGui = new StarterGuiService();
        this.StarterGui.Parent = this;
        this.services.set('StarterGui', this.StarterGui);

        // 10) StarterPack
        this.StarterPack = new StarterPackService();
        this.StarterPack.Parent = this;
        this.services.set('StarterPack', this.StarterPack);

        // 11) StarterPlayer (внутри StarterCharacterScripts и StarterPlayerScripts)
        this.StarterPlayer = new StarterPlayerService();
        this.StarterPlayer.Parent = this;
        this.services.set('StarterPlayer', this.StarterPlayer);

        // 12) Teams
        this.Teams = new TeamsService();
        this.Teams.Parent = this;
        this.services.set('Teams', this.Teams);

        // 13) SoundService
        this.SoundService = new SoundServiceService();
        this.SoundService.Parent = this;
        this.services.set('SoundService', this.SoundService);

        // 14) TextChatService
        this.TextChatService = new TextChatServiceService();
        this.TextChatService.Parent = this;
        this.services.set('TextChatService', this.TextChatService);

        // Core Utility & Execution Services
        this.UserInputService = new UserInputService();
        this.UserInputService.Parent = this;
        this.services.set('UserInputService', this.UserInputService);

        this.RunService = new RunService();
        this.RunService.Parent = this;
        this.services.set('RunService', this.RunService);
    }

    GetService(name) {
        if (this.services.has(name)) {
            return this.services.get(name);
        }
        return this.FindFirstChild(name);
    }

    createDefaultPlace() {
        // Clear existing workspace contents
        this.Workspace.ClearAllChildren();

        // Standard Modern Roblox Baseplate (512 x 4 x 512, dark gray with 16x16 grid Texture)
        const baseplate = new Part();
        baseplate.Name = 'Baseplate';
        baseplate.Size = new Vector3(512, 4, 512);
        baseplate.Position = new Vector3(0, -2, 0); // Top surface at y=0
        baseplate.Color = Color3.fromRGB(99, 95, 98);
        baseplate.Material = 'Plastic';
        baseplate.Anchored = true;
        baseplate.Locked = true;
        baseplate.Parent = this.Workspace;

        const texture = Instance.new('Texture');
        texture.Name = 'Texture';
        texture.Face = 'Top';
        texture.Texture = 'rbxassetid://baseplate_grid.png';
        texture.StudsPerTileU = 16;
        texture.StudsPerTileV = 16;
        texture.Parent = baseplate;

        // SpawnLocation
        const spawn = Instance.new('SpawnLocation');
        spawn.Name = 'SpawnLocation';
        spawn.Size = new Vector3(6, 1, 6);
        spawn.Position = new Vector3(0, 0.5, 0);
        spawn.Color = Color3.fromRGB(163, 162, 165);
        spawn.Material = 'Plastic';
        spawn.Anchored = true;
        spawn.Parent = this.Workspace;

        // Terrain in Workspace (permanent singleton)
        let terrain = this.Workspace.FindFirstChild('Terrain');
        if (!terrain) {
            terrain = new Terrain();
            terrain.Parent = this.Workspace;
        }

        // Clouds inside Terrain (only active when inside Terrain per specification)
        const clouds = new Clouds();
        clouds.Cover = 0.5;
        clouds.Density = 0.7;
        clouds.Color = Color3.fromRGB(255, 255, 255);
        clouds.Enabled = true;
        clouds.Parent = terrain;

        // Standard Roblox Workspace Camera
        const cam = new Camera();
        cam.Name = 'Camera';
        cam.Parent = this.Workspace;
        this.Workspace.CurrentCamera = cam;

        // Lighting effects
        this.Lighting.ClearAllChildren();

        const sky = new Sky();
        sky.Parent = this.Lighting;

        const atmo = new Atmosphere();
        atmo.Parent = this.Lighting;

        const bloom = new BloomEffect();
        bloom.Parent = this.Lighting;

        const sunrays = new SunRaysEffect();
        sunrays.Parent = this.Lighting;
    }
}

Instance.register('Workspace', WorkspaceService);
Instance.register('Players', PlayersService);
Instance.register('Lighting', LightingService);
Instance.register('MaterialService', MaterialServiceService);
Instance.register('ReplicatedFirst', ReplicatedFirstService);
Instance.register('ReplicatedStorage', ReplicatedStorageService);
Instance.register('ServerScriptService', ServerScriptServiceService);
Instance.register('ServerStorage', ServerStorageService);
Instance.register('StarterGui', StarterGuiService);
Instance.register('StarterPack', StarterPackService);
Instance.register('StarterPlayer', StarterPlayerService);
Instance.register('StarterCharacterScripts', StarterCharacterScriptsFolder);
Instance.register('StarterPlayerScripts', StarterPlayerScriptsFolder);
Instance.register('Teams', TeamsService);
Instance.register('SoundService', SoundServiceService);
Instance.register('TextChatService', TextChatServiceService);
Instance.register('UserInputService', UserInputService);
Instance.register('RunService', RunService);
Instance.register('DataModel', DataModel);
