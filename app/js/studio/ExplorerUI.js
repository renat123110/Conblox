/**
 * Conblox Explorer Tree Panel
 * Replicates Roblox Studio Explorer hierarchy, search, hover '+' Insert Object popup, and context menu
 */

import { Part, SpawnLocation } from '../engine/BasePart.js';
import { Model, Folder, Script, LocalScript, PointLight, Humanoid, BloomEffect, Atmosphere, DepthOfFieldEffect, SunRaysEffect, Sky, SkyBox, Clouds, Decal, Texture, Sound, Weld, WeldConstraint, WeldConstant, Motor6D } from '../engine/OtherInstances.js';
import { TemplateManager } from './TemplateManager.js';
import { Vector3, Color3 } from '../engine/Math3D.js';

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
                if (item.GetChildren().length > 0) this.collapsedNodes.add(item.id);
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

        if (dm.DescendantRemoved) {
            this._dmDescendantRemovedConn = dm.DescendantRemoved.Connect((descendant) => {
                if (descendant) {
                    this.selectedInstances.delete(descendant);
                    if (this.selectedInstance === descendant) {
                        this.selectedInstance = this.selectedInstances.size > 0 ? Array.from(this.selectedInstances)[0] : null;
                    }
                }
                this.render();
            });
        }
        if (dm.DescendantAdded) {
            this._dmDescendantAddedConn = dm.DescendantAdded.Connect((descendant) => {
                if (descendant && descendant.Changed) {
                    descendant.Changed.Connect((prop) => {
                        if (prop === 'Name') this.requestRender();
                    });
                }
                this.render();
            });
        }
        this.bindDataModelEvents(dm);
        this.render();
    }

    requestRender() {
        if (this._renderTimeout) return;
        this._renderTimeout = setTimeout(() => {
            this._renderTimeout = null;
            this.render();
        }, 16);
    }

    bindDataModelEvents(node) {
        node.ChildAdded.Connect(() => this.render());
        node.ChildRemoved.Connect(() => this.render());
        node.Changed.Connect((prop) => {
            if (prop === 'Name') this.render();
        });
        for (const child of node.GetChildren()) {
            this.bindDataModelEvents(child);
        }
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
                { name: 'Decal', icon: 'image', create: () => this.createDecalIn(targetInst) },
                { name: 'Texture', icon: 'grid', create: () => this.createTextureIn(targetInst) },
                { name: 'Script', icon: 'file-code', create: () => this.createScriptIn(targetInst) },
                { name: 'LocalScript', icon: 'file-terminal', create: () => this.createLocalScriptIn(targetInst) },
                { name: 'PointLight', icon: 'lightbulb', create: () => this.createLightIn(targetInst) },
                { name: 'SkyBox', icon: 'cloud-sun', create: () => this.createSkyIn(targetInst) },
                { name: 'Clouds', icon: 'cloud', create: () => this.createCloudsIn(targetInst) },
                { name: 'Atmosphere', icon: 'wind', create: () => this.createAtmosphereIn(targetInst) },
                { name: 'BloomEffect', icon: 'sparkles', create: () => this.createBloomIn(targetInst) },
                { name: 'SunRaysEffect', icon: 'sun', create: () => this.createSunRaysIn(targetInst) },
                { name: 'DepthOfFieldEffect', icon: 'aperture', create: () => this.createDepthOfFieldIn(targetInst) },
                { name: 'Sky', icon: 'cloud-sun', create: () => this.createSkyIn(targetInst) },
                { name: 'Folder', icon: 'folder', create: () => this.createFolderIn(targetInst) },
                { name: 'Model', icon: 'package', create: () => this.createModelIn(targetInst) },
                { name: 'Humanoid', icon: 'user', create: () => this.createHumanoidIn(targetInst) },
                { name: 'Weld', icon: 'link', create: () => this.createWeldIn(targetInst) },
                { name: 'WeldConstraint', icon: 'link-2', create: () => this.createWeldConstraintIn(targetInst) },
                { name: 'Motor6D', icon: 'rotate-cw', create: () => this.createMotor6DIn(targetInst) }
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

    createLightIn(parent) {
        const l = new PointLight();
        l.Parent = parent;
        this.expandNode(parent);
        this.setSelected(l);
        if (this.onSelect) this.onSelect(l);
        window.conbloxStudio?.historyManager?.recordState();
        return l;
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

    createMotor6DIn(parent) {
        const m = new Motor6D();
        m.Name = 'Motor6D';
        m.Parent = parent;
        this.expandNode(parent);
        this.setSelected(m);
        if (this.onSelect) this.onSelect(m);
        window.conbloxStudio?.historyManager?.recordState();
        return m;
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

        this.contextMenuEl.innerHTML = `
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
                if (action === 'insert-object') {
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
            case 'SpawnLocation': return 'map-pin';
            case 'Model': return 'package';
            case 'Folder': return 'folder';
            case 'Script': return 'file-code';
            case 'LocalScript': return 'file-terminal';
            case 'PointLight': return 'lightbulb';
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
            let children = inst.GetChildren();
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
                const hasMatchingChild = this.filterText && child.GetDescendants().some(d => d.Name.toLowerCase().includes(this.filterText));
                if (!this.filterText || matchesSelf || hasMatchingChild) {
                    visible.push(child);
                    const hasChildren = child.GetChildren().length > 0;
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
        let children = inst.GetChildren();
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
        const hasMatchingChild = this.filterText && inst.GetDescendants().some(d => d.Name.toLowerCase().includes(this.filterText));

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

                item.Parent = inst;
                movedCount++;
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
            if ((inst.ClassName === 'Script' || inst.ClassName === 'LocalScript') && this.onOpenScript) {
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
