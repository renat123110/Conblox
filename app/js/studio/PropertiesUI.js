/**
 * Conblox Properties Grid Panel
 * Replicates Roblox Studio Properties inspector with categorized fields & live two-way binding
 */

import { Vector3, Color3, CFrame } from '../engine/Math3D.js';

export class PropertiesUI {
    constructor(containerEl, dataModel, onPropertyChange) {
        this.container = containerEl;
        this.dataModel = dataModel;
        this.onPropertyChange = onPropertyChange;

        this.selectedInstance = null;
        this.collapsedSections = new Set();
        this.bodyEl = null;

        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="panel-header">
                <span class="panel-title">Properties</span>
                <span class="panel-subtitle" id="properties-target-name">Nothing Selected</span>
            </div>
            <div class="properties-filter">
                <input type="search" id="properties-filter-input" placeholder="Filter Properties (Ctrl+Shift+P)" />
            </div>
            <div class="properties-body" id="properties-body">
            </div>
        `;

        this.bodyEl = this.container.querySelector('#properties-body');
        this.container.querySelector('#properties-filter-input').addEventListener('input', (event) => {
            const query = event.target.value.trim().toLowerCase();
            this.bodyEl.querySelectorAll('.prop-row').forEach(row => {
                row.hidden = query !== '' && !row.textContent.toLowerCase().includes(query);
            });
            this.bodyEl.querySelectorAll('.properties-section').forEach(section => {
                section.hidden = query !== '' && !section.querySelector('.prop-row:not([hidden])');
            });
        });
        window.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.shiftKey && event.code === 'KeyP') {
                event.preventDefault();
                this.container.querySelector('#properties-filter-input').focus();
            }
        });
        if (window.lucide) window.lucide.createIcons({ root: this.container });
    }

    setTarget(inst) {
        if (this._changedConn) {
            this._changedConn.Disconnect();
            this._changedConn = null;
        }

        this.selectedInstance = inst;
        const nameEl = this.container.querySelector('#properties-target-name');

        if (!inst) {
            nameEl.textContent = 'Nothing Selected';
            this.bodyEl.innerHTML = '';
            return;
        }

        nameEl.textContent = `${inst.Name} (${inst.ClassName})`;
        this.render();

        if (inst.Changed) {
            this._changedConn = inst.Changed.Connect(() => {
                this.scheduleUpdateValues();
            });
        }
    }

    scheduleUpdateValues() {
        if (this._updateValuesFrame !== undefined) return;
        this._updateValuesFrame = requestAnimationFrame(() => {
            this._updateValuesFrame = undefined;
            this.updateValues();
        });
    }

    render() {
        if (!this.selectedInstance) return;
        const inst = this.selectedInstance;
        this.bodyEl.innerHTML = '';

        // 1. Data Category (Common to all)
        this.renderSection('Data', [
            { name: 'Name', type: 'string', value: inst.Name, set: (v) => inst.Name = v },
            { name: 'ClassName', type: 'readonly', value: inst.ClassName },
            { name: 'Parent', type: 'readonly', value: inst.Parent ? inst.Parent.Name : 'nil' }
        ]);

        // 2. BasePart Specific Categories
        if (inst.IsA && inst.IsA('BasePart')) {
            // Transform
            this.renderSection('Transform', [
                {
                    name: 'CFrame Position', type: 'vector3', value: inst.CFrame?.position,
                    set: (v) => {
                        inst.CFrame = new CFrame(v, inst.Orientation || new Vector3());
                        this.notifyChange();
                    }
                },
                {
                    name: 'Position', type: 'vector3', value: inst.Position,
                    set: (v) => { inst.Position = v; this.notifyChange(); }
                },
                {
                    name: 'Size', type: 'vector3', value: inst.Size,
                    set: (v) => { inst.Size = v; this.notifyChange(); }
                },
                {
                    name: 'Orientation', type: 'vector3', value: inst.Orientation,
                    set: (v) => { inst.Orientation = v; this.notifyChange(); }
                }
            ]);

            // Appearance
            this.renderSection('Appearance', [
                {
                    name: 'Color', type: 'color', value: inst.Color ? inst.Color.toHex() : '#ffffff',
                    set: (v, commit = false) => { inst.Color = Color3.fromHex(v); this.notifyChange(commit); }
                },
                {
                    name: 'Material', type: 'select', value: inst.Material,
                    options: ['Plastic', 'SmoothPlastic', 'Neon', 'Wood', 'WoodPlanks', 'Metal', 'CorrodedMetal', 'DiamondPlate', 'Foil', 'Glass', 'Concrete', 'Granite', 'Brick', 'Grass', 'Ice', 'Sand', 'Fabric', 'Marble', 'Slate'],
                    set: (v) => { inst.Material = v; this.notifyChange(); }
                },
                {
                    name: 'Transparency', type: 'number', value: inst.Transparency, min: 0, max: 1, step: 0.05,
                    set: (v) => { inst.Transparency = Number(v); this.notifyChange(); }
                },
                {
                    name: 'Reflectance', type: 'number', value: inst.Reflectance, min: 0, max: 1, step: 0.05,
                    set: (v) => { inst.Reflectance = Number(v); this.notifyChange(); }
                },
                {
                    name: 'CastShadow', type: 'bool', value: inst.CastShadow,
                    set: (v) => { inst.CastShadow = Boolean(v); this.notifyChange(); }
                }
            ]);

            // Collision & Physics
            this.renderSection('Collision', [
                {
                    name: 'Anchored', type: 'bool', value: inst.Anchored,
                    set: (v) => { inst.Anchored = Boolean(v); this.notifyChange(); }
                },
                {
                    name: 'Locked', type: 'bool', value: inst.Locked,
                    set: (v) => { inst.Locked = Boolean(v); this.notifyChange(); }
                },
                {
                    name: 'CanCollide', type: 'bool', value: inst.CanCollide,
                    set: (v) => { inst.CanCollide = Boolean(v); this.notifyChange(); }
                },
                {
                    name: 'Shape', type: 'select', value: inst.Shape,
                    options: ['Block', 'Ball', 'Cylinder', 'Wedge'],
                    set: (v) => { inst.Shape = v; this.notifyChange(); }
                }
            ]);
        }

        // 3. Lighting Category
        if (inst.ClassName === 'Lighting') {
            this.renderSection('Lighting', [
                {
                    name: 'Ambient', type: 'color', value: inst.Ambient ? inst.Ambient.toHex() : '#808080',
                    set: (v) => { inst.Ambient = Color3.fromHex(v); this.notifyChange(); }
                },
                {
                    name: 'OutdoorAmbient', type: 'color', value: inst.OutdoorAmbient ? inst.OutdoorAmbient.toHex() : '#808080',
                    set: (v) => { inst.OutdoorAmbient = Color3.fromHex(v); this.notifyChange(); }
                },
                {
                    name: 'Brightness', type: 'slider', value: inst.Brightness !== undefined ? inst.Brightness : 2, min: 0, max: 10, step: 0.1,
                    set: (v) => { inst.Brightness = Number(v); this.notifyChange(); }
                },
                {
                    name: 'ClockTime', type: 'slider', value: inst.ClockTime !== undefined ? inst.ClockTime : 14, min: 0, max: 24, step: 0.1,
                    set: (v, commit = false) => { inst.ClockTime = Number(v); this.notifyChange(commit); }
                },
                {
                    name: 'FogColor', type: 'color', value: inst.FogColor ? inst.FogColor.toHex() : '#c0d6ed',
                    set: (v) => { inst.FogColor = Color3.fromHex(v); this.notifyChange(); }
                },
                {
                    name: 'FogStart', type: 'number', value: inst.FogStart !== undefined ? inst.FogStart : 0, min: 0, max: 2000, step: 5,
                    set: (v) => { inst.FogStart = Number(v); this.notifyChange(); }
                },
                {
                    name: 'FogEnd', type: 'number', value: inst.FogEnd !== undefined ? inst.FogEnd : 1000, min: 1, max: 5000, step: 10,
                    set: (v) => { inst.FogEnd = Number(v); this.notifyChange(); }
                }
            ]);
        }

        // 4. Light Categories
        if (['PointLight', 'SpotLight', 'SurfaceLight'].includes(inst.ClassName)) {
            const lightProperties = [
                {
                    name: 'Color', type: 'color', value: inst.Color ? inst.Color.toHex() : '#ffffff',
                    set: (v, commit = false) => { inst.Color = Color3.fromHex(v); this.notifyChange(commit); }
                },
                {
                    name: 'Brightness', type: 'number', value: inst.Brightness, min: 0, max: 20, step: 0.5,
                    set: (v) => { inst.Brightness = Number(v); this.notifyChange(); }
                },
                {
                    name: 'Range', type: 'number', value: inst.Range, min: 1, max: 100, step: 1,
                    set: (v) => { inst.Range = Number(v); this.notifyChange(); }
                }
            ];
            if (inst.ClassName !== 'PointLight') {
                lightProperties.push(
                    {
                        name: 'Face', type: 'select', options: ['Back', 'Bottom', 'Front', 'Left', 'Right', 'Top'], value: inst.Face,
                        set: (v) => { inst.Face = v; this.notifyChange(); }
                    },
                    {
                        name: 'Angle', type: 'number', value: inst.Angle, min: 0, max: 180, step: 1,
                        set: (v) => { inst.Angle = Number(v); this.notifyChange(); }
                    }
                );
            }
            lightProperties.push(
                {
                    name: 'Shadows', type: 'bool', value: inst.Shadows,
                    set: (v) => { inst.Shadows = Boolean(v); this.notifyChange(); }
                },
                {
                    name: 'Enabled', type: 'bool', value: inst.Enabled,
                    set: (v) => { inst.Enabled = Boolean(v); this.notifyChange(); }
                }
            );
            this.renderSection(inst.ClassName, lightProperties);
        }

        // 5. Script Category
        if (inst.ClassName === 'Script') {
            this.renderSection('Script', [
                {
                    name: 'Enabled', type: 'bool', value: inst.Enabled,
                    set: (v) => { inst.Enabled = Boolean(v); this.notifyChange(); }
                },
                {
                    name: 'Source Code', type: 'button', label: 'Edit Script',
                    action: () => {
                        window.conbloxStudio?.openScriptEditor(inst);
                    }
                }
            ]);
        }

        // 5b. Humanoid Category
        if (inst.ClassName === 'Humanoid') {
            this.renderSection('Humanoid', [
                {
                    name: 'WalkSpeed', type: 'slider', value: inst.WalkSpeed, min: 0, max: 128, step: 1,
                    set: (v) => { inst.WalkSpeed = Number(v); this.notifyChange(); }
                },
                {
                    name: 'JumpPower', type: 'slider', value: inst.JumpPower, min: 0, max: 200, step: 1,
                    set: (v) => { inst.JumpPower = Number(v); this.notifyChange(); }
                },
                {
                    name: 'Health', type: 'slider', value: inst.Health, min: 0, max: inst.MaxHealth, step: 1,
                    set: (v) => { inst.Health = Number(v); this.notifyChange(); }
                },
                {
                    name: 'MaxHealth', type: 'number', value: inst.MaxHealth, min: 1, max: 10000, step: 1,
                    set: (v) => { inst.MaxHealth = Number(v); this.notifyChange(); }
                }
            ]);
        }

        // 6. BloomEffect Category
        if (inst.ClassName === 'BloomEffect') {
            this.renderSection('BloomEffect', [
                {
                    name: 'Enabled', type: 'bool', value: inst.Enabled,
                    set: (v) => { inst.Enabled = Boolean(v); this.notifyChange(); }
                },
                {
                    name: 'Intensity', type: 'slider', value: inst.Intensity, min: 0, max: 5, step: 0.05,
                    set: (v) => { inst.Intensity = Number(v); this.notifyChange(); }
                },
                {
                    name: 'Size', type: 'slider', value: inst.Size, min: 0, max: 56, step: 1,
                    set: (v) => { inst.Size = Number(v); this.notifyChange(); }
                },
                {
                    name: 'Threshold', type: 'slider', value: inst.Threshold, min: 0, max: 4, step: 0.05,
                    set: (v) => { inst.Threshold = Number(v); this.notifyChange(); }
                }
            ]);
        }

        // 7. Atmosphere Category
        if (inst.ClassName === 'Atmosphere') {
            this.renderSection('Atmosphere', [
                {
                    name: 'Density', type: 'slider', value: inst.Density, min: 0, max: 1, step: 0.01,
                    set: (v) => { inst.Density = Number(v); this.notifyChange(); }
                },
                {
                    name: 'Offset', type: 'slider', value: inst.Offset, min: 0, max: 1, step: 0.01,
                    set: (v) => { inst.Offset = Number(v); this.notifyChange(); }
                },
                {
                    name: 'Color', type: 'color', value: inst.Color ? inst.Color.toHex() : '#ffffff',
                    set: (v, commit = false) => { inst.Color = Color3.fromHex(v); this.notifyChange(commit); }
                },
                {
                    name: 'Decay', type: 'color', value: inst.Decay.toHex(),
                    set: (v) => { inst.Decay = Color3.fromHex(v); this.notifyChange(); }
                },
                {
                    name: 'Glare', type: 'slider', value: inst.Glare, min: 0, max: 1, step: 0.05,
                    set: (v) => { inst.Glare = Number(v); this.notifyChange(); }
                },
                {
                    name: 'Haze', type: 'slider', value: inst.Haze, min: 0, max: 10, step: 0.1,
                    set: (v) => { inst.Haze = Number(v); this.notifyChange(); }
                }
            ]);
        }

        // 8. DepthOfFieldEffect Category
        if (inst.ClassName === 'DepthOfFieldEffect') {
            this.renderSection('DepthOfFieldEffect', [
                {
                    name: 'Enabled', type: 'bool', value: inst.Enabled,
                    set: (v) => { inst.Enabled = Boolean(v); this.notifyChange(); }
                },
                {
                    name: 'FocusDistance', type: 'slider', value: inst.FocusDistance, min: 0, max: 200, step: 1,
                    set: (v) => { inst.FocusDistance = Number(v); this.notifyChange(); }
                },
                {
                    name: 'InFocusRadius', type: 'slider', value: inst.InFocusRadius, min: 0, max: 100, step: 1,
                    set: (v) => { inst.InFocusRadius = Number(v); this.notifyChange(); }
                },
                {
                    name: 'NearIntensity', type: 'slider', value: inst.NearIntensity, min: 0, max: 1, step: 0.05,
                    set: (v) => { inst.NearIntensity = Number(v); this.notifyChange(); }
                },
                {
                    name: 'FarIntensity', type: 'slider', value: inst.FarIntensity, min: 0, max: 1, step: 0.05,
                    set: (v) => { inst.FarIntensity = Number(v); this.notifyChange(); }
                }
            ]);
        }

        // 9. SunRaysEffect Category
        if (inst.ClassName === 'SunRaysEffect') {
            this.renderSection('SunRaysEffect', [
                {
                    name: 'Enabled', type: 'bool', value: inst.Enabled,
                    set: (v) => { inst.Enabled = Boolean(v); this.notifyChange(); }
                },
                {
                    name: 'Intensity', type: 'slider', value: inst.Intensity, min: 0, max: 1, step: 0.02,
                    set: (v) => { inst.Intensity = Number(v); this.notifyChange(); }
                },
                {
                    name: 'Spread', type: 'slider', value: inst.Spread, min: 0, max: 1, step: 0.02,
                    set: (v) => { inst.Spread = Number(v); this.notifyChange(); }
                }
            ]);
        }

        // 10. Sky / SkyBox Category
        if (inst.ClassName === 'Sky' || inst.ClassName === 'SkyBox') {
            this.renderSection('Sky / SkyBox', [
                {
                    name: 'Preset', type: 'enum',
                    options: ['Classic Roblox', 'Realistic Atmosphere', 'Sunset', 'Night Sky', 'Overcast', 'Custom'],
                    value: inst.Preset || 'Classic Roblox',
                    set: (v) => { inst.Preset = v; this.notifyChange(); }
                },
                {
                    name: 'CelestialBodiesShown', type: 'bool', value: inst.CelestialBodiesShown,
                    set: (v) => { inst.CelestialBodiesShown = Boolean(v); this.notifyChange(); }
                },
                {
                    name: 'SunAngularSize', type: 'slider', value: inst.SunAngularSize, min: 0, max: 60, step: 1,
                    set: (v) => { inst.SunAngularSize = Number(v); this.notifyChange(); }
                },
                {
                    name: 'MoonAngularSize', type: 'slider', value: inst.MoonAngularSize, min: 0, max: 60, step: 1,
                    set: (v) => { inst.MoonAngularSize = Number(v); this.notifyChange(); }
                },
                {
                    name: 'StarCount', type: 'slider', value: inst.StarCount, min: 0, max: 8000, step: 100,
                    set: (v) => { inst.StarCount = Number(v); this.notifyChange(); }
                },
                {
                    name: 'SkyboxBk', type: 'string', value: inst.SkyboxBk,
                    set: (v) => { inst.SkyboxBk = v; this.notifyChange(); }
                },
                {
                    name: 'SkyboxDn', type: 'string', value: inst.SkyboxDn,
                    set: (v) => { inst.SkyboxDn = v; this.notifyChange(); }
                },
                {
                    name: 'SkyboxFt', type: 'string', value: inst.SkyboxFt,
                    set: (v) => { inst.SkyboxFt = v; this.notifyChange(); }
                },
                {
                    name: 'SkyboxLf', type: 'string', value: inst.SkyboxLf,
                    set: (v) => { inst.SkyboxLf = v; this.notifyChange(); }
                },
                {
                    name: 'SkyboxRt', type: 'string', value: inst.SkyboxRt,
                    set: (v) => { inst.SkyboxRt = v; this.notifyChange(); }
                },
                {
                    name: 'SkyboxUp', type: 'string', value: inst.SkyboxUp,
                    set: (v) => { inst.SkyboxUp = v; this.notifyChange(); }
                }
            ]);
        }

        // 11. Clouds Category
        if (inst.ClassName === 'Clouds') {
            this.renderSection('Clouds', [
                {
                    name: 'Enabled', type: 'bool', value: inst.Enabled,
                    set: (v) => { inst.Enabled = Boolean(v); this.notifyChange(); }
                },
                {
                    name: 'Speed', type: 'slider', value: (inst.Speed !== undefined ? inst.Speed : 1.0), min: 0, max: 5, step: 0.1,
                    set: (v) => { inst.Speed = Number(v); this.notifyChange(); }
                },
                {
                    name: 'Cover', type: 'slider', value: inst.Cover, min: 0, max: 1, step: 0.02,
                    set: (v) => { inst.Cover = Number(v); this.notifyChange(); }
                },
                {
                    name: 'Density', type: 'slider', value: inst.Density, min: 0, max: 1, step: 0.02,
                    set: (v) => { inst.Density = Number(v); this.notifyChange(); }
                },
                {
                    name: 'Color', type: 'color', value: inst.Color.toHex(),
                    set: (v) => { inst.Color = Color3.fromHex(v); this.notifyChange(); }
                }
            ]);
        }

        // 12. Decal & Texture Category
        if (inst.ClassName === 'Decal' || inst.ClassName === 'Texture') {
            const isTexture = inst.ClassName === 'Texture';
            this.renderSection(isTexture ? 'Texture' : 'Decal', [
                {
                    name: 'Texture', type: 'string', value: inst.Texture,
                    set: (v) => { inst.Texture = v; this.notifyChange(); }
                },
                {
                    name: 'Face', type: 'select', options: ['Back', 'Bottom', 'Front', 'Left', 'Right', 'Top'], value: inst.Face || 'Front',
                    set: (v) => { inst.Face = v; this.notifyChange(); }
                },
                {
                    name: 'Transparency', type: 'number', value: inst.Transparency, min: 0, max: 1, step: 0.1,
                    set: (v) => { inst.Transparency = Number(v); this.notifyChange(); }
                },
                {
                    name: 'Color', type: 'color', value: inst.Color.toHex(),
                    set: (v) => { inst.Color = Color3.fromHex(v); this.notifyChange(); }
                }
            ]);
            if (isTexture) {
                this.renderSection('Texture Tiling', [
                    {
                        name: 'StudsPerTileU', type: 'number', value: inst.StudsPerTileU, min: 0.1, step: 0.5,
                        set: (v) => { inst.StudsPerTileU = Number(v); this.notifyChange(); }
                    },
                    {
                        name: 'StudsPerTileV', type: 'number', value: inst.StudsPerTileV, min: 0.1, step: 0.5,
                        set: (v) => { inst.StudsPerTileV = Number(v); this.notifyChange(); }
                    }
                ]);
            }
        }

        // 13. Sound Category
        if (inst.ClassName === 'Sound') {
            this.renderSection('Sound', [
                {
                    name: 'SoundId', type: 'string', value: inst.SoundId,
                    set: (v) => { inst.SoundId = v; this.notifyChange(); }
                },
                {
                    name: 'Playing', type: 'bool', value: inst.Playing,
                    set: (v) => { inst.Playing = Boolean(v); this.notifyChange(); }
                },
                {
                    name: 'Looped', type: 'bool', value: inst.Looped,
                    set: (v) => { inst.Looped = Boolean(v); this.notifyChange(); }
                },
                {
                    name: 'Volume', type: 'number', value: inst.Volume, min: 0, max: 1, step: 'any',
                    set: (v) => { inst.Volume = Number(v); this.notifyChange(); }
                },
                {
                    name: 'PlaybackSpeed', type: 'number', value: inst.PlaybackSpeed, min: 0.1, max: 16, step: 'any',
                    set: (v) => { inst.PlaybackSpeed = Number(v); this.notifyChange(); }
                },
                {
                    name: 'TimePosition', type: 'number', value: inst.TimePosition, min: 0, step: 'any',
                    set: (v) => { inst.TimePosition = Number(v); this.notifyChange(); }
                },
                {
                    name: 'Preview', type: 'button', label: inst.Playing ? 'Stop' : 'Play',
                    action: () => {
                        if (inst.Playing) inst.Stop();
                        else inst.Play();
                        this.updateValues();
                    }
                }
            ]);
        }

        // 14. Model Category
        if (inst.ClassName === 'Model') {
            this.renderSection('Model', [
                {
                    name: 'PrimaryPart',
                    type: 'string',
                    value: inst.PrimaryPart ? inst.PrimaryPart.Name : '(None)',
                    set: (v) => {
                        const target = inst.FindFirstChild(v, true);
                        if (target && target.IsA('BasePart')) {
                            inst.PrimaryPart = target;
                        } else if (!v || v === '(None)') {
                            inst.PrimaryPart = null;
                        }
                        this.notifyChange();
                    }
                }
            ]);
        }

        // 15. Joint & Constraint Category (Weld, WeldConstraint, WeldConstant, Motor6D)
        const isJoint = inst.ClassName === 'Weld' || inst.ClassName === 'WeldConstraint' || inst.ClassName === 'WeldConstant' || inst.ClassName === 'Motor6D';
        if (isJoint) {
            const allParts = this.dataModel.GetDescendants ? this.dataModel.GetDescendants().filter(i => i.IsA && i.IsA('BasePart')) : [];

            const rows = [
                {
                    name: 'Part0',
                    type: 'instance_ref',
                    value: inst.Part0 ? inst.Part0.Name : '(None)',
                    get: () => inst.Part0 ? inst.Part0.Name : '',
                    set: (v) => {
                        if (!v) {
                            inst.Part0 = null;
                        } else if (v.IsA && v.IsA('BasePart') && allParts.includes(v)) {
                            inst.Part0 = v;
                        }
                        this.notifyChange();
                    }
                },
                {
                    name: 'Part1',
                    type: 'instance_ref',
                    value: inst.Part1 ? inst.Part1.Name : '(None)',
                    get: () => inst.Part1 ? inst.Part1.Name : '',
                    set: (v) => {
                        if (!v) {
                            inst.Part1 = null;
                        } else if (v.IsA && v.IsA('BasePart') && allParts.includes(v)) {
                            inst.Part1 = v;
                        }
                        this.notifyChange();
                    }
                },
                {
                    name: 'Enabled',
                    type: 'bool',
                    value: inst.Enabled,
                    set: (v) => { inst.Enabled = Boolean(v); this.notifyChange(); }
                }
            ];

            if (inst.ClassName === 'Weld' || inst.ClassName === 'Motor6D') {
                rows.push(
                    {
                        name: 'C0 Position',
                        type: 'vector3',
                        value: inst.C0 ? inst.C0.position : new Vector3(),
                        set: (v) => {
                            const ori = inst.C0 ? inst.C0.orientation : new Vector3();
                            inst.C0 = new CFrame(v, ori);
                            this.notifyChange();
                        }
                    },
                    {
                        name: 'C1 Position',
                        type: 'vector3',
                        value: inst.C1 ? inst.C1.position : new Vector3(),
                        set: (v) => {
                            const ori = inst.C1 ? inst.C1.orientation : new Vector3();
                            inst.C1 = new CFrame(v, ori);
                            this.notifyChange();
                        }
                    },
                    {
                        name: 'C0 Orientation',
                        type: 'vector3',
                        value: inst.C0 ? inst.C0.orientation : new Vector3(),
                        set: (v) => {
                            const position = inst.C0 ? inst.C0.position : new Vector3();
                            inst.C0 = new CFrame(position, v);
                            this.notifyChange();
                        }
                    },
                    {
                        name: 'C1 Orientation',
                        type: 'vector3',
                        value: inst.C1 ? inst.C1.orientation : new Vector3(),
                        set: (v) => {
                            const position = inst.C1 ? inst.C1.position : new Vector3();
                            inst.C1 = new CFrame(position, v);
                            this.notifyChange();
                        }
                    }
                );
            }

            if (inst.ClassName === 'Motor6D') {
                rows.push(
                    {
                        name: 'CurrentAngle',
                        type: 'number',
                        value: inst.CurrentAngle,
                        step: 'any',
                        set: (v) => { inst.CurrentAngle = Number(v); this.notifyChange(); }
                    },
                    {
                        name: 'DesiredAngle',
                        type: 'number',
                        value: inst.DesiredAngle,
                        step: 'any',
                        set: (v) => { inst.DesiredAngle = Number(v); this.notifyChange(); }
                    },
                    {
                        name: 'MaxVelocity',
                        type: 'number',
                        value: inst.MaxVelocity,
                        step: 'any',
                        set: (v) => { inst.MaxVelocity = Number(v); this.notifyChange(); }
                    }
                );
            }

            this.renderSection(inst.ClassName, rows);
        }

        if (inst.ClassName === 'KeyframeSequence') {
            this.renderSection('Animation', [
                { name: 'Loop', type: 'bool', value: inst.Loop, set: (value) => { inst.Loop = value; this.notifyChange(); } },
                { name: 'Priority', type: 'string', value: inst.Priority, set: (value) => { inst.Priority = value; this.notifyChange(); } },
                { name: 'Duration', type: 'number', value: inst.Duration, min: 0, step: 0.01, set: (value) => { inst.Duration = Number(value); this.notifyChange(); } },
                { name: 'Length', type: 'readonly', value: inst.Length }
            ]);
        }

        if (inst.ClassName === 'Keyframe') {
            this.renderSection('Keyframe', [
                { name: 'Time', type: 'number', value: inst.Time, min: 0, step: 0.01, set: (value) => { inst.Time = Number(value); this.notifyChange(); } },
                {
                    name: 'Position',
                    type: 'vector3',
                    value: inst.Position,
                    set: (value) => { inst.CFrame = new CFrame(value, inst.Orientation); this.notifyChange(); }
                },
                {
                    name: 'Orientation',
                    type: 'vector3',
                    value: inst.Orientation,
                    set: (value) => { inst.CFrame = new CFrame(inst.Position, value); this.notifyChange(); }
                }
            ]);
        }

        // 16. Camera
        if (inst.ClassName === 'Camera') {
            this.renderSection('Transform', [
                {
                    name: 'Position', type: 'vector3', value: inst.Position || inst.CFrame?.position,
                    set: (v) => {
                        inst.Position = v;
                        if (window.conbloxStudio?.viewport) {
                            window.conbloxStudio.viewport.cameraPos.set(v.x, v.y, v.z);
                            window.conbloxStudio.viewport.camera.position.set(v.x, v.y, v.z);
                        }
                        this.notifyChange();
                    }
                },
                {
                    name: 'Orientation', type: 'vector3', value: inst.Orientation || inst.CFrame?.orientation,
                    set: (v) => {
                        inst.Orientation = v;
                        this.notifyChange();
                    }
                }
            ]);
            this.renderSection('Camera', [
                {
                    name: 'FieldOfView', type: 'number', value: inst.FieldOfView, min: 1, max: 120, step: 1,
                    set: (v) => {
                        inst.FieldOfView = Number(v);
                        if (window.conbloxStudio?.viewport?.camera) {
                            window.conbloxStudio.viewport.camera.fov = Number(v);
                            window.conbloxStudio.viewport.camera.updateProjectionMatrix();
                        }
                        this.notifyChange();
                    }
                },
                {
                    name: 'CameraType', type: 'select', options: ['Custom', 'Fixed', 'Scriptable', 'Follow', 'Track', 'Watch'], value: inst.CameraType,
                    set: (v) => { inst.CameraType = v; this.notifyChange(); }
                },
                {
                    name: 'CameraSubject', type: 'instance_ref',
                    value: inst.CameraSubject ? inst.CameraSubject.Name : '',
                    get: () => inst.CameraSubject ? inst.CameraSubject.Name : '',
                    set: (target) => {
                        inst.CameraSubject = target;
                        this.notifyChange(true);
                    }
                },
                {
                    name: 'HeadLocked', type: 'bool', value: inst.HeadLocked,
                    set: (v) => { inst.HeadLocked = Boolean(v); this.notifyChange(); }
                }
            ]);
        }

        if (window.lucide) window.lucide.createIcons({ root: this.bodyEl });
    }

    notifyChange(commit = false) {
        if (this.onPropertyChange && this.selectedInstance) {
            this.onPropertyChange(this.selectedInstance, commit);
        }
    }

    renderSection(title, rows) {
        const isCollapsed = this.collapsedSections.has(title);

        const sectionEl = document.createElement('div');
        sectionEl.className = 'properties-section';

        const headerEl = document.createElement('div');
        headerEl.className = 'section-header' + (isCollapsed ? ' collapsed' : '');
        headerEl.innerHTML = `
            <i data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-down'}" class="section-chevron"></i>
            <span>${title}</span>
        `;
        headerEl.addEventListener('click', () => {
            if (this.collapsedSections.has(title)) {
                this.collapsedSections.delete(title);
            } else {
                this.collapsedSections.add(title);
            }
            this.render();
        });
        sectionEl.appendChild(headerEl);

        if (!isCollapsed) {
            const contentEl = document.createElement('div');
            contentEl.className = 'section-content';

            for (const row of rows) {
                const origSet = row.set;
                if (origSet) {
                    row.set = (v, commit = true) => {
                        origSet(v, commit);
                        const selSet = window.conbloxStudio?.explorerUI?.selectedInstances;
                        if (selSet && selSet.size > 1) {
                            for (const other of selSet) {
                                if (other && other !== this.selectedInstance) {
                                    const propName = row.propName || row.name;
                                    try {
                                        if (propName in other || other[propName] !== undefined) {
                                            if (row.type === 'bool') other[propName] = Boolean(v);
                                            else if (row.type === 'number' || row.type === 'slider') other[propName] = Number(v);
                                            else if (row.type === 'color') other[propName] = (typeof v === 'string' ? Color3.fromHex(v) : v);
                                            else other[propName] = v;

                                            if (window.conbloxStudio?.viewport && other.IsA && other.IsA('BasePart')) {
                                                window.conbloxStudio.viewport.syncPartMesh(other);
                                            }
                                        }
                                    } catch (err) {}
                                }
                            }
                        }
                    };
                }

                const rowEl = document.createElement('div');
                rowEl.className = 'prop-row';
                rowEl.dataset.prop = row.name;

                const labelEl = document.createElement('div');
                labelEl.className = 'prop-name';
                labelEl.textContent = row.name;
                rowEl.appendChild(labelEl);

                const valueEl = document.createElement('div');
                valueEl.className = 'prop-value';

                if (row.type === 'readonly') {
                    valueEl.innerHTML = `<span class="prop-readonly">${row.value}</span>`;
                } else if (row.type === 'string') {
                    const isImageProp = (row.name === 'Texture' || row.name.startsWith('Skybox'));
                    const isAudioProp = (row.name === 'SoundId');

                    const wrapper = document.createElement('div');
                    wrapper.className = 'prop-asset-input-wrapper';
                    wrapper.style.display = 'flex';
                    wrapper.style.alignItems = 'center';
                    wrapper.style.gap = '4px';
                    wrapper.style.width = '100%';

                    const input = document.createElement('input');
                    input.type = 'text';
                    input.dataset.prop = row.name;
                    input.className = 'prop-input' + (isImageProp ? ' prop-input-texture' : '');
                    input.value = row.value || '';
                    input.placeholder = isImageProp ? 'Drop image here or URL...' : (isAudioProp ? 'Drop audio here...' : '');
                    input.addEventListener('change', (e) => row.set(e.target.value));
                    wrapper.appendChild(input);

                    if (isImageProp || isAudioProp) {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = isImageProp ? 'image/*' : 'audio/*';
                        fileInput.style.display = 'none';

                        fileInput.addEventListener('change', (e) => {
                            const file = e.target.files && e.target.files[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                                const dataUrl = ev.target.result;
                                input.value = dataUrl;
                                row.set(dataUrl);
                                window.conbloxStudio?.historyManager?.recordState();
                                window.conbloxStudio?.outputUI?.log('info', `Applied ${isImageProp ? 'image' : 'audio'} "${file.name}" to ${row.name}`);
                            };
                            reader.readAsDataURL(file);
                        });

                        const browseBtn = document.createElement('button');
                        browseBtn.type = 'button';
                        browseBtn.className = 'prop-browse-btn';
                        browseBtn.title = isImageProp ? 'Choose image file...' : 'Choose audio file...';
                        browseBtn.style.padding = '3px 6px';
                        browseBtn.style.background = '#2b2d35';
                        browseBtn.style.border = '1px solid #444755';
                        browseBtn.style.borderRadius = '3px';
                        browseBtn.style.color = '#ccc';
                        browseBtn.style.cursor = 'pointer';
                        browseBtn.style.display = 'flex';
                        browseBtn.style.alignItems = 'center';
                        browseBtn.innerHTML = `<i data-lucide="${isImageProp ? 'image' : 'volume-2'}" style="width:14px;height:14px;"></i>`;
                        browseBtn.addEventListener('click', () => fileInput.click());

                        wrapper.appendChild(browseBtn);
                        wrapper.appendChild(fileInput);

                        // Drag & Drop handlers on input & row
                        const handleDropTarget = (targetEl) => {
                            targetEl.addEventListener('dragover', (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.dataTransfer.dropEffect = 'copy';
                                targetEl.style.outline = '2px solid #00a2ff';
                            });
                            targetEl.addEventListener('dragleave', (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                targetEl.style.outline = '';
                            });
                            targetEl.addEventListener('drop', (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                targetEl.style.outline = '';
                                const file = e.dataTransfer.files && e.dataTransfer.files[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                    const dataUrl = ev.target.result;
                                    input.value = dataUrl;
                                    row.set(dataUrl);
                                    window.conbloxStudio?.historyManager?.recordState();
                                    window.conbloxStudio?.outputUI?.log('info', `Applied ${isImageProp ? 'image' : 'audio'} "${file.name}" to ${row.name}`);
                                };
                                reader.readAsDataURL(file);
                            });
                        };

                        handleDropTarget(input);
                        handleDropTarget(rowEl);
                    }

                    valueEl.appendChild(wrapper);
                } else if (row.type === 'slider') {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'prop-slider-wrapper';
                    wrapper.style.display = 'flex';
                    wrapper.style.alignItems = 'center';
                    wrapper.style.gap = '8px';
                    wrapper.style.width = '100%';

                    const input = document.createElement('input');
                    input.type = 'number';
                    input.className = 'prop-input prop-input-num';
                    input.style.width = '55px';
                    input.style.flexShrink = '0';
                    input.dataset.prop = row.name;
                    if (row.min !== undefined) input.min = row.min;
                    if (row.max !== undefined) input.max = row.max;
                    input.step = row.step !== undefined ? row.step : 'any';

                    const rawVal = Number(row.value);
                    const formatted = isNaN(rawVal) ? '0' : (Number.isInteger(rawVal) ? rawVal.toString() : parseFloat(rawVal.toFixed(3)).toString());
                    input.value = formatted;

                    const slider = document.createElement('input');
                    slider.type = 'range';
                    slider.className = 'prop-range-slider';
                    slider.style.flex = '1';
                    slider.style.cursor = 'pointer';
                    slider.style.accentColor = '#00a2ff';
                    slider.style.height = '4px';
                    slider.min = row.min !== undefined ? row.min : 0;
                    slider.max = row.max !== undefined ? row.max : 24;
                    slider.step = row.step !== undefined ? row.step : 0.1;
                    slider.value = isNaN(rawVal) ? '14' : rawVal;

                    slider.addEventListener('input', (e) => {
                        const val = parseFloat(e.target.value);
                        input.value = val;
                        row.set(val, false);
                    });
                    slider.addEventListener('change', (e) => {
                        const val = parseFloat(e.target.value);
                        input.value = val;
                        row.set(val, true);
                    });

                    input.addEventListener('input', (e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                            slider.value = val;
                            row.set(val, false);
                        }
                    });
                    input.addEventListener('change', (e) => {
                        const val = parseFloat(input.value);
                        if (!isNaN(val)) {
                            slider.value = val;
                            row.set(val, true);
                        }
                    });

                    wrapper.appendChild(input);
                    wrapper.appendChild(slider);
                    valueEl.appendChild(wrapper);
                } else if (row.type === 'number') {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.className = 'prop-input prop-input-num';
                    input.dataset.prop = row.name;
                    if (row.min !== undefined) input.min = row.min;
                    if (row.max !== undefined) input.max = row.max;
                    input.step = 'any';

                    const rawVal = Number(row.value);
                    if (isNaN(rawVal)) {
                        input.value = '0';
                    } else if (Number.isInteger(rawVal)) {
                        input.value = rawVal.toString();
                    } else {
                        input.value = parseFloat(rawVal.toFixed(4)).toString();
                    }

                    const updateNum = (e, commit = false) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) row.set(val, commit);
                    };
                    input.addEventListener('input', (e) => updateNum(e, false));
                    input.addEventListener('change', (e) => updateNum(e, true));
                    valueEl.appendChild(input);
                } else if (row.type === 'bool') {
                    const cb = document.createElement('input');
                    cb.type = 'checkbox';
                    cb.className = 'prop-checkbox';
                    cb.checked = Boolean(row.value);
                    cb.addEventListener('change', (e) => row.set(e.target.checked, true));
                    valueEl.appendChild(cb);
                } else if (row.type === 'color') {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'prop-color-wrapper';
                    const colorInput = document.createElement('input');
                    colorInput.type = 'color';
                    colorInput.className = 'prop-color-picker';
                    colorInput.value = row.value;
                    const hexInput = document.createElement('input');
                    hexInput.type = 'text';
                    hexInput.className = 'prop-input prop-input-hex';
                    hexInput.value = row.value;

                    colorInput.addEventListener('input', (e) => {
                        hexInput.value = e.target.value;
                        row.set(e.target.value, false); // live visual preview, no undo history flood
                    });
                    colorInput.addEventListener('change', (e) => {
                        hexInput.value = e.target.value;
                        row.set(e.target.value, true); // single commit to history on release
                    });
                    hexInput.addEventListener('input', (e) => {
                        colorInput.value = e.target.value;
                        row.set(e.target.value, false);
                    });
                    hexInput.addEventListener('change', (e) => {
                        colorInput.value = e.target.value;
                        row.set(e.target.value, true); // single commit to history
                    });

                    wrapper.appendChild(colorInput);
                    wrapper.appendChild(hexInput);
                    valueEl.appendChild(wrapper);
                } else if (row.type === 'select' || row.type === 'enum') {
                    const sel = document.createElement('select');
                    sel.className = 'prop-input prop-select';
                    sel.dataset.prop = row.name;
                    for (const opt of (row.options || [])) {
                        const optEl = document.createElement('option');
                        optEl.value = opt;
                        optEl.textContent = opt;
                        if (opt === row.value) optEl.selected = true;
                        sel.appendChild(optEl);
                    }
                    sel.addEventListener('change', (e) => {
                        row.set(e.target.value);
                        window.conbloxStudio?.historyManager?.recordState();
                    });
                    valueEl.appendChild(sel);
                } else if (row.type === 'vector3') {
                    const vec = row.value || new Vector3();
                    const vecWrapper = document.createElement('div');
                    vecWrapper.className = 'prop-vector3-wrapper';

                    const axes = ['X', 'Y', 'Z'];
                    const keys = ['x', 'y', 'z'];
                    const inputs = {};

                    axes.forEach((axis, idx) => {
                        const key = keys[idx];
                        const axisBox = document.createElement('div');
                        axisBox.className = `axis-box axis-${axis.toLowerCase()}`;
                        axisBox.innerHTML = `<span class="axis-badge">${axis}</span>`;

                        const inp = document.createElement('input');
                        inp.type = 'number';
                        inp.step = 'any';
                        inp.className = 'axis-input';
                        const numVal = Number(vec[key]) || 0;
                        inp.value = Number.isInteger(numVal) ? numVal.toString() : parseFloat(numVal.toFixed(4)).toString();
                        inputs[key] = inp;

                        inp.addEventListener('change', () => {
                            const newVec = new Vector3(
                                parseFloat(inputs.x.value) || 0,
                                parseFloat(inputs.y.value) || 0,
                                parseFloat(inputs.z.value) || 0
                            );
                            row.set(newVec);
                        });

                        axisBox.appendChild(inp);
                        vecWrapper.appendChild(axisBox);
                    });
                    valueEl.appendChild(vecWrapper);
                } else if (row.type === 'button') {
                    const btn = document.createElement('button');
                    btn.className = 'prop-btn';
                    btn.textContent = row.label;
                    btn.addEventListener('click', row.action);
                    valueEl.appendChild(btn);
                } else if (row.type === 'instance_ref') {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'prop-ref-wrapper';
                    wrapper.style.display = 'flex';
                    wrapper.style.alignItems = 'center';
                    wrapper.style.gap = '4px';
                    wrapper.style.width = '100%';

                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'prop-ref-btn';
                    btn.style.flex = '1';
                    btn.style.textAlign = 'left';
                    btn.style.background = '#22252a';
                    btn.style.border = '1px solid #3c404b';
                    btn.style.borderRadius = '3px';
                    btn.style.padding = '3px 8px';
                    btn.style.color = row.value ? '#55b5ff' : '#888';
                    btn.style.fontSize = '12px';
                    btn.style.cursor = 'pointer';
                    btn.textContent = row.value || '[None]';

                    let isPicking = false;

                    const cleanup = () => {
                        isPicking = false;
                        document.body.style.cursor = 'default';
                        btn.style.borderColor = '#3c404b';
                        const currentVal = row.get ? row.get() : (row.value || '');
                        btn.textContent = currentVal || '[None]';
                        btn.style.color = currentVal ? '#55b5ff' : '#888';
                        window.removeEventListener('click', onWinClick, true);
                        window.removeEventListener('keydown', onEsc, true);
                        window._instancePickCallback = null;
                    };

                    const pickHandler = (target) => {
                        if (target) {
                            row.set(target);
                            btn.textContent = target.Name || target.ClassName;
                            btn.style.color = '#55b5ff';
                        }
                        cleanup();
                    };

                    const onWinClick = (we) => {
                        if (we.target === btn || btn.contains(we.target)) return;
                        if (we.target.closest && (we.target.closest('#explorer') || we.target.closest('.explorer-tree') || we.target.closest('.explorer-node'))) {
                            return;
                        }
                        const vp = window.conbloxStudio?.viewport;
                        const clickedPart = vp ? vp.raycast(we.clientX, we.clientY, false) : null;
                        if (clickedPart) {
                            we.stopPropagation();
                            we.preventDefault();
                            pickHandler(clickedPart);
                        } else {
                            cleanup();
                        }
                    };

                    const onEsc = (ke) => {
                        if (ke.code === 'Escape') cleanup();
                    };

                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (isPicking) {
                            cleanup();
                            return;
                        }
                        isPicking = true;
                        btn.textContent = 'Click object to select...';
                        btn.style.borderColor = '#00a2ff';
                        btn.style.color = '#00a2ff';
                        document.body.style.cursor = 'crosshair';

                        window._instancePickCallback = pickHandler;
                        setTimeout(() => {
                            window.addEventListener('click', onWinClick, true);
                            window.addEventListener('keydown', onEsc, true);
                        }, 50);
                    });

                    const clearBtn = document.createElement('button');
                    clearBtn.type = 'button';
                    clearBtn.className = 'prop-ref-clear-btn';
                    clearBtn.title = 'Clear';
                    clearBtn.style.background = '#2b2d35';
                    clearBtn.style.border = '1px solid #444755';
                    clearBtn.style.borderRadius = '3px';
                    clearBtn.style.color = '#888';
                    clearBtn.style.cursor = 'pointer';
                    clearBtn.style.padding = '3px 6px';
                    clearBtn.innerHTML = '<i data-lucide="x" style="width:12px;height:12px;"></i>';
                    clearBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        row.set(null);
                        btn.textContent = '[None]';
                        btn.style.color = '#888';
                    });

                    wrapper.appendChild(btn);
                    wrapper.appendChild(clearBtn);
                    valueEl.appendChild(wrapper);
                }

                rowEl.appendChild(valueEl);
                contentEl.appendChild(rowEl);
            }

            sectionEl.appendChild(contentEl);
        }

        this.bodyEl.appendChild(sectionEl);
    }

    // Refresh active values without re-rendering everything if an input is focused
    updateValues() {
        if (!this.selectedInstance) return;
        if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
        this.render();
    }
}
