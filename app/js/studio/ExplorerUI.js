/**
 * Conblox Explorer Tree Panel
 * Replicates Roblox Studio Explorer hierarchy, search, hover '+' Insert Object popup, and context menu
 */

import { Instance } from '../engine/Instance.js';
import { Part, SpawnLocation } from '../engine/BasePart.js';
import { Model, Folder, Tool, Script, LocalScript, ModuleScript, PointLight, SpotLight, SurfaceLight, Humanoid, BloomEffect, Atmosphere, DepthOfFieldEffect, SunRaysEffect, Sky, SkyBox, Clouds, Decal, Texture, Sound, Weld, WeldConstraint, WeldConstant, Motor6D, Keyframe, KeyframeSequence, SpecialMesh, CharacterMesh, Shirt, Pants } from '../engine/OtherInstances.js';
import { TemplateManager } from './TemplateManager.js';
import { Vector3, Color3 } from '../engine/Math3D.js';

const EXPLORER_HIDDEN_CLASSES = new Set(['Keyframe', 'Pose']);

export class ExplorerUI {
    constructor(containerEl, dataModel, onSelect, onOpenScript) {
        this.container = containerEl;
        this._dataModel = null;
        this.onSelect = onSelect;
        this.onOpenScript = onOpenScript;

        this.selectedInstance = null;
        this.selectedInstances = new Set();
        this.anchorInstance = null;
        this.draggedInstances = null;
        this.collapsedNodes = new Set();
        this.filterText = '';
        this.treeContainer = null;
        this.contextMenuEl = null;
        this.insertPopupEl = null;
        this.insertTargetInst = null;

        this.init();
        if (dataModel) this.setDataModel(dataModel);
    }

    init() {
        this.container.innerHTML = `
            <div class="panel-header">
                <span class="panel-title">Explorer</span>
                <div class="panel-header-actions">
                    <button class="panel-action-btn" id="explorer-collapse-all" title="Collapse All">
                        <i data-lucide="minimize-2"></i>
                    </button>
                    <button class="panel-action-btn" id="explorer-expand-all" title="Expand All">
                        <i data-lucide="maximize-2"></i>
                    </button>
                </div>
            </div>
            <div class="explorer-search-bar">
                <i data-lucide="search" class="search-icon"></i>
                <input type="text" id="explorer-search-input" placeholder="Search Explorer..." />
            </div>
            <div class="explorer-tree" id="explorer-tree-root"></div>
        `;

        this.treeContainer = this.container.querySelector('#explorer-tree-root');
        const searchInput = this.container.querySelector('#explorer-search-input');
        searchInput.addEventListener('input', (e) => {
            this.filterText = e.target.value.toLowerCase().trim();
            this.render();
        });

        this.container.querySelector('#explorer-collapse-all').addEventListener('click', () => {
            const all = this.dataModel.GetDescendants();
            for (const item of all) {
                if (EXPLORER_HIDDEN_CLASSES.has(item.ClassName)) continue;
                if (item.GetChildren().some(c => !EXPLORER_HIDDEN_CLASSES.has(c.ClassName))) {
                    this.collapsedNodes.add(item.id);
                }
            }
            this.render();
        });

        this.container.querySelector('#explorer-expand-all').addEventListener('click', () => {
            this.collapsedNodes.clear();
            this.render();
        });

        // Create Context Menu and Insert Popup
        this.createContextMenu();
        this.createInsertPopup();

        if (window.lucide) window.lucide.createIcons({ root: this.container });
    }

    get dataModel() {
        return this._dataModel;
    }

    set dataModel(dm) {
        this.setDataModel(dm);
    }

    setDataModel(dm) {
        this._dataModel = dm;
        if (!dm) return;

        if (this._dmDescendantRemovedConn && this._dmDescendantRemovedConn.Disconnect) {
            this._dmDescendantRemovedConn.Disconnect();
        }
        if (this._dmDescendantAddedConn && this._dmDescendantAddedConn.Disconnect) {
            this._dmDescendantAddedConn.Disconnect();
        }

        // Initialize collapsed states: collapse all services except Workspace, and collapse containers inside Workspace
        this.collapsedNodes = new Set();
        for (const service of dm.GetChildren()) {
            if (service.Name !== 'Workspace') {
                this.collapsedNodes.add(service.id);
            }
        }
        if (dm.Workspace) {
            for (const child of dm.Workspace.GetChildren()) {
                if (child.GetChildren().some(c => !EXPLORER_HIDDEN_CLASSES.has(c.ClassName))) {
                    this.collapsedNodes.add(child.id);
                }
            }
        }

        if (dm.DescendantRemoved) {
            this._dmDescendantRemovedConn = dm.DescendantRemoved.Connect((descendant) => {
                if (descendant) {
                    this.selectedInstances.delete(descendant);
                    if (this.selectedInstance === descendant) {
                        this.selectedInstance = this.selectedInstances.size > 0 ? Array.from(this.selectedInstances)[0] : null;
                    }
                }
                this.requestRender();
            });
        }
        if (dm.DescendantAdded) {
            this._dmDescendantAddedConn = dm.DescendantAdded.Connect((descendant) => {
                if (EXPLORER_HIDDEN_CLASSES.has(descendant.ClassName)) return;
                for (const addedInstance of [descendant, ...descendant.GetDescendants()]) {
                    if (EXPLORER_HIDDEN_CLASSES.has(addedInstance.ClassName)) continue;
                    if (addedInstance.GetChildren().some(c => !EXPLORER_HIDDEN_CLASSES.has(c.ClassName))) {
                        this.collapsedNodes.add(addedInstance.id);
                    }
                }
                if (descendant && descendant.Changed) {
                    descendant.Changed.Connect((prop) => {
                        if (prop === 'Name') this.requestRender();
                    });
                }
                this.requestRender();
            });
        }

        for (const descendant of dm.GetDescendants()) {
            if (EXPLORER_HIDDEN_CLASSES.has(descendant.ClassName)) continue;
            if (descendant && descendant.Changed) {
                descendant.Changed.Connect((prop) => {
                    if (prop === 'Name') this.requestRender();
                });
            }
        }

        this.render();
    }

