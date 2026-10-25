/**
 * Conblox Studio Application Main Controller
 * Orchestrates Engine, Viewport, UI Panels, Physics, Scripts, and Place Serialization
 */

import { DataModel } from '../engine/DataModel.js';
import { Instance } from '../engine/Instance.js';
import { Part, SpawnLocation } from '../engine/BasePart.js';
import { Model, Folder, Script, LocalScript, PointLight, Sound, Decal, Texture } from '../engine/OtherInstances.js';
import { Vector3, Color3 } from '../engine/Math3D.js';
import { PhysicsEngine } from '../engine/PhysicsEngine.js';
import { CharacterController } from '../engine/CharacterController.js';
import { MultiplayerClient } from '../engine/MultiplayerClient.js';
import { ScriptRunner } from '../engine/ScriptRunner.js';
import { SoundEngine } from '../engine/SoundEngine.js';

import { Viewport } from './Viewport.js';
import { GizmoManager } from './GizmoManager.js';
import { ExplorerUI } from './ExplorerUI.js';
import { PropertiesUI } from './PropertiesUI.js';
import { RibbonUI } from './RibbonUI.js';
import { OutputUI } from './OutputUI.js';
import { ScriptEditorUI } from './ScriptEditorUI.js';
import { HistoryManager } from './HistoryManager.js';
import { TemplateManager } from './TemplateManager.js';
import { SettingsUI } from './SettingsUI.js';
import { nativeInputManager } from '../engine/NativeInputManager.js';

export class StudioApp {
    constructor() {
        this.dataModel = null;
        this.viewport = null;
        this.gizmoManager = null;
        this.explorerUI = null;
        this.propertiesUI = null;
        this.ribbonUI = null;
        this.outputUI = null;
        this.scriptEditorUI = null;
        this.physicsEngine = null;
        this.characterController = null;
        this.multiplayerClient = null;
        this.scriptRunner = null;
        this.historyManager = null;
        this.settingsUI = null;

        this.selectedInstance = null;
        this.simulationState = 'Edit'; // 'Edit', 'Play', 'Run'
        this.isPaused = false;
        this.pendingSimulationSteps = 0;
        this.editSnapshot = null;
        this.currentPlaceName = 'baseplate.cblx';
        this.clipboard = null;

        this.lastFrameTime = performance.now();
        this.animationFrameId = null;

        // Expose globally for context actions
        window.conbloxStudio = this;
        window.conbloxInstance = Instance;
    }

    init() {
        // 1. Initialize DataModel
        this.dataModel = new DataModel();
        this.dataModel.createDefaultPlace();

        // 2. Output UI
        const outputContainer = document.getElementById('panel-output');
        this.outputUI = new OutputUI(outputContainer, (cmd) => {
            this.scriptRunner.executeCommand(cmd);
        });

        // 3. Viewport
        const viewportContainer = document.getElementById('viewport-3d');
        this.viewport = new Viewport(viewportContainer, this.dataModel);

        // 4. Gizmos
        this.gizmoManager = new GizmoManager(
            this.viewport,
            () => {
                this.propertiesUI.scheduleUpdateValues();
            },
            (part) => {
                this.historyManager.recordState();
            }
        );

        // 5. Explorer UI
        const explorerContainer = document.getElementById('panel-explorer');
        this.explorerUI = new ExplorerUI(
            explorerContainer,
            this.dataModel,
            (inst, range) => this.selectInstance(inst, range),
            (script) => this.openScriptEditor(script)
        );

        // 6. Properties UI
        const propertiesContainer = document.getElementById('panel-properties');
        this.propertiesUI = new PropertiesUI(
            propertiesContainer,
            this.dataModel,
            (inst, commit = false) => {
                if (inst && inst.IsA && inst.IsA('BasePart')) {
                    this.viewport.syncPartMesh(inst);
                    if (this.gizmoManager) this.gizmoManager.update();
                } else if (inst && inst.ClassName === 'Lighting') {
                    this.viewport.syncAllParts();
                }
                if (commit) {
                    this.historyManager.recordState();
                }
            }
        );

        // 7. Script Editor UI
        const tabsBarEl = document.getElementById('center-tabs-bar');
        const scriptEditorContainer = document.getElementById('script-editor-container');
        this.scriptEditorUI = new ScriptEditorUI(tabsBarEl, scriptEditorContainer, viewportContainer, this.dataModel);

        // 8. Ribbon UI
        const ribbonContainer = document.getElementById('studio-ribbon-container');
        this.ribbonUI = new RibbonUI(ribbonContainer, this);

        // 9. Sound, Physics & Simulation
        this.soundEngine = new SoundEngine();
        this.physicsEngine = new PhysicsEngine(this.dataModel);
        this.characterController = new CharacterController(this.dataModel, this.physicsEngine, this.soundEngine, this.viewport);
        this.viewport.characterController = this.characterController;
        this.multiplayerClient = new MultiplayerClient(this);
        this.scriptRunner = new ScriptRunner(this.dataModel, this.outputUI);

        // Core RunService linkage & Drag-and-Drop
        if (this.dataModel.RunService) {
            this.dataModel.RunService.setStudioApp(this);
        }
        this.setupDragAndDrop();

        // 10. History
        this.historyManager = new HistoryManager(
            this.dataModel,
            (targetId, targetName, targetItems) => {
                // 1. Immediately detach gizmo so controls never clings to a stale mesh
                if (this.gizmoManager) {
                    this.gizmoManager.detach();
                }

                // 2. Synchronize all 3D meshes & UIs with deserialized instances
                this.viewport.syncAllParts();
                this.explorerUI.render();
                this.propertiesUI.render();

                // 3. Find restored instance by stable ID first, then fallback to name
                let restored = null;
                if (targetId) {
                    restored = this.findRestoredInstanceById(targetId);
                }
                if (!restored && targetName) {
                    restored = this.findRestoredInstanceByName(targetName);
                }

                // 4. Re-select and re-attach gizmos cleanly
                const restoredSelection = (targetItems || []).map(item => {
                    return this.findRestoredInstanceById(item.id) || this.findRestoredInstanceByName(item.name);
                }).filter(Boolean);
                if (restored && !restoredSelection.includes(restored)) {
                    restoredSelection.push(restored);
                }
                const activeSelection = restoredSelection.find(item => item.id === targetId) ||
                    restoredSelection[restoredSelection.length - 1] || restored || null;
                this.selectInstance(activeSelection, restoredSelection.length > 1 ? restoredSelection : null);
                if (this.gizmoManager) {
                    this.gizmoManager.updatePivotPosition();
                    this.gizmoManager.pivotObject?.updateMatrixWorld(true);
                    this.gizmoManager.controls?.updateMatrixWorld(true);
                    if (this.gizmoManager.currentMode === 'scale') {
                        this.gizmoManager.updateScaleHandles();
                    }
                }
            },
            () => {
                if (!this.selectedInstance) return null;
                const selectedItems = this.explorerUI?.selectedInstances?.size > 1
                    ? Array.from(this.explorerUI.selectedInstances)
                    : [this.selectedInstance];
                if (!selectedItems.includes(this.selectedInstance)) selectedItems.push(this.selectedInstance);
                return {
                    id: this.selectedInstance.id,
                    name: this.selectedInstance.Name,
                    items: selectedItems.map(item => ({ id: item.id, name: item.Name }))
                };
            }
        );
        this.historyManager.recordState();

        // 11. Studio Settings UI
        this.settingsUI = new SettingsUI(this);

        // Bind 3D raycast click selection with drag & gizmo protection
        let mouseDownPos = null;
        this.viewport.renderer.domElement.addEventListener('mousedown', (e) => {
            mouseDownPos = { x: e.clientX, y: e.clientY };
        });

        this.viewport.renderer.domElement.addEventListener('click', (e) => {
            if (window._instancePickCallback) return;
            if (this.isCharacterSimulation()) return;
            // Prevent selection if gizmo is active, just dragged, or mouse is over gizmo handle
            if (this.viewport.isTransformDragging || this.viewport.justFinishedTransformDrag) return;
            if (this.gizmoManager && this.gizmoManager.isHovered && this.gizmoManager.isHovered()) return;

            // If mouse moved more than 4 pixels between mousedown and mouseup, it was a drag, not a click
            if (mouseDownPos) {
                const dist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
                if (dist > 4) return;
            }

            const clickedRaw = this.viewport.raycast(e.clientX, e.clientY, !e.altKey);
            let clickedPart = clickedRaw;
            if (clickedRaw && !e.altKey) {
                let curr = clickedRaw.Parent;
                let topModel = null;
                while (curr && curr !== this.dataModel && curr !== this.dataModel.Workspace) {
                    if (curr.IsA && curr.IsA('Model')) {
                        topModel = curr;
                    }
                    curr = curr.Parent;
                }
                if (topModel) clickedPart = topModel;
            }

            if (e.shiftKey) {
                // Multi-selection via Shift in 3D Viewport (synchronized with Explorer)
                let currentList = [];
                if (this.explorerUI && this.explorerUI.selectedInstances && this.explorerUI.selectedInstances.size > 0) {
                    currentList = Array.from(this.explorerUI.selectedInstances);
                } else if (this.selectedInstance) {
                    currentList = [this.selectedInstance];
                }

                if (clickedPart) {
                    const idx = currentList.indexOf(clickedPart);
                    if (idx >= 0) {
                        currentList.splice(idx, 1);
                    } else {
                        currentList.push(clickedPart);
                    }
                }
                const active = currentList.length > 0 ? currentList[currentList.length - 1] : null;
                this.selectInstance(active, currentList);
            } else {
                this.selectInstance(clickedPart);
            }
        });

        // Global hotkeys
        this.bindHotkeys();

        // Right dock vertical resizer
        this.bindDockSplitter();

        // FPS Counter element (toggled with F9, hidden by default)
        this.fpsCounterEl = document.createElement('div');
        this.fpsCounterEl.id = 'conblox-fps-counter';
        this.fpsCounterEl.style.cssText = `
            position: absolute;
            top: 10px;
            right: 14px;
            background: rgba(18, 20, 26, 0.85);
            color: #00ff88;
            font-family: monospace;
            font-size: 13px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            pointer-events: none;
            z-index: 1000;
            display: none;
            user-select: none;
            backdrop-filter: blur(4px);
        `;
        this.fpsCounterEl.textContent = '60 FPS';
        const vpContainer = document.getElementById('viewport-3d') || document.body;
        vpContainer.appendChild(this.fpsCounterEl);

        // Initial sync
        this.viewport.syncAllParts();
        this.explorerUI.render();

        // Start render loop
        this.startLoop();

        // Automatically open baseplate.cblx from places folder
        this.loadInitialPlace();
    }

