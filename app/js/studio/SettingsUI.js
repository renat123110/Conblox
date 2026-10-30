/**
 * Conblox Studio Settings UI
 * Dedicated modal window replicating Roblox Studio Settings
 * Features interactive Rendering Level slider (1 to 21), AAA shadow controls,
 * Dual Kawase Bloom, Volumetric Sun Rays, and Graphics Fidelity presets.
 */

export class SettingsUI {
    constructor(studioApp) {
        this.app = studioApp;
        this.isOpen = false;
        this.activeTab = 'rendering';

        this.defaultSettings = {
            rendering: {
                graphicsLevel: 21,
                shadowQuality: '4096', // 'off', '1024', '2048', '4096'
                shadowSoftness: 3.2,
                shadowNormalBias: 0.012,
                shadowFrustumRadius: 48,
                shadowFollow: true,
                bloomQuality: 'cinematic', // 'off', 'basic', 'cinematic'
                sunRaysSamples: 36,
                pixelRatio: 'native', // '1.0', '1.5', 'native'
                cloudsQuality: 'high',
                antialiasing: true
            },
            physics: {
                frameRateCap: 'uncapped', // '60', '120', 'uncapped'
                substeps: 2,
                defaultWalkSpeed: 16,
                defaultJumpPower: 50
            },
            camera: {
                sensitivity: 1.0,
                invertY: false,
                fov: 70,
                cameraCollision: true
            },
            general: {
                theme: 'dark',
                autosave: true,
                autosaveInterval: 5,
                showGrid: true
            }
        };

        this.settings = this.loadSettings();
        this.createDOM();
        this.bindEvents();

        // Apply loaded settings on initialization
        this.applySettings();
    }

    loadSettings() {
        try {
            const raw = localStorage.getItem('conblox_studio_settings');
            if (raw) {
                const parsed = JSON.parse(raw);
                const rendering = { ...this.defaultSettings.rendering, ...(parsed.rendering || {}) };
                if (Number(rendering.shadowNormalBias) > 0.025) rendering.shadowNormalBias = 0.012;
                return {
                    rendering,
                    physics: { ...this.defaultSettings.physics, ...(parsed.physics || {}) },
                    camera: { ...this.defaultSettings.camera, ...(parsed.camera || {}) },
                    general: { ...this.defaultSettings.general, ...(parsed.general || {}) }
                };
            }
        } catch (e) {
            console.warn('[SettingsUI] Failed to load saved settings, using defaults', e);
        }
        return JSON.parse(JSON.stringify(this.defaultSettings));
    }