    requestRender() {
        if (this._renderTimeout) return;
        this._renderTimeout = setTimeout(() => {
            this._renderTimeout = null;
            this.render();
        }, 16);
    }

    createContextMenu() {
        this.contextMenuEl = document.createElement('div');
        this.contextMenuEl.className = 'studio-context-menu';
        this.contextMenuEl.style.display = 'none';
        document.body.appendChild(this.contextMenuEl);

        window.addEventListener('click', (e) => {
            if (!this.contextMenuEl.contains(e.target)) {
                this.contextMenuEl.style.display = 'none';
            }
        });
    }

    createInsertPopup() {
        this.insertPopupEl = document.createElement('div');
        this.insertPopupEl.className = 'studio-insert-popup';
        this.insertPopupEl.style.display = 'none';
        
        // Prevent background zoom when scrolling insert list
        this.insertPopupEl.addEventListener('wheel', (e) => {
            e.stopPropagation();
        }, { passive: true });

        document.body.appendChild(this.insertPopupEl);

        window.addEventListener('click', (e) => {
            if (!this.insertPopupEl.contains(e.target) && !e.target.closest('.explorer-add-btn')) {
                this.insertPopupEl.style.display = 'none';
            }
        });
    }

    showInsertPopup(x, y, targetInst) {
        this.insertTargetInst = targetInst;

        const isLighting = targetInst.ClassName === 'Lighting';

        let objectsList = [];

        if (isLighting) {
            objectsList.push(
                { name: 'SkyBox', icon: 'cloud-sun', create: () => this.createSkyIn(targetInst) },
                { name: 'Atmosphere', icon: 'wind', create: () => this.createAtmosphereIn(targetInst) },
                { name: 'BloomEffect', icon: 'sparkles', create: () => this.createBloomIn(targetInst) },
                { name: 'SunRaysEffect', icon: 'sun', create: () => this.createSunRaysIn(targetInst) },
                { name: 'DepthOfFieldEffect', icon: 'aperture', create: () => this.createDepthOfFieldIn(targetInst) },
                { name: 'Sky', icon: 'cloud-sun', create: () => this.createSkyIn(targetInst) },
                { name: 'Clouds', icon: 'cloud', create: () => this.createCloudsIn(targetInst) }
            );
        } else {
            objectsList.push(
                { name: 'Part (Block)', icon: 'box', create: () => this.createPartIn(targetInst, 'Block') },
                { name: 'Part (Sphere)', icon: 'circle', create: () => this.createPartIn(targetInst, 'Ball') },
                { name: 'Part (Cylinder)', icon: 'cylinder', create: () => this.createPartIn(targetInst, 'Cylinder') },
                { name: 'Part (Wedge)', icon: 'triangle', create: () => this.createPartIn(targetInst, 'Wedge') },
                { name: 'SpawnLocation', icon: 'map-pin', create: () => this.createSpawnIn(targetInst) },
                { name: 'Sound', icon: 'volume-2', create: () => this.createSoundIn(targetInst) },
                { name: 'SpecialMesh', icon: 'box', create: () => this.createSpecialMeshIn(targetInst) },
                { name: 'CharacterMesh', icon: 'user', create: () => this.createCharacterMeshIn(targetInst) },
                { name: 'Shirt', icon: 'shirt', create: () => this.createShirtIn(targetInst) },
                { name: 'Pants', icon: 'layers', create: () => this.createPantsIn(targetInst) },
                { name: 'Decal', icon: 'image', create: () => this.createDecalIn(targetInst) },
                { name: 'Texture', icon: 'grid', create: () => this.createTextureIn(targetInst) },
                { name: 'Script', icon: 'file-code', create: () => this.createScriptIn(targetInst) },
                { name: 'LocalScript', icon: 'file-terminal', create: () => this.createLocalScriptIn(targetInst) },
                { name: 'ModuleScript', icon: 'file-cog', create: () => this.createModuleScriptIn(targetInst) },
                { name: 'PointLight', icon: 'lightbulb', create: () => this.createLightIn(targetInst) },
                { name: 'SpotLight', icon: 'flashlight', create: () => this.createSpotLightIn(targetInst) },
                { name: 'SurfaceLight', icon: 'sun', create: () => this.createSurfaceLightIn(targetInst) },
                { name: 'SkyBox', icon: 'cloud-sun', create: () => this.createSkyIn(targetInst) },
                { name: 'Clouds', icon: 'cloud', create: () => this.createCloudsIn(targetInst) },
                { name: 'Atmosphere', icon: 'wind', create: () => this.createAtmosphereIn(targetInst) },
                { name: 'BloomEffect', icon: 'sparkles', create: () => this.createBloomIn(targetInst) },
                { name: 'SunRaysEffect', icon: 'sun', create: () => this.createSunRaysIn(targetInst) },
                { name: 'DepthOfFieldEffect', icon: 'aperture', create: () => this.createDepthOfFieldIn(targetInst) },
                { name: 'Sky', icon: 'cloud-sun', create: () => this.createSkyIn(targetInst) },
                { name: 'Folder', icon: 'folder', create: () => this.createFolderIn(targetInst) },
                { name: 'Model', icon: 'package', create: () => this.createModelIn(targetInst) },
                { name: 'Tool', icon: 'wrench', create: () => this.createToolIn(targetInst) },
                { name: 'Humanoid', icon: 'user', create: () => this.createHumanoidIn(targetInst) },
                { name: 'Weld', icon: 'link', create: () => this.createWeldIn(targetInst) },
                { name: 'WeldConstraint', icon: 'link-2', create: () => this.createWeldConstraintIn(targetInst) },
                { name: 'WeldConstant', icon: 'link-2', create: () => this.createWeldConstantIn(targetInst) },
                { name: 'Motor6D', icon: 'rotate-cw', create: () => this.createMotor6DIn(targetInst) },
                { name: 'KeyframeSequence', icon: 'film', create: () => this.createKeyframeSequenceIn(targetInst) },
                { name: 'Keyframe', icon: 'circle-dot', create: () => this.createKeyframeIn(targetInst) }
            );
        }

        this.insertPopupEl.innerHTML = `
            <div class="insert-popup-header">
                <span class="insert-popup-title">Insert Object into <b>${targetInst.Name}</b></span>
            </div>
            <div class="insert-popup-search">
                <input type="text" id="insert-search-input" placeholder="Search Objects..." autofocus />
            </div>
            <div class="insert-popup-list" id="insert-list-body"></div>
        `;

        const listBody = this.insertPopupEl.querySelector('#insert-list-body');
        const searchInput = this.insertPopupEl.querySelector('#insert-search-input');

        const renderItems = (filter = '') => {
            listBody.innerHTML = '';
            const filtered = objectsList.filter(o => o.name.toLowerCase().includes(filter));
            for (const item of filtered) {
                const el = document.createElement('div');
                el.className = 'insert-popup-item';
                el.innerHTML = `<i data-lucide="${item.icon}"></i> <span>${item.name}</span>`;
                el.onclick = () => {
                    item.create();
                    this.insertPopupEl.style.display = 'none';
                };
                listBody.appendChild(el);
            }
            if (window.lucide) window.lucide.createIcons({ root: listBody });
        };

        searchInput.oninput = (e) => renderItems(e.target.value.toLowerCase().trim());
        renderItems('');

        // Position popup near button
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const posX = Math.max(10, Math.min(winW - 250, x - 230));
        const posY = Math.max(10, Math.min(winH - 330, y - 20));

        this.insertPopupEl.style.left = `${posX}px`;
        this.insertPopupEl.style.top = `${posY}px`;
        this.insertPopupEl.style.display = 'flex';

        setTimeout(() => searchInput.focus(), 50);
    }

