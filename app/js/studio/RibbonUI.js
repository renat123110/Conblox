/**
 * Conblox Studio Ribbon UI
 * Top toolbar replicating the iconic Roblox Studio Ribbon
 */

export class RibbonUI {
    constructor(containerEl, studioApp) {
        this.container = containerEl;
        this.app = studioApp;
        this.activeTab = 'home';

        this.init();
    }

    init() {
        this.container.innerHTML = `
            <!-- Top App Bar / Quick Access -->
            <div class="studio-topbar">
                <div class="topbar-left">
                    <div class="file-dropdown-btn" id="file-menu-btn">
                        <span>File</span>
                    </div>
                    <div class="topbar-menu-items">
                        <span class="topbar-menu-item">Edit</span>
                        <span class="topbar-menu-item">View</span>
                        <span class="topbar-menu-item">Plugins</span>
                        <span class="topbar-menu-item">Test</span>
                        <span class="topbar-menu-item">Window</span>
                        <span class="topbar-menu-item">Help</span>
                    </div>
                    <div class="quick-access-icons">
                        <button class="qa-btn" id="qa-save" title="Save Place (Ctrl+S)"><i data-lucide="save"></i></button>
                        <button class="qa-btn" id="qa-undo" title="Undo (Ctrl+Z)"><i data-lucide="undo-2"></i></button>
                        <button class="qa-btn" id="qa-redo" title="Redo (Ctrl+Y)"><i data-lucide="redo-2"></i></button>
                    </div>
                    <div class="place-title" id="place-title-display">baseplate.cblx</div>
                </div>
                <div class="topbar-right">
                    <div class="status-indicator" id="sim-status-badge">
                        <span class="status-dot"></span>
                        <span class="status-label">EDIT MODE</span>
                    </div>
                </div>
            </div>

            <div class="studio-quickbar">
                <select class="quickbar-mode-select" id="sim-mode-select" aria-label="Simulation mode">
                    <option value="Test">Test</option>
                    <option value="TestHere">Test Here</option>
                    <option value="Run">Run</option>
                </select>
                <div class="quickbar-simulation-controls">
                    <button class="quickbar-action-btn btn-play" id="btn-play-sim" title="Play" aria-label="Play">
                        <i data-lucide="play" class="icon-play"></i>
                    </button>
                    <button class="quickbar-action-btn btn-pause disabled" id="btn-pause-sim" title="Pause" aria-label="Pause">
                        <i data-lucide="pause" class="icon-pause"></i>
                    </button>
                    <button class="quickbar-action-btn btn-stop disabled" id="btn-stop-sim" title="Stop" aria-label="Stop">
                        <i data-lucide="square" class="icon-stop"></i>
                    </button>
                    <button class="quickbar-action-btn btn-step disabled" id="btn-step-sim" title="Step Forward" aria-label="Step forward one frame">
                        <i data-lucide="skip-forward"></i>
                    </button>
                </div>
            </div>

            <!-- Ribbon Tabs Bar -->
            <div class="ribbon-tabs">
                <button class="ribbon-tab active" data-tab="home">Home</button>
                <button class="ribbon-tab" data-tab="model">Model</button>
                <button class="ribbon-tab" data-tab="test">Test</button>
                <button class="ribbon-tab" data-tab="view">View</button>
            </div>

            <!-- Ribbon Content -->
            <div class="ribbon-content">
                <!-- HOME TAB -->
                <div class="ribbon-tab-pane active" id="pane-home">
                    <!-- Tools Group -->
                    <div class="ribbon-group">
                        <div class="ribbon-group-content">
                            <button class="ribbon-tool-btn active" id="tool-select" title="Select (1)">
                                <i data-lucide="mouse-pointer"></i>
                                <span>Select</span>
                            </button>
                            <button class="ribbon-tool-btn" id="tool-move" title="Move (2)">
                                <i data-lucide="move"></i>
                                <span>Move</span>
                            </button>
                            <button class="ribbon-tool-btn" id="tool-scale" title="Scale (3)">
                                <i data-lucide="maximize"></i>
                                <span>Scale</span>
                            </button>
                            <button class="ribbon-tool-btn" id="tool-rotate" title="Rotate (4)">
                                <i data-lucide="rotate-cw"></i>
                                <span>Rotate</span>
                            </button>
                        </div>
                        <div class="ribbon-group-label">Tools</div>
                    </div>

                    <!-- Snapping & Collisions Group -->
                    <div class="ribbon-group">
                        <div class="ribbon-group-content ribbon-grid-2">
                            <label class="ribbon-checkbox-label">
                                <input type="checkbox" id="chk-snap" checked />
                                <span>Snap:</span>
                            </label>
                            <select id="sel-snap-studs" class="ribbon-select">
                                <option value="0.1">0.1 Studs</option>
                                <option value="0.5">0.5 Studs</option>
                                <option value="1.0" selected>1 Stud</option>
                                <option value="2.0">2 Studs</option>
                                <option value="4.0">4 Studs</option>
                            </select>
                            <label class="ribbon-checkbox-label">
                                <input type="checkbox" id="chk-collisions" checked />
                                <span>Collisions</span>
                            </label>
                            <select id="sel-snap-rot" class="ribbon-select">
                                <option value="0">Smooth (Off)</option>
                                <option value="5" selected>5° (Smooth)</option>
                                <option value="15">15°</option>
                                <option value="45">45°</option>
                                <option value="90">90°</option>
                            </select>
                        </div>
                        <div class="ribbon-group-label">Snap</div>
                    </div>

                    <!-- Insert Part Group -->
                    <div class="ribbon-group">
                        <div class="ribbon-group-content">
                            <div class="split-button">
                                <button class="ribbon-big-btn" id="btn-spawn-part-quick" title="Spawn Block Part">
                                    <i data-lucide="box"></i>
                                    <span>Part</span>
                                </button>
                                <button class="split-dropdown-arrow" id="btn-part-dropdown">
                                    <i data-lucide="chevron-down"></i>
                                </button>
                                <div class="dropdown-menu" id="menu-part-shapes">
                                    <div class="drop-item" data-shape="Block"><i data-lucide="box"></i> Block</div>
                                    <div class="drop-item" data-shape="Ball"><i data-lucide="circle"></i> Sphere (Ball)</div>
                                    <div class="drop-item" data-shape="Cylinder"><i data-lucide="cylinder"></i> Cylinder</div>
                                    <div class="drop-item" data-shape="Wedge"><i data-lucide="triangle"></i> Wedge</div>
                                </div>
                            </div>
                        </div>
                        <div class="ribbon-group-label">Insert</div>
                    </div>

                    <!-- Material & Color Group -->
                    <div class="ribbon-group">
                        <div class="ribbon-group-content">
                            <!-- Material Dropdown -->
                            <div class="ribbon-picker-wrapper">
                                <button class="ribbon-picker-btn" id="btn-material-picker">
                                    <i data-lucide="palette"></i>
                                    <span id="label-active-material">Plastic</span>
                                    <i data-lucide="chevron-down" class="picker-arrow"></i>
                                </button>
                                <div class="dropdown-menu" id="menu-materials">
                                    <div class="drop-item" data-mat="Plastic">Plastic</div>
                                    <div class="drop-item" data-mat="SmoothPlastic">SmoothPlastic</div>
                                    <div class="drop-item" data-mat="Neon">Neon (Glowing)</div>
                                    <div class="drop-item" data-mat="Wood">Wood</div>
                                    <div class="drop-item" data-mat="Metal">Metal</div>
                                    <div class="drop-item" data-mat="Glass">Glass</div>
                                    <div class="drop-item" data-mat="Grass">Grass</div>
                                    <div class="drop-item" data-mat="Concrete">Concrete</div>
                                    <div class="drop-item" data-mat="Ice">Ice</div>
                                </div>
                            </div>

                            <!-- Color Palette Dropdown -->
                            <div class="ribbon-picker-wrapper">
                                <button class="ribbon-picker-btn" id="btn-color-palette">
                                    <span class="color-swatch-preview" id="preview-active-color" style="background: #a3a2a5;"></span>
                                    <span>Color</span>
                                    <i data-lucide="chevron-down" class="picker-arrow"></i>
                                </button>
                                <div class="palette-popup" id="menu-color-palette">
                                    <div class="palette-grid">
                                        <div class="pal-color" style="background: #f5cd2f;" data-color="#f5cd2f" title="Bright yellow"></div>
                                        <div class="pal-color" style="background: #e29b40;" data-color="#e29b40" title="Bright orange"></div>
                                        <div class="pal-color" style="background: #c4281c;" data-color="#c4281c" title="Bright red"></div>
                                        <div class="pal-color" style="background: #6b327c;" data-color="#6b327c" title="Bright violet"></div>
                                        <div class="pal-color" style="background: #0d69ac;" data-color="#0d69ac" title="Bright blue"></div>
                                        <div class="pal-color" style="background: #00a2ff;" data-color="#00a2ff" title="Cyan"></div>
                                        <div class="pal-color" style="background: #287f46;" data-color="#287f46" title="Bright green"></div>
                                        <div class="pal-color" style="background: #4b974b;" data-color="#4b974b" title="Lime green"></div>
                                        <div class="pal-color" style="background: #a3a2a5;" data-color="#a3a2a5" title="Medium stone grey"></div>
                                        <div class="pal-color" style="background: #635f61;" data-color="#635f61" title="Dark stone grey"></div>
                                        <div class="pal-color" style="background: #1b2a34;" data-color="#1b2a34" title="Really black"></div>
                                        <div class="pal-color" style="background: #f8f8f8;" data-color="#f8f8f8" title="White"></div>
                                    </div>
                                    <div class="custom-color-row">
                                        <span>Custom:</span>
                                        <input type="color" id="input-custom-ribbon-color" value="#00a2ff" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="ribbon-group-label">Appearance</div>
                    </div>

                    <!-- Edit Actions Group -->
                    <div class="ribbon-group">
                        <div class="ribbon-group-content ribbon-grid-2">
                            <button class="ribbon-small-btn" id="btn-group" title="Group (Ctrl+G)">
                                <i data-lucide="package"></i> Group
                            </button>
                            <button class="ribbon-small-btn" id="btn-ungroup" title="Ungroup (Ctrl+U)">
                                <i data-lucide="package-open"></i> Ungroup
                            </button>
                            <button class="ribbon-small-btn" id="btn-anchor" title="Toggle Anchor">
                                <i data-lucide="anchor"></i> Anchor
                            </button>
                            <button class="ribbon-small-btn" id="btn-duplicate" title="Duplicate (Ctrl+D)">
                                <i data-lucide="copy"></i> Duplicate
                            </button>
                        </div>
                        <div class="ribbon-group-label">Edit</div>
                    </div>

                </div>

                <!-- MODEL TAB -->
                <div class="ribbon-tab-pane" id="pane-model">
                    <div class="ribbon-group">
                        <div class="ribbon-group-content">
                            <button class="ribbon-big-btn" id="btn-insert-spawn" title="Insert SpawnLocation">
                                <i data-lucide="map-pin"></i>
                                <span>Spawn</span>
                            </button>
                            <button class="ribbon-big-btn" id="btn-insert-pointlight" title="Insert PointLight">
                                <i data-lucide="lightbulb"></i>
                                <span>Light</span>
                            </button>
                            <button class="ribbon-big-btn" id="btn-insert-script" title="Insert Server Script">
                                <i data-lucide="file-code"></i>
                                <span>Script</span>
                            </button>
                            <button class="ribbon-big-btn" id="btn-insert-localscript" title="Insert Client LocalScript">
                                <i data-lucide="file-terminal" style="color: #00e5ff;"></i>
                                <span>LocalScript</span>
                            </button>
                        </div>
                        <div class="ribbon-group-label">Gameplay Objects</div>
                    </div>
                </div>

                <!-- TEST TAB -->
                <div class="ribbon-tab-pane" id="pane-test">
                    <div class="ribbon-group">
                        <div class="ribbon-group-content ribbon-test-content">
                            <button class="ribbon-big-btn btn-play" id="btn-play-sim-2" title="Play selected test mode">
                                <i data-lucide="play"></i><span>Play</span>
                            </button>
                            <button class="ribbon-big-btn btn-run" id="btn-run-sim-2" title="Run without a character">
                                <i data-lucide="play-circle"></i> Run
                            </button>
                            <button class="ribbon-big-btn btn-stop disabled" id="btn-stop-sim-2" title="Stop simulation">
                                <i data-lucide="square"></i> Stop
                            </button>
                        </div>
                        <div class="ribbon-group-label">Simulation</div>
                    </div>
                </div>

                <!-- VIEW TAB -->
                <div class="ribbon-tab-pane" id="pane-view">
                    <div class="ribbon-group">
                        <div class="ribbon-group-content ribbon-grid-2">
                            <button class="ribbon-small-btn active" id="btn-toggle-explorer">
                                <i data-lucide="layers"></i> Explorer
                            </button>
                            <button class="ribbon-small-btn active" id="btn-toggle-properties">
                                <i data-lucide="sliders"></i> Properties
                            </button>
                            <button class="ribbon-small-btn active" id="btn-toggle-output">
                                <i data-lucide="terminal"></i> Output
                            </button>
                            <button class="ribbon-small-btn" id="btn-toggle-fullscreen">
                                <i data-lucide="maximize-2"></i> Fullscreen
                            </button>
                        </div>
                        <div class="ribbon-group-label">Panels</div>
                    </div>
                </div>
            </div>

            <!-- File Dropdown Menu Modal -->
            <div class="file-dropdown-menu" id="file-menu" style="display: none;">
                <div class="file-menu-item" id="fm-new"><i data-lucide="file-plus"></i> New Place</div>
                <div class="file-menu-item" id="fm-save"><i data-lucide="save"></i> Save Place (Ctrl+S)</div>
                <div class="file-menu-item" id="fm-load"><i data-lucide="folder-open"></i> Open Place...</div>
                <div class="file-menu-item" id="fm-export"><i data-lucide="package"></i> Export Game (.exe)</div>
                <div class="file-menu-divider"></div>
                <div class="file-menu-item" id="fm-template-baseplate"><i data-lucide="grid"></i> Template: Classic Baseplate</div>
                <div class="file-menu-item" id="fm-template-obby"><i data-lucide="flag"></i> Template: Obby Starter</div>
                <div class="file-menu-item" id="fm-template-physics"><i data-lucide="activity"></i> Template: Physics Sandbox</div>
                <div class="file-menu-divider"></div>
                <div class="file-menu-item" id="fm-settings"><i data-lucide="settings"></i> <span>Studio Settings...</span> <span style="margin-left: auto; color: var(--text-muted); font-size: 11px;">Alt+S</span></div>
            </div>
        `;

        this.bindEvents();
        if (window.lucide) window.lucide.createIcons({ root: this.container });
    }