    saveSettings() {
        try {
            localStorage.setItem('conblox_studio_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('[SettingsUI] Failed to save settings to localStorage', e);
        }
    }

    resetDefaults() {
        this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
        this.saveSettings();
        this.applySettings();
        this.syncUIValues();
    }

    createDOM() {
        // Modal Overlay Container
        this.overlayEl = document.createElement('div');
        this.overlayEl.id = 'studio-settings-overlay';
        this.overlayEl.className = 'studio-settings-backdrop';
        this.overlayEl.style.display = 'none';

        this.overlayEl.innerHTML = `
            <div class="studio-settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
                <!-- Modal Header -->
                <div class="settings-modal-header">
                    <div class="settings-header-title">
                        <i data-lucide="sliders-horizontal" class="settings-header-icon"></i>
                        <span id="settings-title">Conblox Studio Settings</span>
                    </div>
                    <button class="settings-close-btn" id="btn-close-settings" title="Close (Esc)">
                        <i data-lucide="x"></i>
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="settings-modal-body">
                    <!-- Sidebar Tabs -->
                    <div class="settings-sidebar">
                        <button class="settings-tab-btn active" data-tab="rendering">
                            <i data-lucide="monitor"></i>
                            <span>Rendering</span>
                        </button>
                        <button class="settings-tab-btn" data-tab="physics">
                            <i data-lucide="activity"></i>
                            <span>Physics & Sim</span>
                        </button>
                        <button class="settings-tab-btn" data-tab="camera">
                            <i data-lucide="gamepad-2"></i>
                            <span>Camera & Controls</span>
                        </button>
                        <button class="settings-tab-btn" data-tab="general">
                            <i data-lucide="sliders"></i>
                            <span>General</span>
                        </button>
                    </div>

                    <!-- Tab Contents -->
                    <div class="settings-content">
                        <!-- RENDERING TAB -->
                        <div class="settings-pane active" id="pane-rendering">
                            <div class="settings-section">
                                <div class="settings-section-title">
                                    <i data-lucide="sparkles"></i>
                                    <span>Graphics Fidelity (Graphics Level 1 - 21)</span>
                                </div>
                                <div class="settings-section-desc">
                                    Higher rendering levels scale up shadow map resolution (up to 4096), contact-hardening soft penumbra, dynamic camera tracking, Dual Kawase mip-chain bloom, and volumetric sun rays.
                                </div>

                                <!-- Graphics Level Slider Box -->
                                <div class="graphics-level-card">
                                    <div class="graphics-level-top">
                                        <span class="graphics-level-label">Quality Level</span>
                                        <div class="graphics-level-badge" id="badge-graphics-level">
                                            Level 21 • Ultra Cinematic AAA
                                        </div>
                                    </div>
                                    <div class="graphics-slider-wrapper">
                                        <input type="range" min="1" max="21" step="1" value="21" class="studio-slider" id="slider-graphics-level">
                                        <div class="slider-ticks">
                                            <span>1</span>
                                            <span>4</span>
                                            <span>9</span>
                                            <span>15</span>
                                            <span>21</span>
                                        </div>
                                    </div>

                                    <!-- Quick Presets -->
                                    <div class="graphics-presets-row">
                                        <span class="presets-label">Quick Presets:</span>
                                        <button class="preset-btn" data-level="4">Low (4)</button>
                                        <button class="preset-btn" data-level="9">Medium (9)</button>
                                        <button class="preset-btn" data-level="15">High (15)</button>
                                        <button class="preset-btn active" data-level="21">Ultra Cinematic (21)</button>
                                    </div>

                                    <!-- Active Specs Summary Box -->
                                    <div class="level-specs-card" id="level-specs-summary">
                                        <!-- Populated dynamically -->
                                    </div>
                                </div>
                            </div>

                            <!-- Advanced Rendering Overrides -->
                            <div class="settings-section">
                                <div class="settings-section-title">
                                    <i data-lucide="layers"></i>
                                    <span>Advanced Lighting & Shadow Overrides</span>
                                </div>
                                
                                <div class="settings-grid">
                                    <!-- Shadow Resolution -->
                                    <div class="setting-item">
                                        <div class="setting-info">
                                            <span class="setting-name">Shadow Map Resolution</span>
                                            <span class="setting-desc">Resolution of directional sun light shadow texture</span>
                                        </div>
                                        <select class="setting-select" id="opt-shadow-quality">
                                            <option value="off">Disabled</option>
                                            <option value="1024">1024 x 1024 (Performance)</option>
                                            <option value="2048">2048 x 2048 (High)</option>
                                            <option value="4096" selected>4096 x 4096 (Ultra Cinematic)</option>
                                        </select>
                                    </div>

                                    <!-- Shadow Softness (Radius) -->
                                    <div class="setting-item">
                                        <div class="setting-info">
                                            <span class="setting-name">Shadow Softness / Penumbra</span>
                                            <span class="setting-desc">PCFSoft blur radius for smooth, natural contact shadows</span>
                                        </div>
                                        <div class="setting-slider-group">
                                            <input type="range" min="0.5" max="5.0" step="0.1" value="3.2" class="studio-slider" id="slider-shadow-softness">
                                            <span class="slider-val-display" id="val-shadow-softness">3.2</span>
                                        </div>
                                    </div>

                                    <!-- Dynamic Frustum Tracking -->
                                    <div class="setting-item">
                                        <div class="setting-info">
                                            <span class="setting-name">Dynamic Avatar Tracking</span>
                                            <span class="setting-desc">Centers shadow frustum directly on avatar/focus for maximum texel density</span>
                                        </div>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="chk-shadow-follow" checked>
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <!-- Normal Bias (Anti-Acne) -->
                                    <div class="setting-item">
                                        <div class="setting-info">
                                            <span class="setting-name">Shadow Normal Bias</span>
                                            <span class="setting-desc">Eliminates surface acne without causing Peter-Panning (floating shadows)</span>
                                        </div>
                                        <div class="setting-slider-group">
                                            <input type="range" min="0.001" max="0.025" step="0.001" value="0.012" class="studio-slider" id="slider-normal-bias">
                                            <span class="slider-val-display" id="val-normal-bias">0.012</span>
                                        </div>
                                    </div>

                                    <!-- Dual Kawase Bloom Quality -->
                                    <div class="setting-item">
                                        <div class="setting-info">
                                            <span class="setting-name">Dual Kawase Pyramid Bloom</span>
                                            <span class="setting-desc">Unreal Engine / Unity standard multi-pass down/upsampling bloom</span>
                                        </div>
                                        <select class="setting-select" id="opt-bloom-quality">
                                            <option value="off">Disabled</option>
                                            <option value="basic">Standard (3 Mip Passes)</option>
                                            <option value="cinematic" selected>Ultra Cinematic (5 Mip Passes)</option>
                                        </select>
                                    </div>

                                    <!-- Volumetric Sun Rays -->
                                    <div class="setting-item">
                                        <div class="setting-info">
                                            <span class="setting-name">Volumetric Sun Rays</span>
                                            <span class="setting-desc">Screen-space god ray marching samples and solar flare</span>
                                        </div>
                                        <select class="setting-select" id="opt-sunrays-samples">
                                            <option value="0">Disabled</option>
                                            <option value="12">Fast (12 Ray Samples)</option>
                                            <option value="24">High (24 Ray Samples)</option>
                                            <option value="36" selected>Cinematic (36 Ray Samples)</option>
                                        </select>
                                    </div>

                                    <!-- Display Resolution Scale -->
                                    <div class="setting-item">
                                        <div class="setting-info">
                                            <span class="setting-name">Display Resolution Scale</span>
                                            <span class="setting-desc">Viewport rendering pixel ratio (Retina / 4K crisp texturing)</span>
                                        </div>
                                        <select class="setting-select" id="opt-pixel-ratio">
                                            <option value="1.0">100% (1.0x Scale)</option>
                                            <option value="1.5">150% (1.5x Supersampling)</option>
                                            <option value="native" selected>Native Display (Retina / 2.0x)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- PHYSICS TAB -->
                        <div class="settings-pane" id="pane-physics">
                            <div class="settings-section">
                                <div class="settings-section-title">
                                    <i data-lucide="activity"></i>
                                    <span>Simulation & Physics Engine</span>
                                </div>
                                <div class="settings-grid">
                                    <div class="setting-item">
                                        <div class="setting-info">
                                            <span class="setting-name">Physics Substepping</span>
                                            <span class="setting-desc">Precision iterations per simulation frame (Cannon.js)</span>
                                        </div>
                                        <select class="setting-select" id="opt-substeps">
                                            <option value="1">1x (Standard 60 Hz)</option>
                                            <option value="2" selected>2x (Accurate 120 Hz)</option>
                                            <option value="4">4x (Ultra Precision 240 Hz)</option>
                                        </select>
                                    </div>
                                    <div class="setting-item">
                                        <div class="setting-info">
                                            <span class="setting-name">Default WalkSpeed</span>
                                            <span class="setting-desc">Default Humanoid movement speed (Roblox standard = 16)</span>
                                        </div>
                                        <input type="number" min="0" max="250" value="16" class="setting-number" id="input-walkspeed">
                                    </div>
                                    <div class="setting-item">
                                        <div class="setting-info">
                                            <span class="setting-name">Default JumpPower</span>
                                            <span class="setting-desc">Default Humanoid jump impulse (Roblox standard = 50)</span>
                                        </div>
                                        <input type="number" min="0" max="300" value="50" class="setting-number" id="input-jumppower">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- CAMERA TAB -->
                        <div class="settings-pane" id="pane-camera">
                            <div class="settings-section">
                                <div class="settings-section-title">
                                    <i data-lucide="camera"></i>
                                    <span>Camera & Controls</span>
                                </div>
                                <div class="settings-grid">
                                    <div class="setting-item">
                                        <div class="setting-info">
                                            <span class="setting-name">Mouse Sensitivity</span>
                                            <span class="setting-desc">Third-person and freecam orbit rotation speed</span>
                                        </div>
                                        <div class="setting-slider-group">
                                            <input type="range" min="0.2" max="3.0" step="0.1" value="1.0" class="studio-slider" id="slider-sensitivity">
                                            <span class="slider-val-display" id="val-sensitivity">1.0</span>
                                        </div>
                                    </div>
                                    <div class="setting-item">
                                        <div class="setting-info">
                                            <span class="setting-name">Invert Mouse Y</span>
                                            <span class="setting-desc">Invert vertical pitch rotation</span>
                                        </div>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="chk-invert-y">
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </div>
                                    <div class="setting-item">
                                        <div class="setting-info">
                                            <span class="setting-name">Camera Collision</span>
                                            <span class="setting-desc">Prevent third-person camera from clipping into geometry</span>
                                        </div>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="chk-cam-collision" checked>
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- GENERAL TAB -->
                        <div class="settings-pane" id="pane-general">
                            <div class="settings-section">
                                <div class="settings-section-title">
                                    <i data-lucide="sliders"></i>
                                    <span>Studio Preferences</span>
                                </div>
                                <div class="settings-grid">
                                    <div class="setting-item">
                                        <div class="setting-info">
                                            <span class="setting-name">Theme</span>
                                            <span class="setting-desc">Interface visual style</span>
                                        </div>
                                        <select class="setting-select" id="opt-theme" disabled>
                                            <option value="dark" selected>Roblox Studio Dark</option>
                                        </select>
                                    </div>
                                    <div class="setting-item">
                                        <div class="setting-info">
                                            <span class="setting-name">Auto-save Places</span>
                                            <span class="setting-desc">Automatically backup place file periodically</span>
                                        </div>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="chk-autosave" checked>
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="settings-modal-footer">
                    <span class="settings-footer-hint">
                        <i data-lucide="check-circle-2"></i> Settings apply immediately and persist in local profile.
                    </span>
                    <div class="settings-footer-actions">
                        <button class="settings-btn btn-secondary" id="btn-reset-settings">Reset to Defaults</button>
                        <button class="settings-btn btn-primary" id="btn-confirm-settings">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlayEl);
        if (window.lucide) window.lucide.createIcons({ root: this.overlayEl });
    }

    bindEvents() {
        // Close buttons
        const closeBtn = this.overlayEl.querySelector('#btn-close-settings');
        const confirmBtn = this.overlayEl.querySelector('#btn-confirm-settings');
        const resetBtn = this.overlayEl.querySelector('#btn-reset-settings');

        closeBtn.addEventListener('click', () => this.close());
        confirmBtn.addEventListener('click', () => this.close());
        resetBtn.addEventListener('click', () => {
            if (confirm('Reset all Studio settings to default values?')) {
                this.resetDefaults();
            }
        });

        // Close on backdrop click
        this.overlayEl.addEventListener('click', (e) => {
            if (e.target === this.overlayEl) this.close();
        });

        // Tab switching
        const tabBtns = this.overlayEl.querySelectorAll('.settings-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.setActiveTab(tab);
            });
        });

        // Graphics Level Slider
        const sliderLevel = this.overlayEl.querySelector('#slider-graphics-level');
        sliderLevel.addEventListener('input', (e) => {
            const level = parseInt(e.target.value, 10);
            this.setGraphicsLevel(level);
        });

        // Preset Buttons
        const presetBtns = this.overlayEl.querySelectorAll('.preset-btn');
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const level = parseInt(btn.dataset.level, 10);
                sliderLevel.value = level;
                this.setGraphicsLevel(level);
            });
        });

        // Overrides - Shadows
        const optShadow = this.overlayEl.querySelector('#opt-shadow-quality');
        optShadow.addEventListener('change', (e) => {
            this.settings.rendering.shadowQuality = e.target.value;
            this.saveAndApply();
            this.updateLevelSpecsCard();
        });

        const sliderSoft = this.overlayEl.querySelector('#slider-shadow-softness');
        const valSoft = this.overlayEl.querySelector('#val-shadow-softness');
        sliderSoft.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            valSoft.textContent = v.toFixed(1);
            this.settings.rendering.shadowSoftness = v;
            this.saveAndApply();
        });

        const chkFollow = this.overlayEl.querySelector('#chk-shadow-follow');
        chkFollow.addEventListener('change', (e) => {
            this.settings.rendering.shadowFollow = e.target.checked;
            this.saveAndApply();
        });

        const sliderBias = this.overlayEl.querySelector('#slider-normal-bias');
        const valBias = this.overlayEl.querySelector('#val-normal-bias');
        sliderBias.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            valBias.textContent = v.toFixed(3);
            this.settings.rendering.shadowNormalBias = v;
            this.saveAndApply();
        });

        // Overrides - Bloom
        const optBloom = this.overlayEl.querySelector('#opt-bloom-quality');
        optBloom.addEventListener('change', (e) => {
            this.settings.rendering.bloomQuality = e.target.value;
            this.saveAndApply();
            this.updateLevelSpecsCard();
        });

        // Overrides - SunRays
        const optSunRays = this.overlayEl.querySelector('#opt-sunrays-samples');
        optSunRays.addEventListener('change', (e) => {
            this.settings.rendering.sunRaysSamples = parseInt(e.target.value, 10);
            this.saveAndApply();
            this.updateLevelSpecsCard();
        });

        // Overrides - Pixel Ratio
        const optPr = this.overlayEl.querySelector('#opt-pixel-ratio');
        optPr.addEventListener('change', (e) => {
            this.settings.rendering.pixelRatio = e.target.value;
            this.saveAndApply();
            this.updateLevelSpecsCard();
        });

        // Camera Settings
        const sliderSens = this.overlayEl.querySelector('#slider-sensitivity');
        const valSens = this.overlayEl.querySelector('#val-sensitivity');
        sliderSens.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            valSens.textContent = v.toFixed(1);
            this.settings.camera.sensitivity = v;
            this.saveAndApply();
        });

        const sliderFov = this.overlayEl.querySelector('#slider-fov');
        const valFov = this.overlayEl.querySelector('#val-fov');
        if (sliderFov) {
            sliderFov.addEventListener('input', (e) => {
                const v = parseInt(e.target.value, 10);
                if (valFov) valFov.textContent = `${v}°`;
                this.settings.camera.fov = v;
                this.saveAndApply();
            });
        }

        const chkInvertY = this.overlayEl.querySelector('#chk-invert-y');
        chkInvertY.addEventListener('change', (e) => {
            this.settings.camera.invertY = e.target.checked;
            this.saveAndApply();
        });

        const chkCamCollision = this.overlayEl.querySelector('#chk-cam-collision');
        chkCamCollision.addEventListener('change', (e) => {
            this.settings.camera.cameraCollision = e.target.checked;
            this.saveAndApply();
        });

        // Physics Settings
        const optSubsteps = this.overlayEl.querySelector('#opt-substeps');
        optSubsteps.addEventListener('change', (e) => {
            this.settings.physics.substeps = parseInt(e.target.value, 10);
            this.saveAndApply();
        });

        const inputWs = this.overlayEl.querySelector('#input-walkspeed');
        inputWs.addEventListener('change', (e) => {
            const v = Math.max(0, parseFloat(e.target.value) || 16);
            this.settings.physics.defaultWalkSpeed = v;
            this.saveAndApply();
        });

        const inputJp = this.overlayEl.querySelector('#input-jumppower');
        inputJp.addEventListener('change', (e) => {
            const v = Math.max(0, parseFloat(e.target.value) || 50);
            this.settings.physics.defaultJumpPower = v;
            this.saveAndApply();
        });

        // Keyboard handler for Escape & Alt+S
        window.addEventListener('keydown', (e) => {
            if (e.altKey && e.code === 'KeyS') {
                e.preventDefault();
                this.toggle();
            } else if (e.code === 'Escape' && this.isOpen) {
                e.preventDefault();
                this.close();
            }
        });

        this.syncUIValues();
    }

    setActiveTab(tabName) {
        this.activeTab = tabName;
        const btns = this.overlayEl.querySelectorAll('.settings-tab-btn');
        const panes = this.overlayEl.querySelectorAll('.settings-pane');

        btns.forEach(b => {
            b.classList.toggle('active', b.dataset.tab === tabName);
        });

        panes.forEach(p => {
            p.classList.toggle('active', p.id === `pane-${tabName}`);
        });

        if (window.lucide) window.lucide.createIcons({ root: this.overlayEl });
    }

    setGraphicsLevel(level) {
        level = Math.max(1, Math.min(21, Math.round(level)));
        this.settings.rendering.graphicsLevel = level;
        this.settings.rendering.antialiasing = (level >= 9);

        // Automatically map graphics level to settings parameters
        if (level <= 4) {
            // Level 1-4: Low / Potato
            this.settings.rendering.shadowQuality = 'off';
            this.settings.rendering.shadowSoftness = 1.0;
            this.settings.rendering.shadowNormalBias = 0.012;
            this.settings.rendering.shadowFrustumRadius = 140;
            this.settings.rendering.bloomQuality = 'off';
            this.settings.rendering.sunRaysSamples = 0;
            this.settings.rendering.pixelRatio = '1.0';
        } else if (level <= 9) {
            // Level 5-9: Medium
            this.settings.rendering.shadowQuality = '1024';
            this.settings.rendering.shadowSoftness = 1.8;
            this.settings.rendering.shadowNormalBias = 0.012;
            this.settings.rendering.shadowFrustumRadius = 110;
            this.settings.rendering.bloomQuality = 'basic';
            this.settings.rendering.sunRaysSamples = 12;
            this.settings.rendering.pixelRatio = '1.0';
        } else if (level <= 15) {
            // Level 10-15: High (Classic Roblox Studio Max)
            this.settings.rendering.shadowQuality = '2048';
            this.settings.rendering.shadowSoftness = 2.4;
            this.settings.rendering.shadowNormalBias = 0.012;
            this.settings.rendering.shadowFrustumRadius = 80;
            this.settings.rendering.bloomQuality = 'basic';
            this.settings.rendering.sunRaysSamples = 24;
            this.settings.rendering.pixelRatio = '1.5';
        } else if (level <= 20) {
            // Level 16-20: Ultra HD (Unity HDRP quality)
            this.settings.rendering.shadowQuality = '4096';
            this.settings.rendering.shadowSoftness = 2.8;
            this.settings.rendering.shadowNormalBias = 0.012;
            this.settings.rendering.shadowFrustumRadius = 60;
            this.settings.rendering.bloomQuality = 'cinematic';
            this.settings.rendering.sunRaysSamples = 36;
            this.settings.rendering.pixelRatio = 'native';
        } else {
            // Level 21: Cinematic AAA (Unreal Engine 5 standard)
            this.settings.rendering.shadowQuality = '4096';
            this.settings.rendering.shadowSoftness = 3.2;
            this.settings.rendering.shadowNormalBias = 0.012;
            this.settings.rendering.shadowFrustumRadius = 48;
            this.settings.rendering.bloomQuality = 'cinematic';
            this.settings.rendering.sunRaysSamples = 36;
            this.settings.rendering.pixelRatio = 'native';
        }

        this.syncUIValues();
        this.saveAndApply();
    }

    syncUIValues() {
        const r = this.settings.rendering;
        const c = this.settings.camera;
        const p = this.settings.physics;

        // Level Slider & Badge
        const slider = this.overlayEl.querySelector('#slider-graphics-level');
        if (slider) slider.value = r.graphicsLevel;

        const badge = this.overlayEl.querySelector('#badge-graphics-level');
        if (badge) {
            let label = `Level ${r.graphicsLevel}`;
            let colorCls = 'level-high';
            if (r.graphicsLevel <= 4) {
                label += ' • Low Performance';
                colorCls = 'level-low';
            } else if (r.graphicsLevel <= 9) {
                label += ' • Medium';
                colorCls = 'level-med';
            } else if (r.graphicsLevel <= 15) {
                label += ' • High Fidelity';
                colorCls = 'level-high';
            } else if (r.graphicsLevel <= 20) {
                label += ' • Ultra HD (Unity HDRP)';
                colorCls = 'level-ultra';
            } else {
                label += ' • Cinematic AAA (Unreal 5)';
                colorCls = 'level-cinematic';
            }
            badge.className = `graphics-level-badge ${colorCls}`;
            badge.textContent = label;
        }

        // Preset buttons active state
        this.overlayEl.querySelectorAll('.preset-btn').forEach(btn => {
            const lvl = parseInt(btn.dataset.level, 10);
            btn.classList.toggle('active', lvl === r.graphicsLevel);
        });

        // Overrides
        const optShadow = this.overlayEl.querySelector('#opt-shadow-quality');
        if (optShadow) optShadow.value = r.shadowQuality;

        const sliderSoft = this.overlayEl.querySelector('#slider-shadow-softness');
        const valSoft = this.overlayEl.querySelector('#val-shadow-softness');
        if (sliderSoft) sliderSoft.value = r.shadowSoftness;
        if (valSoft) valSoft.textContent = Number(r.shadowSoftness).toFixed(1);

        const chkFollow = this.overlayEl.querySelector('#chk-shadow-follow');
        if (chkFollow) chkFollow.checked = Boolean(r.shadowFollow);

        const sliderBias = this.overlayEl.querySelector('#slider-normal-bias');
        const valBias = this.overlayEl.querySelector('#val-normal-bias');
        if (sliderBias) sliderBias.value = r.shadowNormalBias;
        if (valBias) valBias.textContent = Number(r.shadowNormalBias).toFixed(3);

        const optBloom = this.overlayEl.querySelector('#opt-bloom-quality');
        if (optBloom) optBloom.value = r.bloomQuality;

        const optSunRays = this.overlayEl.querySelector('#opt-sunrays-samples');
        if (optSunRays) optSunRays.value = String(r.sunRaysSamples);

        const optPr = this.overlayEl.querySelector('#opt-pixel-ratio');
        if (optPr) optPr.value = r.pixelRatio;

        // Camera
        const sliderSens = this.overlayEl.querySelector('#slider-sensitivity');
        const valSens = this.overlayEl.querySelector('#val-sensitivity');
        if (sliderSens) sliderSens.value = c.sensitivity;
        if (valSens) valSens.textContent = Number(c.sensitivity).toFixed(1);

        const sliderFov = this.overlayEl.querySelector('#slider-fov');
        const valFov = this.overlayEl.querySelector('#val-fov');
        if (sliderFov) sliderFov.value = c.fov;
        if (valFov) valFov.textContent = `${c.fov}°`;

        const chkInvertY = this.overlayEl.querySelector('#chk-invert-y');
        if (chkInvertY) chkInvertY.checked = Boolean(c.invertY);

        const chkCamCollision = this.overlayEl.querySelector('#chk-cam-collision');
        if (chkCamCollision) chkCamCollision.checked = Boolean(c.cameraCollision);

        // Physics
        const optSubsteps = this.overlayEl.querySelector('#opt-substeps');
        if (optSubsteps) optSubsteps.value = String(p.substeps);

        const inputWs = this.overlayEl.querySelector('#input-walkspeed');
        if (inputWs) inputWs.value = p.defaultWalkSpeed;

        const inputJp = this.overlayEl.querySelector('#input-jumppower');
        if (inputJp) inputJp.value = p.defaultJumpPower;

        this.updateLevelSpecsCard();
    }

    updateLevelSpecsCard() {
        const card = this.overlayEl.querySelector('#level-specs-summary');
        if (!card) return;

        const r = this.settings.rendering;
        const shadowText = r.shadowQuality === 'off' ? 'Disabled' : `${r.shadowQuality}x${r.shadowQuality} (PCFSoft Radius ${r.shadowSoftness})`;
        const bloomText = r.bloomQuality === 'off' ? 'Disabled' : (r.bloomQuality === 'basic' ? '3-Mip Kawase' : '5-Mip Dual Kawase');
        const raysText = r.sunRaysSamples === 0 ? 'Disabled' : `${r.sunRaysSamples} Raymarching Steps`;
        const resText = r.pixelRatio === 'native' ? 'Native Retina / 4K (2.0x)' : (r.pixelRatio === '1.5' ? '150% Scale' : '100% Native');

        card.innerHTML = `
            <div class="spec-row">
                <span class="spec-name">Shadow Fidelity:</span>
                <span class="spec-val ${r.shadowQuality === '4096' ? 'highlight' : ''}">${shadowText}</span>
            </div>
            <div class="spec-row">
                <span class="spec-name">Avatar Frustum Tracking:</span>
                <span class="spec-val ${r.shadowFollow ? 'highlight' : ''}">${r.shadowFollow ? 'Dynamic Focus (48-80 studs)' : 'Static Bounds'}</span>
            </div>
            <div class="spec-row">
                <span class="spec-name">Anti-Acne Normal Bias:</span>
                <span class="spec-val">${r.shadowNormalBias} (No Peter-Panning)</span>
            </div>
            <div class="spec-row">
                <span class="spec-name">Pyramid Bloom:</span>
                <span class="spec-val ${r.bloomQuality === 'cinematic' ? 'highlight' : ''}">${bloomText}</span>
            </div>
            <div class="spec-row">
                <span class="spec-name">Volumetric Sun Rays:</span>
                <span class="spec-val ${r.sunRaysSamples >= 24 ? 'highlight' : ''}">${raysText}</span>
            </div>
            <div class="spec-row">
                <span class="spec-name">Viewport Resolution:</span>
                <span class="spec-val">${resText}</span>
            </div>
        `;
    }

    saveAndApply() {
        this.saveSettings();
        this.applySettings();
    }

    applySettings() {
        if (!this.app) return;

        // 1. Apply to Viewport
        if (this.app.viewport && this.app.viewport.applyGraphicsSettings) {
            this.app.viewport.applyGraphicsSettings(this.settings.rendering);
        }

        // 2. Apply Camera Settings
        if (this.app.viewport && this.app.viewport.camera) {
            if (this.settings.camera.fov && this.app.viewport.camera.fov !== this.settings.camera.fov) {
                this.app.viewport.camera.fov = this.settings.camera.fov;
                this.app.viewport.camera.updateProjectionMatrix();
            }
        }
        if (this.app.characterController) {
            this.app.characterController.mouseSensitivity = this.settings.camera.sensitivity || 1.0;
            this.app.characterController.invertY = Boolean(this.settings.camera.invertY);
            this.app.characterController.cameraCollision = Boolean(this.settings.camera.cameraCollision);
        }

        // 3. Apply Physics Settings
        if (this.app.physicsEngine) {
            if (this.settings.physics.substeps) {
                this.app.physicsEngine.substeps = this.settings.physics.substeps;
            }
        }
    }

    open(tab = 'rendering') {
        this.isOpen = true;
        this.overlayEl.style.display = 'flex';
        this.setActiveTab(tab);
        this.syncUIValues();
    }

    close() {
        this.isOpen = false;
        this.overlayEl.style.display = 'none';
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open('rendering');
    }
}