    createPartIn(parent, shape = 'Block') {
        const p = new Part();
        p.Name = shape === 'Block' ? 'Part' : shape;
        p.Shape = shape;
        p.Position = (parent.Position ? parent.Position.add(new Vector3(0, 3, 0)) : new Vector3(0, 4, 0));
        p.Color = Color3.fromRGB(163, 162, 165);
        p.Material = 'Plastic';
        p.Anchored = false;
        p.Parent = parent;

        this.expandNode(parent);
        this.setSelected(p);
        if (this.onSelect) this.onSelect(p);
        window.conbloxStudio?.historyManager?.recordState();
        return p;
    }

    createSpawnIn(parent) {
        const s = new SpawnLocation();
        s.Position = (parent.Position ? parent.Position.add(new Vector3(0, 2, 0)) : new Vector3(0, 1, 0));
        s.Parent = parent;
        this.expandNode(parent);
        this.setSelected(s);
        if (this.onSelect) this.onSelect(s);
        window.conbloxStudio?.historyManager?.recordState();
        return s;
    }

    createScriptIn(parent) {
        const s = new Script();
        s.Parent = parent;
        this.expandNode(parent);
        this.setSelected(s);
        if (this.onSelect) this.onSelect(s);
        if (this.onOpenScript) this.onOpenScript(s);
        window.conbloxStudio?.historyManager?.recordState();
        return s;
    }

    createLocalScriptIn(parent) {
        const s = new LocalScript();
        s.Parent = parent;
        this.expandNode(parent);
        this.setSelected(s);
        if (this.onSelect) this.onSelect(s);
        if (this.onOpenScript) this.onOpenScript(s);
        window.conbloxStudio?.historyManager?.recordState();
        return s;
    }

    createModuleScriptIn(parent) {
        const s = new ModuleScript();
        s.Parent = parent || this.dataModel.ReplicatedStorage || this.dataModel.Workspace;
        this.expandNode(s.Parent);
        this.setSelected(s);
        if (this.onSelect) this.onSelect(s);
        if (this.onOpenScript) this.onOpenScript(s);
        window.conbloxStudio?.historyManager?.recordState();
        return s;
    }

    createLightIn(parent) {
        const l = new PointLight();
        l.Parent = parent;
        this.expandNode(parent);
        this.setSelected(l);
        if (this.onSelect) this.onSelect(l);
        window.conbloxStudio?.historyManager?.recordState();
        return l;
    }

    createSpotLightIn(parent) {
        const light = new SpotLight();
        light.Parent = parent;
        this.expandNode(parent);
        this.setSelected(light);
        if (this.onSelect) this.onSelect(light);
        window.conbloxStudio?.historyManager?.recordState();
        return light;
    }

    createSurfaceLightIn(parent) {
        const light = new SurfaceLight();
        light.Parent = parent;
        this.expandNode(parent);
        this.setSelected(light);
        if (this.onSelect) this.onSelect(light);
        window.conbloxStudio?.historyManager?.recordState();
        return light;
    }

    createFolderIn(parent) {
        const f = new Folder();
        f.Parent = parent;
        this.expandNode(parent);
        this.setSelected(f);
        if (this.onSelect) this.onSelect(f);
        window.conbloxStudio?.historyManager?.recordState();
        return f;
    }

    createModelIn(parent) {
        const m = new Model();
        m.Parent = parent;
        this.expandNode(parent);
        this.setSelected(m);
        if (this.onSelect) this.onSelect(m);
        window.conbloxStudio?.historyManager?.recordState();
        return m;
    }

    createToolIn(parent) {
        const tool = new Tool();
        tool.Parent = parent;
        this.expandNode(parent);
        this.setSelected(tool);
        if (this.onSelect) this.onSelect(tool);
        window.conbloxStudio?.historyManager?.recordState();
        return tool;
    }

    createHumanoidIn(parent) {
        const h = new Humanoid();
        h.Parent = parent;
        this.expandNode(parent);
        this.setSelected(h);
        if (this.onSelect) this.onSelect(h);
        window.conbloxStudio?.historyManager?.recordState();
        return h;
    }

    createWeldIn(parent) {
        const w = new Weld();
        w.Name = 'Weld';
        w.Parent = parent;
        this.expandNode(parent);
        this.setSelected(w);
        if (this.onSelect) this.onSelect(w);
        window.conbloxStudio?.historyManager?.recordState();
        return w;
    }

    createWeldConstraintIn(parent) {
        const wc = new WeldConstraint();
        wc.Name = 'WeldConstraint';
        wc.Parent = parent;
        this.expandNode(parent);
        this.setSelected(wc);
        if (this.onSelect) this.onSelect(wc);
        window.conbloxStudio?.historyManager?.recordState();
        return wc;
    }