    bindEvents() {
        // Tab switching
        const tabs = this.container.querySelectorAll('.ribbon-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const targetPane = tab.dataset.tab;
                this.container.querySelectorAll('.ribbon-tab-pane').forEach(p => p.classList.remove('active'));
                const p = this.container.querySelector(`#pane-${targetPane}`);
                if (p) p.classList.add('active');
            });
        });

        // Tools (Select, Move, Scale, Rotate)
        const toolBtns = {
            select: this.container.querySelector('#tool-select'),
            translate: this.container.querySelector('#tool-move'),
            scale: this.container.querySelector('#tool-scale'),
            rotate: this.container.querySelector('#tool-rotate')
        };

        const setActiveTool = (mode) => {
            Object.values(toolBtns).forEach(b => b?.classList.remove('active'));
            if (toolBtns[mode]) toolBtns[mode].classList.add('active');
            this.app.gizmoManager.setMode(mode);
        };

        toolBtns.select.addEventListener('click', () => setActiveTool('select'));
        toolBtns.translate.addEventListener('click', () => setActiveTool('translate'));
        toolBtns.scale.addEventListener('click', () => setActiveTool('scale'));
        toolBtns.rotate.addEventListener('click', () => setActiveTool('rotate'));

        // Keyboard shortcuts for tools: 1, 2, 3, 4
        window.addEventListener('keydown', (e) => {
            if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
            if (e.code === 'Digit1') setActiveTool('select');
            else if (e.code === 'Digit2') setActiveTool('translate');
            else if (e.code === 'Digit3') setActiveTool('scale');
            else if (e.code === 'Digit4') setActiveTool('rotate');
        });

        // Snapping
        const chkSnap = this.container.querySelector('#chk-snap');
        const selStuds = this.container.querySelector('#sel-snap-studs');
        const selRot = this.container.querySelector('#sel-snap-rot');

        chkSnap.addEventListener('change', () => this.app.gizmoManager.setSnapEnabled(chkSnap.checked));
        selStuds.addEventListener('change', () => this.app.gizmoManager.setMoveSnap(parseFloat(selStuds.value)));
        selRot.addEventListener('change', () => this.app.gizmoManager.setRotateSnap(parseFloat(selRot.value)));

        // Part Spawning
        this.container.querySelector('#btn-spawn-part-quick').addEventListener('click', () => {
            this.app.spawnPart('Block');
        });

        const partDrop = this.container.querySelector('#btn-part-dropdown');
        const shapeMenu = this.container.querySelector('#menu-part-shapes');
        partDrop.addEventListener('click', (e) => {
            e.stopPropagation();
            shapeMenu.classList.toggle('show');
        });
        shapeMenu.querySelectorAll('.drop-item').forEach(item => {
            item.addEventListener('click', () => {
                shapeMenu.classList.remove('show');
                this.app.spawnPart(item.dataset.shape);
            });
        });

        // Material Picker
        const matBtn = this.container.querySelector('#btn-material-picker');
        const matMenu = this.container.querySelector('#menu-materials');
        matBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            matMenu.classList.toggle('show');
        });
        matMenu.querySelectorAll('.drop-item').forEach(item => {
            item.addEventListener('click', () => {
                matMenu.classList.remove('show');
                const mat = item.dataset.mat;
                this.container.querySelector('#label-active-material').textContent = mat;
                this.app.applyMaterialToSelected(mat);
            });
        });

        // Color Palette
        const colorBtn = this.container.querySelector('#btn-color-palette');
        const colorMenu = this.container.querySelector('#menu-color-palette');
        colorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            colorMenu.classList.toggle('show');
        });
        colorMenu.querySelectorAll('.pal-color').forEach(item => {
            item.addEventListener('click', () => {
                colorMenu.classList.remove('show');
                const col = item.dataset.color;
                this.container.querySelector('#preview-active-color').style.background = col;
                this.app.applyColorToSelected(col);
            });
        });
        this.container.querySelector('#input-custom-ribbon-color').addEventListener('input', (e) => {
            this.container.querySelector('#preview-active-color').style.background = e.target.value;
            this.app.applyColorToSelected(e.target.value);
        });

        // Close dropdowns on outside click
        window.addEventListener('click', () => {
            shapeMenu.classList.remove('show');
            matMenu.classList.remove('show');
            colorMenu.classList.remove('show');
        });

        // Group / Ungroup / Anchor / Duplicate
        this.container.querySelector('#btn-group').addEventListener('click', () => this.app.groupSelected());
        this.container.querySelector('#btn-ungroup').addEventListener('click', () => this.app.ungroupSelected());
        this.container.querySelector('#btn-anchor').addEventListener('click', () => this.app.toggleAnchorSelected());
        this.container.querySelector('#btn-duplicate').addEventListener('click', () => this.app.duplicateSelected());

        // Model Tab Inserts
        this.container.querySelector('#btn-insert-spawn').addEventListener('click', () => this.app.spawnLocation());
        this.container.querySelector('#btn-insert-pointlight').addEventListener('click', () => this.app.createPointLight());
        this.container.querySelector('#btn-insert-script').addEventListener('click', () => this.app.createScript());
        this.container.querySelector('#btn-insert-localscript').addEventListener('click', () => this.app.createLocalScript());

        // Simulation controls share one selected mode.
        const selectedMode = () => this.container.querySelector('#sim-mode-select').value;
        this.container.querySelector('#btn-play-sim').addEventListener('click', () => this.app.startSimulation(selectedMode()));
        this.container.querySelector('#btn-play-sim-2').addEventListener('click', () => this.app.startSimulation(selectedMode()));
        this.container.querySelector('#btn-run-sim-2').addEventListener('click', () => this.app.startSimulation('Run'));
        this.container.querySelector('#btn-pause-sim').addEventListener('click', () => this.app.toggleSimulationPause());
        this.container.querySelector('#btn-step-sim').addEventListener('click', () => this.app.stepSimulationFrame());
        this.container.querySelector('#btn-stop-sim').addEventListener('click', () => this.app.stopSimulation());
        this.container.querySelector('#btn-stop-sim-2').addEventListener('click', () => this.app.stopSimulation());

        // File Menu
        const fileBtn = this.container.querySelector('#file-menu-btn');
        const fileMenu = this.container.querySelector('#file-menu');
        fileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileMenu.style.display = fileMenu.style.display === 'none' ? 'block' : 'none';
        });
        window.addEventListener('click', (e) => {
            if (!fileMenu.contains(e.target) && e.target !== fileBtn) {
                fileMenu.style.display = 'none';
            }
        });

        this.container.querySelector('#fm-new').addEventListener('click', () => {
            fileMenu.style.display = 'none';
            this.app.newPlace();
        });
        this.container.querySelector('#fm-save').addEventListener('click', () => {
            fileMenu.style.display = 'none';
            this.app.savePlace();
        });
        this.container.querySelector('#qa-save').addEventListener('click', () => this.app.savePlace());
        this.container.querySelector('#qa-undo').addEventListener('click', () => this.app.undo());
        this.container.querySelector('#qa-redo').addEventListener('click', () => this.app.redo());
        this.container.querySelector('#fm-load').addEventListener('click', () => {
            fileMenu.style.display = 'none';
            this.app.promptLoadPlace();
        });
        this.container.querySelector('#fm-export').addEventListener('click', () => {
            fileMenu.style.display = 'none';
            this.app.exportGame();
        });

        // Templates
        this.container.querySelector('#fm-template-baseplate').addEventListener('click', () => {
            fileMenu.style.display = 'none';
            this.app.loadTemplate('baseplate');
        });
        this.container.querySelector('#fm-template-obby').addEventListener('click', () => {
            fileMenu.style.display = 'none';
            this.app.loadTemplate('obby');
        });
        this.container.querySelector('#fm-template-physics').addEventListener('click', () => {
            fileMenu.style.display = 'none';
            this.app.loadTemplate('physics');
        });

        // Settings Modal triggers
        const topbarSettingsBtn = this.container.querySelector('#topbar-settings-btn');
        if (topbarSettingsBtn) {
            topbarSettingsBtn.addEventListener('click', () => {
                if (this.app.settingsUI) this.app.settingsUI.open('rendering');
            });
        }
        const fmSettings = this.container.querySelector('#fm-settings');
        if (fmSettings) {
            fmSettings.addEventListener('click', () => {
                fileMenu.style.display = 'none';
                if (this.app.settingsUI) this.app.settingsUI.open('rendering');
            });
        }

        // View Tab Toggles
        this.container.querySelector('#btn-toggle-explorer').addEventListener('click', () => this.app.togglePanel('explorer'));
        this.container.querySelector('#btn-toggle-properties').addEventListener('click', () => this.app.togglePanel('properties'));
        this.container.querySelector('#btn-toggle-output').addEventListener('click', () => this.app.togglePanel('output'));
        this.container.querySelector('#btn-toggle-fullscreen').addEventListener('click', () => this.app.toggleFullscreen());
    }

    setSimulationState(state) {
        const badge = this.container.querySelector('#sim-status-badge');
        const stopBtns = this.container.querySelectorAll('.btn-stop');
        const playBtns = this.container.querySelectorAll('.btn-play');
        const runBtns = this.container.querySelectorAll('.btn-run');
        const pauseButton = this.container.querySelector('#btn-pause-sim');
        const stepButton = this.container.querySelector('#btn-step-sim');
        const modeSelect = this.container.querySelector('#sim-mode-select');

        if (state === 'Edit') {
            badge.className = 'status-indicator';
            badge.innerHTML = `<span class="status-dot"></span><span class="status-label">EDIT MODE</span>`;
            stopBtns.forEach(b => b.classList.add('disabled'));
            pauseButton.classList.add('disabled');
            stepButton.classList.add('disabled');
            playBtns.forEach(b => b.classList.remove('disabled'));
            runBtns.forEach(b => b.classList.remove('disabled'));
            modeSelect.disabled = false;
            this.setPaused(false);
        } else if (state === 'Test' || state === 'TestHere') {
            badge.className = 'status-indicator status-playing';
            badge.innerHTML = `<span class="status-dot"></span><span class="status-label">${state === 'TestHere' ? 'TEST HERE' : 'PLAYING (AVATAR)'}</span>`;
            stopBtns.forEach(b => b.classList.remove('disabled'));
            pauseButton.classList.remove('disabled');
            stepButton.classList.add('disabled');
            playBtns.forEach(b => b.classList.add('disabled'));
            runBtns.forEach(b => b.classList.add('disabled'));
            modeSelect.disabled = true;
        } else if (state === 'Run') {
            badge.className = 'status-indicator status-running';
            badge.innerHTML = `<span class="status-dot"></span><span class="status-label">RUNNING SIMULATION</span>`;
            stopBtns.forEach(b => b.classList.remove('disabled'));
            pauseButton.classList.remove('disabled');
            stepButton.classList.add('disabled');
            playBtns.forEach(b => b.classList.add('disabled'));
            runBtns.forEach(b => b.classList.add('disabled'));
            modeSelect.disabled = true;
        }
    }

    getSelectedSimulationMode() {
        return this.container.querySelector('#sim-mode-select').value;
    }

    setPaused(paused) {
        const button = this.container.querySelector('#btn-pause-sim');
        if (!button) return;
        const stepButton = this.container.querySelector('#btn-step-sim');
        button.classList.toggle('is-paused', paused);
        button.title = paused ? 'Resume' : 'Pause';
        button.setAttribute('aria-label', paused ? 'Resume' : 'Pause');
        button.innerHTML = `<i data-lucide="${paused ? 'step-forward' : 'pause'}"></i>`;
        stepButton.classList.toggle('disabled', !paused);
        if (window.lucide) window.lucide.createIcons({ root: button });
    }
}
