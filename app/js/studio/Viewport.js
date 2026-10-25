/**
 * Conblox 3D Viewport
 * Three.js scene, camera controls, mesh synchronization, selection outline, and PBR materials
 */

import { Vector3, Color3, CFrame } from '../engine/Math3D.js';
import { nativeInputManager } from '../engine/NativeInputManager.js';

export class Viewport {
    constructor(containerEl, dataModel) {
        this.container = containerEl;
        this.dataModel = dataModel;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sunLight = null;
        this.ambientLight = null;
        this.hemiLight = null;

        // Mesh mapping: BasePart -> THREE.Mesh
        this.partMeshes = new Map();
        this.meshParts = new Map();

        // PointLight mapping: PointLight -> { light: THREE.PointLight, helper: THREE.Mesh }
        this.pointLights = new Map();

        // Selection box & outline
        this.selectionBox = null;
        this.selectionOutline = null;
        this.selectedPart = null;

        // Studio camera fly state
        this.cameraPos = new THREE.Vector3(0, 15, 30);
        this.cameraPitch = -0.35; // radians
        this.cameraYaw = 0;
        this.isLeftMouseDown = false;
        this.isRightMouseDown = false;
        this.isMiddleMouseDown = false;
        this.isHoveredOverViewport = false;
        this.isCtrlDown = false;
        this.leftMouseDownPos = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.flyKeys = { w: false, a: false, s: false, d: false, q: false, e: false, shift: false };
        this.isPlayMode = false;
        this.isPausedCameraMode = false;
        this.cloudsDriftTime = 0;

        this.studTexture = null;
        this.faceTexture = null;
        this.init();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xa3c8f5); // Soft Roblox sky blue
        this.scene.fog = new THREE.FogExp2(0xa3c8f5, 0.0018);