    createWeldConstantIn(parent) {
        const weld = new WeldConstant();
        weld.Parent = parent;
        this.expandNode(parent);
        this.setSelected(weld);
        if (this.onSelect) this.onSelect(weld);
        window.conbloxStudio?.historyManager?.recordState();
        return weld;
    }

    createMotor6DIn(parent) {
        const m = new Motor6D();
        m.Name = 'Motor6D';
        const parentIsPart = parent.IsA && parent.IsA('BasePart');
        const candidateParts = parentIsPart
            ? [parent, ...(parent.Parent ? parent.Parent.GetDescendants() : []).filter(instance => instance.IsA && instance.IsA('BasePart') && instance !== parent)]
            : parent.GetDescendants().filter(instance => instance.IsA && instance.IsA('BasePart'));
        if (parentIsPart) {
            m.Part0 = parent;
            m.Part1 = candidateParts.find(part => part !== parent) || null;
        } else if (candidateParts.length === 2) {
            [m.Part0, m.Part1] = candidateParts;
        }
        m.Parent = parent;
        this.expandNode(parent);
        this.setSelected(m);
        if (this.onSelect) this.onSelect(m);
        window.conbloxStudio?.historyManager?.recordState();
        return m;
    }

    createKeyframeSequenceIn(parent) {
        const sequence = new KeyframeSequence();
        sequence.Parent = parent;
        this.expandNode(parent);
        this.setSelected(sequence);
        if (this.onSelect) this.onSelect(sequence);
        window.conbloxStudio?.historyManager?.recordState();
        return sequence;
    }

    createKeyframeIn(parent) {
        const keyframe = new Keyframe();
        keyframe.Time = parent.ClassName === 'KeyframeSequence' ? parent.Length : 0;
        keyframe.Parent = parent;
        this.expandNode(parent);
        this.setSelected(keyframe);
        if (this.onSelect) this.onSelect(keyframe);
        window.conbloxStudio?.historyManager?.recordState();
        return keyframe;
    }

    createBloomIn(parent) {
        const b = new BloomEffect();
        b.Parent = parent;
        this.expandNode(parent);
        this.setSelected(b);
        if (this.onSelect) this.onSelect(b);
        window.conbloxStudio?.historyManager?.recordState();
        return b;
    }

    createAtmosphereIn(parent) {
        const a = new Atmosphere();
        a.Parent = parent;
        this.expandNode(parent);
        this.setSelected(a);
        if (this.onSelect) this.onSelect(a);
        window.conbloxStudio?.historyManager?.recordState();
        return a;
    }

    createDepthOfFieldIn(parent) {
        const d = new DepthOfFieldEffect();
        d.Parent = parent;
        this.expandNode(parent);
        this.setSelected(d);
        if (this.onSelect) this.onSelect(d);
        window.conbloxStudio?.historyManager?.recordState();
        return d;
    }

    createSunRaysIn(parent) {
        const s = new SunRaysEffect();
        s.Parent = parent;
        this.expandNode(parent);
        this.setSelected(s);
        if (this.onSelect) this.onSelect(s);
        window.conbloxStudio?.historyManager?.recordState();
        return s;
    }

    createSkyIn(parent) {
        const sk = new Sky();
        sk.Parent = parent;
        this.expandNode(parent);
        this.setSelected(sk);
        if (this.onSelect) this.onSelect(sk);
        window.conbloxStudio?.historyManager?.recordState();
        return sk;
    }

    createCloudsIn(parent) {
        const c = new Clouds();
        c.Parent = parent;
        this.expandNode(parent);
        this.setSelected(c);
        if (this.onSelect) this.onSelect(c);
        window.conbloxStudio?.historyManager?.recordState();
        return c;
    }

    createSpecialMeshIn(parent) {
        if (window.conbloxStudio?.createSpecialMesh) {
            return window.conbloxStudio.createSpecialMesh(parent);
        }

        let targetPart = null;
        if (parent && parent.IsA && parent.IsA('BasePart')) {
            targetPart = parent;
        } else if (this.selectedInstance && this.selectedInstance.IsA && this.selectedInstance.IsA('BasePart')) {
            targetPart = this.selectedInstance;
        } else {
            // SpecialMesh must be inside a BasePart. Create a Part to host it if not inside one!
            targetPart = new Part();
            targetPart.Name = 'Part';
            targetPart.Parent = parent || this._dataModel?.Workspace;
            if (window.conbloxStudio?.viewport) {
                window.conbloxStudio.viewport.syncPartMesh(targetPart);
            }
        }

        const sm = new SpecialMesh();
        sm.Name = 'Mesh';
        sm.MeshType = 'Head';
        sm.Parent = targetPart;

        if (parent && parent !== targetPart) {
            this.expandNode(parent);
        }
        this.expandNode(targetPart);
        this.setSelected(sm);
        if (this.onSelect) this.onSelect(sm);
        window.conbloxStudio?.historyManager?.recordState();

        if (window.conbloxStudio?.viewport) {
            window.conbloxStudio.viewport.rebuildPartMesh(targetPart);
        }
        return sm;
    }

    createCharacterMeshIn(parent) {
        const cm = new CharacterMesh();
        cm.Name = 'CharacterMesh';
        cm.BodyPart = 'Torso';
        cm.Parent = parent;
        this.expandNode(parent);
        this.setSelected(cm);
        if (this.onSelect) this.onSelect(cm);
        window.conbloxStudio?.historyManager?.recordState();
        if (window.conbloxStudio?.viewport) {
            window.conbloxStudio.viewport.handleCharacterChildChange?.(parent);
        }
        return cm;
    }

    createShirtIn(parent) {
        const sh = new Shirt();
        sh.Name = 'Shirt';
        sh.Parent = parent;
        this.expandNode(parent);
        this.setSelected(sh);
        if (this.onSelect) this.onSelect(sh);
        window.conbloxStudio?.historyManager?.recordState();
        if (window.conbloxStudio?.viewport) {
            window.conbloxStudio.viewport.handleCharacterChildChange?.(parent);
        }
        return sh;
    }

    createPantsIn(parent) {
        const p = new Pants();
        p.Name = 'Pants';
        p.Parent = parent;
        this.expandNode(parent);
        this.setSelected(p);
        if (this.onSelect) this.onSelect(p);
        window.conbloxStudio?.historyManager?.recordState();
        if (window.conbloxStudio?.viewport) {
            window.conbloxStudio.viewport.handleCharacterChildChange?.(parent);
        }
        return p;
    }