    bindDockSplitter() {
        const splitEl = document.getElementById('panel-split-right');
        const explorerEl = document.getElementById('panel-explorer-container');
        if (!splitEl || !explorerEl) return;

        let isSplitting = false;
        let startY = 0;
        let startExpH = 0;

        splitEl.addEventListener('mousedown', (e) => {
            isSplitting = true;
            startY = e.clientY;
            startExpH = explorerEl.clientHeight;
            document.body.style.cursor = 'row-resize';
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isSplitting) return;
            const dy = e.clientY - startY;
            const newH = Math.max(90, Math.min(window.innerHeight - 250, startExpH + dy));
            explorerEl.style.flex = 'none';
            explorerEl.style.height = `${newH}px`;
        });

        window.addEventListener('mouseup', () => {
            if (isSplitting) {
                isSplitting = false;
                document.body.style.cursor = 'default';
            }
        });
    }

    bindHotkeys() {
        window.addEventListener('keydown', (e) => {
            if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
                return;
            }

            // Ctrl+S: Save
            if (e.ctrlKey && e.code === 'KeyS') {
                e.preventDefault();
                this.savePlace();
            }
            // Ctrl+Z: Undo
            else if (e.ctrlKey && !e.shiftKey && e.code === 'KeyZ') {
                e.preventDefault();
                this.undo();
            }
            // Ctrl+Y or Ctrl+Shift+Z: Redo
            else if ((e.ctrlKey && e.code === 'KeyY') || (e.ctrlKey && e.shiftKey && e.code === 'KeyZ')) {
                e.preventDefault();
                this.redo();
            }
            // Ctrl+D: Duplicate (exact transform)
            else if (e.ctrlKey && e.code === 'KeyD') {
                e.preventDefault();
                this.duplicateSelected();
            }
            // Ctrl+C: Copy selected instances
            else if (e.ctrlKey && e.code === 'KeyC') {
                e.preventDefault();
                this.copySelected();
            }
            // Ctrl+V: Paste copied instances
            else if (e.ctrlKey && e.code === 'KeyV') {
                e.preventDefault();
                this.pasteClipboard();
            }
            // Ctrl+G: Group
            else if (e.ctrlKey && e.code === 'KeyG') {
                e.preventDefault();
                this.groupSelected();
            }
            // Ctrl+U: Ungroup
            else if (e.ctrlKey && e.code === 'KeyU') {
                e.preventDefault();
                this.ungroupSelected();
            }
            // Delete: Delete selected
            else if (e.code === 'Delete' || e.code === 'Backspace') {
                e.preventDefault();
                this.deleteSelected();
            }
            // F5: Play
            else if (e.code === 'F5') {
                e.preventDefault();
                if (this.simulationState === 'Edit') this.startSimulation(this.ribbonUI.getSelectedSimulationMode());
                else this.stopSimulation();
            }
            // F9: Toggle FPS Counter (default hidden)
            else if (e.code === 'F9') {
                e.preventDefault();
                this.toggleFpsCounter();
            }
            // Alt+S: Open Studio Settings
            else if (e.altKey && e.code === 'KeyS') {
                e.preventDefault();
                if (this.settingsUI) this.settingsUI.toggle();
            }
            // Escape: Roblox ESC menu in Play mode, or deselect in Edit mode
            else if (e.code === 'Escape') {
                if (this.isCharacterSimulation()) {
                    e.preventDefault();
                    this.toggleEscMenu();
                } else {
                    this.selectInstance(null);
                }
            }
        });
    }

    toggleFpsCounter() {
        if (!this.fpsCounterEl) return;
        const isHidden = this.fpsCounterEl.style.display === 'none';
        this.fpsCounterEl.style.display = isHidden ? 'block' : 'none';
    }

    selectInstance(inst, multiInstances = null) {
        this.selectedInstance = inst;
        if (multiInstances && multiInstances.length > 1) {
            if (this.explorerUI) {
                this.explorerUI.selectedInstances = new Set(multiInstances);
                this.explorerUI.selectedInstance = inst;
                this.explorerUI.updateSelectionClasses();
            }
            const parts = [];
            for (const item of multiInstances) {
                if (!item) continue;
                if (item.IsA && item.IsA('BasePart')) parts.push(item);
                else if (item.IsA && item.IsA('Model')) {
                    parts.push(...item.GetDescendants().filter(d => d && d.IsA && d.IsA('BasePart')));
                }
            }
            if (this.viewport && this.viewport.setSelectedParts) {
                this.viewport.setSelectedParts(parts);
            }
        } else {
            this.explorerUI.setSelected(inst);
            if (inst && inst.IsA && inst.IsA('Model')) {
                const parts = inst.GetDescendants().filter(d => d && d.IsA && d.IsA('BasePart'));
                if (this.viewport && this.viewport.setSelectedParts) {
                    this.viewport.setSelectedParts(parts);
                }
            } else if (inst && inst.IsA && inst.IsA('BasePart')) {
                if (this.viewport && this.viewport.setSelectedParts) {
                    this.viewport.setSelectedParts([inst]);
                } else if (this.viewport) {
                    this.viewport.setSelectedPart(inst);
                }
            } else if (this.viewport) {
                if (this.viewport.setSelectedParts) {
                    this.viewport.setSelectedParts([]);
                } else {
                    this.viewport.setSelectedPart(null);
                }
            }
        }
        this.propertiesUI.setTarget(inst);

        if (inst && inst.IsA && (inst.IsA('BasePart') || inst.IsA('Model'))) {
            this.gizmoManager.attachTo(inst, multiInstances);
        } else if (multiInstances && multiInstances.some(i => i && i.IsA && (i.IsA('BasePart') || i.IsA('Model')))) {
            const firstPartOrModel = multiInstances.find(i => i && i.IsA && (i.IsA('BasePart') || i.IsA('Model')));
            this.gizmoManager.attachTo(firstPartOrModel, multiInstances);
        } else {
            this.gizmoManager.detach();
        }
    }

    spawnPart(shape = 'Block') {
        const part = new Part();
        part.Name = shape === 'Block' ? 'Part' : shape;
        part.Shape = shape;

        // Position in front of camera
        const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(this.viewport.camera.quaternion);
        const spawnPos = this.viewport.camera.position.clone().addScaledVector(fwd, 15);

        // Snap to whole studs
        part.Position = new Vector3(Math.round(spawnPos.x), Math.max(1, Math.round(spawnPos.y)), Math.round(spawnPos.z));
        part.Size = (shape === 'Ball' || shape === 'Cylinder') ? new Vector3(3, 3, 3) : new Vector3(4, 2, 2);
        part.Color = Color3.fromRGB(163, 162, 165);
        part.Material = 'Plastic';
        part.Anchored = false;
        part.Parent = this.dataModel.Workspace;

        this.viewport.syncPartMesh(part);
        this.selectInstance(part);
        this.historyManager.recordState();
        this.outputUI.log('info', `Created ${shape} at ${part.Position.toString()}`);
        return part;
    }

    spawnLocation() {
        const spawn = new SpawnLocation();
        const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(this.viewport.camera.quaternion);
        const pos = this.viewport.camera.position.clone().addScaledVector(fwd, 15);
        spawn.Position = new Vector3(Math.round(pos.x), 1, Math.round(pos.z));
        spawn.Parent = this.dataModel.Workspace;

        this.viewport.syncPartMesh(spawn);
        this.selectInstance(spawn);
        this.historyManager.recordState();
        this.outputUI.log('info', `Created SpawnLocation at ${spawn.Position.toString()}`);
        return spawn;
    }

    createPointLight(parent = null) {
        const light = new PointLight();
        light.Parent = parent || (this.selectedInstance && this.selectedInstance.IsA('BasePart') ? this.selectedInstance : this.dataModel.Workspace);
        this.selectInstance(light);
        this.historyManager.recordState();
        this.outputUI.log('info', `Created PointLight in ${light.Parent.Name}`);
        return light;
    }

    createScript(parent = null) {
        const script = new Script();
        script.Parent = parent || (this.selectedInstance || this.dataModel.Workspace);
        this.selectInstance(script);
        this.historyManager.recordState();
        this.openScriptEditor(script);
        this.outputUI.log('info', `Created Script in ${script.Parent.Name}`);
        return script;
    }

    createLocalScript(parent = null) {
        const script = new LocalScript();
        script.Parent = parent || (this.selectedInstance || this.dataModel.StarterPlayer?.StarterPlayerScripts || this.dataModel.Workspace);
        this.selectInstance(script);
        this.historyManager.recordState();
        this.openScriptEditor(script);
        this.outputUI.log('info', `Created LocalScript in ${script.Parent.Name}`);
        return script;
    }

    createFolder(parent = null) {
        const folder = new Folder();
        folder.Parent = parent || this.dataModel.Workspace;
        this.selectInstance(folder);
        this.historyManager.recordState();
        return folder;
    }

    duplicateSelected() {
        const instancesToDuplicate = (this.explorerUI?.selectedInstances?.size > 1)
            ? Array.from(this.explorerUI.selectedInstances).filter(i => i.Parent !== this.dataModel && i !== this.dataModel)
            : (this.selectedInstance && this.selectedInstance.Parent !== this.dataModel && this.selectedInstance !== this.dataModel ? [this.selectedInstance] : []);

        if (instancesToDuplicate.length === 0) return;

        const newClones = [];
        for (const inst of instancesToDuplicate) {
            const clone = inst.Clone();
            if (clone) {
                clone.Parent = inst.Parent;
                // Authentic Roblox Ctrl+D: exact same position, rotation, and size (zero offset)
                newClones.push(clone);
            }
        }

        if (newClones.length > 0) {
            this.viewport.syncAllParts();
            this.selectInstance(newClones[newClones.length - 1]);
            if (this.explorerUI) {
                this.explorerUI.selectedInstances = new Set(newClones);
                this.explorerUI.updateSelectionClasses();
            }
            this.historyManager.recordState();
            this.outputUI.log('info', `Duplicated ${newClones.length} item(s)`);
        }
    }

    copySelected() {
        const instancesToCopy = (this.explorerUI?.selectedInstances?.size > 1)
            ? Array.from(this.explorerUI.selectedInstances).filter(i => i.Parent !== this.dataModel && i !== this.dataModel)
            : (this.selectedInstance && this.selectedInstance.Parent !== this.dataModel && this.selectedInstance !== this.dataModel ? [this.selectedInstance] : []);

        if (instancesToCopy.length === 0) return;

        this.clipboard = instancesToCopy.map(inst => ({
            serialized: inst.serialize(),
            parentName: inst.Parent ? inst.Parent.Name : null,
            parentId: inst.Parent ? inst.Parent.id : null
        }));
        this.outputUI.log('info', `Copied ${this.clipboard.length} item(s)`);
    }

    pasteClipboard() {
        if (!this.clipboard || this.clipboard.length === 0) return;

        const newInstances = [];
        for (const item of this.clipboard) {
            const inst = Instance.deserialize(item.serialized, true);
            if (inst) {
                let targetParent = this.dataModel.Workspace;
                if (this.selectedInstance) {
                    if (this.selectedInstance.ClassName === 'Model' || this.selectedInstance.ClassName === 'Folder') {
                        targetParent = this.selectedInstance;
                    } else if (this.selectedInstance.Parent && this.selectedInstance.Parent !== this.dataModel) {
                        targetParent = this.selectedInstance.Parent;
                    }
                } else if (item.parentId) {
                    const p = this.dataModel.GetDescendants().find(d => d.id === item.parentId);
                    if (p) targetParent = p;
                }
                inst.Parent = targetParent;
                newInstances.push(inst);
            }
        }

        if (newInstances.length > 0) {
            this.viewport.syncAllParts();
            this.selectInstance(newInstances[newInstances.length - 1]);
            if (this.explorerUI) {
                this.explorerUI.selectedInstances = new Set(newInstances);
                this.explorerUI.updateSelectionClasses();
            }
            this.historyManager.recordState();
            this.outputUI.log('info', `Pasted ${newInstances.length} item(s)`);
        }
    }

    groupSelected() {
        const isGroupable = (i) => i && i.Parent !== this.dataModel && i !== this.dataModel && i.ClassName !== 'Terrain' && i.Name !== 'Terrain';
        const instancesToGroup = (this.explorerUI?.selectedInstances?.size > 0)
            ? Array.from(this.explorerUI.selectedInstances).filter(isGroupable)
            : (this.selectedInstance && isGroupable(this.selectedInstance) ? [this.selectedInstance] : []);

        if (instancesToGroup.length === 0) return;

        const targetParent = instancesToGroup[0].Parent || this.dataModel.Workspace;
        const model = new Model();
        model.Name = 'Model';
        model.Parent = targetParent;

        for (const inst of instancesToGroup) {
            inst.Parent = model;
        }

        const firstPart = instancesToGroup.find(i => i && i.IsA && i.IsA('BasePart')) ||
                          model.GetDescendants().find(d => d && d.IsA && d.IsA('BasePart'));
        if (firstPart) {
            model.PrimaryPart = firstPart;
        }

        if (this.explorerUI) {
            this.explorerUI.collapsedNodes.delete(model.id);
            if (targetParent.id) this.explorerUI.collapsedNodes.delete(targetParent.id);
            this.explorerUI.render();
        }

        this.viewport.syncAllParts();
        this.selectInstance(model);
        if (this.explorerUI) {
            this.explorerUI.selectedInstances = new Set([model]);
            this.explorerUI.selectedInstance = model;
            this.explorerUI.updateSelectionClasses();
        }

        this.historyManager.recordState();
        this.outputUI.log('info', `Grouped ${instancesToGroup.length} item(s) into Model`);
    }

    ungroupSelected() {
        const selected = (this.explorerUI?.selectedInstances?.size > 0)
            ? Array.from(this.explorerUI.selectedInstances)
            : (this.selectedInstance ? [this.selectedInstance] : []);

        const modelsToUngroup = selected.filter(inst => inst && inst.ClassName === 'Model' && inst !== this.dataModel && inst.Parent !== this.dataModel);
        if (modelsToUngroup.length === 0) return;

        const allUnpackedChildren = [];
        for (const model of modelsToUngroup) {
            const targetParent = model.Parent || this.dataModel.Workspace;
            const children = model.GetChildren().slice();
            for (const child of children) {
                child.Parent = targetParent;
                allUnpackedChildren.push(child);
            }
            model.Destroy();
        }

        if (this.explorerUI) {
            this.explorerUI.render();
        }
        this.viewport.syncAllParts();

        if (allUnpackedChildren.length > 0) {
            this.selectInstance(allUnpackedChildren[allUnpackedChildren.length - 1], allUnpackedChildren);
        } else {
            this.selectInstance(null);
        }

        this.historyManager.recordState();
        this.outputUI.log('info', `Ungrouped ${modelsToUngroup.length} model(s)`);
    }

    deleteSelected() {
        const isDeletable = (i) => i && i.Parent !== this.dataModel && i !== this.dataModel && i.ClassName !== 'Terrain' && i.Name !== 'Terrain';
        const instancesToDelete = (this.explorerUI?.selectedInstances?.size > 1) 
            ? Array.from(this.explorerUI.selectedInstances).filter(isDeletable)
            : (this.selectedInstance && isDeletable(this.selectedInstance) ? [this.selectedInstance] : []);

        if (instancesToDelete.length === 0) return;

        this.selectInstance(null);
        if (this.explorerUI) {
            this.explorerUI.selectedInstances.clear();
            this.explorerUI.updateSelectionClasses();
        }

        for (const inst of instancesToDelete) {
            inst.Destroy();
        }

        if (this.explorerUI) {
            this.explorerUI.render();
        }
        this.viewport.syncAllParts();
        this.historyManager.recordState();
        this.outputUI.log('info', `Deleted ${instancesToDelete.length} item(s)`);
    }

    applyColorToSelected(colorHex) {
        if (this.selectedInstance && this.selectedInstance.IsA && this.selectedInstance.IsA('BasePart')) {
            this.selectedInstance.Color = Color3.fromHex(colorHex);
            this.propertiesUI.updateValues();
            this.historyManager.recordState();
        }
    }

    applyMaterialToSelected(matName) {
        if (this.selectedInstance && this.selectedInstance.IsA && this.selectedInstance.IsA('BasePart')) {
            this.selectedInstance.Material = matName;
            this.propertiesUI.updateValues();
            this.historyManager.recordState();
        }
    }

    toggleAnchorSelected() {
        if (this.selectedInstance && this.selectedInstance.IsA && this.selectedInstance.IsA('BasePart')) {
            this.selectedInstance.Anchored = !this.selectedInstance.Anchored;
            this.propertiesUI.updateValues();
            this.historyManager.recordState();
            this.outputUI.log('info', `${this.selectedInstance.Name} Anchored = ${this.selectedInstance.Anchored}`);
        }
    }

    openScriptEditor(script) {
        this.scriptEditorUI.openScript(script);
    }

    undo() {
        const priorId = this.selectedInstance?.id || null;
        const priorName = this.selectedInstance?.Name || null;
        if (this.gizmoManager) this.gizmoManager.detach();
        this.historyManager.undo(priorId, priorName);
    }

    redo() {
        const priorId = this.selectedInstance?.id || null;
        const priorName = this.selectedInstance?.Name || null;
        if (this.gizmoManager) this.gizmoManager.detach();
        this.historyManager.redo(priorId, priorName);
    }

    findRestoredInstanceById(id) {
        if (!id || !this.dataModel || !this.dataModel.Workspace) return null;
        const all = this.dataModel.Workspace.GetDescendants();
        return all.find(i => i.id === id) || null;
    }

    findRestoredInstanceByName(name, parentName) {
        if (!name || !this.dataModel || !this.dataModel.Workspace) return null;
        const all = this.dataModel.Workspace.GetDescendants();
        if (parentName) {
            const match = all.find(i => i.Name === name && i.Parent?.Name === parentName);
            if (match) return match;
        }
        return all.find(i => i.Name === name) || null;
    }

    // SIMULATION
    isCharacterSimulation() {
        return this.simulationState === 'Test' || this.simulationState === 'TestHere';
    }

    startSimulation(mode = 'Test') {
        if (this.simulationState !== 'Edit') return;

        this.outputUI.log('info', `--- Simulation Started: ${mode} ---`);
        this.simulationState = mode;
        this.isPaused = false;
        this.pendingSimulationSteps = 0;
        this.ribbonUI.setSimulationState(mode);

        // Snapshot camera state before simulation to restore immediately on stop
        if (this.viewport && this.viewport.cameraPos) {
            this.cameraSnapshot = {
                pos: this.viewport.cameraPos.clone(),
                pitch: this.viewport.cameraPitch,
                yaw: this.viewport.cameraYaw,
                fov: this.viewport.camera.fov
            };
        }

        // Make sure viewport tab is active
        this.scriptEditorUI.showViewport();

        // 1. Take snapshot of current workspace for restore
        this.editSnapshot = this.dataModel.Workspace.serialize();

        // 2. Start physics
        this.physicsEngine.start();

        // 3. Start scripts
        this.scriptRunner.start();

        // 4. If Play mode: spawn player character
        if (mode === 'Test' || mode === 'TestHere') {
            this.viewport.setPlayMode(true);
            this.gizmoManager.detach();
            this.characterController.spawn(mode === 'TestHere' ? this.viewport.cameraPos : null);
            this.showPlayHUD();
            this.multiplayerClient.mountControls();
        }

        // 5. Authentic Roblox: Move/clone StarterPlayerScripts into Players.LocalPlayer.PlayerScripts
        const starterPlayer = this.dataModel.StarterPlayer;
        if (starterPlayer && starterPlayer.StarterPlayerScripts) {
            let localPlayer = this.dataModel.Players?.LocalPlayer;
            if (!localPlayer && this.dataModel.Players) {
                localPlayer = new Instance('Player');
                localPlayer.Name = 'Player';
                localPlayer.Parent = this.dataModel.Players;
                this.dataModel.Players.LocalPlayer = localPlayer;
            }
            if (localPlayer) {
                let playerScripts = localPlayer.FindFirstChild('PlayerScripts');
                if (!playerScripts) {
                    playerScripts = new Folder();
                    playerScripts.Name = 'PlayerScripts';
                    playerScripts.Parent = localPlayer;
                }
                for (const item of starterPlayer.StarterPlayerScripts.GetChildren()) {
                    const cloned = item.Clone();
                    if (cloned) {
                        cloned.Parent = playerScripts;
                        // Execute script only upon moving into PlayerScripts
                        if ((cloned.ClassName === 'Script' || cloned.ClassName === 'LocalScript') && this.scriptRunner) {
                            this.scriptRunner.runScript(cloned);
                        }
                    }
                }
            }
        }
    }

    stopSimulation() {
        if (this.simulationState === 'Edit') return;

        this.outputUI.log('info', '--- Simulation Stopped. Restoring state... ---');
        this.multiplayerClient.disconnect();
        if (this.multiplayerClient.panel) this.multiplayerClient.panel.hidden = true;

        this.viewport.setPlayMode(false);
        this.hidePlayHUD();

        // 0. Restore camera to pre-simulation position & angles immediately
        if (this.cameraSnapshot && this.viewport) {
            this.viewport.cameraPos.copy(this.cameraSnapshot.pos);
            this.viewport.cameraPitch = this.cameraSnapshot.pitch;
            this.viewport.cameraYaw = this.cameraSnapshot.yaw;
            if (this.viewport.camera.fov !== this.cameraSnapshot.fov) {
                this.viewport.camera.fov = this.cameraSnapshot.fov;
                this.viewport.camera.updateProjectionMatrix();
            }
            this.viewport.updateCameraTransform();
            this.cameraSnapshot = null;
        }

        // 1. Stop scripts & physics & character
        this.scriptRunner.stop();
        this.characterController.despawn();
        this.physicsEngine.stop();

        // Stop and reset RunService & UserInputService runtime state
        if (this.dataModel.RunService) {
            this.dataModel.RunService.reset();
        }
        if (this.dataModel.UserInputService) {
            this.dataModel.UserInputService.reset();
        }

        // Clean up runtime LocalPlayer
        if (this.dataModel.Players && this.dataModel.Players.LocalPlayer) {
            this.dataModel.Players.LocalPlayer.Destroy();
            this.dataModel.Players.LocalPlayer = null;
        }

        // 2. Restore Workspace from snapshot preserving singletons (Terrain, Camera)
        if (this.editSnapshot) {
            for (const child of [...this.dataModel.Workspace.GetChildren()]) {
                if (child.ClassName === 'Terrain' || child.ClassName === 'Camera') continue;
                child.Destroy();
            }
            if (this.editSnapshot.children) {
                for (const childData of this.editSnapshot.children) {
                    if (childData.className === 'Terrain' || childData.className === 'Camera') {
                        const existing = this.dataModel.Workspace.FindFirstChild(childData.className);
                        if (existing) {
                            if (childData.properties && existing.deserializeProperties) {
                                existing.deserializeProperties(childData.properties);
                            }
                            if (childData.children) {
                                for (const c of [...existing.GetChildren()]) c.Destroy();
                                for (const cData of childData.children) {
                                    const c = Instance.deserialize(cData, false);
                                    c.Parent = existing;
                                }
                            }
                            continue;
                        }
                    }
                    const child = Instance.deserialize(childData, false);
                    child.Parent = this.dataModel.Workspace;
                }
            }
            this.editSnapshot = null;
        }

        this.simulationState = 'Edit';
        this.isPaused = false;
        this.pendingSimulationSteps = 0;
        this.ribbonUI.setSimulationState('Edit');

        // Resync Three scene and UI
        this.viewport.syncAllParts();
        this.explorerUI.render();
        this.selectInstance(null);
    }

    toggleSimulationPause() {
        if (this.simulationState === 'Edit') return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.scriptRunner.pause();
            this.characterController.setPaused(true);
            this.viewport.setPausedCameraMode(true);
        } else {
            this.viewport.setPausedCameraMode(false);
            this.characterController.setPaused(false);
            this.scriptRunner.resume();
        }
        this.ribbonUI.setPaused(this.isPaused);
        this.outputUI.log('info', this.isPaused ? '--- Simulation Paused ---' : '--- Simulation Resumed ---');
    }

    stepSimulationFrame() {
        if (this.simulationState === 'Edit' || !this.isPaused) return;
        this.pendingSimulationSteps++;
    }

    showPlayHUD() {
        let hud = document.getElementById('play-hud-overlay');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'play-hud-overlay';
            hud.className = 'play-hud-overlay';
            document.getElementById('viewport-3d').appendChild(hud);
        }

        hud.innerHTML = `
            <div class="hud-topbar">
                <div class="hud-left">
                    <button class="roblox-topbar-btn" id="roblox-esc-trigger" title="Roblox Menu (Esc)">
                        <svg class="roblox-tilt-icon" viewBox="0 0 24 24" width="22" height="22">
                            <rect x="5" y="5" width="14" height="14" rx="3" transform="rotate(12 12 12)" fill="#ffffff" />
                            <rect x="9.5" y="9.5" width="5" height="5" rx="1" transform="rotate(12 12 12)" fill="#111216" />
                        </svg>
                    </button>
                </div>
                <div class="hud-right">
                    <div class="hud-health-container">
                        <div class="hud-health-info">
                            <span class="hud-player-name">Player</span>
                            <span class="hud-health-val" id="hud-health-text">100 / 100</span>
                        </div>
                        <div class="hud-health-bar-bg">
                            <div class="hud-health-bar-fill" id="hud-health-bar-fill" style="width: 100%;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        hud.style.display = 'block';

        // Bind top-left Roblox tilt button to toggle ESC menu
        const escTrigger = hud.querySelector('#roblox-esc-trigger');
        if (escTrigger) {
            escTrigger.onclick = () => {
                this.toggleEscMenu();
            };
        }

        // Bind health change listener
        if (this.characterController.humanoid) {
            const updateHealthUI = (hp) => {
                const fill = document.getElementById('hud-health-bar-fill');
                const txt = document.getElementById('hud-health-text');
                const maxHp = this.characterController.humanoid.MaxHealth || 100;
                const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));

                if (fill) {
                    fill.style.width = `${pct}%`;
                    if (pct < 30) fill.style.background = '#e53935';
                    else if (pct < 60) fill.style.background = '#fbc02d';
                    else fill.style.background = '#00d685';
                }
                if (txt) txt.textContent = `${Math.round(hp)} / ${Math.round(maxHp)}`;
            };

            this.characterController.humanoid.HealthChanged.Connect((hp) => updateHealthUI(hp));
        }
    }

    hidePlayHUD() {
        const hud = document.getElementById('play-hud-overlay');
        if (hud) hud.style.display = 'none';
        this.hideEscMenu();
    }

    toggleEscMenu(forceOpen = null) {
        let menu = document.getElementById('roblox-esc-overlay');
        const isOpen = menu && menu.style.display === 'flex';
        const shouldOpen = forceOpen !== null ? forceOpen : !isOpen;

        if (shouldOpen) this.showEscMenu();
        else this.hideEscMenu();
    }

    showEscMenu() {
        nativeInputManager.unlock({ restorePos: false });
        let overlay = document.getElementById('roblox-esc-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'roblox-esc-overlay';
            overlay.className = 'roblox-esc-overlay';
            document.getElementById('viewport-3d').appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="roblox-esc-backdrop"></div>
            <div class="roblox-esc-card">
                <div class="roblox-esc-card-header">
                    <div class="roblox-esc-title-group">
                        <svg class="roblox-tilt-icon" viewBox="0 0 24 24" width="24" height="24">
                            <rect x="5" y="5" width="14" height="14" rx="3" transform="rotate(12 12 12)" fill="#ffffff" />
                            <rect x="9.5" y="9.5" width="5" height="5" rx="1" transform="rotate(12 12 12)" fill="#1e2025" />
                        </svg>
                        <span class="roblox-esc-header-text">Experience Menu</span>
                    </div>
                    <button class="roblox-esc-close-btn" id="roblox-esc-btn-close" title="Resume (Esc)">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="roblox-esc-actions">
                    <button class="roblox-esc-item primary" id="roblox-esc-resume">
                        <i data-lucide="play"></i>
                        <div class="roblox-esc-item-texts">
                            <div class="roblox-esc-item-title">Resume</div>
                            <div class="roblox-esc-item-sub">Return to the experience</div>
                        </div>
                        <div class="roblox-esc-key-badge">Esc</div>
                    </button>
                    <button class="roblox-esc-item warning" id="roblox-esc-reset">
                        <i data-lucide="rotate-ccw"></i>
                        <div class="roblox-esc-item-texts">
                            <div class="roblox-esc-item-title">Reset Character</div>
                            <div class="roblox-esc-item-sub">Respawn your avatar at spawn location</div>
                        </div>
                        <div class="roblox-esc-key-badge">R</div>
                    </button>
                    <button class="roblox-esc-item danger" id="roblox-esc-leave">
                        <i data-lucide="log-out"></i>
                        <div class="roblox-esc-item-texts">
                            <div class="roblox-esc-item-title">Leave Experience</div>
                            <div class="roblox-esc-item-sub">Stop simulation and return to Studio</div>
                        </div>
                        <div class="roblox-esc-key-badge">L</div>
                    </button>
                </div>
            </div>
        `;

        overlay.style.display = 'flex';
        if (window.lucide) window.lucide.createIcons({ root: overlay });

        // Bind actions
        overlay.querySelector('.roblox-esc-backdrop').onclick = () => this.hideEscMenu();
        overlay.querySelector('#roblox-esc-btn-close').onclick = () => this.hideEscMenu();
        overlay.querySelector('#roblox-esc-resume').onclick = () => this.hideEscMenu();

        overlay.querySelector('#roblox-esc-reset').onclick = () => {
            if (this.characterController && this.characterController.active) {
                this.characterController.handleDeath();
            }
            this.hideEscMenu();
        };

        overlay.querySelector('#roblox-esc-leave').onclick = () => {
            this.hideEscMenu();
            this.stopSimulation();
        };
    }

    hideEscMenu() {
        const overlay = document.getElementById('roblox-esc-overlay');
        if (overlay) overlay.style.display = 'none';

        // Seamlessly re-lock in first person if simulation active
        if (this.isCharacterSimulation() && this.characterController && this.characterController.active) {
            if (this.characterController.isFirstPerson) {
                const targetEl = this.viewport?.renderer?.domElement || document.getElementById('viewport-3d');
                nativeInputManager.lock({
                    targetEl,
                    mode: 'character_first_person'
                });
            }
        }
    }

    // PLACE MANAGEMENT
    async newPlace() {
        if (confirm('Create new place? Unsaved changes will be lost.')) {
            this.stopSimulation();
            await this.loadInitialPlace();
            this.currentPlaceName = 'baseplate.cblx';
            const titleEl = document.getElementById('place-title-display');
            if (titleEl) titleEl.textContent = this.currentPlaceName;
            this.outputUI.log('info', 'Created new place (baseplate.cblx).');
        }
    }

    loadTemplate(templateKey) {
        this.stopSimulation();
        if (templateKey === 'baseplate') TemplateManager.loadBaseplate(this.dataModel);
        else if (templateKey === 'obby') TemplateManager.loadObby(this.dataModel);
        else if (templateKey === 'physics') TemplateManager.loadPhysicsSandbox(this.dataModel);

        this.viewport.syncAllParts();
        this.explorerUI.render();
        this.selectInstance(null);
        this.currentPlaceName = `Template_${templateKey}.cblx`;
        document.getElementById('place-title-display').textContent = this.currentPlaceName;
        this.outputUI.log('info', `Loaded template: ${templateKey}`);
    }

    async savePlace() {
        const placeData = {
            version: '1.0.0',
            name: this.currentPlaceName,
            timestamp: new Date().toISOString(),
            dataModel: this.dataModel.serialize()
        };

        const jsonStr = JSON.stringify(placeData, null, 2);

        // Try server API first
        try {
            const resp = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: this.currentPlaceName, data: placeData })
            });
            if (resp.ok) {
                this.outputUI.log('info', `Saved place successfully to server (${this.currentPlaceName})`);
                return;
            }
        } catch (e) {
            // Fallback to browser download
        }

        // Browser download fallback
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = this.currentPlaceName;
        a.click();
        this.outputUI.log('info', `Downloaded ${this.currentPlaceName}`);
    }

    async exportGame() {
        const placeData = {
            version: '1.0.0',
            name: this.currentPlaceName,
            timestamp: new Date().toISOString(),
            dataModel: this.dataModel.serialize()
        };
        try {
            const response = await fetch('/api/build', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: placeData })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'EXE export failed');
            }
            const blob = await response.blob();
            const filename = `${this.currentPlaceName.replace(/\.cblx$/i, '')}.exe`;
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            setTimeout(() => URL.revokeObjectURL(link.href), 1000);
            this.outputUI.log('info', `Exported game: ${filename}`);
        } catch (error) {
            this.outputUI.log('error', `EXE export failed: ${error.message}`);
            alert(`EXE export failed: ${error.message}`);
        }
    }

    promptLoadPlace() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.cblx,.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    this.loadPlaceData(data, file.name);
                } catch (err) {
                    this.outputUI.log('error', 'Failed to load place: ' + err.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    async loadInitialPlace() {
        const params = new URLSearchParams(location.search);
        const requestedPlace = params.get('place') || 'baseplate.cblx';
        const candidates = [...new Set([requestedPlace, 'baseplate.cblx'])];
        let loaded = false;
        for (const filename of candidates) {
            for (const route of [`/api/load?name=${encodeURIComponent(filename)}`, `/places/${encodeURIComponent(filename)}`]) {
                try {
                    const response = await fetch(route);
                    if (!response.ok) continue;
                    const placeData = await response.json();
                    this.loadPlaceData(placeData, filename);
                    this.outputUI.log('info', `Loaded ${filename} from places`);
                    loaded = true;
                    break;
                } catch (error) {
                    console.warn(`[Conblox] Failed to load ${filename}:`, error);
                }
            }
            if (loaded) break;
        }
        if (params.get('play') === '1') {
            document.body.classList.add('game-player');
            this.startSimulation('Test');
        }
    }

    loadPlaceData(placeData, filename = 'Place.cblx') {
        this.stopSimulation();

        if (placeData.dataModel) {
            this.dataModel.Destroy();
            this.dataModel = Instance.deserialize(placeData.dataModel, false);
            this.currentPlaceName = filename;
            const titleEl = document.getElementById('place-title-display');
            if (titleEl) {
                titleEl.textContent = this.currentPlaceName;
            }

            // Ensure CurrentCamera is properly linked
            if (this.dataModel.Workspace) {
                let cam = this.dataModel.Workspace.FindFirstChild('Camera');
                if (!cam) {
                    const CameraClass = Instance.classRegistry ? Instance.classRegistry.get('Camera') : null;
                    if (CameraClass) {
                        cam = new CameraClass();
                        cam.Name = 'Camera';
                        cam.Parent = this.dataModel.Workspace;
                    }
                }
                if (cam) {
                    this.dataModel.Workspace.CurrentCamera = cam;
                }
            }

            this.viewport.dataModel = this.dataModel;
            if (this.viewport.bindWorkspaceHierarchy) this.viewport.bindWorkspaceHierarchy();
            if (this.viewport.bindLightingAndAtmosphereHierarchy) this.viewport.bindLightingAndAtmosphereHierarchy();
            if (this.viewport.syncLightingAndEffects) this.viewport.syncLightingAndEffects();

            this.explorerUI.dataModel = this.dataModel;
            this.propertiesUI.dataModel = this.dataModel;
            this.physicsEngine.dataModel = this.dataModel;
            this.characterController.dataModel = this.dataModel;
            this.characterController.viewport = this.viewport;
            this.scriptRunner.dataModel = this.dataModel;

            if (this.historyManager) {
                this.historyManager.dataModel = this.dataModel;
                try {
                    if (typeof this.historyManager.clear === 'function') {
                        this.historyManager.clear();
                    } else {
                        this.historyManager.history = [];
                        this.historyManager.currentIndex = -1;
                    }
                    this.historyManager.recordState();
                } catch (err) {
                    console.warn('[StudioApp] HistoryManager reset error:', err);
                }
            }

            if (this.dataModel.RunService) {
                this.dataModel.RunService.setStudioApp(this);
            }

            this.viewport.syncAllParts();
            this.explorerUI.render();
            this.selectInstance(null);
            this.outputUI.log('info', `Loaded place: ${filename}`);
        }
    }

    togglePanel(panelName) {
        if (panelName === 'explorer') {
            const p = document.getElementById('panel-explorer-container');
            p.style.display = p.style.display === 'none' ? 'flex' : 'none';
        } else if (panelName === 'properties') {
            const p = document.getElementById('panel-properties-container');
            p.style.display = p.style.display === 'none' ? 'flex' : 'none';
        } else if (panelName === 'output') {
            const p = document.getElementById('panel-output');
            p.style.display = p.style.display === 'none' ? 'flex' : 'none';
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // MAIN ANIMATION LOOP
    startLoop() {
        let fpsFrameCount = 0;
        let lastFpsUpdate = performance.now();

        const loop = (currentTime) => {
            const dt = Math.min(0.1, (currentTime - this.lastFrameTime) / 1000);
            this.lastFrameTime = currentTime;

            // Update FPS counter
            fpsFrameCount++;
            if (currentTime - lastFpsUpdate >= 350) {
                const fps = Math.round((fpsFrameCount * 1000) / (currentTime - lastFpsUpdate));
                if (this.fpsCounterEl && this.fpsCounterEl.style.display !== 'none') {
                    this.fpsCounterEl.textContent = `${fps} FPS`;
                }
                fpsFrameCount = 0;
                lastFpsUpdate = currentTime;
            }

            const isSimulating = this.simulationState !== 'Edit';
            const isSimulationActive = isSimulating && !this.isPaused;

            // Camera movement in edit mode
            if (!isSimulating || this.isPaused || !this.isCharacterSimulation()) {
                this.viewport.updateFlyMovement(dt);
            }

            const shouldStep = isSimulationActive || (isSimulating && this.isPaused && this.pendingSimulationSteps > 0);
            if (shouldStep) {
                const stepDt = isSimulationActive ? dt : 1 / 60;
                this.advanceSimulationFrame(stepDt);
                if (this.isPaused && this.pendingSimulationSteps > 0) this.pendingSimulationSteps--;
            }

            // Render 3D Scene
            this.viewport.render(dt);

            this.animationFrameId = requestAnimationFrame(loop);
        };

        this.animationFrameId = requestAnimationFrame(loop);
    }

    advanceSimulationFrame(dt) {
        if (this.dataModel && this.dataModel.RunService) {
            this.dataModel.RunService._fireStepped(dt);
        }

        this.physicsEngine.step(dt);

        if (this.dataModel && this.dataModel.RunService) {
            this.dataModel.RunService._fireHeartbeat(dt);
        }

        if (this.isCharacterSimulation()) {
            this.characterController.update(dt);
        }

        if (this.dataModel && this.dataModel.RunService) {
            this.dataModel.RunService._fireRenderStepped(dt);
        }

        if (this.isCharacterSimulation()) {
            this.characterController.updateCamera(this.viewport.camera, dt, this.viewport);
        }
        if (this.multiplayerClient) {
            this.multiplayerClient.update(dt);
        }
    }

    // DRAG AND DROP ASSET STORAGE & IMPORT
    setupDragAndDrop() {
        const handleDrag = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'copy';
            }
        };

        window.addEventListener('dragenter', handleDrag, false);
        window.addEventListener('dragover', handleDrag, false);

        window.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const files = e.dataTransfer?.files;
            if (!files || files.length === 0) return;

            for (let i = 0; i < files.length; i++) {
                this.handleDroppedFile(files[i], e.clientX, e.clientY);
            }
        }, false);
    }

    handleDroppedFile(file, clientX, clientY) {
        const name = file.name;
        const ext = name.split('.').pop().toLowerCase();
        const mime = file.type || '';

        // 1. Audio files: mp3, wav, ogg, m4a, aac, flac
        const isAudio = mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext);
        if (isAudio) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const dataUrl = ev.target.result;
                const sound = new Sound();
                sound.Name = name.replace(/\.[^/.]+$/, '') || 'Sound';
                sound.SoundId = dataUrl;
                sound.Playing = false;
                sound.Looped = false;
                sound.Volume = 0.5;

                // Parent target determination:
                // 1) Raycast hit Part in 3D viewport
                // 2) Selected Instance
                // 3) SoundService
                // 4) Workspace
                let parent = null;
                const hit = this.viewport.raycastWithFace ? this.viewport.raycastWithFace(clientX, clientY) : null;
                if (hit && hit.part) {
                    parent = hit.part;
                } else if (this.selectedInstance) {
                    parent = this.selectedInstance;
                } else if (this.dataModel.SoundService) {
                    parent = this.dataModel.SoundService;
                } else {
                    parent = this.dataModel.Workspace;
                }

                sound.Parent = parent;
                this.selectInstance(sound);
                this.historyManager.recordState();
                this.outputUI.log('info', `Imported Sound: "${sound.Name}" into ${parent.Name} (embedded into .cblx)`);
            };
            reader.readAsDataURL(file);
            return;
        }

        // 2. Image files: png, jpg, jpeg, gif, webp
        const isImage = mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
        if (isImage) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const dataUrl = ev.target.result;

                // If currently selected instance is a Decal or Texture, update its Texture directly
                const sel = this.selectedInstance;
                const dropEl = document.elementFromPoint(clientX, clientY);
                const isOverProperties = dropEl && Boolean(dropEl.closest('#panel-properties') || dropEl.closest('#properties-container'));
                if (sel && (sel.ClassName === 'Decal' || sel.ClassName === 'Texture')) {
                    sel.Texture = dataUrl;
                    this.propertiesUI?.render();
                    this.historyManager.recordState();
                    this.outputUI.log('info', `Applied image "${name}" to ${sel.ClassName} "${sel.Name}"`);
                    return;
                }

                // Raycast in viewport to find target Part and hit face normal
                let parent = null;
                let face = 'Front';
                const hit = this.viewport.raycastWithFace ? this.viewport.raycastWithFace(clientX, clientY) : null;
                if (hit && hit.part) {
                    parent = hit.part;
                    face = hit.face || 'Front';
                } else if (this.selectedInstance && this.selectedInstance.IsA && this.selectedInstance.IsA('BasePart')) {
                    parent = this.selectedInstance;
                } else if (this.selectedInstance) {
                    parent = this.selectedInstance;
                } else {
                    parent = this.dataModel.Workspace.FindFirstChildOfClass('BasePart') || this.dataModel.Workspace;
                }

                decal.Face = face;
                decal.Parent = parent;
                this.selectInstance(decal);
                this.historyManager.recordState();
                this.outputUI.log('info', `Imported Decal: "${decal.Name}" on ${parent.Name}.${decal.Face} (embedded into .cblx)`);
            };
            reader.readAsDataURL(file);
            return;
        }

        // 3. Place files: .cblx or .json
        if (ext === 'cblx' || ext === 'json') {
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    this.loadPlaceData(data, name);
                } catch (err) {
                    this.outputUI.log('error', 'Failed to load dropped place: ' + err.message);
                }
            };
            reader.readAsText(file);
            return;
        }
    }

    createSound(parent = null) {
        const sound = new Sound();
        sound.Parent = parent || (this.selectedInstance || this.dataModel.SoundService || this.dataModel.Workspace);
        this.selectInstance(sound);
        this.historyManager.recordState();
        this.outputUI.log('info', `Created Sound in ${sound.Parent.Name}`);
        return sound;
    }

    createDecal(parent = null, face = 'Front') {
        const decal = new Decal();
        decal.Face = face;
        decal.Parent = parent || (this.selectedInstance || this.dataModel.Workspace.FindFirstChildOfClass('BasePart') || this.dataModel.Workspace);
        this.selectInstance(decal);
        this.historyManager.recordState();
        this.outputUI.log('info', `Created Decal on ${decal.Parent.Name}.${decal.Face}`);
        return decal;
    }

    createTexture(parent = null, face = 'Front') {
        const texture = new Texture();
        texture.Face = face;
        texture.Parent = parent || (this.selectedInstance || this.dataModel.Workspace.FindFirstChildOfClass('BasePart') || this.dataModel.Workspace);
        this.selectInstance(texture);
        this.historyManager.recordState();
        this.outputUI.log('info', `Created Texture on ${texture.Parent.Name}.${texture.Face}`);
        return texture;
    }
}