        // Camera
        const aspect = (this.container.clientWidth / this.container.clientHeight) || 1;
        this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 2500);
        this.updateCameraTransform();

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.NoToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);

        // Ambient & Hemisphere Lighting
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
        this.scene.add(this.ambientLight);

        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x3d4a36, 0.4);
        this.scene.add(this.hemiLight);

        // Sun Directional Light (AAA Quality Unreal / Unity / Roblox Future lighting)
        this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.35);
        this.sunLight.position.set(120, 240, 90);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 4096;
        this.sunLight.shadow.mapSize.height = 4096;
        this.sunLight.shadow.camera.near = 10;
        this.sunLight.shadow.camera.far = 600;
        const d = 48;
        this.sunLight.shadow.camera.left = -d;
        this.sunLight.shadow.camera.right = d;
        this.sunLight.shadow.camera.top = d;
        this.sunLight.shadow.camera.bottom = -d;
        this.sunLight.shadow.bias = -0.00005;
        this.sunLight.shadow.normalBias = 0.048;
        this.sunLight.shadow.radius = 3.2;
        this.scene.add(this.sunLight);
        this.scene.add(this.sunLight.target);

        // Dynamic Frustum Follow & Graphics Level
        this.shadowFocus = new THREE.Vector3(0, 0, 0);
        this.sunLightDirection = new THREE.Vector3(120, 240, 90).normalize();
        this.shadowFrustumRadius = 48;
        this.shadowFollowEnabled = true;
        this.graphicsLevel = 21;
        this.bloomQuality = 'cinematic';
        this.sunRaysQuality = 'cinematic';

        // Selection Box & Outline System (Thick 3D Beams with depth test)
        this.selectionBoxMaterial = new THREE.MeshBasicMaterial({
            color: 0x00e1ff,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -3.0,
            polygonOffsetUnits: -3.0,
            transparent: true,
            opacity: 0.98
        });

        this.selectionOutlineMaterial = new THREE.MeshBasicMaterial({
            color: 0x00b4ff,
            side: THREE.BackSide,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            opacity: 0.65
        });

        this.selectionBox = new THREE.Mesh(new THREE.BufferGeometry(), this.selectionBoxMaterial);
        this.selectionBox.visible = false;
        this.selectionBox.renderOrder = 998;
        this.scene.add(this.selectionBox);

        this.selectionOutline = new THREE.Mesh(new THREE.BufferGeometry(), this.selectionOutlineMaterial);
        this.selectionOutline.visible = false;
        this.selectionOutline.renderOrder = 997;
        this.scene.add(this.selectionOutline);

        this.selectionGroupBounds = new THREE.Box3Helper(new THREE.Box3(), 0x42d8ff);
        this.selectionGroupBounds.material.depthTest = false;
        this.selectionGroupBounds.material.depthWrite = false;
        this.selectionGroupBounds.renderOrder = 999;
        this.selectionGroupBounds.visible = false;
        this.scene.add(this.selectionGroupBounds);

        // Create textures
        this.studTexture = this.createStudCanvasTexture();
        this.baseplateTexture = this.createBaseplateGridTexture();
        this.faceTexture = this.createFaceCanvasTexture();

        // Skybox, Sun, Moon & Stars System
        this.skyGroup = new THREE.Group();
        this.scene.add(this.skyGroup);
        this.initCelestialBodies();

        // Clouds System
        this.initClouds();

        // Post-Processing Shaders Pipeline (Bloom, Atmosphere, SunRays, DepthOfField)
        this.initPostProcessing();

        // Bind events
        this.bindInput();
        this.bindWorkspaceHierarchy();
        this.bindLightingAndAtmosphereHierarchy();

        window.addEventListener('resize', this.onResize.bind(this));
    }

    bindWorkspaceHierarchy() {
        const ws = this.dataModel.Workspace;
        if (!ws) return;

        if (ws.CurrentCamera) {
            this.bindWorkspaceCameraEvents(ws.CurrentCamera);
        }
        ws.Changed.Connect((prop) => {
            if (prop === 'CurrentCamera' && ws.CurrentCamera) {
                this.bindWorkspaceCameraEvents(ws.CurrentCamera);
            }
        });

        ws.DescendantAdded.Connect((inst) => {
            if (inst.IsA && inst.IsA('BasePart')) {
                this.syncPartMesh(inst);
            } else if (inst.ClassName === 'PointLight') {
                this.syncPointLight(inst);
            } else if (inst.ClassName === 'Clouds') {
                inst.Changed.Connect(() => this.syncClouds());
                this.syncClouds();
            } else if (inst.ClassName === 'Decal' || inst.ClassName === 'Texture') {
                if (inst.Parent && inst.Parent.IsA && inst.Parent.IsA('BasePart')) {
                    const mesh = this.partMeshes.get(inst.Parent);
                    if (mesh) {
                        inst.Changed.Connect(() => this.syncDecalOverlays(inst.Parent, mesh));
                        this.syncDecalOverlays(inst.Parent, mesh);
                    }
                }
            }
        });

        ws.DescendantRemoved.Connect((inst) => {
            if (inst.IsA && inst.IsA('BasePart')) {
                this.removePartMesh(inst);
            } else if (inst.ClassName === 'PointLight') {
                this.removePointLight(inst);
            } else if (inst.ClassName === 'Clouds') {
                this.syncClouds();
            } else if (inst.ClassName === 'Decal' || inst.ClassName === 'Texture') {
                if (inst.Parent && inst.Parent.IsA && inst.Parent.IsA('BasePart')) {
                    const mesh = this.partMeshes.get(inst.Parent);
                    if (mesh) {
                        this.syncDecalOverlays(inst.Parent, mesh);
                    }
                }
            }
        });

        // Bind any existing Clouds already in Workspace
        for (const child of ws.GetDescendants()) {
            if (child.ClassName === 'Clouds') {
                child.Changed.Connect(() => this.syncClouds());
            }
        }
        this.syncClouds();
    }

    bindLightingAndAtmosphereHierarchy() {
        const lighting = this.dataModel.Lighting;
        if (!lighting) return;

        lighting.Changed.Connect(() => this.syncLightingAndEffects());
        lighting.ChildAdded.Connect((child) => {
            child.Changed.Connect(() => this.syncLightingAndEffects());
            this.syncLightingAndEffects();
        });
        lighting.ChildRemoved.Connect(() => this.syncLightingAndEffects());

        for (const child of lighting.GetChildren()) {
            child.Changed.Connect(() => this.syncLightingAndEffects());
        }

        this.syncLightingAndEffects();
    }

    initCelestialBodies() {
        // 1. Cube Skybox (6-sided seamless panoramic skybox)
        const skyBoxGeo = new THREE.BoxGeometry(2200, 2200, 2200);
        this.skyBoxMaterials = [];
        for (let i = 0; i < 6; i++) {
            this.skyBoxMaterials.push(new THREE.MeshBasicMaterial({
                side: THREE.BackSide,
                depthWrite: false,
                fog: false
            }));
        }
        this.skyBoxMesh = new THREE.Mesh(skyBoxGeo, this.skyBoxMaterials);
        this.skyGroup.add(this.skyBoxMesh);

        // Procedural Sky Dome fallback
        const skyGeo = new THREE.SphereGeometry(1700, 32, 24);
        this.skyCanvas = document.createElement('canvas');
        this.skyCanvas.width = 128;
        this.skyCanvas.height = 512;
        this.skyCtx = this.skyCanvas.getContext('2d');
        this.skyTexture = new THREE.CanvasTexture(this.skyCanvas);
        this.skyMat = new THREE.MeshBasicMaterial({
            map: this.skyTexture,
            side: THREE.BackSide,
            depthWrite: false,
            fog: false
        });
        this.skyDome = new THREE.Mesh(skyGeo, this.skyMat);
        this.skyDome.visible = false;
        this.skyGroup.add(this.skyDome);

        // 2. Realistic Photorealistic Sun Billboard (Majestic Large Solar Corona)
        const sunTex = this.createRealisticSunTexture();
        const sunMat = new THREE.SpriteMaterial({
            map: sunTex,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            fog: false
        });
        this.sunSprite = new THREE.Sprite(sunMat);
        this.sunSprite.scale.set(460, 460, 1);
        this.skyGroup.add(this.sunSprite);

        // 3. Realistic Photorealistic Moon Billboard
        const moonTex = this.createRealisticMoonTexture();
        const moonMat = new THREE.SpriteMaterial({
            map: moonTex,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            fog: false
        });
        this.moonSprite = new THREE.Sprite(moonMat);
        this.moonSprite.scale.set(320, 320, 1);
        this.skyGroup.add(this.moonSprite);

        // 4. Night Stars
        const starCount = 1200;
        const starGeo = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);
        const starRadius = 1500;

        for (let i = 0; i < starCount; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = starRadius;
            const sinPhi = Math.sin(phi);

            starPositions[i * 3] = r * sinPhi * Math.cos(theta);
            starPositions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.95 + (Math.random() - 0.2) * 200;
            starPositions[i * 3 + 2] = r * sinPhi * Math.sin(theta);

            const brightness = 0.6 + Math.random() * 0.4;
            const tint = Math.random();
            if (tint < 0.2) {
                starColors[i * 3] = 0.8 * brightness;
                starColors[i * 3 + 1] = 0.9 * brightness;
                starColors[i * 3 + 2] = 1.0 * brightness;
            } else if (tint < 0.35) {
                starColors[i * 3] = 1.0 * brightness;
                starColors[i * 3 + 1] = 0.9 * brightness;
                starColors[i * 3 + 2] = 0.7 * brightness;
            } else {
                starColors[i * 3] = brightness;
                starColors[i * 3 + 1] = brightness;
                starColors[i * 3 + 2] = brightness;
            }
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        const starMat = new THREE.PointsMaterial({
            size: 3.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.0,
            depthWrite: false,
            fog: false
        });
        this.starPoints = new THREE.Points(starGeo, starMat);
        this.skyGroup.add(this.starPoints);
    }

    getMaterialTexture(type) {
        if (!this.materialTextures) this.materialTextures = new Map();
        if (this.materialTextures.has(type)) return this.materialTextures.get(type);

        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        if (type === 'Wood') {
            ctx.fillStyle = '#e8dccb';
            ctx.fillRect(0, 0, 256, 256);
            for (let i = 0; i < 220; i++) {
                const x = Math.random() * 256;
                const w = 1 + Math.random() * 3;
                const alpha = 0.08 + Math.random() * 0.18;
                ctx.fillStyle = `rgba(90, 58, 30, ${alpha})`;
                ctx.fillRect(x, 0, w, 256);
            }
            ctx.strokeStyle = 'rgba(90, 58, 30, 0.14)';
            ctx.lineWidth = 3;
            for (let y = 30; y < 256; y += 45) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.bezierCurveTo(80, y - 15, 170, y + 15, 256, y);
                ctx.stroke();
            }
        } else if (type === 'WoodPlanks') {
            ctx.fillStyle = '#decbb5';
            ctx.fillRect(0, 0, 256, 256);
            for (let p = 0; p < 4; p++) {
                const px = p * 64;
                for (let i = 0; i < 45; i++) {
                    const x = px + Math.random() * 62;
                    ctx.fillStyle = `rgba(80, 50, 25, ${0.05 + Math.random() * 0.15})`;
                    ctx.fillRect(x, 0, 1 + Math.random() * 2, 256);
                }
                ctx.fillStyle = 'rgba(40, 25, 15, 0.7)';
                ctx.fillRect(px + 62, 0, 2, 256);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.fillRect(px + 64, 0, 1, 256);
            }
        } else if (type === 'Brick') {
            ctx.fillStyle = '#dcd8d0';
            ctx.fillRect(0, 0, 256, 256);
            const rowH = 32;
            const brickW = 64;
            for (let row = 0; row < 8; row++) {
                const y = row * rowH + 2;
                const offset = (row % 2) * (brickW / 2);
                for (let col = -1; col < 5; col++) {
                    const x = col * brickW + offset + 2;
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(x, y, brickW - 4, rowH - 4);
                    for (let s = 0; s < 15; s++) {
                        ctx.fillStyle = `rgba(0, 0, 0, ${0.03 + Math.random() * 0.08})`;
                        ctx.fillRect(x + Math.random() * (brickW - 5), y + Math.random() * (rowH - 5), 2, 2);
                    }
                }
            }
        } else if (type === 'DiamondPlate') {
            ctx.fillStyle = '#b0b8c0';
            ctx.fillRect(0, 0, 256, 256);
            const grid = 64;
            for (let gy = 0; gy < 256; gy += grid) {
                for (let gx = 0; gx < 256; gx += grid) {
                    const drawDiamond = (cx, cy, angle) => {
                        ctx.save();
                        ctx.translate(cx, cy);
                        ctx.rotate(angle);
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                        ctx.beginPath();
                        ctx.ellipse(-1, -1, 14, 5, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = 'rgba(30, 35, 40, 0.35)';
                        ctx.beginPath();
                        ctx.ellipse(1, 1, 14, 5, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    };
                    drawDiamond(gx + 16, gy + 16, Math.PI / 4);
                    drawDiamond(gx + 48, gy + 48, -Math.PI / 4);
                }
            }
        } else if (type === 'CorrodedMetal') {
            ctx.fillStyle = '#788088';
            ctx.fillRect(0, 0, 256, 256);
            for (let i = 0; i < 45; i++) {
                const rx = Math.random() * 256;
                const ry = Math.random() * 256;
                const r = 8 + Math.random() * 28;
                const grad = ctx.createRadialGradient(rx, ry, 2, rx, ry, r);
                grad.addColorStop(0, 'rgba(110, 48, 16, 0.6)');
                grad.addColorStop(0.6, 'rgba(150, 75, 25, 0.35)');
                grad.addColorStop(1, 'rgba(60, 30, 10, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(rx, ry, r, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (type === 'Concrete') {
            ctx.fillStyle = '#cccccc';
            ctx.fillRect(0, 0, 256, 256);
            for (let i = 0; i < 1800; i++) {
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                const dark = Math.random() < 0.5;
                ctx.fillStyle = dark ? `rgba(40, 40, 40, ${0.05 + Math.random() * 0.12})` : `rgba(255, 255, 255, ${0.08 + Math.random() * 0.15})`;
                ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
            }
        } else if (type === 'Granite') {
            ctx.fillStyle = '#b8b4b0';
            ctx.fillRect(0, 0, 256, 256);
            for (let i = 0; i < 1200; i++) {
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                const c = Math.random();
                if (c < 0.35) ctx.fillStyle = 'rgba(20, 20, 20, 0.35)';
                else if (c < 0.7) ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                else ctx.fillStyle = 'rgba(180, 130, 100, 0.25)';
                ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
            }
        } else if (type === 'Marble') {
            ctx.fillStyle = '#fafafc';
            ctx.fillRect(0, 0, 256, 256);
            ctx.strokeStyle = 'rgba(120, 130, 145, 0.22)';
            ctx.lineWidth = 3;
            for (let i = 0; i < 6; i++) {
                ctx.beginPath();
                ctx.moveTo(Math.random() * 256, 0);
                ctx.bezierCurveTo(Math.random() * 256, 80, Math.random() * 256, 180, Math.random() * 256, 256);
                ctx.stroke();
            }
        } else if (type === 'Slate') {
            ctx.fillStyle = '#68727d';
            ctx.fillRect(0, 0, 256, 256);
            for (let y = 0; y < 256; y += 4) {
                const alpha = 0.04 + Math.random() * 0.1;
                ctx.fillStyle = Math.random() < 0.5 ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 0, 0, ${alpha})`;
                ctx.fillRect(0, y, 256, 2 + Math.random() * 4);
            }
        } else if (type === 'Fabric') {
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, 256, 256);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            for (let i = 0; i < 256; i += 6) {
                ctx.fillRect(i, 0, 2, 256);
                ctx.fillRect(0, i, 256, 2);
            }
        } else if (type === 'Sand') {
            ctx.fillStyle = '#e8d8b8';
            ctx.fillRect(0, 0, 256, 256);
            for (let i = 0; i < 2400; i++) {
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                ctx.fillStyle = Math.random() < 0.5 ? 'rgba(140, 110, 60, 0.15)' : 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(x, y, 1, 1);
            }
        } else if (type === 'Foil') {
            ctx.fillStyle = '#e2e6ea';
            ctx.fillRect(0, 0, 256, 256);
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 50; i++) {
                ctx.strokeStyle = Math.random() < 0.5 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(40, 50, 60, 0.35)';
                ctx.beginPath();
                ctx.moveTo(Math.random() * 256, Math.random() * 256);
                ctx.lineTo(Math.random() * 256, Math.random() * 256);
                ctx.stroke();
            }
        } else if (type === 'Ice') {
            ctx.fillStyle = '#eaf4fc';
            ctx.fillRect(0, 0, 256, 256);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 25; i++) {
                ctx.beginPath();
                ctx.moveTo(Math.random() * 256, Math.random() * 256);
                ctx.lineTo(Math.random() * 256, Math.random() * 256);
                ctx.stroke();
            }
        } else if (type === 'Metal') {
            ctx.fillStyle = '#c5ccd3';
            ctx.fillRect(0, 0, 256, 256);
            for (let y = 0; y < 256; y += 2) {
                ctx.fillStyle = `rgba(255, 255, 255, ${0.04 + Math.random() * 0.08})`;
                ctx.fillRect(0, y, 256, 1);
            }
        } else if (type === 'Grass') {
            ctx.fillStyle = '#bce6b5';
            ctx.fillRect(0, 0, 256, 256);
            for (let i = 0; i < 2800; i++) {
                const gx = Math.random() * 256;
                const gy = Math.random() * 256;
                const gl = 3 + Math.random() * 6;
                const dark = Math.random() < 0.48;
                ctx.fillStyle = dark ? `rgba(25, 55, 15, ${0.15 + Math.random() * 0.20})` : `rgba(255, 255, 255, ${0.18 + Math.random() * 0.25})`;
                ctx.fillRect(gx, gy, 1 + Math.random() * 1.5, gl);
            }
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.generateMipmaps = true;
        this.materialTextures.set(type, tex);
        return tex;
    }

    createStudCanvasTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Clean white base
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 128, 128);

        // Outer stud drop shadow
        ctx.beginPath();
        ctx.arc(64, 67, 34, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.26)';
        ctx.fill();

        // Outer stud rim
        ctx.beginPath();
        ctx.arc(64, 64, 34, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.20)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 3D cylindrical body
        const grad = ctx.createLinearGradient(64, 30, 64, 98);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.40)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
        ctx.beginPath();
        ctx.arc(64, 64, 32, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Stud circular top highlight
        ctx.beginPath();
        ctx.arc(63, 62, 28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fill();

        // Center iconic embossed circle
        ctx.beginPath();
        ctx.arc(64, 64, 16, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        return tex;
    }

    createBaseplateGridTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Pure white base for vertex color multiplication
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 256, 256);

        // Subtle 1-stud subgrid crosshairs at 64px intervals
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 64; i < 256; i += 64) {
            ctx.beginPath();
            ctx.moveTo(i, 0); ctx.lineTo(i, 256);
            ctx.moveTo(0, i); ctx.lineTo(256, i);
            ctx.stroke();
        }

        // Inner 4-stud border bevel
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(1.5, 1.5, 253, 253);

        // Outer prominent 4-stud grid line (classic Roblox Studio grid)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(0, 0, 256, 256);

        // Center 4-stud crosshair accent
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(126, 126, 4, 4);

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        return tex;
    }

    createFaceCanvasTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Classic bright yellow background matching avatar head (#FED542 / #F5CD2F)
        ctx.fillStyle = '#f5cd2f';
        ctx.fillRect(0, 0, 512, 512);

        // Eyes: Solid black vertical ovals with smooth anti-aliased curves
        ctx.fillStyle = '#111111';

        // Left Eye
        ctx.beginPath();
        ctx.ellipse(172, 192, 28, 42, 0, 0, Math.PI * 2);
        ctx.fill();

        // Right Eye
        ctx.beginPath();
        ctx.ellipse(340, 192, 28, 42, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye specular highlights: pure white
        ctx.fillStyle = '#ffffff';
        // Left eye primary highlight
        ctx.beginPath();
        ctx.arc(178, 178, 10, 0, Math.PI * 2);
        ctx.fill();
        // Left eye secondary highlight
        ctx.beginPath();
        ctx.arc(164, 210, 5, 0, Math.PI * 2);
        ctx.fill();

        // Right eye primary highlight
        ctx.beginPath();
        ctx.arc(346, 178, 10, 0, Math.PI * 2);
        ctx.fill();
        // Right eye secondary highlight
        ctx.beginPath();
        ctx.arc(332, 210, 5, 0, Math.PI * 2);
        ctx.fill();

        // Smile: Classic Roblox curved smile with cute corner ticks
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Main smile arc
        ctx.beginPath();
        ctx.moveTo(144, 260);
        ctx.bezierCurveTo(176, 385, 336, 385, 368, 260);
        ctx.stroke();

        // Corner dimple ticks
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(144, 260);
        ctx.lineTo(134, 248);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(368, 260);
        ctx.lineTo(378, 248);
        ctx.stroke();

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        return tex;
    }

    createPlayerBillboard(name = 'Player') {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Text "Player" in bold clean font
        ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Dark text outline for perfect contrast
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.lineWidth = 6;
        ctx.lineJoin = 'round';
        ctx.strokeText(name, 128, 32);

        // White text fill
        ctx.fillStyle = '#ffffff';
        ctx.fillText(name, 128, 32);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            depthTest: false
        });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(2.4, 0.6, 1.0);
        sprite.renderOrder = 2000;
        return sprite;
    }

    createRealisticSunTexture() {
        const sunCanvas = document.createElement('canvas');
        sunCanvas.width = 512;
        sunCanvas.height = 512;
        const sctx = sunCanvas.getContext('2d');
        const cx = 256, cy = 256;

        // Clean, authentic celestial sun disk with subtle soft luminous edge (no flare spikes, no ray streamers, no picture)
        const coreGrad = sctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        coreGrad.addColorStop(0.70, 'rgba(255, 255, 255, 1.0)');
        coreGrad.addColorStop(0.85, 'rgba(255, 250, 235, 0.95)');
        coreGrad.addColorStop(0.93, 'rgba(255, 235, 180, 0.45)');
        coreGrad.addColorStop(1, 'rgba(255, 220, 150, 0.0)');

        sctx.fillStyle = coreGrad;
        sctx.beginPath();
        sctx.arc(cx, cy, 180, 0, Math.PI * 2);
        sctx.fill();

        const tex = new THREE.CanvasTexture(sunCanvas);
        return tex;
    }

    createRealisticMoonTexture() {
        const moonCanvas = document.createElement('canvas');
        moonCanvas.width = 512;
        moonCanvas.height = 512;
        const mctx = moonCanvas.getContext('2d');
        const cx = 256, cy = 256;
        const mr = 145;

        // Ethereal lunar atmospheric halo
        const moonHalo = mctx.createRadialGradient(cx, cy, mr - 10, cx, cy, mr + 90);
        moonHalo.addColorStop(0, 'rgba(195, 220, 255, 0.35)');
        moonHalo.addColorStop(0.4, 'rgba(150, 190, 255, 0.14)');
        moonHalo.addColorStop(0.8, 'rgba(120, 160, 255, 0.04)');
        moonHalo.addColorStop(1, 'rgba(100, 140, 255, 0.0)');
        mctx.fillStyle = moonHalo;
        mctx.fillRect(0, 0, 512, 512);

        // Clip to lunar disc
        mctx.save();
        mctx.beginPath();
        mctx.arc(cx, cy, mr, 0, Math.PI * 2);
        mctx.clip();

        // Base highland anorthosite regolith with 3D spherical shading
        const sphereGrad = mctx.createRadialGradient(cx - 35, cy - 35, 15, cx, cy, mr);
        sphereGrad.addColorStop(0, '#e5ecf6');
        sphereGrad.addColorStop(0.5, '#c5d0e0');
        sphereGrad.addColorStop(0.85, '#9daac0');
        sphereGrad.addColorStop(1, '#657388');
        mctx.fillStyle = sphereGrad;
        mctx.fillRect(cx - mr, cy - mr, mr * 2, mr * 2);

        // Draw Lunar Maria (basaltic dark plains)
        const drawMare = (x, y, rx, ry, angle, opacity) => {
            mctx.save();
            mctx.translate(x, y);
            mctx.rotate(angle);
            const mg = mctx.createRadialGradient(0, 0, 2, 0, 0, Math.max(rx, ry));
            mg.addColorStop(0, `rgba(45, 52, 65, ${opacity})`);
            mg.addColorStop(0.65, `rgba(60, 69, 84, ${opacity * 0.75})`);
            mg.addColorStop(1, 'rgba(80, 90, 105, 0.0)');
            mctx.fillStyle = mg;
            mctx.beginPath();
            mctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
            mctx.fill();
            mctx.restore();
        };

        // Oceanus Procellarum & Mare Imbrium (West)
        drawMare(cx - 50, cy - 35, 55, 65, -0.2, 0.82);
        drawMare(cx - 35, cy - 55, 48, 42, 0.1, 0.85);
        // Mare Serenitatis & Tranquillitatis (East)
        drawMare(cx + 35, cy - 40, 36, 32, -0.3, 0.78);
        drawMare(cx + 45, cy + 5, 42, 38, 0.2, 0.80);
        // Mare Crisium (Distinct eastern oval)
        drawMare(cx + 90, cy - 25, 22, 17, -0.2, 0.88);
        // Mare Fecunditatis & Nectaris (Southeast)
        drawMare(cx + 55, cy + 45, 35, 28, 0.3, 0.75);
        drawMare(cx + 25, cy + 55, 25, 22, 0.1, 0.72);
        // Mare Nubium & Humorum (Southwest)
        drawMare(cx - 40, cy + 50, 38, 30, -0.1, 0.78);
        drawMare(cx - 75, cy + 35, 22, 20, 0.4, 0.80);

        // Tycho Crater Ray System (Southern Highlands)
        const tychoX = cx - 15, tychoY = cy + 78;
        mctx.save();
        mctx.translate(tychoX, tychoY);
        for (let r = 0; r < 20; r++) {
            const rayAngle = (r / 20) * Math.PI * 2 + 0.15;
            const rLength = 110 + Math.sin(r * 4.3) * 50;
            const rayGrad = mctx.createLinearGradient(0, 0, Math.cos(rayAngle) * rLength, Math.sin(rayAngle) * rLength);
            rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
            rayGrad.addColorStop(0.3, 'rgba(240, 245, 255, 0.35)');
            rayGrad.addColorStop(1, 'rgba(200, 220, 255, 0.0)');
            mctx.strokeStyle = rayGrad;
            mctx.lineWidth = 1.5 + (r % 3) * 0.8;
            mctx.beginPath();
            mctx.moveTo(0, 0);
            mctx.lineTo(Math.cos(rayAngle) * rLength, Math.sin(rayAngle) * rLength);
            mctx.stroke();
        }
        mctx.restore();

        // Tycho central bright peak & rim
        mctx.fillStyle = '#ffffff';
        mctx.beginPath();
        mctx.arc(tychoX, tychoY, 5, 0, Math.PI * 2);
        mctx.fill();
        mctx.strokeStyle = 'rgba(40, 45, 55, 0.6)';
        mctx.lineWidth = 1.5;
        mctx.stroke();

        // Copernicus Crater with bright ejecta
        const copX = cx - 35, copY = cy - 10;
        const copG = mctx.createRadialGradient(copX, copY, 2, copX, copY, 18);
        copG.addColorStop(0, '#ffffff');
        copG.addColorStop(0.4, 'rgba(245, 250, 255, 0.6)');
        copG.addColorStop(1, 'rgba(200, 215, 235, 0.0)');
        mctx.fillStyle = copG;
        mctx.beginPath();
        mctx.arc(copX, copY, 18, 0, Math.PI * 2);
        mctx.fill();
        mctx.fillStyle = '#ffffff';
        mctx.beginPath();
        mctx.arc(copX, copY, 4, 0, Math.PI * 2);
        mctx.fill();

        // Kepler & Aristarchus (bright spots)
        mctx.fillStyle = '#ffffff';
        mctx.beginPath();
        mctx.arc(cx - 75, cy - 15, 3.5, 0, Math.PI * 2);
        mctx.arc(cx - 65, cy - 45, 4.5, 0, Math.PI * 2);
        mctx.fill();

        // Delicate limb brightening around edge
        const limbG = mctx.createRadialGradient(cx, cy, mr - 12, cx, cy, mr);
        limbG.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
        limbG.addColorStop(0.8, 'rgba(230, 240, 255, 0.25)');
        limbG.addColorStop(1, 'rgba(180, 210, 255, 0.45)');
        mctx.fillStyle = limbG;
        mctx.beginPath();
        mctx.arc(cx, cy, mr, 0, Math.PI * 2);
        mctx.fill();

        mctx.restore();

        const tex = new THREE.CanvasTexture(moonCanvas);
        return tex;
    }

    onResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        if (w === 0 || h === 0) return;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);

        const pr = this.renderer.getPixelRatio() || 1;
        const rw = Math.max(1, Math.floor(w * pr));
        const rh = Math.max(1, Math.floor(h * pr));
        if (this.mainRenderTarget) {
            this.mainRenderTarget.setSize(rw, rh);
        }
        if (this.initBloomPyramid) {
            this.initBloomPyramid(rw, rh);
        }
        if (this.postMaterial && this.postMaterial.uniforms.uResolution) {
            this.postMaterial.uniforms.uResolution.value.set(rw, rh);
        }
    }

    bindInput() {
        const el = this.renderer.domElement;

        // 2D Marquee Selection Box (Studio 3D Viewport)
        this.marqueeEl = document.createElement('div');
        this.marqueeEl.id = 'conblox-viewport-marquee';
        this.marqueeEl.style.cssText = `
            position: absolute;
            display: none;
            border: 1px solid rgba(0, 162, 255, 0.95);
            background: rgba(0, 162, 255, 0.18);
            pointer-events: none;
            z-index: 50;
            box-sizing: border-box;
        `;
        this.container.appendChild(this.marqueeEl);
        this.isMarqueeSelecting = false;
        this.marqueeStart = null;

        el.addEventListener('contextmenu', (e) => e.preventDefault());

        el.addEventListener('mouseenter', () => {
            this.isHoveredOverViewport = true;
        });

        el.addEventListener('mouseleave', () => {
            if (!this.isLeftMouseDown && !this.isRightMouseDown && !this.isMiddleMouseDown) {
                this.isHoveredOverViewport = false;
                this.lastMouseX = 0;
                this.lastMouseY = 0;
                this.flyKeys.w = false;
                this.flyKeys.a = false;
                this.flyKeys.s = false;
                this.flyKeys.d = false;
                this.flyKeys.q = false;
                this.flyKeys.e = false;
                this.flyKeys.shift = false;
            }
        });

        el.addEventListener('mousedown', (e) => {
            if (this.isPlayMode && !this.isPausedCameraMode) return; // Handled by CharacterController
            if (this.isPlayMode && e.button !== 1 && e.button !== 2) return;

            if (e.button === 0) {
                this.isLeftMouseDown = true;
                this.leftMouseDownPos = { x: e.clientX, y: e.clientY };
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;

                // When in Select mode, holding left click on an un-locked Part drags it
                const gizmo = window.conbloxStudio?.gizmoManager;
                const isSelectMode = (!gizmo || gizmo.currentMode === 'select');
                if (isSelectMode && !this.isTransformDragging) {
                    const hitPart = this.raycast(e.clientX, e.clientY);
                    if (e.shiftKey && hitPart && !hitPart.Locked) return;
                    if (hitPart && !hitPart.Locked) {
                        this.isDraggingPart = true;
                        this.dragPart = hitPart;
                        this.dragPlaneY = hitPart.Position ? hitPart.Position.y : 0;
                        this.dragStartPos = hitPart.Position ? hitPart.Position.clone() : new Vector3();
                        this.dragStartMouse = { x: e.clientX, y: e.clientY };
                        this.dragHasMoved = false;

                        // Check if part belongs to a Model (Task 8)
                        let targetToSelect = hitPart;
                        if (!e.altKey) {
                            let curr = hitPart.Parent;
                            let topModel = null;
                            while (curr && curr !== this.dataModel && curr !== this.dataModel?.Workspace) {
                                if (curr.IsA && curr.IsA('Model')) topModel = curr;
                                curr = curr.Parent;
                            }
                            if (topModel) targetToSelect = topModel;
                        }

                        // If hitPart is already part of multi-selection, preserve selection!
                        const currentSel = window.conbloxStudio?.explorerUI?.selectedInstances;
                        if (!currentSel || !currentSel.has(targetToSelect)) {
                            window.conbloxStudio?.selectInstance(targetToSelect);
                        }

                        // Store initial positions of all selected parts for simultaneous drag
                        this.dragMultiStartPositions = new Map();
                        const partsToMove = (this.selectedParts && this.selectedParts.length > 0)
                            ? this.selectedParts
                            : [hitPart];
                        for (const p of partsToMove) {
                            if (p.Position) {
                                this.dragMultiStartPositions.set(p, p.Position.clone());
                            }
                        }

                        el.style.cursor = 'grabbing';
                    } else {
                        // Empty space or locked part: start 2D Marquee selection box
                        this.isMarqueeSelecting = true;
                        this.marqueeStart = { x: e.clientX, y: e.clientY };
                    }
                } else if (!this.isTransformDragging) {
                    this.isMarqueeSelecting = true;
                    this.marqueeStart = { x: e.clientX, y: e.clientY };
                }
            } else if (e.button === 2) {
                this.isRightMouseDown = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                nativeInputManager.lock({
                    targetEl: el,
                    mode: 'viewport_rmb',
                    clientX: e.clientX,
                    clientY: e.clientY,
                    screenX: e.screenX,
                    screenY: e.screenY
                });
            } else if (e.button === 1) {
                this.isMiddleMouseDown = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isPlayMode && !this.isPausedCameraMode) return;

            // Check if mouse is inside the 3D viewport container
            const rect = el.getBoundingClientRect();
            const isInside = (
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            );

            if (!isInside) {
                if (!this.isLeftMouseDown && !this.isRightMouseDown && !this.isMiddleMouseDown) {
                    this.isHoveredOverViewport = false;
                    this.lastMouseX = e.clientX;
                    this.lastMouseY = e.clientY;
                    return;
                }
            } else {
                this.isHoveredOverViewport = true;
            }

            // Hover cursor in Select mode
            const gizmo = window.conbloxStudio?.gizmoManager;
            const isSelectMode = (!gizmo || gizmo.currentMode === 'select');
            if (isInside && isSelectMode && !this.isLeftMouseDown && !this.isRightMouseDown && !this.isMiddleMouseDown && !this.isTransformDragging) {
                const hitPart = this.raycast(e.clientX, e.clientY);
                if (hitPart && !hitPart.Locked) {
                    el.style.cursor = 'grab';
                } else {
                    el.style.cursor = 'default';
                }
            }

            // Dragging part with Select tool
            if (this.isDraggingPart && this.dragPart) {
                const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.camera);

                // Exclude all currently moving parts from intersection
                const movingParts = this.dragMultiStartPositions ? Array.from(this.dragMultiStartPositions.keys()) : [this.dragPart];
                const movingMeshes = new Set(movingParts.map(p => this.partMeshes.get(p)).filter(Boolean));
                const candidateMeshes = Array.from(this.partMeshes.values()).filter(m => !movingMeshes.has(m));

                const intersects = raycaster.intersectObjects(candidateMeshes, false);
                let targetPos = null;
                const snap = (gizmo && gizmo.snapEnabled) ? (gizmo.moveSnap || 1.0) : 1.0;
                const halfSizeY = (this.dragPart.Size ? Number(this.dragPart.Size.y) || 1 : 1) / 2;

                if (intersects.length > 0) {
                    const hit = intersects[0];
                    const hitNormal = hit.face ? hit.face.normal.clone().applyQuaternion(hit.object.quaternion).normalize() : new THREE.Vector3(0, 1, 0);

                    let targetY;
                    let targetX = hit.point.x;
                    let targetZ = hit.point.z;

                    if (hitNormal.y > 0.5) {
                        // Resting on top of underlying surface
                        targetY = hit.point.y + halfSizeY;
                    } else if (hitNormal.y < -0.5) {
                        targetY = hit.point.y - halfSizeY;
                    } else {
                        // Side face contact
                        targetY = hit.point.y;
                        const halfSizeX = (this.dragPart.Size ? Number(this.dragPart.Size.x) || 1 : 1) / 2;
                        const halfSizeZ = (this.dragPart.Size ? Number(this.dragPart.Size.z) || 1 : 1) / 2;
                        targetX += hitNormal.x * halfSizeX;
                        targetZ += hitNormal.z * halfSizeZ;
                    }

                    targetX = Math.round(targetX / snap) * snap;
                    targetY = Math.round(targetY * 100) / 100;
                    targetZ = Math.round(targetZ / snap) * snap;
                    targetPos = new Vector3(targetX, targetY, targetZ);
                } else {
                    // Mouse ray does not directly hit a surface:
                    // Project ray to horizontal plane at original height, then cast down to find nearest underlying Part
                    const horizPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -this.dragPlaneY);
                    const hitPlane = new THREE.Vector3();
                    if (raycaster.ray.intersectPlane(horizPlane, hitPlane)) {
                        const downRaycaster = new THREE.Raycaster(
                            new THREE.Vector3(hitPlane.x, 500, hitPlane.z),
                            new THREE.Vector3(0, -1, 0)
                        );
                        const downHits = downRaycaster.intersectObjects(candidateMeshes, false);
                        if (downHits.length > 0) {
                            const topHit = downHits[0];
                            const newX = Math.round(hitPlane.x / snap) * snap;
                            const newZ = Math.round(hitPlane.z / snap) * snap;
                            const newY = Math.round((topHit.point.y + halfSizeY) * 100) / 100;
                            targetPos = new Vector3(newX, newY, newZ);
                        } else {
                            // "если под ним ничего нет то он не двигается"
                            // Nothing underneath! Do not move into empty void!
                            return;
                        }
                    } else {
                        return;
                    }
                }

                if (targetPos) {
                    const delta = targetPos.sub(this.dragStartPos);
                    if (this.dragMultiStartPositions && this.dragMultiStartPositions.size > 0) {
                        for (const [p, startPos] of this.dragMultiStartPositions.entries()) {
                            p.Position = startPos.add(delta);
                            this.syncPartMesh(p);
                        }
                    } else {
                        this.dragPart.Position = targetPos;
                        this.syncPartMesh(this.dragPart);
                    }
                    this.updateSelectionBox();
                    this.dragHasMoved = true;
                }
                return;
            }

            // Dragging marquee selection box
            if (this.isMarqueeSelecting && this.isLeftMouseDown && !this.isDraggingPart && !this.isTransformDragging && this.marqueeStart) {
                const dist = Math.hypot(e.clientX - this.marqueeStart.x, e.clientY - this.marqueeStart.y);
                if (dist > 4) {
                    const minX = Math.max(rect.left, Math.min(this.marqueeStart.x, e.clientX));
                    const maxX = Math.min(rect.right, Math.max(this.marqueeStart.x, e.clientX));
                    const minY = Math.max(rect.top, Math.min(this.marqueeStart.y, e.clientY));
                    const maxY = Math.min(rect.bottom, Math.max(this.marqueeStart.y, e.clientY));

                    this.marqueeEl.style.display = 'block';
                    this.marqueeEl.style.left = `${minX - rect.left}px`;
                    this.marqueeEl.style.top = `${minY - rect.top}px`;
                    this.marqueeEl.style.width = `${Math.max(1, maxX - minX)}px`;
                    this.marqueeEl.style.height = `${Math.max(1, maxY - minY)}px`;
                }
            }

            let dx = (e.movementX !== undefined && e.movementX !== 0) ? e.movementX : (this.lastMouseX ? e.clientX - this.lastMouseX : 0);
            let dy = (e.movementY !== undefined && e.movementY !== 0) ? e.movementY : (this.lastMouseY ? e.clientY - this.lastMouseY : 0);
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;

            // Middle mouse button pans the camera
            if (this.isMiddleMouseDown) {
                const panSpeed = 0.05;
                const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
                const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera.quaternion);
                this.cameraPos.addScaledVector(right, -dx * panSpeed);
                this.cameraPos.addScaledVector(up, dy * panSpeed);
                this.updateCameraTransform();
                return;
            }

            // Do not rotate camera if currently dragging a gizmo
            if (this.isTransformDragging) return;

            // Rotate camera in editor ONLY when holding RIGHT mouse button (RMB)
            if (this.isRightMouseDown) {
                const delta = nativeInputManager.getDelta(e);
                if (delta.isTeleport) return;

                const rotDx = delta.dx;
                const rotDy = delta.dy;
                if (rotDx !== 0 || rotDy !== 0) {
                    const sensitivity = 0.003;
                    const maxPitch = (89 * Math.PI) / 180; // [-89°, +89°] clamp to prevent Gimbal lock and flip
                    this.cameraYaw -= rotDx * sensitivity;
                    this.cameraPitch = Math.max(-maxPitch, Math.min(maxPitch, this.cameraPitch - rotDy * sensitivity));
                    this.updateCameraTransform();
                }
                return;
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (this.isPlayMode && !this.isPausedCameraMode) return;

            if (e.button === 0) {
                this.isLeftMouseDown = false;
                this.leftMouseDownPos = null;

                // Process Marquee selection if box was drawn
                if (this.isMarqueeSelecting && this.marqueeEl && this.marqueeEl.style.display !== 'none') {
                    this.marqueeEl.style.display = 'none';
                    const rect = el.getBoundingClientRect();
                    const minX = Math.min(this.marqueeStart.x, e.clientX);
                    const maxX = Math.max(this.marqueeStart.x, e.clientX);
                    const minY = Math.min(this.marqueeStart.y, e.clientY);
                    const maxY = Math.max(this.marqueeStart.y, e.clientY);

                    if (maxX - minX > 5 && maxY - minY > 5) {
                        const selectedItems = [];
                        const seenModels = new Set();

                        for (const [part, mesh] of this.partMeshes.entries()) {
                            if (part.Locked) continue;
                            if (!mesh.visible) continue;

                            const worldPos = new THREE.Vector3();
                            mesh.getWorldPosition(worldPos);
                            worldPos.project(this.camera);

                            if (worldPos.z >= -1 && worldPos.z <= 1) {
                                const screenX = (worldPos.x * 0.5 + 0.5) * rect.width + rect.left;
                                const screenY = (-worldPos.y * 0.5 + 0.5) * rect.height + rect.top;

                                if (screenX >= minX && screenX <= maxX && screenY >= minY && screenY <= maxY) {
                                    let target = part;
                                    let curr = part.Parent;
                                    let topModel = null;
                                    while (curr && curr !== this.dataModel && curr !== this.dataModel?.Workspace) {
                                        if (curr.IsA && curr.IsA('Model')) topModel = curr;
                                        curr = curr.Parent;
                                    }
                                    if (topModel) {
                                        if (!seenModels.has(topModel)) {
                                            seenModels.add(topModel);
                                            selectedItems.push(topModel);
                                        }
                                    } else {
                                        selectedItems.push(part);
                                    }
                                }
                            }
                        }

                        if (selectedItems.length > 0) {
                            let list = selectedItems;
                            if (e.shiftKey) {
                                const cur = window.conbloxStudio?.explorerUI?.selectedInstances || new Set();
                                list = Array.from(new Set([...cur, ...selectedItems]));
                            }
                            window.conbloxStudio?.selectInstance(list[0], list);
                        }
                    }
                }
                this.isMarqueeSelecting = false;
                if (this.marqueeEl) this.marqueeEl.style.display = 'none';

                if (this.isDraggingPart) {
                    this.isDraggingPart = false;
                    this.dragPart = null;
                    el.style.cursor = 'grab';
                    if (this.dragHasMoved) {
                        window.conbloxStudio?.historyManager?.recordState();
                    }
                }
            } else if (e.button === 2) {
                if (this.isRightMouseDown) {
                    this.isRightMouseDown = false;
                    this.lastMouseX = e.clientX;
                    this.lastMouseY = e.clientY;
                    nativeInputManager.unlock({ mode: 'viewport_rmb', restorePos: true });
                }
            } else if (e.button === 1) {
                this.isMiddleMouseDown = false;
            }
        });

        window.addEventListener('blur', () => {
            if (this.isRightMouseDown) {
                this.isRightMouseDown = false;
                nativeInputManager.unlock({ mode: 'viewport_rmb', restorePos: true });
            }
            this.isLeftMouseDown = false;
            this.isMarqueeSelecting = false;
            if (this.marqueeEl) this.marqueeEl.style.display = 'none';
            this.isMiddleMouseDown = false;
            this.isHoveredOverViewport = false;
            this.isCtrlDown = false;
            this.leftMouseDownPos = null;
            this.flyKeys.w = false;
            this.flyKeys.a = false;
            this.flyKeys.s = false;
            this.flyKeys.d = false;
            this.flyKeys.q = false;
            this.flyKeys.e = false;
            this.flyKeys.shift = false;
        });

        el.addEventListener('wheel', (e) => {
            if ((this.isPlayMode && !this.isPausedCameraMode) || this.isCtrlDown) return;

            const zoomSpeed = 0.03;
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
            this.cameraPos.addScaledVector(forward, -e.deltaY * zoomSpeed);
            this.updateCameraTransform();
        }, { passive: true });

        window.addEventListener('keydown', (e) => {
            // While Ctrl or Cmd is held, camera CANNOT move in editor
            if (e.ctrlKey || e.metaKey || e.key === 'Control') {
                this.isCtrlDown = true;
                this.flyKeys.w = false;
                this.flyKeys.a = false;
                this.flyKeys.s = false;
                this.flyKeys.d = false;
                this.flyKeys.q = false;
                this.flyKeys.e = false;
                this.flyKeys.shift = false;
                return;
            }

            if (this.isPlayMode && !this.isPausedCameraMode) return;
            if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
                return;
            }
            if (!this.isHoveredOverViewport && !this.isLeftMouseDown && !this.isRightMouseDown) {
                return;
            }
            switch (e.code) {
                case 'KeyW': this.flyKeys.w = true; break;
                case 'KeyA': this.flyKeys.a = true; break;
                case 'KeyS': this.flyKeys.s = true; break;
                case 'KeyD': this.flyKeys.d = true; break;
                case 'KeyE': this.flyKeys.e = true; break;
                case 'KeyQ': this.flyKeys.q = true; break;
                case 'ShiftLeft':
                case 'ShiftRight': this.flyKeys.shift = true; break;
                case 'KeyF':
                    if (this.selectedPart) this.focusOnPart(this.selectedPart);
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'Control' || e.key === 'Meta' || !e.ctrlKey) {
                this.isCtrlDown = false;
            }
            if (this.isPlayMode && !this.isPausedCameraMode) return;
            switch (e.code) {
                case 'KeyW': this.flyKeys.w = false; break;
                case 'KeyA': this.flyKeys.a = false; break;
                case 'KeyS': this.flyKeys.s = false; break;
                case 'KeyD': this.flyKeys.d = false; break;
                case 'KeyE': this.flyKeys.e = false; break;
                case 'KeyQ': this.flyKeys.q = false; break;
                case 'ShiftLeft':
                case 'ShiftRight': this.flyKeys.shift = false; break;
            }
        });
    }

    updateCameraTransform() {
        const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);
        const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.cameraPitch);
        const q = qYaw.multiply(qPitch);

        this.camera.position.copy(this.cameraPos);
        this.camera.quaternion.copy(q);

        this.syncWorkspaceCamera();
    }

    syncWorkspaceCamera() {
        if (!this.dataModel?.Workspace) return;
        let camObj = this.dataModel.Workspace.CurrentCamera;
        if (!camObj) {
            camObj = this.dataModel.Workspace.FindFirstChild('Camera');
            if (camObj) this.dataModel.Workspace.CurrentCamera = camObj;
        }
        if (!camObj) return;

        let degX, degY, degZ;
        if (this.cameraPitch !== undefined && this.cameraYaw !== undefined) {
            degX = (this.cameraPitch * 180) / Math.PI;
            degY = (this.cameraYaw * 180) / Math.PI;
            degZ = 0;
        } else {
            const euler = new THREE.Euler().setFromQuaternion(this.camera.quaternion, 'YXZ');
            degX = (euler.x * 180) / Math.PI;
            degY = (euler.y * 180) / Math.PI;
            degZ = (euler.z * 180) / Math.PI;
        }

        this._isSyncingCamera = true;
        try {
            camObj.CFrame = new CFrame(
                new Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z),
                new Vector3(degX, degY, degZ)
            );
            if (camObj.FieldOfView !== this.camera.fov) {
                camObj.FieldOfView = this.camera.fov;
            }
        } finally {
            this._isSyncingCamera = false;
        }
    }

    bindWorkspaceCameraEvents(cam) {
        if (!cam || cam._viewportBound) return;
        cam._viewportBound = true;
        cam.Changed.Connect((prop) => {
            // Terminate circular feedback loops when CFrame is modified internally by Viewport
            if (this._isSyncingCamera) return;

            if (prop === 'FieldOfView') {
                if (this.camera.fov !== cam.FieldOfView) {
                    this.camera.fov = cam.FieldOfView;
                    this.camera.updateProjectionMatrix();
                }
            } else if ((prop === 'CFrame' || prop === 'Position' || prop === 'Orientation') && cam.CFrame) {
                const pos = cam.CFrame.position || cam.Position;
                const ori = cam.CFrame.orientation || cam.Orientation;
                if (pos) {
                    this.cameraPos.set(pos.x, pos.y, pos.z);
                    this.camera.position.set(pos.x, pos.y, pos.z);
                }
                if (ori) {
                    const radX = (ori.x * Math.PI) / 180;
                    const radY = (ori.y * Math.PI) / 180;
                    const radZ = (ori.z * Math.PI) / 180;
                    this.camera.rotation.set(radX, radY, radZ, 'YXZ');
                    this.cameraPitch = radX;
                    this.cameraYaw = radY;
                }
            }
        });
    }

    focusOnPart(part) {
        if (!part || !part.Position) return;
        const pos = part.Position;
        const target = new THREE.Vector3(pos.x, pos.y, pos.z);
        const size = part.Size || new Vector3(4, 1, 2);
        const dist = Math.max(size.x, size.y, size.z) * 2.5 + 4;
        const dir = new THREE.Vector3(0, 0.4, 1).normalize();
        this.cameraPos.copy(target).addScaledVector(dir, dist);
        this.cameraYaw = 0;
        this.cameraPitch = -0.3;
        this.updateCameraTransform();
    }

    updateFlyMovement(dt) {
        if ((this.isPlayMode && !this.isPausedCameraMode) || this.isCtrlDown) return;
        if (!this.isHoveredOverViewport && !this.isRightMouseDown) return;

        const anyFlyKeyPressed = this.flyKeys.w || this.flyKeys.s || this.flyKeys.d || this.flyKeys.a || this.flyKeys.e || this.flyKeys.q;
        if (!anyFlyKeyPressed) return;

        const baseSpeed = this.flyKeys.shift ? 45 : 18;
        const dist = baseSpeed * dt;

        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        const up = new THREE.Vector3(0, 1, 0);

        if (this.flyKeys.w) this.cameraPos.addScaledVector(forward, dist);
        if (this.flyKeys.s) this.cameraPos.addScaledVector(forward, -dist);
        if (this.flyKeys.d) this.cameraPos.addScaledVector(right, dist);
        if (this.flyKeys.a) this.cameraPos.addScaledVector(right, -dist);
        if (this.flyKeys.e) this.cameraPos.addScaledVector(up, dist);
        if (this.flyKeys.q) this.cameraPos.addScaledVector(up, -dist);

        this.updateCameraTransform();
    }

    getMaterialForPart(part) {
        const colorVal = part.Color || new Color3(1, 1, 1);
        const rgb = colorVal.toRGB ? colorVal.toRGB() : { r: 160, g: 160, b: 160 };
        const color = new THREE.Color(rgb.r / 255, rgb.g / 255, rgb.b / 255);
        const trans = Number(part.Transparency) || 0;
        const transparent = trans > 0;
        const opacity = Math.max(0, Math.min(1, 1 - trans));

        const baseProps = {
            color: color,
            transparent: transparent,
            opacity: opacity,
            roughness: 0.5,
            metalness: 0.05
        };

        // Classic Head with Smiley Face decal (Face is on -Z front face in Roblox coords)
        if (part.Name === 'Head' && this.faceTexture) {
            const sideMat = new THREE.MeshStandardMaterial({ ...baseProps, roughness: 0.35 });
            const faceMat = new THREE.MeshStandardMaterial({ ...baseProps, roughness: 0.35, map: this.faceTexture });
            // Three.js BoxGeometry face order: [+X, -X, +Y, -Y, +Z, -Z]
            return [sideMat, sideMat, sideMat, sideMat, sideMat, faceMat];
        }

        // Baseplate grid texture (if no child Texture is defined)
        const hasChildTexture = part.GetChildren && part.GetChildren().some(c => c.ClassName === 'Texture');
        if (part.Name === 'Baseplate' && this.baseplateTexture && !hasChildTexture) {
            const tex = this.baseplateTexture.clone();
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(0.25, 0.25);
            tex.needsUpdate = true;
            return new THREE.MeshStandardMaterial({
                ...baseProps,
                roughness: 0.85,
                metalness: 0.0,
                map: tex
            });
        }

        const mat = part.Material || 'Plastic';

        // Neon Material (Glowing radiant bloom look)
        if (mat === 'Neon') {
            return new THREE.MeshStandardMaterial({
                ...baseProps,
                color: color,
                emissive: color,
                emissiveIntensity: 5.5,
                roughness: 0.1
            });
        }

        // Glass Material (Refractive transmission)
        if (mat === 'Glass') {
            return new THREE.MeshPhysicalMaterial({
                ...baseProps,
                transmission: 0.9,
                opacity: 1,
                transparent: true,
                roughness: 0.06,
                ior: 1.5
            });
        }

        // Ice Material (Glossy, slightly translucent)
        if (mat === 'Ice') {
            const tex = this.getMaterialTexture('Ice').clone();
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(0.25, 0.25);
            tex.needsUpdate = true;
            return new THREE.MeshPhysicalMaterial({
                ...baseProps,
                transmission: 0.65,
                opacity: 1,
                transparent: true,
                roughness: 0.08,
                ior: 1.31,
                map: tex
            });
        }

        // SmoothPlastic (Glossy clean plastic)
        if (mat === 'SmoothPlastic') {
            return new THREE.MeshStandardMaterial({
                ...baseProps,
                roughness: 0.22,
                metalness: 0.02
            });
        }

        // Helper to get scaled cloned texture
        const getScaledTex = (type) => {
            const tex = this.getMaterialTexture(type).clone();
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(0.25, 0.25); // 1 tile per 4 studs uniformly across all 6 faces
            tex.needsUpdate = true;
            return tex;
        };

        if (mat === 'Metal') {
            return new THREE.MeshStandardMaterial({
                ...baseProps,
                metalness: 0.88,
                roughness: 0.28,
                map: getScaledTex('Metal')
            });
        }

        if (mat === 'DiamondPlate') {
            return new THREE.MeshStandardMaterial({
                ...baseProps,
                metalness: 0.85,
                roughness: 0.35,
                map: getScaledTex('DiamondPlate')
            });
        }

        if (mat === 'CorrodedMetal') {
            return new THREE.MeshStandardMaterial({
                ...baseProps,
                metalness: 0.65,
                roughness: 0.72,
                map: getScaledTex('CorrodedMetal')
            });
        }

        if (mat === 'Foil') {
            return new THREE.MeshStandardMaterial({
                ...baseProps,
                metalness: 0.95,
                roughness: 0.18,
                map: getScaledTex('Foil')
            });
        }

        if (mat === 'Wood') {
            return new THREE.MeshStandardMaterial({
                ...baseProps,
                roughness: 0.78,
                metalness: 0.0,
                map: getScaledTex('Wood')
            });
        }

        if (mat === 'WoodPlanks') {
            return new THREE.MeshStandardMaterial({
                ...baseProps,
                roughness: 0.75,
                metalness: 0.0,
                map: getScaledTex('WoodPlanks')
            });
        }

        if (mat === 'Brick') {
            return new THREE.MeshStandardMaterial({
                ...baseProps,
                roughness: 0.88,
                metalness: 0.0,
                map: getScaledTex('Brick')
            });
        }

        if (mat === 'Concrete') {
            return new THREE.MeshStandardMaterial({
                ...baseProps,
                roughness: 0.92,
                metalness: 0.0,
                map: getScaledTex('Concrete')
            });
        }

        if (mat === 'Granite') {
            return new THREE.MeshStandardMaterial({
                ...baseProps,
                roughness: 0.82,
                metalness: 0.0,
                map: getScaledTex('Granite')
            });
        }

        if (mat === 'Marble') {
            return new THREE.MeshStandardMaterial({
                ...baseProps,
                roughness: 0.28,
                metalness: 0.05,
                map: getScaledTex('Marble')
            });
        }

        if (mat === 'Slate') {
            return new THREE.MeshStandardMaterial({
                ...baseProps,
                roughness: 0.85,
                metalness: 0.0,
                map: getScaledTex('Slate')
            });
        }

        if (mat === 'Fabric') {
            return new THREE.MeshStandardMaterial({
                ...baseProps,
                roughness: 0.88,
                metalness: 0.0,
                map: getScaledTex('Fabric')
            });
        }

        if (mat === 'Sand') {
            return new THREE.MeshStandardMaterial({
                ...baseProps,
                roughness: 0.95,
                metalness: 0.0,
                map: getScaledTex('Sand')
            });
        }

        if (mat === 'Grass') {
            return new THREE.MeshStandardMaterial({
                ...baseProps,
                roughness: 0.88,
                metalness: 0.0,
                map: getScaledTex('Grass')
            });
        }

        // Default: Plastic (with classic stud texture)
        let resultMat = null;
        if (this.studTexture) {
            const tex = this.studTexture.clone();
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(1, 1); // 1 stud per stud uniformly across all 6 faces
            tex.needsUpdate = true;
            resultMat = new THREE.MeshStandardMaterial({
                ...baseProps,
                roughness: 0.65,
                map: tex
            });
        } else {
            resultMat = new THREE.MeshStandardMaterial({
                ...baseProps,
                roughness: 0.65,
                metalness: 0.05
            });
        }

        return resultMat;
    }

    getDecalTexture(dec, onReady = null) {
        if (!dec) return null;
        const texVal = String(dec.Texture || '').trim();
        if (!texVal) {
            return this.createPresetDecalTexture('Roblox');
        }
        const isUrl = texVal.startsWith('http://') || texVal.startsWith('https://') ||
                      texVal.startsWith('data:image/') || texVal.startsWith('blob:') ||
                      texVal.startsWith('/') || texVal.startsWith('./');

        if (isUrl) {
            if (!this.decalTextureLoader) this.decalTextureLoader = new THREE.TextureLoader();
            if (!this.decalTextureCache) this.decalTextureCache = new Map();
            if (!this.decalPendingCallbacks) this.decalPendingCallbacks = new Map();

            const cached = this.decalTextureCache.get(texVal);
            if (cached) {
                const isReady = Boolean(cached.image && (cached.image.complete !== false && (cached.image.width > 0 || cached.image.naturalWidth > 0)));
                if (!isReady && onReady) {
                    if (!this.decalPendingCallbacks.has(texVal)) {
                        this.decalPendingCallbacks.set(texVal, []);
                    }
                    this.decalPendingCallbacks.get(texVal).push(onReady);
                }
                return cached;
            }

            if (onReady) {
                if (!this.decalPendingCallbacks.has(texVal)) {
                    this.decalPendingCallbacks.set(texVal, []);
                }
                this.decalPendingCallbacks.get(texVal).push(onReady);
            }

            const tex = this.decalTextureLoader.load(
                texVal,
                (loadedTex) => {
                    loadedTex.needsUpdate = true;
                    const cbs = this.decalPendingCallbacks.get(texVal) || [];
                    this.decalPendingCallbacks.delete(texVal);
                    for (const cb of cbs) {
                        try { cb(loadedTex); } catch (e) { console.error('[Viewport] Decal callback error:', e); }
                    }
                },
                undefined,
                (err) => {
                    console.warn('[Viewport] Failed to load decal texture:', err);
                    this.decalPendingCallbacks.delete(texVal);
                }
            );
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            this.decalTextureCache.set(texVal, tex);
            return tex;
        }
        return this.createPresetDecalTexture(texVal);
    }

    syncDecalOverlays(part, mesh) {
        if (!part || !mesh) return;

        // 1. Remove existing decal overlay meshes
        const toRemove = [];
        for (let i = 0; i < mesh.children.length; i++) {
            const child = mesh.children[i];
            if (child.userData && child.userData.isDecalOverlay) {
                toRemove.push(child);
            }
        }
        for (const child of toRemove) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (child.material.map && child.material.map.dispose) {
                    child.material.map.dispose();
                }
                child.material.dispose();
            }
            mesh.remove(child);
        }

        // 2. Query Decal or Texture children
        const decals = (part && part.GetChildren)
            ? part.GetChildren().filter(c => c.ClassName === 'Decal' || c.ClassName === 'Texture')
            : [];
        if (decals.length === 0) return;

        const s = (part && part.Size) ? part.Size : new Vector3(4, 1, 2);
        const sx = Math.max(0.05, Number(s.x) || 4);
        const sy = Math.max(0.05, Number(s.y) || 1);
        const sz = Math.max(0.05, Number(s.z) || 2);
        const eps = 0.005;

        for (const dec of decals) {
            const onReady = () => {
                if (this.partMeshes.get(part) === mesh) {
                    this.syncDecalOverlays(part, mesh);
                }
            };
            const dTex = this.getDecalTexture(dec, onReady);
            if (!dTex) continue;

            let w = sx, h = sy;
            let px = 0, py = 0, pz = 0;
            let rx = 0, ry = 0, rz = 0;

            const face = dec.Face || 'Front';
            switch (face) {
                case 'Front': // -Z (Roblox standard Front face)
                    w = sx; h = sy;
                    pz = (-sz / 2) - eps;
                    ry = Math.PI;
                    break;
                case 'Back': // +Z (Roblox standard Back face)
                    w = sx; h = sy;
                    pz = (sz / 2) + eps;
                    ry = 0;
                    break;
                case 'Top': // +Y
                    w = sx; h = sz;
                    py = (sy / 2) + eps;
                    rx = -Math.PI / 2;
                    break;
                case 'Bottom': // -Y
                    w = sx; h = sz;
                    py = (-sy / 2) - eps;
                    rx = Math.PI / 2;
                    break;
                case 'Right': // +X
                    w = sz; h = sy;
                    px = (sx / 2) + eps;
                    ry = Math.PI / 2;
                    break;
                case 'Left': // -X
                    w = sz; h = sy;
                    px = (-sx / 2) - eps;
                    ry = -Math.PI / 2;
                    break;
            }

            let texForOverlay = dTex.clone();
            if (dTex.image) {
                texForOverlay.image = dTex.image;
            }

            if (dec.ClassName === 'Texture') {
                const u = Math.max(0.01, Number(dec.StudsPerTileU) || 2);
                const v = Math.max(0.01, Number(dec.StudsPerTileV) || 2);
                texForOverlay.wrapS = THREE.RepeatWrapping;
                texForOverlay.wrapT = THREE.RepeatWrapping;
                texForOverlay.repeat.set(Math.max(0.01, w / u), Math.max(0.01, h / v));
                texForOverlay.needsUpdate = true;
            } else {
                texForOverlay.wrapS = THREE.ClampToEdgeWrapping;
                texForOverlay.wrapT = THREE.ClampToEdgeWrapping;
                texForOverlay.repeat.set(1, 1);
                texForOverlay.needsUpdate = true;
            }

            const planeGeo = new THREE.PlaneGeometry(w, h);
            const matColor = (dec.Color && dec.Color.toHex) ? new THREE.Color(dec.Color.toHex()) : new THREE.Color(0xffffff);
            const isImageLoaded = Boolean(dTex.image && (dTex.image.complete !== false && (dTex.image.width > 0 || dTex.image.naturalWidth > 0)));

            const decalMat = new THREE.MeshStandardMaterial({
                map: texForOverlay,
                color: matColor,
                transparent: true,
                opacity: Math.max(0, 1 - (Number(dec.Transparency) || 0)),
                roughness: 0.5,
                metalness: 0.05,
                polygonOffset: true,
                polygonOffsetFactor: -1,
                polygonOffsetUnits: -1,
                depthWrite: false,
                side: THREE.FrontSide
            });

            const decalMesh = new THREE.Mesh(planeGeo, decalMat);
            decalMesh.name = `Decal_${dec.Name}_${face}`;
            decalMesh.userData = { isDecalOverlay: true, decalInstance: dec };
            decalMesh.position.set(px, py, pz);
            decalMesh.rotation.set(rx, ry, rz);
            decalMesh.castShadow = false;
            decalMesh.receiveShadow = true;

            // If image is still downloading or decoding, hide mesh until onLoad fires and re-syncs
            if (!isImageLoaded && (String(dec.Texture || '').startsWith('http') || String(dec.Texture || '').startsWith('data:') || String(dec.Texture || '').startsWith('blob:'))) {
                decalMesh.visible = false;
            }

            mesh.add(decalMesh);
        }
    }

    createPresetDecalTexture(name = 'Roblox') {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 256, 256);

        if (name === 'Smile' || name === 'Face') {
            ctx.fillStyle = '#111111';
            ctx.beginPath();
            ctx.ellipse(88, 96, 16, 24, 0, 0, Math.PI * 2);
            ctx.ellipse(168, 96, 16, 24, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(128, 140, 52, 0.15 * Math.PI, 0.85 * Math.PI);
            ctx.lineWidth = 10;
            ctx.stroke();
        } else if (name === 'Warning' || name === 'Hazard') {
            ctx.fillStyle = '#f5c518';
            ctx.beginPath();
            ctx.moveTo(128, 30); ctx.lineTo(230, 210); ctx.lineTo(26, 210); ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#111111';
            ctx.fillRect(122, 90, 12, 60);
            ctx.fillRect(122, 165, 12, 14);
        } else {
            // Classic Roblox Tilt Logo Decal
            ctx.fillStyle = '#e2231a';
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(48, 48, 160, 160, 24);
            else ctx.fillRect(48, 48, 160, 160);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(96, 96, 64, 64, 10);
            else ctx.fillRect(96, 96, 64, 64);
            ctx.fill();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    createGeometryForPart(part) {
        // Safe check so 'undefined.x' NEVER throws!
        const s = (part && part.Size) ? part.Size : new Vector3(4, 1, 2);
        const sx = Math.max(0.05, Number(s.x) || 4);
        const sy = Math.max(0.05, Number(s.y) || 1);
        const sz = Math.max(0.05, Number(s.z) || 2);

        if (part.Shape === 'Ball') {
            const geo = new THREE.SphereGeometry(Math.max(0.1, sx / 2), 28, 28);
            if (geo.attributes.uv) {
                const uvs = geo.attributes.uv.array;
                for (let i = 0; i < uvs.length; i += 2) {
                    uvs[i] *= (Math.PI * sx);
                    uvs[i + 1] *= (Math.PI * sy);
                }
                geo.attributes.uv.needsUpdate = true;
            }
            return geo;
        } else if (part.Shape === 'Cylinder') {
            const geo = new THREE.CylinderGeometry(sx / 2, sx / 2, sy, 28);
            if (geo.attributes.uv) {
                const uvs = geo.attributes.uv.array;
                for (let i = 0; i < uvs.length; i += 2) {
                    uvs[i] *= (Math.PI * sx);
                    uvs[i + 1] *= sy;
                }
                geo.attributes.uv.needsUpdate = true;
            }
            return geo;
        } else if (part.Shape === 'Wedge') {
            const geo = new THREE.BufferGeometry();
            const hx = sx / 2, hy = sy / 2, hz = sz / 2;
            const vertices = new Float32Array([
                // Front triangle
                -hx, -hy,  hz,    hx, -hy,  hz,   -hx,  hy,  hz,
                // Back triangle
                -hx, -hy, -hz,   -hx,  hy, -hz,    hx, -hy, -hz,
                // Bottom quad
                -hx, -hy, -hz,    hx, -hy, -hz,    hx, -hy,  hz,
                -hx, -hy, -hz,    hx, -hy,  hz,   -hx, -hy,  hz,
                // Sloped quad
                -hx,  hy,  hz,    hx, -hy,  hz,    hx, -hy, -hz,
                -hx,  hy,  hz,    hx, -hy, -hz,   -hx,  hy, -hz,
                // Vertical back quad
                -hx, -hy,  hz,   -hx,  hy,  hz,   -hx,  hy, -hz,
                -hx, -hy,  hz,   -hx,  hy, -hz,   -hx, -hy, -hz,
            ]);
            geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            geo.computeVertexNormals();
            const uvs = new Float32Array(vertices.length / 3 * 2);
            for (let i = 0; i < vertices.length; i += 3) {
                const vx = vertices[i];
                const vy = vertices[i + 1];
                const vz = vertices[i + 2];
                const uvIdx = (i / 3) * 2;
                uvs[uvIdx] = (vx + vz);
                uvs[uvIdx + 1] = vy;
            }
            geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
            return geo;
        }

        // Default Block: 1:1 studs UV mapping per face to prevent any stretching
        const geo = new THREE.BoxGeometry(sx, sy, sz);
        if (geo.attributes.uv) {
            const uvs = geo.attributes.uv.array;
            // Face 0 (+X, right side: width=sz, height=sy)
            for (let v = 0; v < 4; v++) {
                const idx = 0 * 8 + v * 2;
                uvs[idx] *= sz;
                uvs[idx + 1] *= sy;
            }
            // Face 1 (-X, left side: width=sz, height=sy)
            for (let v = 0; v < 4; v++) {
                const idx = 1 * 8 + v * 2;
                uvs[idx] *= sz;
                uvs[idx + 1] *= sy;
            }
            // Face 2 (+Y, top: width=sx, height=sz)
            for (let v = 0; v < 4; v++) {
                const idx = 2 * 8 + v * 2;
                uvs[idx] *= sx;
                uvs[idx + 1] *= sz;
            }
            // Face 3 (-Y, bottom: width=sx, height=sz)
            for (let v = 0; v < 4; v++) {
                const idx = 3 * 8 + v * 2;
                uvs[idx] *= sx;
                uvs[idx + 1] *= sz;
            }
            // Face 4 (+Z, back: width=sx, height=sy)
            for (let v = 0; v < 4; v++) {
                const idx = 4 * 8 + v * 2;
                uvs[idx] *= sx;
                uvs[idx + 1] *= sy;
            }
            // Face 5 (-Z, front: width=sx, height=sy)
            // Head face decal uses standard [0, 1] texture mapping across front face
            if (part.Name !== 'Head') {
                for (let v = 0; v < 4; v++) {
                    const idx = 5 * 8 + v * 2;
                    uvs[idx] *= sx;
                    uvs[idx + 1] *= sy;
                }
            }
            geo.attributes.uv.needsUpdate = true;
        }
        return geo;
    }

    syncPartMesh(part) {
        // Strictly only sync BasePart instances
        if (!part || !part.IsA || !part.IsA('BasePart')) return;
        if (!part.Position || !part.Size) return;

        let mesh = this.partMeshes.get(part);

        if (!mesh) {
            const geo = this.createGeometryForPart(part);
            const mat = this.getMaterialForPart(part);
            mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.order = 'YXZ';
            mesh.visible = (Number(part.Transparency) < 1);
            mesh.castShadow = (part.CastShadow !== false) && (Number(part.Transparency) < 0.95);
            mesh.receiveShadow = true;
            mesh.userData.part = part;

            this.scene.add(mesh);
            this.partMeshes.set(part, mesh);
            this.meshParts.set(mesh, part);

            // Iconic Roblox Top Head Stud & Overhead Billboard for Head
            if (part.Name === 'Head') {
                const studGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 24);
                const studMat = new THREE.MeshStandardMaterial({
                    color: 0xf5cd2f,
                    roughness: 0.35,
                    metalness: 0.05
                });
                const studMesh = new THREE.Mesh(studGeo, studMat);
                studMesh.name = 'HeadTopStud';
                const sy = part.Size ? Number(part.Size.y) || 1.25 : 1.25;
                studMesh.position.set(0, (sy / 2) + 0.11, 0);
                studMesh.castShadow = true;
                studMesh.receiveShadow = true;
                mesh.add(studMesh);
            }

            // Listen for part property changes
            part.Changed.Connect((prop) => {
                this.updatePartMeshProperties(part, mesh, prop);
            });

            // Re-attach or sync any existing PointLight, Decal, or Texture children
            part.ChildAdded?.Connect((child) => {
                if (child.ClassName === 'Decal' || child.ClassName === 'Texture') {
                    child.Changed?.Connect(() => {
                        this.syncDecalOverlays(part, mesh);
                    });
                    this.syncDecalOverlays(part, mesh);
                } else if (child.ClassName === 'PointLight') {
                    this.syncPointLight(child);
                }
            });
            part.ChildRemoved?.Connect((child) => {
                if (child.ClassName === 'Decal' || child.ClassName === 'Texture') {
                    this.syncDecalOverlays(part, mesh);
                }
            });

            if (part.GetChildren) {
                for (const child of part.GetChildren()) {
                    if (child.ClassName === 'PointLight') {
                        this.syncPointLight(child);
                    } else if (child.ClassName === 'Decal' || child.ClassName === 'Texture') {
                        child.Changed?.Connect(() => {
                            this.syncDecalOverlays(part, mesh);
                        });
                    }
                }
            }
            this.syncDecalOverlays(part, mesh);
        }

        // Update transforms
        mesh.position.set(part.Position.x, part.Position.y, part.Position.z);
        const ori = part.Orientation || new Vector3(0, 0, 0);
        const radX = ((ori.x || 0) * Math.PI) / 180;
        const radY = ((ori.y || 0) * Math.PI) / 180;
        const radZ = ((ori.z || 0) * Math.PI) / 180;
        mesh.rotation.order = 'YXZ';
        mesh.rotation.set(radX, radY, radZ, 'YXZ');

        if (this.selectedPart === part && !this.isBatchTransformSync) {
            this.updateSelectionBox();
        }
    }

    updatePartMeshProperties(part, mesh, prop) {
        if (!mesh || !part) return;

        if (prop === 'Position' && part.Position) {
            mesh.position.set(part.Position.x, part.Position.y, part.Position.z);
        } else if (prop === 'Orientation' && part.Orientation) {
            const radX = ((part.Orientation.x || 0) * Math.PI) / 180;
            const radY = ((part.Orientation.y || 0) * Math.PI) / 180;
            const radZ = ((part.Orientation.z || 0) * Math.PI) / 180;
            mesh.rotation.order = 'YXZ';
            mesh.rotation.set(radX, radY, radZ, 'YXZ');
        } else if (prop === 'Size' || prop === 'Shape') {
            mesh.geometry.dispose();
            mesh.geometry = this.createGeometryForPart(part);
            this.syncDecalOverlays(part, mesh);
        } else if (prop === 'Color' || prop === 'Material' || prop === 'Transparency') {
            this.disposeMaterial(mesh.material);
            mesh.material = this.getMaterialForPart(part);
            mesh.visible = (Number(part.Transparency) < 1);
            mesh.castShadow = (part.CastShadow !== false) && (Number(part.Transparency) < 0.95);
        } else if (prop === 'CastShadow') {
            mesh.castShadow = (part.CastShadow !== false) && (Number(part.Transparency) < 0.95);
        }

        if (this.selectedPart === part && !this.isBatchTransformSync) {
            this.updateSelectionBox();
        }
    }

    disposeMaterial(mat) {
        if (!mat) return;
        const disposeMat = (m) => {
            if (m.map && m.map !== this.studTexture && m.map !== this.faceTexture && m.map !== this.baseplateTexture) {
                m.map.dispose();
            }
            m.dispose();
        };
        if (Array.isArray(mat)) {
            mat.forEach(disposeMat);
        } else {
            disposeMat(mat);
        }
    }

    removePartMesh(part) {
        const mesh = this.partMeshes.get(part);
        if (mesh) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            this.disposeMaterial(mesh.material);
            this.partMeshes.delete(part);
            this.meshParts.delete(mesh);
        }
        if (this.selectedPart === part) {
            this.setSelectedPart(null);
            if (window.conbloxStudio?.gizmoManager?.targetPart === part) {
                window.conbloxStudio.gizmoManager.detach();
            }
        }
    }

    syncAllParts() {
        const ws = this.dataModel.Workspace;
        if (!ws) return;
        const parts = ws.GetDescendants().filter(i => i.IsA && i.IsA('BasePart'));
        const currentSet = new Set(parts);

        // Remove old meshes
        for (const [part] of this.partMeshes.entries()) {
            if (!currentSet.has(part)) {
                this.removePartMesh(part);
            }
        }

        // Add or sync
        for (const part of parts) {
            this.syncPartMesh(part);
        }

        // Sync PointLights
        const lights = ws.GetDescendants().filter(i => i.ClassName === 'PointLight');
        const currentLightSet = new Set(lights);
        for (const [l] of this.pointLights.entries()) {
            if (!currentLightSet.has(l)) {
                this.removePointLight(l);
            }
        }
        for (const l of lights) {
            this.syncPointLight(l);
        }

        // Bind and sync Clouds
        for (const child of ws.GetDescendants()) {
            if (child.ClassName === 'Clouds') {
                child.Changed.Connect(() => this.syncClouds());
            }
        }

        // Sync lighting & atmospheric effects
        this.syncLightingAndEffects();
    }

    syncPointLight(lightInst) {
        if (!lightInst || lightInst.ClassName !== 'PointLight') return;

        let entry = this.pointLights.get(lightInst);
        if (!entry) {
            const rgb = lightInst.Color ? (lightInst.Color.toRGB ? lightInst.Color.toRGB() : { r: 255, g: 255, b: 255 }) : { r: 255, g: 255, b: 255 };
            const threeColor = new THREE.Color(rgb.r / 255, rgb.g / 255, rgb.b / 255);
            const intensity = Math.max(0, Number(lightInst.Brightness) || 1) * 3.5;
            const distance = Math.max(0.1, Number(lightInst.Range) || 16);

            const threeLight = new THREE.PointLight(threeColor, intensity, distance, 1.5);
            threeLight.castShadow = Boolean(lightInst.Shadows);
            threeLight.shadow.mapSize.width = 1024;
            threeLight.shadow.mapSize.height = 1024;
            threeLight.shadow.bias = -0.001;
            threeLight.shadow.normalBias = 0.04;
            threeLight.shadow.radius = 2.0;
            threeLight.visible = (lightInst.Enabled !== false);

            // Glowing Light Bulb Core (emits HDR bloom)
            const helperGeo = new THREE.SphereGeometry(0.35, 12, 12);
            const helperMat = new THREE.MeshBasicMaterial({ color: threeColor.clone().multiplyScalar(5.5) });
            const helper = new THREE.Mesh(helperGeo, helperMat);
            threeLight.add(helper);

            entry = { light: threeLight, helper };
            this.pointLights.set(lightInst, entry);

            this.attachPointLightToHierarchy(lightInst, entry);

            lightInst.Changed.Connect((prop) => {
                this.updatePointLightProperties(lightInst, prop);
            });
        } else {
            this.updatePointLightProperties(lightInst);
        }
    }

    attachPointLightToHierarchy(lightInst, entry) {
        if (!entry || !entry.light) return;
        const threeLight = entry.light;

        let p = lightInst.Parent;
        let parentMesh = null;
        while (p) {
            if (p.IsA && p.IsA('BasePart')) {
                parentMesh = this.partMeshes.get(p);
                break;
            }
            p = p.Parent;
        }

        if (parentMesh) {
            if (threeLight.parent !== parentMesh) {
                if (threeLight.parent) threeLight.parent.remove(threeLight);
                parentMesh.add(threeLight);
                threeLight.position.set(0, 0, 0);
            }
        } else {
            if (threeLight.parent !== this.scene) {
                if (threeLight.parent) threeLight.parent.remove(threeLight);
                this.scene.add(threeLight);
                const pos = lightInst.Parent?.Position || new Vector3(0, 5, 0);
                threeLight.position.set(pos.x, pos.y, pos.z);
            }
        }
    }

    updatePointLightProperties(lightInst, prop = null) {
        const entry = this.pointLights.get(lightInst);
        if (!entry) return;

        const threeLight = entry.light;
        const helper = entry.helper;

        if (!prop || prop === 'Color') {
            const rgb = lightInst.Color ? (lightInst.Color.toRGB ? lightInst.Color.toRGB() : { r: 255, g: 255, b: 255 }) : { r: 255, g: 255, b: 255 };
            threeLight.color.setRGB(rgb.r / 255, rgb.g / 255, rgb.b / 255);
            if (helper && helper.material) {
                helper.material.color.setRGB((rgb.r / 255) * 5.5, (rgb.g / 255) * 5.5, (rgb.b / 255) * 5.5);
            }
        }
        if (!prop || prop === 'Brightness') {
            threeLight.intensity = Math.max(0, Number(lightInst.Brightness) || 0) * 3.5;
        }
        if (!prop || prop === 'Range') {
            threeLight.distance = Math.max(0.1, Number(lightInst.Range) || 16);
        }
        if (!prop || prop === 'Shadows') {
            threeLight.castShadow = Boolean(lightInst.Shadows);
        }
        if (!prop || prop === 'Enabled') {
            threeLight.visible = Boolean(lightInst.Enabled);
        }
        if (!prop || prop === 'Parent') {
            this.attachPointLightToHierarchy(lightInst, entry);
        }

        if (helper) {
            helper.visible = Boolean(threeLight.visible);
        }
    }

    removePointLight(lightInst) {
        const entry = this.pointLights.get(lightInst);
        if (entry) {
            const threeLight = entry.light;
            if (threeLight.parent) {
                threeLight.parent.remove(threeLight);
            }
            if (entry.helper) {
                entry.helper.geometry.dispose();
                entry.helper.material.dispose();
            }
            threeLight.dispose?.();
            this.pointLights.delete(lightInst);
        }
    }

    setPlayMode(isPlay) {
        this.isPlayMode = Boolean(isPlay);
        if (!this.isPlayMode) this.isPausedCameraMode = false;
        if (this.pointLights) {
            for (const entry of this.pointLights.values()) {
                if (entry.helper) {
                    entry.helper.visible = (!this.isPlayMode && entry.light.visible);
                }
            }
        }
    }

    setPausedCameraMode(isPaused) {
        this.isPausedCameraMode = Boolean(isPaused && this.isPlayMode);
        if (!this.isPausedCameraMode) return;

        this.cameraPos.copy(this.camera.position);
        const euler = new THREE.Euler().setFromQuaternion(this.camera.quaternion, 'YXZ');
        this.cameraPitch = euler.x;
        this.cameraYaw = euler.y;
        this.flyKeys.w = false;
        this.flyKeys.a = false;
        this.flyKeys.s = false;
        this.flyKeys.d = false;
        this.flyKeys.q = false;
        this.flyKeys.e = false;
        this.flyKeys.shift = false;
        this.updateCameraTransform();
    }

    syncLighting() {
        const lighting = this.dataModel.Lighting;
        if (!lighting || !this.sunLight || !this.ambientLight) return;

        const clockTime = (lighting.ClockTime !== undefined) ? Number(lighting.ClockTime) : 14;
        const brightness = (lighting.Brightness !== undefined) ? Math.max(0, Number(lighting.Brightness)) : 2;

        // Angle in radians: 6:00 = 0 (horizon), 12:00 = PI/2 (zenith), 18:00 = PI (sunset), 0:00 = midnight
        const timeAngle = ((clockTime - 6) / 24) * (Math.PI * 2);
        const celestialDist = 1200;
        const sunX = Math.cos(timeAngle) * celestialDist;
        const sunY = Math.sin(timeAngle) * celestialDist;
        const sunZ = Math.sin(timeAngle * 0.5) * 280;

        // Directional light direction follows sun celestial position
        this.sunLightDirection = new THREE.Vector3(sunX, Math.max(30, sunY), sunZ).normalize();
        this.updateShadowFrustum(0.016);

        // Day/night factor: 0.0 (midnight) to 1.0 (midday)
        const isDay = sunY > 0;
        const dayAlpha = Math.max(0, Math.min(1, (sunY + 120) / 400));

        // ── 0. Sky Instance Settings ──
        const sky = lighting.GetChildren ? lighting.GetChildren().find(c => c.ClassName === 'Sky') : null;
        const bodiesShown = sky ? Boolean(sky.CelestialBodiesShown) : true;
        const sunAngularSize = sky && sky.SunAngularSize !== undefined ? Number(sky.SunAngularSize) : 21;
        const moonAngularSize = sky && sky.MoonAngularSize !== undefined ? Number(sky.MoonAngularSize) : 11;

        // ── 1. Sun Billboard ──
        if (this.sunSprite) {
            this.sunSprite.position.set(sunX, sunY, sunZ);
            const sunScale = (sunAngularSize / 21) * 460;
            this.sunSprite.scale.set(sunScale, sunScale, 1);
            if (bodiesShown && sunY > -60) {
                this.sunSprite.visible = true;
                const sOpacity = Math.max(0, Math.min(1, (sunY + 60) / 180));
                this.sunSprite.material.opacity = sOpacity;
                // Warm sunset/sunrise color
                if (clockTime >= 16 && clockTime <= 19.5) {
                    this.sunSprite.material.color.setRGB(1.0, 0.72, 0.35);
                } else if (clockTime >= 5 && clockTime <= 7.5) {
                    this.sunSprite.material.color.setRGB(1.0, 0.78, 0.45);
                } else {
                    this.sunSprite.material.color.setRGB(1.0, 0.98, 0.92);
                }
            } else {
                this.sunSprite.visible = false;
            }
        }

        // ── 2. Moon Billboard (Opposite Sun) ──
        if (this.moonSprite) {
            this.moonSprite.position.set(-sunX, -sunY, -sunZ);
            const moonScale = (moonAngularSize / 11) * 320;
            this.moonSprite.scale.set(moonScale, moonScale, 1);
            if (bodiesShown && -sunY > -60) {
                this.moonSprite.visible = true;
                const mOpacity = Math.max(0, Math.min(1, (-sunY + 60) / 180));
                this.moonSprite.material.opacity = mOpacity;
            } else {
                this.moonSprite.visible = false;
            }
        }

        // ── 3. Night Stars ──
        if (this.starPoints) {
            const nightFactor = Math.max(0, Math.min(1, (-sunY + 80) / 300));
            this.starPoints.material.opacity = nightFactor * 0.95;
            this.starPoints.visible = bodiesShown && (nightFactor > 0.01);
        }

        // ── 4. Dynamic Skybox Dome Gradient ──
        if (this.skyCtx && this.skyCanvas) {
            const grad = this.skyCtx.createLinearGradient(0, 0, 0, 512);
            if (clockTime >= 16.5 && clockTime <= 19.5) {
                // Sunset glow
                grad.addColorStop(0, '#2e3863');
                grad.addColorStop(0.45, '#c9542a');
                grad.addColorStop(0.65, '#ff8a43');
                grad.addColorStop(0.85, '#e0a16c');
                grad.addColorStop(1, '#4a2f38');
            } else if (clockTime >= 5 && clockTime <= 7.5) {
                // Sunrise glow
                grad.addColorStop(0, '#3a4e75');
                grad.addColorStop(0.45, '#d46b38');
                grad.addColorStop(0.65, '#ffa259');
                grad.addColorStop(0.85, '#d9b48f');
                grad.addColorStop(1, '#453835');
            } else if (isDay) {
                // Sunny Day: rich classic sky blue top to soft cyan-white horizon
                grad.addColorStop(0, '#538de8');
                grad.addColorStop(0.45, '#85b3f2');
                grad.addColorStop(0.75, '#c7dfff');
                grad.addColorStop(0.88, '#e5f0ff');
                grad.addColorStop(1, '#97b4d6');
            } else {
                // Deep starry night
                grad.addColorStop(0, '#04060d');
                grad.addColorStop(0.5, '#0a1020');
                grad.addColorStop(0.8, '#101a33');
                grad.addColorStop(1, '#080c17');
            }
            this.skyCtx.fillStyle = grad;
            this.skyCtx.fillRect(0, 0, 128, 512);
            if (this.skyTexture) this.skyTexture.needsUpdate = true;
        }

        // ── 5. Fog Settings ──
        const fogColorRGB = lighting.FogColor ? (lighting.FogColor.toRGB ? lighting.FogColor.toRGB() : { r: 192, g: 214, b: 237 }) : { r: 192, g: 214, b: 237 };
        const fogColor = new THREE.Color(fogColorRGB.r / 255, fogColorRGB.g / 255, fogColorRGB.b / 255);
        const fogStart = (lighting.FogStart !== undefined) ? Math.max(0, Number(lighting.FogStart)) : 0;
        const fogEnd = (lighting.FogEnd !== undefined) ? Math.max(1, Number(lighting.FogEnd)) : 1000;

        if (!this.scene.fog || !(this.scene.fog instanceof THREE.Fog)) {
            this.scene.fog = new THREE.Fog(fogColor, fogStart, fogEnd);
        } else {
            this.scene.fog.color.copy(fogColor);
            this.scene.fog.near = fogStart;
            this.scene.fog.far = fogEnd;
        }

        // ── 6. Dynamic Gradient Skybox Recolor ──
        this.updateGradientSkyBox(clockTime);

        // Sunlight vs Moonlight
        if (isDay) {
            this.sunLight.intensity = brightness * Math.max(0.08, dayAlpha) * 0.95;
            if (clockTime >= 16.5 && clockTime <= 19.5) {
                this.sunLight.color.setRGB(1.0, 0.7, 0.45);
            } else {
                this.sunLight.color.setRGB(1.0, 0.98, 0.93);
            }
        } else {
            // Moonlight
            this.sunLight.intensity = Math.max(0.02, brightness * 0.1);
            this.sunLight.color.setRGB(0.55, 0.7, 0.95);
        }

        // Ambient & OutdoorAmbient colors
        const amb = lighting.Ambient ? (lighting.Ambient.toRGB ? lighting.Ambient.toRGB() : { r: 128, g: 128, b: 128 }) : { r: 128, g: 128, b: 128 };
        const outAmb = lighting.OutdoorAmbient ? (lighting.OutdoorAmbient.toRGB ? lighting.OutdoorAmbient.toRGB() : { r: 128, g: 128, b: 128 }) : { r: 128, g: 128, b: 128 };

        // Ambient Light
        const ambFactor = 0.2 + 0.8 * dayAlpha;
        this.ambientLight.color.setRGB(
            (amb.r / 255) * ambFactor,
            (amb.g / 255) * ambFactor,
            (amb.b / 255) * ambFactor
        );
        this.ambientLight.intensity = Math.max(0.08, (brightness * 0.45) * ambFactor);

        // Hemisphere Light
        if (this.hemiLight) {
            this.hemiLight.color.setRGB(
                (outAmb.r / 255) * (0.3 + 0.7 * dayAlpha),
                (outAmb.g / 255) * (0.3 + 0.7 * dayAlpha),
                (outAmb.b / 255) * (0.3 + 0.7 * dayAlpha)
            );
            this.hemiLight.groundColor.setRGB(
                (outAmb.r / 255) * 0.2 * dayAlpha,
                (outAmb.g / 255) * 0.2 * dayAlpha,
                (outAmb.b / 255) * 0.2 * dayAlpha
            );
            this.hemiLight.intensity = Math.max(0.05, (brightness * 0.4) * (0.2 + 0.8 * dayAlpha));
        }
    }

    setSelectedParts(parts) {
        if (!Array.isArray(parts)) parts = parts ? [parts] : [];
        this.selectedParts = parts;
        this.selectedPart = parts.length > 0 ? parts[parts.length - 1] : null;
        this.updateSelectionBox();
    }

    setSelectionGroupBounds(box) {
        if (!this.selectionGroupBounds) return;
        if (!box || box.isEmpty()) {
            this.selectionGroupBounds.visible = false;
            return;
        }
        this.selectionGroupBounds.box.copy(box);
        this.selectionGroupBounds.updateMatrixWorld(true);
        this.selectionGroupBounds.visible = true;
    }

    setSelectedPart(part) {
        this.setSelectedParts(part ? [part] : []);
    }

    createSelectionBoxGeometry(sx, sy, sz, thickness = 0.05) {
        const t = Math.max(0.035, Math.min(0.12, thickness));
        const w = sx;
        const h = sy;
        const d = sz;

        // 12 edge beam definitions [width, height, depth, posX, posY, posZ]
        const beams = [
            // 4 horizontal beams along X (top & bottom edges)
            [w + t, t, t, 0, h / 2, d / 2],
            [w + t, t, t, 0, h / 2, -d / 2],
            [w + t, t, t, 0, -h / 2, d / 2],
            [w + t, t, t, 0, -h / 2, -d / 2],
            // 4 vertical beams along Y (pillar edges)
            [t, h + t, t, w / 2, 0, d / 2],
            [t, h + t, t, -w / 2, 0, d / 2],
            [t, h + t, t, w / 2, 0, -d / 2],
            [t, h + t, t, -w / 2, 0, -d / 2],
            // 4 depth beams along Z (side edges)
            [t, t, d + t, w / 2, h / 2, 0],
            [t, t, d + t, -w / 2, h / 2, 0],
            [t, t, d + t, w / 2, -h / 2, 0],
            [t, t, d + t, -w / 2, -h / 2, 0]
        ];

        const positions = [];
        const indices = [];

        beams.forEach(([bw, bh, bd, px, py, pz], bIdx) => {
            const hx = bw / 2, hy = bh / 2, hz = bd / 2;
            const vertexOffset = bIdx * 8;

            // 8 corners of the beam box
            positions.push(
                px - hx, py - hy, pz - hz,
                px + hx, py - hy, pz - hz,
                px + hx, py + hy, pz - hz,
                px - hx, py + hy, pz - hz,
                px - hx, py - hy, pz + hz,
                px + hx, py - hy, pz + hz,
                px + hx, py + hy, pz + hz,
                px - hx, py + hy, pz + hz
            );

            // 12 triangles (36 indices) per beam box
            const boxIndices = [
                0, 2, 1, 0, 3, 2, // front
                4, 5, 6, 4, 6, 7, // back
                0, 1, 5, 0, 5, 4, // bottom
                2, 3, 7, 2, 7, 6, // top
                0, 4, 7, 0, 7, 3, // left
                1, 2, 6, 1, 6, 5  // right
            ];
            boxIndices.forEach(idx => indices.push(vertexOffset + idx));
        });

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setIndex(indices);
        geo.computeVertexNormals();
        return geo;
    }

    updateSelectionBox() {
        const parts = (this.selectedParts && this.selectedParts.length > 0)
            ? this.selectedParts
            : (this.selectedPart ? [this.selectedPart] : []);

        if (parts.length === 0) {
            if (this.selectionBox) this.selectionBox.visible = false;
            if (this.selectionBoxes) {
                this.selectionBoxes.forEach(b => { b.visible = false; });
            }
            if (this.selectionOutlines) {
                this.selectionOutlines.forEach(o => { o.visible = false; });
            }
            if (this.selectionOutline) this.selectionOutline.visible = false;
            return;
        }

        if (!this.selectionBoxes) this.selectionBoxes = [];
        if (!this.selectionOutlines) this.selectionOutlines = [];

        // Ensure enough selection boxes & outlines exist
        while (this.selectionBoxes.length < parts.length) {
            const box = new THREE.Mesh(new THREE.BufferGeometry(), this.selectionBoxMaterial);
            box.renderOrder = 998;
            this.scene.add(box);
            this.selectionBoxes.push(box);
        }
        while (this.selectionOutlines.length < parts.length) {
            const outline = new THREE.Mesh(new THREE.BufferGeometry(), this.selectionOutlineMaterial);
            outline.renderOrder = 997;
            this.scene.add(outline);
            this.selectionOutlines.push(outline);
        }

        // Hide any excess boxes & outlines
        for (let i = parts.length; i < this.selectionBoxes.length; i++) {
            this.selectionBoxes[i].visible = false;
        }
        for (let i = parts.length; i < this.selectionOutlines.length; i++) {
            this.selectionOutlines[i].visible = false;
        }

        // Render selection for each selected part
        parts.forEach((p, idx) => {
            const mesh = this.partMeshes.get(p);
            const box = this.selectionBoxes[idx];
            const outline = this.selectionOutlines[idx];
            if (!mesh) {
                if (box) box.visible = false;
                if (outline) outline.visible = false;
                return;
            }

            const isRound = (p.Shape === 'Ball' || p.Shape === 'Cylinder');
            const s = p.Size || new Vector3(4, 1, 2);
            const sx = Math.max(0.1, Number(s.x) || 1);
            const sy = Math.max(0.1, Number(s.y) || 1);
            const sz = Math.max(0.1, Number(s.z) || 1);

            // 1. Box outline: strictly hidden for round parts per specification!
            if (isRound) {
                if (box) box.visible = false;
            } else if (box) {
                const thickness = Math.max(0.045, Math.min(0.085, Math.min(sx, sy, sz) * 0.04));
                const geometryKey = `${sx}:${sy}:${sz}:${thickness}`;
                if (box.userData.geometryKey !== geometryKey) {
                    if (box.geometry) box.geometry.dispose();
                    box.geometry = this.createSelectionBoxGeometry(sx, sy, sz, thickness);
                    box.userData.geometryKey = geometryKey;
                }
                box.position.copy(mesh.position);
                box.quaternion.copy(mesh.quaternion);
                box.visible = true;
            }

            // 2. Round/Contour outline: always displayed for round parts, and for primary selection
            if (outline) {
                if (isRound || p === this.selectedPart) {
                    if (outline.userData.sourceGeometryId !== mesh.geometry.id) {
                        if (outline.geometry && outline.geometry !== mesh.geometry) {
                            outline.geometry.dispose();
                        }
                        outline.geometry = mesh.geometry.clone();
                        outline.userData.sourceGeometryId = mesh.geometry.id;
                    }
                    const pad = 0.07;
                    outline.scale.set((sx + pad) / sx, (sy + pad) / sy, (sz + pad) / sz);
                    outline.position.copy(mesh.position);
                    outline.quaternion.copy(mesh.quaternion);
                    outline.visible = true;
                } else {
                    outline.visible = false;
                }
            }
        });
    }

    raycast(clientX, clientY, ignoreLocked = true) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

        const meshes = Array.from(this.partMeshes.values());
        const intersects = raycaster.intersectObjects(meshes, false);

        for (const hit of intersects) {
            const hitMesh = hit.object;
            const part = this.meshParts.get(hitMesh);
            if (part) {
                if (ignoreLocked && part.Locked) {
                    continue; // Skip locked parts so they cannot be selected by clicking in the viewport
                }
                return part;
            }
        }
        return null;
    }

    raycastWithFace(clientX, clientY) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
            return null;
        }
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

        const meshes = Array.from(this.partMeshes.values()).filter(m => m.visible);
        const intersects = raycaster.intersectObjects(meshes, false);

        if (intersects.length > 0) {
            const hit = intersects[0];
            const hitMesh = hit.object;
            const part = this.meshParts.get(hitMesh) || null;
            if (!part) return null;

            let faceName = 'Front';
            if (hit.face && hit.face.normal) {
                const norm = hit.face.normal.clone().normalize();
                const absX = Math.abs(norm.x);
                const absY = Math.abs(norm.y);
                const absZ = Math.abs(norm.z);

                if (absY >= absX && absY >= absZ) {
                    faceName = norm.y > 0 ? 'Top' : 'Bottom';
                } else if (absX >= absY && absX >= absZ) {
                    faceName = norm.x > 0 ? 'Right' : 'Left';
                } else {
                    faceName = norm.z > 0 ? 'Front' : 'Back';
                }
            }

            return {
                part: part,
                face: faceName,
                point: hit.point,
                normal: hit.face ? hit.face.normal : null
            };
        }
        return null;
    }

    initClouds() {
        const cloudVS = `
            varying vec3 vWorldPos;
            void main() {
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                vWorldPos = worldPos.xyz;
                gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
        `;

        const cloudFS = `
            uniform float uTime;
            uniform vec3 uCameraPos;
            uniform vec3 uSunDir;
            uniform vec3 uSunColor;
            uniform vec3 uAmbientColor;
            uniform float uCover;
            uniform float uDensity;
            uniform vec3 uColor;
            uniform bool uEnabled;

            varying vec3 vWorldPos;

            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
            float snoise(vec2 v){
                const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                                   -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod(i, 289.0);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m; m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            float fbm(vec2 p) {
                float total = 0.0;
                float amp = 0.5;
                float freq = 1.0;
                for (int i = 0; i < 4; i++) {
                    total += snoise(p * freq) * amp;
                    freq *= 2.05;
                    amp *= 0.5;
                }
                return total * 0.5 + 0.5;
            }

            void main() {
                if (!uEnabled || uCover <= 0.001 || uDensity <= 0.001) discard;
                vec2 wind = vec2(uTime * 3.5, uTime * 1.8);
                vec2 p = (vWorldPos.xz + wind) * 0.00065;
                float n = fbm(p);
                float detail = fbm(p * 2.4 + vec2(uTime * 2.5, -uTime * 1.2));
                float shape = mix(n, detail, 0.25);

                float threshold = 1.0 - uCover;
                float cloudAlpha = smoothstep(threshold - 0.15, threshold + 0.15, shape);
                cloudAlpha *= uDensity;
                if (cloudAlpha <= 0.01) discard;

                float sunLight = clamp(dot(vec3(0.0, 1.0, 0.0), uSunDir) * 0.5 + 0.5, 0.25, 1.0);
                float heightShade = smoothstep(threshold, 1.0, shape);
                vec3 sunTint = mix(uAmbientColor * 0.75, uSunColor * 1.15, heightShade * sunLight);
                vec3 col = sunTint * uColor;

                float dist = length(vWorldPos.xz - uCameraPos.xz);
                float fade = 1.0 - smoothstep(1300.0, 1800.0, dist);
                gl_FragColor = vec4(col, cloudAlpha * fade * 0.88);
            }
        `;

        this.cloudsMaterial = new THREE.ShaderMaterial({
            vertexShader: cloudVS,
            fragmentShader: cloudFS,
            uniforms: {
                uTime: { value: 0 },
                uCameraPos: { value: new THREE.Vector3() },
                uSunDir: { value: new THREE.Vector3(0.5, 1, 0.3).normalize() },
                uSunColor: { value: new THREE.Color(0xfffaed) },
                uAmbientColor: { value: new THREE.Color(0x8fa9c4) },
                uCover: { value: 0.5 },
                uDensity: { value: 0.7 },
                uColor: { value: new THREE.Color(1, 1, 1) },
                uEnabled: { value: true }
            },
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        const cloudGeo = new THREE.PlaneGeometry(3800, 3800, 16, 16);
        cloudGeo.rotateX(-Math.PI / 2);
        this.cloudsPlane = new THREE.Mesh(cloudGeo, this.cloudsMaterial);
        this.cloudsPlane.position.set(0, 440, 0);
        this.scene.add(this.cloudsPlane);
    }

    initPostProcessing() {
        const pr = this.renderer.getPixelRatio() || 1;
        const w = Math.max(1, Math.floor((this.container.clientWidth || 800) * pr));
        const h = Math.max(1, Math.floor((this.container.clientHeight || 600) * pr));

        const isWebGL2 = Boolean(this.renderer.capabilities?.isWebGL2);
        const RTClass = (isWebGL2 && THREE.WebGLMultisampleRenderTarget) ? THREE.WebGLMultisampleRenderTarget : THREE.WebGLRenderTarget;
        const rtOptions = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.HalfFloatType,
            depthBuffer: true,
            depthTexture: new THREE.DepthTexture(w, h, THREE.UnsignedIntType)
        };
        this.mainRenderTarget = new RTClass(w, h, rtOptions);
        if (this.mainRenderTarget.samples !== undefined) {
            this.mainRenderTarget.samples = (this.antialiasingEnabled !== false) ? 4 : 0;
        }

        const postVS = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position.xy, 0.0, 1.0);
            }
        `;

        const postFS = `
            uniform sampler2D tDiffuse;
            uniform sampler2D tDepth;
            uniform vec2 uResolution;
            uniform float uNear;
            uniform float uFar;
            uniform mat4 uInvProjection;
            uniform mat4 uInvView;
            uniform bool uAntialiasingEnabled;

            // Atmosphere
            uniform bool uAtmosphereEnabled;
            uniform float uAtmosphereDensity;
            uniform float uAtmosphereOffset;
            uniform vec3 uAtmosphereColor;
            uniform vec3 uAtmosphereDecay;
            uniform float uAtmosphereGlare;
            uniform float uAtmosphereHaze;
            uniform vec3 uSunDir;
            uniform vec3 uSunColor;

            // SunRays
            uniform bool uSunRaysEnabled;
            uniform float uSunRaysIntensity;
            uniform float uSunRaysSpread;
            uniform vec2 uSunScreenPos;
            uniform bool uSunOnScreen;

            // DoF
            uniform bool uDofEnabled;
            uniform float uDofFocusDistance;
            uniform float uDofInFocusRadius;
            uniform float uDofNearIntensity;
            uniform float uDofFarIntensity;

            // Bloom
            uniform bool uBloomEnabled;
            uniform float uBloomIntensity;
            uniform float uBloomSize;
            uniform float uBloomThreshold;

            varying vec2 vUv;

            float readLinearDepth(vec2 uv) {
                float depth = texture2D(tDepth, uv).r;
                float z_ndc = 2.0 * depth - 1.0;
                return 2.0 * uNear * uFar / (uFar + uNear - z_ndc * (uFar - uNear));
            }

            vec3 applyAtmosphere(vec3 sceneColor, float linearZ, vec2 uv) {
                if (!uAtmosphereEnabled || linearZ >= (uFar - 60.0)) return sceneColor;
                float dist = linearZ;
                float densityFactor = uAtmosphereDensity * 0.0035;
                float fog = 1.0 - exp(-dist * densityFactor * uAtmosphereHaze);
                fog = clamp(fog, 0.0, 1.0);

                vec4 ndc = vec4(uv * 2.0 - 1.0, 1.0, 1.0);
                vec4 viewRay = uInvProjection * ndc;
                vec3 rayDir = normalize((uInvView * vec4(viewRay.xyz, 0.0)).xyz);
                float sunDot = max(0.0, dot(rayDir, uSunDir));
                float glare = pow(sunDot, 12.0) * uAtmosphereGlare;

                vec3 hazeColor = mix(uAtmosphereColor, uAtmosphereDecay, clamp(dist / 800.0, 0.0, 1.0));
                vec3 atmosColor = mix(hazeColor, uSunColor, glare);
                return mix(sceneColor, atmosColor, fog);
            }

            vec3 applyDepthOfField(vec3 sceneColor, float linearZ, vec2 uv) {
                if (!uDofEnabled) return sceneColor;
                float diff = linearZ - uDofFocusDistance;
                float absDiff = abs(diff);
                if (absDiff <= uDofInFocusRadius) return sceneColor;

                float blurAmt = (absDiff - uDofInFocusRadius) * (diff < 0.0 ? uDofNearIntensity : uDofFarIntensity) * 0.25;
                blurAmt = clamp(blurAmt, 0.0, 6.0);
                if (blurAmt < 0.2) return sceneColor;

                vec2 texel = vec2(blurAmt) / uResolution;
                vec3 col = sceneColor;
                col += texture2D(tDiffuse, uv + vec2( 0.707,  0.707) * texel).rgb;
                col += texture2D(tDiffuse, uv + vec2(-0.707,  0.707) * texel).rgb;
                col += texture2D(tDiffuse, uv + vec2( 0.707, -0.707) * texel).rgb;
                col += texture2D(tDiffuse, uv + vec2(-0.707, -0.707) * texel).rgb;
                return col / 5.0;
            }

            vec3 applySunRays(vec2 uv, float linearZ) {
                if (!uSunRaysEnabled || !uSunOnScreen || uSunRaysIntensity <= 0.001) return vec3(0.0);
                vec2 delta = uSunScreenPos - uv;
                float dist = length(delta);
                if (dist < 0.0001) return vec3(0.0);

                // 1. High-precision Volumetric God Rays (Radial Crepuscular Rays with Depth Occlusion)
                vec2 stepVec = (delta / 32.0) * clamp(uSunRaysSpread, 0.25, 1.0);
                float dither = fract(sin(dot(uv * uResolution, vec2(12.9898, 78.233))) * 43758.5453);
                vec2 coord = uv + stepVec * (dither * 0.95);

                vec3 rays = vec3(0.0);
                float illumination = 1.0;
                float decay = 0.95;

                for (int i = 0; i < 32; i++) {
                    coord += stepVec;
                    if (coord.x >= 0.0 && coord.x <= 1.0 && coord.y >= 0.0 && coord.y <= 1.0) {
                        float sampleDepth = readLinearDepth(coord);
                        // If sample is unoccluded (in the sky / celestial dome)
                        if (sampleDepth > (uFar - 150.0)) {
                            vec3 sampleColor = texture2D(tDiffuse, coord).rgb;
                            float lum = dot(sampleColor, vec3(0.299, 0.587, 0.114));
                            float catchLight = pow(max(0.0, lum - 0.45), 1.5);
                            rays += uSunColor * catchLight * illumination;
                        }
                    }
                    illumination *= decay;
                }

                // 2. Solar Core Volumetric Glare & Corona Halo
                float sunDist = length(uv - uSunScreenPos);
                float solarGlow = 0.45 / (1.0 + sunDist * 14.0) * uSunRaysIntensity;
                vec3 halo = uSunColor * solarGlow;

                return (rays * (uSunRaysIntensity * 0.35) + halo);
            }

            // Fast Approximate Anti-Aliasing (FXAA) for crisp edge smoothing
            vec3 applyFXAA(sampler2D tex, vec2 uv, vec2 resolution) {
                vec3 baseColor = texture2D(tex, uv).rgb;
                if (!uAntialiasingEnabled) return baseColor;
                vec2 rcpFrame = 1.0 / resolution;
                vec3 rgbNW = texture2D(tex, uv + vec2(-0.5, -0.5) * rcpFrame).rgb;
                vec3 rgbNE = texture2D(tex, uv + vec2(0.5, -0.5) * rcpFrame).rgb;
                vec3 rgbSW = texture2D(tex, uv + vec2(-0.5, 0.5) * rcpFrame).rgb;
                vec3 rgbSE = texture2D(tex, uv + vec2(0.5, 0.5) * rcpFrame).rgb;
                vec3 rgbM  = baseColor;

                vec3 luma = vec3(0.299, 0.587, 0.114);
                float lumaNW = dot(rgbNW, luma);
                float lumaNE = dot(rgbNE, luma);
                float lumaSW = dot(rgbSW, luma);
                float lumaSE = dot(rgbSE, luma);
                float lumaM  = dot(rgbM,  luma);

                float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
                float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

                vec2 dir;
                dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
                dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

                float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * 0.03125), 0.0078125);
                float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
                dir = min(vec2(8.0), max(vec2(-8.0), dir * rcpDirMin)) * rcpFrame;

                vec3 rgbA = 0.5 * (
                    texture2D(tex, uv + dir * (1.0 / 3.0 - 0.5)).rgb +
                    texture2D(tex, uv + dir * (2.0 / 3.0 - 0.5)).rgb
                );
                vec3 rgbB = rgbA * 0.5 + 0.25 * (
                    texture2D(tex, uv + dir * -0.5).rgb +
                    texture2D(tex, uv + dir * 0.5).rgb
                );
                float lumaB = dot(rgbB, luma);
                vec3 result = rgbB;
                if (lumaB < lumaMin || lumaB > lumaMax) {
                    result = rgbA;
                }
                return result;
            }

            // Multi-Pass Dual Kawase Mip-Chain Pyramid Bloom (Unreal Engine / Unity standard)
            uniform sampler2D tBloom;

            vec3 applyBloom(vec2 uv) {
                if (!uBloomEnabled || uBloomIntensity <= 0.001) return vec3(0.0);
                vec3 bloom = texture2D(tBloom, uv).rgb;
                return bloom * uBloomIntensity;
            }

            vec3 ACESFilm(vec3 x) {
                float a = 2.51;
                float b = 0.03;
                float c = 2.43;
                float d = 0.59;
                float e = 0.14;
                return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
            }

            void main() {
                vec3 col = applyFXAA(tDiffuse, vUv, uResolution);
                float linearZ = readLinearDepth(vUv);

                col = applyAtmosphere(col, linearZ, vUv);
                col = applyDepthOfField(col, linearZ, vUv);
                col += applySunRays(vUv, linearZ);
                col += applyBloom(vUv);
                col = ACESFilm(col);

                gl_FragColor = vec4(col, 1.0);
            }
        `;

        this.postMaterial = new THREE.ShaderMaterial({
            vertexShader: postVS,
            fragmentShader: postFS,
            uniforms: {
                tDiffuse: { value: null },
                tDepth: { value: null },
                uResolution: { value: new THREE.Vector2(w, h) },
                uNear: { value: 0.1 },
                uFar: { value: 2500.0 },
                uInvProjection: { value: new THREE.Matrix4() },
                uInvView: { value: new THREE.Matrix4() },
                uAntialiasingEnabled: { value: true },
                uAtmosphereEnabled: { value: true },
                uAtmosphereDensity: { value: 0.395 },
                uAtmosphereOffset: { value: 0.25 },
                uAtmosphereColor: { value: new THREE.Color(0.78, 0.83, 0.9) },
                uAtmosphereDecay: { value: new THREE.Color(0.41, 0.48, 0.57) },
                uAtmosphereGlare: { value: 0.4 },
                uAtmosphereHaze: { value: 1.0 },
                uSunDir: { value: new THREE.Vector3(0.5, 1, 0.3).normalize() },
                uSunColor: { value: new THREE.Color(1, 0.98, 0.93) },
                uSunRaysEnabled: { value: true },
                uSunRaysIntensity: { value: 0.25 },
                uSunRaysSpread: { value: 0.75 },
                uSunScreenPos: { value: new THREE.Vector2(0.5, 0.5) },
                uSunOnScreen: { value: true },
                uDofEnabled: { value: false },
                uDofFocusDistance: { value: 25 },
                uDofInFocusRadius: { value: 15 },
                uDofNearIntensity: { value: 0.5 },
                uDofFarIntensity: { value: 0.5 },
                tBloom: { value: null },
                uBloomEnabled: { value: true },
                uBloomIntensity: { value: 1.0 },
                uBloomSize: { value: 24 },
                uBloomThreshold: { value: 1.1 }
            },
            depthTest: false,
            depthWrite: false
        });

        this.postScene = new THREE.Scene();
        this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMaterial);
        this.postScene.add(quad);

        // Initialize True Unreal Engine / Unity 5-level Dual Kawase Mip-Chain Pyramid Bloom
        this.initBloomPyramid(w, h);
    }

    initBloomPyramid(width, height) {
        this.bloomMips = this.bloomMips || 5;
        let resX = Math.max(1, Math.floor(width / 2));
        let resY = Math.max(1, Math.floor(height / 2));

        if (this.bloomRenderTargetsDown) {
            for (let i = 0; i < this.bloomRenderTargetsDown.length; i++) {
                this.bloomRenderTargetsDown[i].dispose();
                this.bloomRenderTargetsUp[i].dispose();
            }
        }

        this.bloomRenderTargetsDown = [];
        this.bloomRenderTargetsUp = [];

        for (let i = 0; i < this.bloomMips; i++) {
            const rtDown = new THREE.WebGLRenderTarget(resX, resY, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                type: THREE.HalfFloatType
            });
            const rtUp = new THREE.WebGLRenderTarget(resX, resY, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                type: THREE.HalfFloatType
            });
            this.bloomRenderTargetsDown.push(rtDown);
            this.bloomRenderTargetsUp.push(rtUp);
            resX = Math.max(1, Math.floor(resX / 2));
            resY = Math.max(1, Math.floor(resY / 2));
        }

        if (!this.bloomQuad) {
            const vs = `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position.xy, 0.0, 1.0);
                }
            `;

            // 1. High-precision Bright Pass with soft-knee
            const fsBright = `
                uniform sampler2D tDiffuse;
                uniform float uThreshold;
                uniform float uKnee;
                varying vec2 vUv;

                void main() {
                    vec3 col = texture2D(tDiffuse, vUv).rgb;
                    float b = max(col.r, max(col.g, col.b));
                    float soft = b - uThreshold + uKnee;
                    soft = clamp(soft, 0.0, 2.0 * uKnee);
                    soft = (soft * soft) / (4.0 * uKnee + 0.00001);
                    float contribution = max(soft, b - uThreshold);
                    contribution /= max(b, 0.00001);
                    gl_FragColor = vec4(col * max(0.0, contribution), 1.0);
                }
            `;

            // 2. 13-tap Jimenez Bilinear Tent Box Filter Downsample (COD / Unreal Engine 5 / Unity URP)
            const fsDown = `
                uniform sampler2D tDiffuse;
                uniform vec2 uTexelSize;
                varying vec2 vUv;

                void main() {
                    float x = uTexelSize.x;
                    float y = uTexelSize.y;

                    vec3 a = texture2D(tDiffuse, vec2(vUv.x - 2.0*x, vUv.y + 2.0*y)).rgb;
                    vec3 b = texture2D(tDiffuse, vec2(vUv.x,          vUv.y + 2.0*y)).rgb;
                    vec3 c = texture2D(tDiffuse, vec2(vUv.x + 2.0*x, vUv.y + 2.0*y)).rgb;

                    vec3 d = texture2D(tDiffuse, vec2(vUv.x - x, vUv.y + y)).rgb;
                    vec3 e = texture2D(tDiffuse, vec2(vUv.x + x, vUv.y + y)).rgb;

                    vec3 f = texture2D(tDiffuse, vec2(vUv.x - 2.0*x, vUv.y)).rgb;
                    vec3 g = texture2D(tDiffuse, vec2(vUv.x,          vUv.y)).rgb;
                    vec3 h = texture2D(tDiffuse, vec2(vUv.x + 2.0*x, vUv.y)).rgb;

                    vec3 i = texture2D(tDiffuse, vec2(vUv.x - x, vUv.y - y)).rgb;
                    vec3 j = texture2D(tDiffuse, vec2(vUv.x + x, vUv.y - y)).rgb;

                    vec3 k = texture2D(tDiffuse, vec2(vUv.x - 2.0*x, vUv.y - 2.0*y)).rgb;
                    vec3 l = texture2D(tDiffuse, vec2(vUv.x,          vUv.y - 2.0*y)).rgb;
                    vec3 m = texture2D(tDiffuse, vec2(vUv.x + 2.0*x, vUv.y - 2.0*y)).rgb;

                    vec3 col = (d + e + i + j) * 0.125;
                    col += (a + b + f + g) * 0.03125;
                    col += (b + c + g + h) * 0.03125;
                    col += (f + g + k + l) * 0.03125;
                    col += (g + h + l + m) * 0.03125;

                    gl_FragColor = vec4(col, 1.0);
                }
            `;

            // 3. 9-tap Bilinear Tent Filter Upsample & Blend (Dual Kawase)
            const fsUp = `
                uniform sampler2D tPreviousMip;
                uniform vec2 uTexelSize;
                uniform float uRadius;
                varying vec2 vUv;

                void main() {
                    float x = uTexelSize.x * uRadius;
                    float y = uTexelSize.y * uRadius;

                    vec3 a = texture2D(tPreviousMip, vec2(vUv.x - x, vUv.y + y)).rgb;
                    vec3 b = texture2D(tPreviousMip, vec2(vUv.x,     vUv.y + y)).rgb * 2.0;
                    vec3 c = texture2D(tPreviousMip, vec2(vUv.x + x, vUv.y + y)).rgb;

                    vec3 d = texture2D(tPreviousMip, vec2(vUv.x - x, vUv.y)).rgb * 2.0;
                    vec3 e = texture2D(tPreviousMip, vec2(vUv.x,     vUv.y)).rgb * 4.0;
                    vec3 f = texture2D(tPreviousMip, vec2(vUv.x + x, vUv.y)).rgb * 2.0;

                    vec3 g = texture2D(tPreviousMip, vec2(vUv.x - x, vUv.y - y)).rgb;
                    vec3 h = texture2D(tPreviousMip, vec2(vUv.x,     vUv.y - y)).rgb * 2.0;
                    vec3 i = texture2D(tPreviousMip, vec2(vUv.x + x, vUv.y - y)).rgb;

                    vec3 upsample = (a + b + c + d + e + f + g + h + i) / 16.0;
                    gl_FragColor = vec4(upsample, 1.0);
                }
            `;

            // 4. Copy pass
            const fsCopy = `
                uniform sampler2D tDiffuse;
                varying vec2 vUv;
                void main() {
                    gl_FragColor = texture2D(tDiffuse, vUv);
                }
            `;

            this.bloomBrightMaterial = new THREE.ShaderMaterial({
                vertexShader: vs, fragmentShader: fsBright,
                uniforms: { tDiffuse: { value: null }, uThreshold: { value: 1.1 }, uKnee: { value: 0.3 } },
                depthTest: false, depthWrite: false
            });

            this.bloomDownsampleMaterial = new THREE.ShaderMaterial({
                vertexShader: vs, fragmentShader: fsDown,
                uniforms: { tDiffuse: { value: null }, uTexelSize: { value: new THREE.Vector2() } },
                depthTest: false, depthWrite: false
            });

            this.bloomUpsampleMaterial = new THREE.ShaderMaterial({
                vertexShader: vs, fragmentShader: fsUp,
                uniforms: { tPreviousMip: { value: null }, uTexelSize: { value: new THREE.Vector2() }, uRadius: { value: 1.0 } },
                depthTest: false, depthWrite: false,
                blending: THREE.AdditiveBlending, transparent: true
            });

            this.bloomCopyMaterial = new THREE.ShaderMaterial({
                vertexShader: vs, fragmentShader: fsCopy,
                uniforms: { tDiffuse: { value: null } },
                depthTest: false, depthWrite: false
            });

            this.bloomQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
            this.bloomScene = new THREE.Scene();
            this.bloomScene.add(this.bloomQuad);
            this.bloomCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        }
    }

    renderBloomPyramid(inputTexture, threshold = 1.1, knee = 0.3, radius = 1.0) {
        if (!this.bloomRenderTargetsDown || this.bloomRenderTargetsDown.length === 0) return null;

        const nMips = this.bloomMips;

        // 1. High-Pass / Bright Extraction Pass
        this.bloomBrightMaterial.uniforms.tDiffuse.value = inputTexture;
        this.bloomBrightMaterial.uniforms.uThreshold.value = threshold;
        this.bloomBrightMaterial.uniforms.uKnee.value = knee;
        this.bloomQuad.material = this.bloomBrightMaterial;
        this.renderer.setRenderTarget(this.bloomRenderTargetsDown[0]);
        this.renderer.render(this.bloomScene, this.bloomCamera);

        // 2. Downsampling Mip-Chain (13-tap Jimenez Bilinear Box Filter)
        this.bloomQuad.material = this.bloomDownsampleMaterial;
        for (let i = 0; i < nMips - 1; i++) {
            const src = this.bloomRenderTargetsDown[i];
            const dst = this.bloomRenderTargetsDown[i + 1];
            this.bloomDownsampleMaterial.uniforms.tDiffuse.value = src.texture;
            this.bloomDownsampleMaterial.uniforms.uTexelSize.value.set(1.0 / src.width, 1.0 / src.height);
            this.renderer.setRenderTarget(dst);
            this.renderer.render(this.bloomScene, this.bloomCamera);
        }

        // 3. Upsampling & Dual Kawase Progressive Blend
        let lastTarget = this.bloomRenderTargetsDown[nMips - 1];
        for (let i = nMips - 1; i > 0; i--) {
            const src = lastTarget;
            const higher = this.bloomRenderTargetsDown[i - 1];
            const dst = this.bloomRenderTargetsUp[i - 1];

            // Copy higher-res mip detail into dst
            this.bloomCopyMaterial.uniforms.tDiffuse.value = higher.texture;
            this.bloomQuad.material = this.bloomCopyMaterial;
            this.renderer.setRenderTarget(dst);
            this.renderer.render(this.bloomScene, this.bloomCamera);

            // Additively blend 9-tap tent upsampled lower-res mip
            this.bloomUpsampleMaterial.uniforms.tPreviousMip.value = src.texture;
            this.bloomUpsampleMaterial.uniforms.uTexelSize.value.set(1.0 / src.width, 1.0 / src.height);
            this.bloomUpsampleMaterial.uniforms.uRadius.value = radius;
            this.bloomQuad.material = this.bloomUpsampleMaterial;
            this.renderer.render(this.bloomScene, this.bloomCamera);

            lastTarget = dst;
        }

        return this.bloomRenderTargetsUp[0].texture;
    }

    syncClouds() {
        if (!this.cloudsPlane || !this.cloudsMaterial) return;

        let cloudsInst = null;
        const terrain = this.dataModel.Workspace ? this.dataModel.Workspace.FindFirstChild('Terrain') : null;
        if (terrain) {
            cloudsInst = terrain.GetChildren().find(c => c.ClassName === 'Clouds');
        }

        if (cloudsInst) {
            const isEnabled = Boolean(cloudsInst.Enabled);
            this.cloudsPlane.visible = isEnabled;
            this.cloudsMaterial.uniforms.uEnabled.value = isEnabled;
            this.cloudsMaterial.uniforms.uCover.value = cloudsInst.Cover !== undefined ? Number(cloudsInst.Cover) : 0.5;
            this.cloudsMaterial.uniforms.uDensity.value = cloudsInst.Density !== undefined ? Number(cloudsInst.Density) : 0.7;
            const rgb = cloudsInst.Color ? (cloudsInst.Color.toRGB ? cloudsInst.Color.toRGB() : { r: 255, g: 255, b: 255 }) : { r: 255, g: 255, b: 255 };
            this.cloudsMaterial.uniforms.uColor.value.setRGB(rgb.r / 255, rgb.g / 255, rgb.b / 255);
        } else {
            this.cloudsPlane.visible = false;
            this.cloudsMaterial.uniforms.uEnabled.value = false;
        }
    }

    syncLightingAndEffects() {
        this.syncLighting();
        this.syncClouds();

        const lighting = this.dataModel.Lighting;
        if (lighting) {
            const sky = lighting.GetChildren().find(c => c.ClassName === 'Sky' || c.ClassName === 'SkyBox');
            if (sky) {
                this.syncSkyBox(sky);
                if (this.sunSprite) {
                    const baseSun = (sky.SunAngularSize !== undefined ? Number(sky.SunAngularSize) : 21) / 21;
                    this.sunSprite.scale.set(460 * baseSun, 460 * baseSun, 1);
                }
                if (this.moonSprite) {
                    const baseMoon = (sky.MoonAngularSize !== undefined ? Number(sky.MoonAngularSize) : 11) / 11;
                    this.moonSprite.scale.set(320 * baseMoon, 320 * baseMoon, 1);
                }
                if (sky.CelestialBodiesShown !== undefined) {
                    if (this.sunSprite && !sky.CelestialBodiesShown) this.sunSprite.visible = false;
                    if (this.moonSprite && !sky.CelestialBodiesShown) this.moonSprite.visible = false;
                    if (this.starPoints && !sky.CelestialBodiesShown) this.starPoints.visible = false;
                }
            } else {
                this.syncSkyBox(null);
            }
        }
    }

    getSkyBoxPresetTextures(preset = 'Classic Roblox') {
        if (!this.skyBoxPresetCache) this.skyBoxPresetCache = new Map();
        if (this.skyBoxPresetCache.has(preset)) return this.skyBoxPresetCache.get(preset);

        const faces = ['Rt', 'Lf', 'Up', 'Dn', 'Ft', 'Bk'];
        const textures = [];

        for (let i = 0; i < 6; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            const face = faces[i];

            if (preset === 'Sunset') {
                if (face === 'Up') {
                    ctx.fillStyle = '#22153b';
                    ctx.fillRect(0, 0, 256, 256);
                } else if (face === 'Dn') {
                    ctx.fillStyle = '#1c111e';
                    ctx.fillRect(0, 0, 256, 256);
                } else {
                    const g = ctx.createLinearGradient(0, 0, 0, 256);
                    g.addColorStop(0, '#22153b');
                    g.addColorStop(0.35, '#5a1d48');
                    g.addColorStop(0.65, '#de5228');
                    g.addColorStop(0.85, '#ff9b36');
                    g.addColorStop(1, '#ffcb6b');
                    ctx.fillStyle = g;
                    ctx.fillRect(0, 0, 256, 256);
                }
            } else if (preset === 'Night Sky') {
                if (face === 'Dn') {
                    ctx.fillStyle = '#050711';
                    ctx.fillRect(0, 0, 256, 256);
                } else {
                    ctx.fillStyle = '#070a18';
                    ctx.fillRect(0, 0, 256, 256);
                    // Nebular dust
                    const ng = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
                    ng.addColorStop(0, 'rgba(80, 50, 140, 0.25)');
                    ng.addColorStop(0.7, 'rgba(30, 45, 95, 0.12)');
                    ng.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    ctx.fillStyle = ng;
                    ctx.fillRect(0, 0, 256, 256);
                    // Twinkling stars
                    for (let s = 0; s < 120; s++) {
                        const sx = Math.random() * 256;
                        const sy = Math.random() * 256;
                        const sr = Math.random() < 0.85 ? 1 : 1.5;
                        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.random() * 0.55})`;
                        ctx.beginPath();
                        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            } else if (preset === 'Realistic Atmosphere') {
                if (face === 'Up') {
                    ctx.fillStyle = '#154178';
                    ctx.fillRect(0, 0, 256, 256);
                } else if (face === 'Dn') {
                    ctx.fillStyle = '#8295a6';
                    ctx.fillRect(0, 0, 256, 256);
                } else {
                    const g = ctx.createLinearGradient(0, 0, 0, 256);
                    g.addColorStop(0, '#154178');
                    g.addColorStop(0.5, '#4a7cb8');
                    g.addColorStop(0.82, '#b8d0e8');
                    g.addColorStop(1, '#8295a6');
                    ctx.fillStyle = g;
                    ctx.fillRect(0, 0, 256, 256);
                }
            } else if (preset === 'Overcast') {
                if (face === 'Up') {
                    ctx.fillStyle = '#8396a8';
                    ctx.fillRect(0, 0, 256, 256);
                } else if (face === 'Dn') {
                    ctx.fillStyle = '#9cb0be';
                    ctx.fillRect(0, 0, 256, 256);
                } else {
                    const g = ctx.createLinearGradient(0, 0, 0, 256);
                    g.addColorStop(0, '#8396a8');
                    g.addColorStop(0.6, '#a4b8c9');
                    g.addColorStop(1, '#9cb0be');
                    ctx.fillStyle = g;
                    ctx.fillRect(0, 0, 256, 256);
                }
            } else {
                // Classic Roblox Skybox (Gradient per specification)
                if (face === 'Up') {
                    ctx.fillStyle = '#388be8';
                    ctx.fillRect(0, 0, 256, 256);
                } else if (face === 'Dn') {
                    ctx.fillStyle = '#78828c';
                    ctx.fillRect(0, 0, 256, 256);
                } else {
                    const g = ctx.createLinearGradient(0, 0, 0, 256);
                    g.addColorStop(0.0, '#388be8');
                    g.addColorStop(0.48, '#4695eb');
                    g.addColorStop(0.58, '#ffffff');
                    g.addColorStop(0.75, '#ffffff');
                    g.addColorStop(0.88, '#adb5c0');
                    g.addColorStop(1.0, '#78828c');
                    ctx.fillStyle = g;
                    ctx.fillRect(0, 0, 256, 256);
                }
            }

            const tex = new THREE.CanvasTexture(canvas);
            textures.push(tex);
        }

        this.skyBoxPresetCache.set(preset, textures);
        return textures;
    }

    syncSkyBox(sky) {
        if (!this.skyBoxMesh || !this.skyBoxMaterials) return;

        const preset = (sky && sky.Preset) ? sky.Preset : 'Classic Roblox';
        const faceProps = ['SkyboxRt', 'SkyboxLf', 'SkyboxUp', 'SkyboxDn', 'SkyboxFt', 'SkyboxBk'];

        let hasCustom = false;
        if (sky) {
            for (const prop of faceProps) {
                if (sky[prop] && String(sky[prop]).trim().length > 0) {
                    hasCustom = true;
                    break;
                }
            }
        }

        if (hasCustom) {
            const loader = new THREE.TextureLoader();
            faceProps.forEach((prop, idx) => {
                const url = sky[prop];
                if (url && String(url).trim().length > 0) {
                    loader.load(url, (tex) => {
                        this.skyBoxMaterials[idx].map = tex;
                        this.skyBoxMaterials[idx].needsUpdate = true;
                    });
                }
            });
        } else if (preset && preset !== 'Classic Roblox' && preset !== 'Custom') {
            const textures = this.getSkyBoxPresetTextures(preset);
            textures.forEach((tex, idx) => {
                this.skyBoxMaterials[idx].map = tex;
                this.skyBoxMaterials[idx].needsUpdate = true;
            });
        } else {
            const clockTime = (this.dataModel.Lighting && this.dataModel.Lighting.ClockTime !== undefined)
                ? Number(this.dataModel.Lighting.ClockTime) : 14;
            this._lastSkyNightFactor = -1; // force render
            this.updateGradientSkyBox(clockTime);
        }
        this.skyBoxMesh.visible = true;
        if (this.skyDome) this.skyDome.visible = false;
    }

    updateGradientSkyBox(clockTime) {
        if (!this.skyBoxMaterials || this.skyBoxMaterials.length < 6) return;

        // Check if custom skybox images or non-standard presets are currently loaded
        const lighting = this.dataModel ? this.dataModel.Lighting : null;
        const sky = lighting ? lighting.GetChildren().find(c => c.ClassName === 'Sky' || c.ClassName === 'SkyBox') : null;
        if (sky) {
            if (sky.Preset && sky.Preset !== 'Classic Roblox' && sky.Preset !== 'Custom') {
                return;
            }
            const faceProps = ['SkyboxRt', 'SkyboxLf', 'SkyboxUp', 'SkyboxDn', 'SkyboxFt', 'SkyboxBk'];
            for (const prop of faceProps) {
                if (sky[prop] && String(sky[prop]).trim().length > 0) {
                    return; // Custom texture in use, do not overwrite
                }
            }
        }

        const ct = Number(clockTime !== undefined ? clockTime : (lighting ? lighting.ClockTime : 14));
        let nightFactor = 0;
        if (ct >= 7 && ct <= 17.5) {
            nightFactor = 0; // Pure Day
        } else if (ct >= 19.5 || ct <= 5) {
            nightFactor = 1; // Pure Night
        } else if (ct > 5 && ct < 7) {
            nightFactor = (7 - ct) / 2.0; // Dawn
        } else {
            nightFactor = (ct - 17.5) / 2.0; // Dusk
        }

        if (this._lastSkyNightFactor !== undefined && Math.abs(nightFactor - this._lastSkyNightFactor) < 0.003) {
            return;
        }
        this._lastSkyNightFactor = nightFactor;

        // Initialize reusable canvases & textures
        if (!this.gradientSkyCanvases) {
            const sideCanvas = document.createElement('canvas');
            sideCanvas.width = 256;
            sideCanvas.height = 512;

            const upCanvas = document.createElement('canvas');
            upCanvas.width = 128;
            upCanvas.height = 128;

            const dnCanvas = document.createElement('canvas');
            dnCanvas.width = 128;
            dnCanvas.height = 128;

            this.gradientSkyCanvases = {
                side: sideCanvas,
                sideCtx: sideCanvas.getContext('2d'),
                up: upCanvas,
                upCtx: upCanvas.getContext('2d'),
                dn: dnCanvas,
                dnCtx: dnCanvas.getContext('2d')
            };

            this.gradientSkyTextures = {
                side: new THREE.CanvasTexture(sideCanvas),
                up: new THREE.CanvasTexture(upCanvas),
                dn: new THREE.CanvasTexture(dnCanvas)
            };
        }

        const lerpRGB = (c1, c2, t) => {
            const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
            const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
            const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
            return `rgb(${r}, ${g}, ${b})`;
        };

        const t = nightFactor;
        // Day vs Night Color stops per user specification:
        // Днем: С верха до середины голубой цвет, в середине до половина низу белый цвет, и в низу серый цвет
        // Ночь: Темно голубой (глубина моря) вверху до середины, и до низу идет темно голубо серым
        const colorTop = lerpRGB([52, 136, 235], [4, 18, 40], t);       // Top (0.0): Sky Blue / Deep Sea
        const colorBlueMid = lerpRGB([65, 150, 242], [6, 22, 46], t);   // Lower Blue (0.48): Blue down to middle of skybox
        const colorMidWhite = lerpRGB([255, 255, 255], [8, 25, 50], t); // Below middle (0.58): White
        const colorMidLow = lerpRGB([250, 252, 255], [16, 28, 39], t);  // Half-bottom (0.75): White
        const colorLow = lerpRGB([173, 181, 192], [20, 32, 44], t);     // Low (0.88)
        const colorBottom = lerpRGB([120, 130, 140], [22, 35, 48], t);  // Bottom (1.0): Gray / Dark Blue-Gray

        // 1. Draw Side Face Gradient (Rt, Lf, Ft, Bk)
        const sideCtx = this.gradientSkyCanvases.sideCtx;
        const grad = sideCtx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0.0, colorTop);
        grad.addColorStop(0.48, colorBlueMid);
        grad.addColorStop(0.58, colorMidWhite);
        grad.addColorStop(0.75, colorMidLow);
        grad.addColorStop(0.88, colorLow);
        grad.addColorStop(1.0, colorBottom);

        sideCtx.fillStyle = grad;
        sideCtx.fillRect(0, 0, 256, 512);

        // 2. Draw Top Face (Up) - solid top color matching top edge of side walls
        const upCtx = this.gradientSkyCanvases.upCtx;
        upCtx.fillStyle = colorTop;
        upCtx.fillRect(0, 0, 128, 128);

        // 3. Draw Bottom Face (Dn) - solid bottom color matching bottom edge of side walls
        const dnCtx = this.gradientSkyCanvases.dnCtx;
        dnCtx.fillStyle = colorBottom;
        dnCtx.fillRect(0, 0, 128, 128);

        // Mark textures for update
        this.gradientSkyTextures.side.needsUpdate = true;
        this.gradientSkyTextures.up.needsUpdate = true;
        this.gradientSkyTextures.dn.needsUpdate = true;

        // Assign to materials
        // Three.js BoxGeometry face order: [Rt(0), Lf(1), Up(2), Dn(3), Ft(4), Bk(5)]
        this.skyBoxMaterials[0].map = this.gradientSkyTextures.side;
        this.skyBoxMaterials[1].map = this.gradientSkyTextures.side;
        this.skyBoxMaterials[2].map = this.gradientSkyTextures.up;
        this.skyBoxMaterials[3].map = this.gradientSkyTextures.dn;
        this.skyBoxMaterials[4].map = this.gradientSkyTextures.side;
        this.skyBoxMaterials[5].map = this.gradientSkyTextures.side;

        for (let i = 0; i < 6; i++) {
            this.skyBoxMaterials[i].needsUpdate = true;
        }
        if (this.skyBoxMesh) this.skyBoxMesh.visible = true;
    }

    hasActivePostEffects() {
        if (this.antialiasingEnabled !== false) return true;
        const lighting = this.dataModel.Lighting;
        if (!lighting) return false;
        const children = lighting.GetChildren();
        for (const c of children) {
            if (c.ClassName === 'BloomEffect' && c.Enabled && c.Intensity > 0) return true;
            if (c.ClassName === 'Atmosphere' && c.Density > 0) return true;
            if (c.ClassName === 'SunRaysEffect' && c.Enabled && c.Intensity > 0) return true;
            if (c.ClassName === 'DepthOfFieldEffect' && c.Enabled) return true;
        }
        return false;
    }

    setAntialiasing(enabled) {
        this.antialiasingEnabled = Boolean(enabled);
        if (this.postMaterial && this.postMaterial.uniforms && this.postMaterial.uniforms.uAntialiasingEnabled) {
            this.postMaterial.uniforms.uAntialiasingEnabled.value = this.antialiasingEnabled;
        }
        if (this.mainRenderTarget && this.mainRenderTarget.samples !== undefined) {
            this.mainRenderTarget.samples = this.antialiasingEnabled ? 4 : 0;
        }
    }

    updatePostProcessingUniforms() {
        const lighting = this.dataModel.Lighting;
        const uniforms = this.postMaterial.uniforms;

        uniforms.uNear.value = this.camera.near;
        uniforms.uFar.value = this.camera.far;
        uniforms.uInvProjection.value.copy(this.camera.projectionMatrixInverse);
        uniforms.uInvView.value.copy(this.camera.matrixWorld);

        const sunDir = this.sunLight.position.clone().normalize();
        uniforms.uSunDir.value.copy(sunDir);
        uniforms.uSunColor.value.copy(this.sunLight.color);

        // Sun screen projected position for radial SunRays
        const celestialSunPos = sunDir.clone().multiplyScalar(1200);
        const sunScreen = celestialSunPos.clone().project(this.camera);
        const sunUV = new THREE.Vector2((sunScreen.x + 1) * 0.5, (sunScreen.y + 1) * 0.5);
        const sunInFront = sunScreen.z < 1.0;
        uniforms.uSunScreenPos.value.copy(sunUV);
        uniforms.uSunOnScreen.value = sunInFront && sunUV.x >= -0.3 && sunUV.x <= 1.3 && sunUV.y >= -0.3 && sunUV.y <= 1.3;

        uniforms.tDiffuse.value = this.mainRenderTarget.texture;
        uniforms.tDepth.value = this.mainRenderTarget.depthTexture;

        if (!lighting) return;

        // Atmosphere
        const atmo = lighting.GetChildren().find(c => c.ClassName === 'Atmosphere');
        if (atmo && atmo.Density > 0) {
            uniforms.uAtmosphereEnabled.value = true;
            uniforms.uAtmosphereDensity.value = Number(atmo.Density) || 0.395;
            uniforms.uAtmosphereOffset.value = Number(atmo.Offset) || 0.25;
            const ac = atmo.Color ? (atmo.Color.toRGB ? atmo.Color.toRGB() : { r: 199, g: 212, b: 229 }) : { r: 199, g: 212, b: 229 };
            uniforms.uAtmosphereColor.value.setRGB(ac.r / 255, ac.g / 255, ac.b / 255);
            const dc = atmo.Decay ? (atmo.Decay.toRGB ? atmo.Decay.toRGB() : { r: 106, g: 124, b: 147 }) : { r: 106, g: 124, b: 147 };
            uniforms.uAtmosphereDecay.value.setRGB(dc.r / 255, dc.g / 255, dc.b / 255);
            uniforms.uAtmosphereGlare.value = Number(atmo.Glare) || 0.4;
            uniforms.uAtmosphereHaze.value = Number(atmo.Haze) || 1.0;
        } else {
            uniforms.uAtmosphereEnabled.value = false;
        }

        // Bloom
        const bloom = lighting.GetChildren().find(c => c.ClassName === 'BloomEffect');
        if (bloom && bloom.Enabled) {
            uniforms.uBloomEnabled.value = true;
            uniforms.uBloomIntensity.value = Number(bloom.Intensity) || 1.0;
            uniforms.uBloomSize.value = Number(bloom.Size) || 24;
            uniforms.uBloomThreshold.value = Number(bloom.Threshold) || 1.4;
        } else {
            uniforms.uBloomEnabled.value = false;
        }

        // SunRays
        const sunrays = lighting.GetChildren().find(c => c.ClassName === 'SunRaysEffect');
        if (sunrays && sunrays.Enabled && this.sunRaysQuality !== 'off' && this.sunRaysSamples !== 0) {
            uniforms.uSunRaysEnabled.value = true;
            uniforms.uSunRaysIntensity.value = Number(sunrays.Intensity) || 0.25;
            uniforms.uSunRaysSpread.value = Number(sunrays.Spread) || 0.75;
        } else {
            uniforms.uSunRaysEnabled.value = false;
        }

        // DepthOfField
        const dof = lighting.GetChildren().find(c => c.ClassName === 'DepthOfFieldEffect');
        if (dof && dof.Enabled) {
            uniforms.uDofEnabled.value = true;
            uniforms.uDofFocusDistance.value = Number(dof.FocusDistance) || 25;
            uniforms.uDofInFocusRadius.value = Number(dof.InFocusRadius) || 15;
            uniforms.uDofNearIntensity.value = Number(dof.NearIntensity) || 0.5;
            uniforms.uDofFarIntensity.value = Number(dof.FarIntensity) || 0.5;
        } else {
            uniforms.uDofEnabled.value = false;
        }
    }

    render(dt = 0.016) {
        // Dynamic AAA Shadow Camera Frustum Tracking (Unreal Engine / Unity standard)
        this.updateShadowFrustum(dt);

        if (this.skyGroup && this.camera) {
            this.skyGroup.position.copy(this.camera.position);
        }

        if (this.cloudsPlane && this.camera) {
            this.cloudsPlane.position.set(this.camera.position.x, 440, this.camera.position.z);
            if (this.cloudsMaterial) {
                // Clouds only drift very slowly and ONLY when the simulation is playing!
                if (this.isPlayMode) {
                    let speed = 1.0;
                    const ws = this.dataModel ? this.dataModel.Workspace : null;
                    if (ws) {
                        const cl = ws.FindFirstChildOfClass ? ws.FindFirstChildOfClass('Clouds') : (ws.GetChildren ? ws.GetChildren().find(c => c.ClassName === 'Clouds') : null);
                        if (cl && cl.Speed !== undefined) speed = Number(cl.Speed);
                    }
                    this.cloudsDriftTime = (this.cloudsDriftTime || 0) + (dt || 0.016) * 0.035 * speed;
                }
                this.cloudsMaterial.uniforms.uTime.value = this.cloudsDriftTime || 0;
                this.cloudsMaterial.uniforms.uCameraPos.value.copy(this.camera.position);
                this.cloudsMaterial.uniforms.uSunDir.value.copy(this.sunLightDirection || this.sunLight.position).normalize();
                this.cloudsMaterial.uniforms.uSunColor.value.copy(this.sunLight.color);
                this.cloudsMaterial.uniforms.uAmbientColor.value.copy(this.ambientLight.color);
            }
        }

        const hasPost = this.hasActivePostEffects();

        if (hasPost && this.mainRenderTarget && this.postMaterial && this.postScene && this.postCamera) {
            this.renderer.setRenderTarget(this.mainRenderTarget);
            this.renderer.render(this.scene, this.camera);

            // Execute True Multi-Pass Dual Kawase Mip-Chain Pyramid Bloom (Unreal Engine / Unity standard)
            const lighting = this.dataModel.Lighting;
            const bloom = lighting ? lighting.GetChildren().find(c => c.ClassName === 'BloomEffect') : null;
            if (bloom && bloom.Enabled && Number(bloom.Intensity) > 0 && this.bloomQuality !== 'off') {
                const threshold = (bloom.Threshold !== undefined && !isNaN(Number(bloom.Threshold))) ? Number(bloom.Threshold) : 1.1;
                const size = (bloom.Size !== undefined && !isNaN(Number(bloom.Size))) ? Number(bloom.Size) : 24;
                const radius = Math.max(0.4, Math.min(2.5, size / 24.0));
                const knee = 0.3;
                const bloomTex = this.renderBloomPyramid(this.mainRenderTarget.texture, threshold, knee, radius);
                this.postMaterial.uniforms.tBloom.value = bloomTex;
            } else {
                this.postMaterial.uniforms.tBloom.value = null;
            }

            this.updatePostProcessingUniforms();

            this.renderer.setRenderTarget(null);
            this.renderer.render(this.postScene, this.postCamera);
        } else {
            this.renderer.setRenderTarget(null);
            this.renderer.render(this.scene, this.camera);
        }
    }

    // ─── AAA SHADOWS & GRAPHICS FIDELITY SYSTEM ─────────────────────────

    getShadowFocusCenter() {
        if (this.isPlayMode && this.characterController && this.characterController.rootPart && this.characterController.rootPart.Position) {
            const p = this.characterController.rootPart.Position;
            return new THREE.Vector3(p.x, p.y + 2, p.z);
        }
        if (this.orbitTarget) {
            return this.orbitTarget.clone();
        }
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        return this.camera.position.clone().addScaledVector(forward, 25);
    }

    updateShadowFrustum(dt = 0.016) {
        if (!this.sunLight || !this.sunLight.castShadow) return;

        if (this.shadowFollowEnabled) {
            const targetPos = this.getShadowFocusCenter();
            if (!this.shadowFocus) {
                this.shadowFocus = targetPos.clone();
            } else {
                this.shadowFocus.lerp(targetPos, Math.min(1.0, (dt || 0.016) * 15.0));
            }

            if (this.sunLight.target) {
                this.sunLight.target.position.copy(this.shadowFocus);
                this.sunLight.target.updateMatrixWorld();
            }

            const sunDir = this.sunLightDirection || new THREE.Vector3(120, 240, 90).normalize();
            this.sunLight.position.copy(this.shadowFocus).addScaledVector(sunDir, 280);
            this.sunLight.updateMatrixWorld();
        }
    }

    applyGraphicsSettings(settings) {
        if (!settings) return;
        if (settings.graphicsLevel !== undefined) {
            this.setGraphicsLevel(settings.graphicsLevel);
        }
        if (settings.shadowQuality !== undefined) {
            if (settings.shadowQuality === 'off') {
                this.setShadowsEnabled(false);
            } else {
                this.setShadowsEnabled(true);
                const res = parseInt(settings.shadowQuality, 10);
                if (!isNaN(res)) this.setShadowResolution(res);
            }
        }
        if (settings.shadowSoftness !== undefined) {
            this.setShadowSoftness(Number(settings.shadowSoftness));
        }
        if (settings.shadowNormalBias !== undefined) {
            this.setShadowNormalBias(Number(settings.shadowNormalBias));
        }
        if (settings.shadowFrustumRadius !== undefined) {
            this.setShadowFrustumRadius(Number(settings.shadowFrustumRadius));
        }
        if (settings.shadowFollow !== undefined) {
            this.shadowFollowEnabled = Boolean(settings.shadowFollow);
        }
        if (settings.bloomQuality !== undefined) {
            this.bloomQuality = settings.bloomQuality;
            if (settings.bloomQuality === 'basic') this.bloomMips = 3;
            else if (settings.bloomQuality === 'cinematic') this.bloomMips = 5;
            if (this.initBloomPyramid && this.container) {
                const pr = this.renderer ? (this.renderer.getPixelRatio() || 1) : 1;
                this.initBloomPyramid(Math.floor(this.container.clientWidth * pr), Math.floor(this.container.clientHeight * pr));
            }
        }
        if (settings.sunRaysSamples !== undefined) {
            this.sunRaysSamples = parseInt(settings.sunRaysSamples, 10);
            this.sunRaysQuality = (this.sunRaysSamples > 0) ? 'on' : 'off';
        }
        if (settings.pixelRatio !== undefined) {
            this.setPixelRatioScale(settings.pixelRatio);
        }
        if (settings.antialiasing !== undefined) {
            this.setAntialiasing(Boolean(settings.antialiasing));
        }
    }

    setGraphicsLevel(level) {
        level = Math.max(1, Math.min(21, Math.round(Number(level) || 16)));
        this.graphicsLevel = level;

        // Antialiasing: enabled on Medium and above (level >= 9), removed below medium (< 9)
        const aaEnabled = (level >= 9);
        this.setAntialiasing(aaEnabled);

        if (level < 9) {
            // Below Medium (Level 1-8): Antialiasing removed, low/budget fidelity
            this.setShadowsEnabled(level >= 5);
            this.setShadowResolution(512);
            this.setShadowFrustumRadius(140);
            this.setShadowSoftness(1.0);
            this.setShadowNormalBias(0.02);
            this.bloomQuality = level >= 5 ? 'basic' : 'off';
            this.bloomMips = level >= 5 ? 3 : 2;
            this.sunRaysQuality = 'off';
            this.sunRaysSamples = 0;
            this.setPixelRatioScale('1.0');
        } else if (level <= 15) {
            // Level 10-15: High Fidelity (Roblox Studio Standard)
            this.setShadowsEnabled(true);
            this.setShadowResolution(2048);
            this.setShadowFrustumRadius(80);
            this.setShadowSoftness(2.4);
            this.setShadowNormalBias(0.035);
            this.bloomQuality = 'basic';
            this.bloomMips = 4;
            this.sunRaysQuality = 'on';
            this.sunRaysSamples = 24;
            this.setPixelRatioScale('1.5');
        } else if (level <= 20) {
            // Level 16-20: Ultra HD (Unity HDRP quality)
            this.setShadowsEnabled(true);
            this.setShadowResolution(4096);
            this.setShadowFrustumRadius(60);
            this.setShadowSoftness(2.8);
            this.setShadowNormalBias(0.045);
            this.bloomQuality = 'cinematic';
            this.bloomMips = 5;
            this.sunRaysQuality = 'on';
            this.sunRaysSamples = 36;
            this.setPixelRatioScale('native');
        } else {
            // Level 21: Cinematic AAA (Unreal Engine 5 standard)
            this.setShadowsEnabled(true);
            this.setShadowResolution(4096);
            this.setShadowFrustumRadius(48);
            this.setShadowSoftness(3.2);
            this.setShadowNormalBias(0.048);
            this.bloomQuality = 'cinematic';
            this.bloomMips = 5;
            this.sunRaysQuality = 'on';
            this.sunRaysSamples = 36;
            this.setPixelRatioScale('native');
        }

        if (this.initBloomPyramid && this.container) {
            const pr = this.renderer ? (this.renderer.getPixelRatio() || 1) : 1;
            this.initBloomPyramid(Math.floor(this.container.clientWidth * pr), Math.floor(this.container.clientHeight * pr));
        }
    }

    setShadowsEnabled(enabled) {
        if (this.sunLight) this.sunLight.castShadow = Boolean(enabled);
        if (this.renderer) this.renderer.shadowMap.enabled = Boolean(enabled);
    }

    setShadowResolution(res) {
        if (!this.sunLight || !this.sunLight.shadow) return;
        res = parseInt(res, 10);
        if (this.sunLight.shadow.mapSize.width === res && this.sunLight.shadow.mapSize.height === res) return;
        this.sunLight.shadow.mapSize.width = res;
        this.sunLight.shadow.mapSize.height = res;
        if (this.sunLight.shadow.map) {
            this.sunLight.shadow.map.dispose();
            this.sunLight.shadow.map = null;
        }
    }

    setShadowFrustumRadius(d) {
        this.shadowFrustumRadius = d;
        if (this.sunLight && this.sunLight.shadow && this.sunLight.shadow.camera) {
            this.sunLight.shadow.camera.left = -d;
            this.sunLight.shadow.camera.right = d;
            this.sunLight.shadow.camera.top = d;
            this.sunLight.shadow.camera.bottom = -d;
            this.sunLight.shadow.camera.updateProjectionMatrix();
        }
    }

    setShadowSoftness(radius) {
        if (this.sunLight && this.sunLight.shadow) {
            this.sunLight.shadow.radius = Math.max(0.1, Number(radius) || 1.0);
        }
    }

    setShadowNormalBias(bias) {
        if (this.sunLight && this.sunLight.shadow) {
            this.sunLight.shadow.normalBias = Math.max(0, Number(bias) || 0.02);
        }
    }

    setPixelRatioScale(scale) {
        if (!this.renderer) return;
        let pr = 1.0;
        if (scale === 'native') {
            pr = Math.min(window.devicePixelRatio || 1, 2.0);
        } else if (scale === '1.5') {
            pr = Math.min(window.devicePixelRatio || 1, 1.5);
        } else {
            pr = 1.0;
        }
        this.renderer.setPixelRatio(pr);
        this.onResize();
    }
}