    createDecalIn(parent) {
        const d = new Decal();
        d.Parent = parent;
        this.expandNode(parent);
        this.setSelected(d);
        if (this.onSelect) this.onSelect(d);
        window.conbloxStudio?.historyManager?.recordState();
        return d;
    }

    createTextureIn(parent) {
        const t = new Texture();
        t.Parent = parent;
        this.expandNode(parent);
        this.setSelected(t);
        if (this.onSelect) this.onSelect(t);
        window.conbloxStudio?.historyManager?.recordState();
        return t;
    }

    createSoundIn(parent) {
        const s = new Sound();
        s.Parent = parent;
        this.expandNode(parent);
        this.setSelected(s);
        if (this.onSelect) this.onSelect(s);
        window.conbloxStudio?.historyManager?.recordState();
        return s;
    }

    expandNode(inst) {
        let p = inst;
        while (p) {
            this.collapsedNodes.delete(p.id);
            p = p.Parent;
        }
        this.render();
    }

    showContextMenu(x, y, targetInst) {
        const isProtected = targetInst === this.dataModel || targetInst.Parent === this.dataModel || targetInst.ClassName === 'Terrain' || targetInst.Name === 'Terrain';
        const hasModelSelected = (this.selectedInstances.size > 0 && Array.from(this.selectedInstances).some(i => i.ClassName === 'Model')) || targetInst.ClassName === 'Model';
        const isKeyframeSequence = targetInst.ClassName === 'KeyframeSequence';

        this.contextMenuEl.innerHTML = `
            ${isKeyframeSequence ? '<div class="ctx-item" data-action="save-to-server" style="color: #60a5fa; font-weight: 600;"><i data-lucide="cloud-upload"></i> Save to Server</div><div class="ctx-divider"></div>' : ''}
            <div class="ctx-item" data-action="insert-object"><i data-lucide="plus-circle"></i> Insert Object...</div>
            <div class="ctx-divider"></div>
            <div class="ctx-item" data-action="group"><i data-lucide="package"></i> Group (Ctrl+G)</div>
            ${hasModelSelected ? '<div class="ctx-item" data-action="ungroup"><i data-lucide="box"></i> Ungroup (Ctrl+U)</div>' : '<div class="ctx-item" data-action="ungroup" style="opacity: 0.5;"><i data-lucide="box"></i> Ungroup (Ctrl+U)</div>'}
            <div class="ctx-divider"></div>
            <div class="ctx-item" data-action="copy"><i data-lucide="copy"></i> Copy (Ctrl+C)</div>
            <div class="ctx-item" data-action="paste"><i data-lucide="clipboard"></i> Paste (Ctrl+V)</div>
            <div class="ctx-item" data-action="duplicate"><i data-lucide="copy-plus"></i> Duplicate (Ctrl+D)</div>
            <div class="ctx-item" data-action="rename"><i data-lucide="edit-3"></i> Rename (F2)</div>
            ${isProtected ? '' : '<div class="ctx-item ctx-danger" data-action="delete"><i data-lucide="trash-2"></i> Delete (Del)</div>'}
        `;

        if (window.lucide) window.lucide.createIcons({ root: this.contextMenuEl });

        this.contextMenuEl.style.left = `${Math.min(window.innerWidth - 180, x)}px`;
        this.contextMenuEl.style.top = `${Math.min(window.innerHeight - 250, y)}px`;
        this.contextMenuEl.style.display = 'block';

        this.contextMenuEl.querySelectorAll('.ctx-item').forEach(btn => {
            btn.onclick = () => {
                const action = btn.dataset.action;
                if (action === 'save-to-server') {
                    this.showSaveAnimationModal(targetInst);
                } else if (action === 'insert-object') {
                    this.showInsertPopup(x, y, targetInst);
                } else if (action === 'group') {
                    window.conbloxStudio?.groupSelected();
                } else if (action === 'ungroup') {
                    window.conbloxStudio?.ungroupSelected();
                } else if (action === 'copy') {
                    window.conbloxStudio?.copySelected();
                } else if (action === 'paste') {
                    window.conbloxStudio?.pasteClipboard();
                } else if (action === 'duplicate') {
                    window.conbloxStudio?.duplicateSelected();
                } else if (action === 'rename') {
                    const newName = prompt('Enter new name:', targetInst.Name);
                    if (newName && newName.trim()) targetInst.Name = newName.trim();
                } else if (action === 'delete') {
                    window.conbloxStudio?.deleteSelected();
                }
                this.contextMenuEl.style.display = 'none';
            };
        });
    }

    showSaveAnimationModal(sequence) {
        const existing = document.getElementById('save-animation-modal-backdrop');
        if (existing) existing.remove();

        const backdrop = document.createElement('div');
        backdrop.id = 'save-animation-modal-backdrop';
        backdrop.className = 'studio-settings-backdrop';
        backdrop.style.zIndex = '99999';

        backdrop.innerHTML = `
            <div class="studio-settings-modal" style="width: 520px; height: auto; max-height: 85vh;">
                <div class="settings-modal-header">
                    <div class="settings-header-title">
                        <i data-lucide="cloud-upload" class="settings-header-icon" style="color: #38bdf8;"></i>
                        <span>Save to Server</span>
                    </div>
                    <button class="settings-close-btn" id="save-anim-close-x"><i data-lucide="x"></i></button>
                </div>
                <div class="settings-modal-body" style="padding: 20px; display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 12px; font-weight: 600; color: var(--text-primary, #fff);">Animation Name</label>
                        <input id="save-anim-name" type="text" value="${sequence.Name || 'Animation'}" style="background: var(--bg-darkest, #151820); border: 1px solid var(--border-color, #2a2e39); border-radius: 4px; padding: 8px 10px; color: #fff; font-size: 13px; outline: none;" />
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <label style="font-size: 12px; font-weight: 600; color: var(--text-primary, #fff);">Description</label>
                        <textarea id="save-anim-desc" rows="4" placeholder="Enter animation description..." style="background: var(--bg-darkest, #151820); border: 1px solid var(--border-color, #2a2e39); border-radius: 4px; padding: 8px 10px; color: #fff; font-size: 13px; outline: none; resize: vertical;"></textarea>
                    </div>
                    <div id="save-anim-status" style="font-size: 12px; display: none; padding: 10px; border-radius: 4px;"></div>
                </div>
                <div class="settings-modal-footer" style="justify-content: flex-end; gap: 10px;">
                    <button class="settings-btn btn-secondary" id="save-anim-cancel-btn">Cancel</button>
                    <button class="settings-btn" id="save-anim-save-btn" style="background: var(--accent-blue, #007acc); color: #fff; font-weight: 600;">Save</button>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);
        if (window.lucide) window.lucide.createIcons({ root: backdrop });

        const close = () => backdrop.remove();
        backdrop.querySelector('#save-anim-close-x').onclick = close;
        backdrop.querySelector('#save-anim-cancel-btn').onclick = close;
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) close();
        });

        const saveBtn = backdrop.querySelector('#save-anim-save-btn');
        const nameInput = backdrop.querySelector('#save-anim-name');
        const descInput = backdrop.querySelector('#save-anim-desc');
        const statusBox = backdrop.querySelector('#save-anim-status');

        saveBtn.onclick = async () => {
            const name = nameInput.value.trim() || sequence.Name || 'Animation';
            const description = descInput.value.trim();

            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';

            try {
                const serialized = sequence.serialize();
                const resp = await fetch('/api/publish-animation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description, serialized })
                });

                const data = await resp.json();
                if (data.success && data.id) {
                    sequence.Name = name;
                    statusBox.style.display = 'block';
                    statusBox.style.background = 'rgba(16, 185, 129, 0.15)';
                    statusBox.style.border = '1px solid rgba(16, 185, 129, 0.4)';
                    statusBox.style.color = '#34d399';
                    statusBox.innerHTML = `
                        <div style="font-weight: 700; margin-bottom: 4px;">Successfully Published!</div>
                        <div>Animation ID: <strong style="color: #fff; user-select: all;">${data.id}</strong></div>
                        <div style="margin-top: 4px; font-size: 11px; color: #a7f3d0;">
                            Use with: <code style="background: rgba(0,0,0,0.3); padding: 2px 4px; border-radius: 3px; user-select: all;">rbxasset://${data.id}</code>
                        </div>
                    `;
                    saveBtn.textContent = 'Done';
                    saveBtn.onclick = close;
                    if (window.conbloxStudio?.outputUI) {
                        window.conbloxStudio.outputUI.log('info', `[Server] Saved animation "${name}" with ID: ${data.id}. Asset URI: rbxasset://${data.id}`);
                    }
                } else {
                    throw new Error(data.error || 'Failed to save animation');
                }
            } catch (err) {
                statusBox.style.display = 'block';
                statusBox.style.background = 'rgba(239, 68, 68, 0.15)';
                statusBox.style.border = '1px solid rgba(239, 68, 68, 0.4)';
                statusBox.style.color = '#f87171';
                statusBox.textContent = `Error: ${err.message}`;
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save';
            }
        };
    }

    getIconForClass(className) {
        switch (className) {
            case 'DataModel': return 'layers';
            case 'Workspace': return 'globe';
            case 'Terrain': return 'mountain';
            case 'Camera': return 'camera';
            case 'Lighting': return 'sun';
            case 'Players': return 'users';
            case 'MaterialService': return 'palette';
            case 'ReplicatedFirst': return 'zap';
            case 'ReplicatedStorage': return 'archive';
            case 'ServerScriptService': return 'cpu';
            case 'ServerStorage': return 'server';
            case 'StarterGui': return 'layout';
            case 'StarterPack': return 'briefcase';
            case 'StarterPlayer': return 'user-check';
            case 'StarterCharacterScripts': return 'folder-code';
            case 'StarterPlayerScripts': return 'folder-code';
            case 'Teams': return 'flag';
            case 'SoundService': return 'volume-2';
            case 'TextChatService': return 'message-square';
            case 'Part': return 'box';
            case 'SpecialMesh': return 'box';
            case 'CharacterMesh': return 'user';
            case 'Shirt': return 'shirt';
            case 'Pants': return 'layers';
            case 'SpawnLocation': return 'map-pin';
            case 'Model': return 'package';
            case 'Folder': return 'folder';
            case 'Script': return 'file-code';
            case 'LocalScript': return 'file-terminal';
            case 'ModuleScript': return 'file-cog';
            case 'PointLight': return 'lightbulb';
            case 'SpotLight': return 'flashlight';
            case 'SurfaceLight': return 'sun';
            case 'Humanoid': return 'user';
            case 'BloomEffect': return 'sparkles';
            case 'Atmosphere': return 'wind';
            case 'DepthOfFieldEffect': return 'aperture';
            case 'SunRaysEffect': return 'sun';
            case 'Sky': return 'cloud-sun';
            case 'Clouds': return 'cloud';
            case 'Sound': return 'volume-2';
            case 'Decal': return 'image';
            case 'Texture': return 'grid';
            case 'Weld': return 'link';
            case 'WeldConstraint':
            case 'WeldConstant': return 'link-2';
            case 'Motor6D': return 'rotate-cw';
            case 'UserInputService': return 'keyboard';
            case 'RunService': return 'activity';
            default: return 'square';
        }
    }

    getVisibleNodes() {
        const visible = [];
        const ROOT_SERVICES_ORDER = [
            'Workspace', 'Players', 'Lighting', 'MaterialService',
            'ReplicatedFirst', 'ReplicatedStorage', 'ServerScriptService',
            'ServerStorage', 'StarterGui', 'StarterPack', 'StarterPlayer',
            'Teams', 'SoundService', 'TextChatService'
        ];

        const traverse = (inst) => {
            let children = inst.GetChildren().filter(c => !EXPLORER_HIDDEN_CLASSES.has(c.ClassName));
            if (inst.ClassName === 'DataModel') {
                const HIDDEN_SERVICES = new Set(['UserInputService', 'RunService']);
                children = children.filter(c => !HIDDEN_SERVICES.has(c.Name) && !HIDDEN_SERVICES.has(c.ClassName));
                children = [...children].sort((a, b) => {
                    const idxA = ROOT_SERVICES_ORDER.indexOf(a.Name);
                    const idxB = ROOT_SERVICES_ORDER.indexOf(b.Name);
                    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
                });
            }
            for (const child of children) {
                const matchesSelf = !this.filterText || child.Name.toLowerCase().includes(this.filterText) || child.ClassName.toLowerCase().includes(this.filterText);
                const hasMatchingChild = this.filterText && child.GetDescendants().some(d => !EXPLORER_HIDDEN_CLASSES.has(d.ClassName) && d.Name.toLowerCase().includes(this.filterText));
                if (!this.filterText || matchesSelf || hasMatchingChild) {
                    visible.push(child);
                    const hasChildren = child.GetChildren().some(c => !EXPLORER_HIDDEN_CLASSES.has(c.ClassName));
                    const isCollapsed = this.collapsedNodes.has(child.id);
                    if (hasChildren && (!isCollapsed || this.filterText)) {
                        traverse(child);
                    }
                }
            }
        };

        traverse(this.dataModel);
        return visible;
    }

    render() {
        if (!this.treeContainer) return;
        this.treeContainer.innerHTML = '';
        this.renderNode(this.dataModel, this.treeContainer, 0);
        if (window.lucide) window.lucide.createIcons({ root: this.treeContainer });
    }

    renderNode(inst, parentEl, depth) {
        let children = inst.GetChildren().filter(c => !EXPLORER_HIDDEN_CLASSES.has(c.ClassName));
        if (inst.ClassName === 'DataModel') {
            const HIDDEN_SERVICES = new Set(['UserInputService', 'RunService']);
            children = children.filter(c => !HIDDEN_SERVICES.has(c.Name) && !HIDDEN_SERVICES.has(c.ClassName));
            const ROOT_SERVICES_ORDER = [
                'Workspace',
                'Players',
                'Lighting',
                'MaterialService',
                'ReplicatedFirst',
                'ReplicatedStorage',
                'ServerScriptService',
                'ServerStorage',
                'StarterGui',
                'StarterPack',
                'StarterPlayer',
                'Teams',
                'SoundService',
                'TextChatService'
            ];
            children = [...children].sort((a, b) => {
                const idxA = ROOT_SERVICES_ORDER.indexOf(a.Name);
                const idxB = ROOT_SERVICES_ORDER.indexOf(b.Name);
                const orderA = idxA === -1 ? 999 : idxA;
                const orderB = idxB === -1 ? 999 : idxB;
                return orderA - orderB;
            });
        }
        const hasChildren = children.length > 0;
        const isCollapsed = this.collapsedNodes.has(inst.id);

        const matchesSelf = !this.filterText || inst.Name.toLowerCase().includes(this.filterText) || inst.ClassName.toLowerCase().includes(this.filterText);
        const hasMatchingChild = this.filterText && inst.GetDescendants().some(d => !EXPLORER_HIDDEN_CLASSES.has(d.ClassName) && d.Name.toLowerCase().includes(this.filterText));

        if (this.filterText && !matchesSelf && !hasMatchingChild) {
            return;
        }

        const isSelected = this.selectedInstances.has(inst) || (this.selectedInstance === inst);
        const nodeEl = document.createElement('div');
        nodeEl.className = 'explorer-node' + (isSelected ? ' selected' : '');
        nodeEl.dataset.id = inst.id;
        nodeEl.style.paddingLeft = `${depth * 14 + 6}px`;

        // Drag & Drop implementation
        const isRootService = (inst.Parent === this.dataModel || inst === this.dataModel);
        nodeEl.draggable = !isRootService;

        nodeEl.addEventListener('dragstart', (e) => {
            if (isRootService) {
                e.preventDefault();
                return;
            }
            e.stopPropagation();

            let itemsToDrag = [inst];
            if (this.selectedInstances.has(inst) && this.selectedInstances.size > 1) {
                itemsToDrag = Array.from(this.selectedInstances).filter(i => i.Parent !== this.dataModel && i !== this.dataModel);
            }
            this.draggedInstances = itemsToDrag;

            e.dataTransfer.setData('text/plain', inst.id);
            e.dataTransfer.effectAllowed = 'move';
            nodeEl.classList.add('dragging');
        });

        nodeEl.addEventListener('dragend', () => {
            nodeEl.classList.remove('dragging');
            this.draggedInstances = null;
            this.container.querySelectorAll('.explorer-node.drag-over').forEach(el => el.classList.remove('drag-over'));
        });

        nodeEl.addEventListener('dragover', (e) => {
            if (!this.draggedInstances || this.draggedInstances.length === 0) return;

            // Check if inst can be a valid target parent for dragged items
            const canDrop = this.draggedInstances.every(dragged => {
                if (dragged === inst) return false;
                if (inst.IsDescendantOf && inst.IsDescendantOf(dragged)) return false;
                return true;
            });

            if (canDrop) {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'move';
                nodeEl.classList.add('drag-over');
            }
        });

        nodeEl.addEventListener('dragleave', (e) => {
            const rect = nodeEl.getBoundingClientRect();
            if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
                nodeEl.classList.remove('drag-over');
            }
        });

        nodeEl.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            nodeEl.classList.remove('drag-over');

            if (!this.draggedInstances || this.draggedInstances.length === 0) return;

            const items = [...this.draggedInstances];
            this.draggedInstances = null;

            let movedCount = 0;
            for (const item of items) {
                if (item === inst) continue;
                if (inst.IsDescendantOf && inst.IsDescendantOf(item)) continue;
                if (item.Parent === this.dataModel) continue;

                const oldParent = item.Parent;
                item.Parent = inst;
                movedCount++;

                if (window.conbloxStudio?.viewport) {
                    if (item.ClassName === 'SpecialMesh') {
                        if (oldParent && oldParent.IsA && oldParent.IsA('BasePart')) {
                            window.conbloxStudio.viewport.rebuildPartMesh(oldParent);
                        }
                        if (inst && inst.IsA && inst.IsA('BasePart')) {
                            window.conbloxStudio.viewport.rebuildPartMesh(inst);
                        }
                    } else if (item.ClassName === 'CharacterMesh' || item.ClassName === 'Shirt' || item.ClassName === 'Pants') {
                        window.conbloxStudio.viewport.handleCharacterChildChange?.(oldParent);
                        window.conbloxStudio.viewport.handleCharacterChildChange?.(inst);
                    }
                }
            }

            if (movedCount > 0) {
                this.collapsedNodes.delete(inst.id);
                this.render();
                this.selectedInstances = new Set(items);
                this.selectedInstance = items[items.length - 1];
                this.updateSelectionClasses();
                if (this.onSelect) this.onSelect(this.selectedInstance, items);
                window.conbloxStudio?.historyManager?.recordState();
                window.conbloxStudio?.outputUI?.log('info', `Moved ${movedCount} item(s) to ${inst.Name}`);
            }
        });

        // Chevron
        const chevron = document.createElement('span');
        chevron.className = 'explorer-chevron' + (hasChildren ? '' : ' hidden') + (isCollapsed ? ' collapsed' : '');
        chevron.innerHTML = `<i data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-down'}"></i>`;
        chevron.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.collapsedNodes.has(inst.id)) {
                this.collapsedNodes.delete(inst.id);
            } else {
                this.collapsedNodes.add(inst.id);
            }
            this.render();
        });
        nodeEl.appendChild(chevron);

        // Icon
        const iconName = this.getIconForClass(inst.ClassName);
        const iconEl = document.createElement('span');
        iconEl.className = `explorer-icon class-${inst.ClassName.toLowerCase()}`;
        iconEl.innerHTML = `<i data-lucide="${iconName}"></i>`;
        nodeEl.appendChild(iconEl);

        // Label
        const label = document.createElement('span');
        label.className = 'explorer-label';
        label.textContent = inst.Name;
        nodeEl.appendChild(label);

        // Signature Roblox Studio "+" hover button!
        const addBtn = document.createElement('button');
        addBtn.className = 'explorer-add-btn';
        addBtn.title = `Insert Object into ${inst.Name}`;
        addBtn.innerHTML = `+`;
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = addBtn.getBoundingClientRect();
            this.showInsertPopup(rect.left, rect.bottom + 4, inst);
        });
        nodeEl.appendChild(addBtn);

        // Selection click with Shift (top-down or bottom-up) and Ctrl toggle
        nodeEl.addEventListener('click', (e) => {
            e.stopPropagation();

            if (window._instancePickCallback) {
                window._instancePickCallback(inst);
                return;
            }

            // 1. Shift Range Selection
            if (e.shiftKey && this.anchorInstance) {
                const visible = this.getVisibleNodes();
                const fromIdx = visible.indexOf(this.anchorInstance);
                const toIdx = visible.indexOf(inst);

                if (fromIdx !== -1 && toIdx !== -1) {
                    const start = Math.min(fromIdx, toIdx);
                    const end = Math.max(fromIdx, toIdx);
                    const range = visible.slice(start, end + 1);

                    this.selectedInstances = new Set(range);
                    this.selectedInstance = inst;
                    this.updateSelectionClasses();
                    if (this.onSelect) this.onSelect(inst, range);
                    return;
                }
            }

            // 2. Ctrl / Cmd Toggle Selection
            if (e.ctrlKey || e.metaKey) {
                if (this.selectedInstances.has(inst)) {
                    this.selectedInstances.delete(inst);
                    this.selectedInstance = this.selectedInstances.size > 0 ? Array.from(this.selectedInstances)[this.selectedInstances.size - 1] : null;
                } else {
                    this.selectedInstances.add(inst);
                    this.selectedInstance = inst;
                    this.anchorInstance = inst;
                }
                this.updateSelectionClasses();
                if (this.onSelect) this.onSelect(this.selectedInstance, Array.from(this.selectedInstances));
                return;
            }

            // 3. Normal Single Selection
            this.anchorInstance = inst;
            this.selectedInstances = new Set([inst]);
            this.selectedInstance = inst;
            this.updateSelectionClasses();
            if (this.onSelect) this.onSelect(inst, [inst]);
        });

        // Double click: open script
        nodeEl.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            if ((inst.ClassName === 'Script' || inst.ClassName === 'LocalScript' || inst.ClassName === 'ModuleScript') && this.onOpenScript) {
                this.onOpenScript(inst);
            }
        });

        // Context menu
        nodeEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!this.selectedInstances.has(inst)) {
                this.setSelected(inst);
                if (this.onSelect) this.onSelect(inst, [inst]);
            }
            this.showContextMenu(e.clientX, e.clientY, inst);
        });

        parentEl.appendChild(nodeEl);

        // Render children
        if (hasChildren && (!isCollapsed || this.filterText)) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'explorer-children';
            parentEl.appendChild(childrenContainer);

            for (const child of children) {
                this.renderNode(child, childrenContainer, depth + 1);
            }
        }
    }

    updateSelectionClasses() {
        const allNodes = this.container.querySelectorAll('.explorer-node');
        allNodes.forEach(node => {
            const id = node.dataset.id;
            const isSel = Array.from(this.selectedInstances).some(i => i.id === id);
            if (isSel) {
                node.classList.add('selected');
            } else {
                node.classList.remove('selected');
            }
        });
    }

    select(inst) {
        this.setSelected(inst);
        if (this.onSelect) this.onSelect(inst, [inst]);
        return inst;
    }

    setSelected(inst) {
        if (!inst) {
            this.selectedInstance = null;
            this.selectedInstances.clear();
            this.updateSelectionClasses();
            return;
        }

        this.selectedInstance = inst;
        this.selectedInstances = new Set([inst]);
        this.anchorInstance = inst;

        let ancestor = inst.Parent;
        let expandedAny = false;
        while (ancestor) {
            if (this.collapsedNodes.has(ancestor.id)) {
                this.collapsedNodes.delete(ancestor.id);
                expandedAny = true;
            }
            ancestor = ancestor.Parent;
        }

        const curExists = this.container.querySelector(`.explorer-node[data-id="${inst.id}"]`);
        if (expandedAny || !curExists) {
            this.render();
        } else {
            this.updateSelectionClasses();
        }

        const cur = this.container.querySelector(`.explorer-node[data-id="${inst.id}"]`);
        if (cur) cur.scrollIntoView({ block: 'nearest' });
    }
}
