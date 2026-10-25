/**
 * Conblox Character Controller & Avatar
 * Authentic Roblox-style R6 character, third-person camera with collision, and smooth movement
 *
 * Camera: Spherical orbit around character head. Right-click drag to orbit.
 *   Scroll to zoom. Camera collision prevents clipping through walls/objects.
 *   Pitch clamped to [-80°, +80°]. Default distance ~12 studs.
 *
 * Movement: WASD moves character relative to camera horizontal facing.
 *   Instant stop when keys released. Character smoothly turns to face movement direction.
 *   WalkSpeed = 16 studs/sec. Space to jump with strict ground detection (no infinite jumps).
 *
 * Avatar: Classic R6 body parts positioned rigidly relative to HumanoidRootPart.
 *   No animations (static pose per user request).
 */

import { Vector3, Color3 } from './Math3D.js';
import { Instance } from './Instance.js';
import { Signal } from './Signal.js';
import { Model, Humanoid, Decal, Motor6D } from './OtherInstances.js';
import { Part } from './BasePart.js';
import { nativeInputManager } from './NativeInputManager.js';

export class CharacterController {
    constructor(dataModel, physicsEngine, soundEngine, viewport = null) {
        this.dataModel = dataModel;
        this.physicsEngine = physicsEngine;
        this.soundEngine = soundEngine;
        this.viewport = viewport;

        this.character = null;
        this.humanoid = null;
        this.rootPart = null;
        this.parts = {};
        this.active = false;
        this.isPaused = false;
        this.isDead = false;

        // Input state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
        };
        this.jumpConsumed = false; // prevents auto-repeating jumps without landing
        this.lastJumpTime = 0;
        this.isJumping = false;

        // Camera orbit state (spherical coordinates)
        // yaw: horizontal angle around Y axis. 0 = looking at character from behind along -Z
        // pitch: vertical angle. Positive = looking down. Negative = looking up.
        this.cameraYaw = 0;
        this.cameraPitch = 0.3; // ~17° looking slightly down from behind
        this.cameraDistance = 12;
        this.targetCameraDistance = 12;
        this.minCameraDistance = 0;
        this.maxCameraDistance = 40;
        this.isFirstPerson = false;

        // Camera focus offset above rootPart center (looks at upper chest / head)
        this.cameraFocusOffsetY = 1.5;

        // Character facing yaw (radians, world Y-axis rotation)
        this.characterYaw = 0;

        // Mouse control
        this.isRightMouseDown = false;
        this.isOrbitMouseDown = false;
        this.isHovered = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Bind event methods
        this.onKeyDown = this._onKeyDown.bind(this);
        this.onKeyUp = this._onKeyUp.bind(this);
        this.onMouseDown = this._onMouseDown.bind(this);
        this.onMouseMove = this._onMouseMove.bind(this);
        this.onMouseUp = this._onMouseUp.bind(this);
        this.onWheel = this._onWheel.bind(this);
        this.onContextMenu = (e) => { if (this.active) e.preventDefault(); };
    }

    // ─── SPAWN / DESPAWN ───────────────────────────────────────────

    spawn(atPosition = null) {
        this.despawn();
        this.isDead = false;

        // Find spawn location surface Y or default to baseplate surface
        let spawnSurfaceY = 0;
        let spawnX = 0;
        let spawnZ = 0;
        const spawns = this.dataModel.Workspace.GetDescendants().filter(i => i.ClassName === 'SpawnLocation');
        if (spawns.length > 0) {
            const sp = spawns[0];
            spawnSurfaceY = sp.Position.y + sp.Size.y / 2;
            spawnX = sp.Position.x;
            spawnZ = sp.Position.z;
        }

        // R6 character total height = 5 studs (legs 2 + torso 2 + head 1.25)
        // RootPart center Y = spawnSurfaceY + 2.5
        const rootCenterY = atPosition ? atPosition.y : spawnSurfaceY + 2.5;
        if (atPosition) {
            spawnX = atPosition.x;
            spawnZ = atPosition.z;
        }

        // Create Character Model
        const char = new Model();
        char.Name = 'Player';

        // Humanoid
        this.humanoid = new Humanoid();
        this.humanoid.WalkSpeed = 16;
        this.humanoid.JumpPower = 50;
        this.humanoid.MaxHealth = 100;
        this.humanoid.Health = 100;
        this.humanoid.Parent = char;

        // HumanoidRootPart (invisible physics collider)
        const rootPart = new Part();
        rootPart.Name = 'HumanoidRootPart';
        rootPart.Size = new Vector3(2, 5, 1);
        rootPart.Position = new Vector3(spawnX, rootCenterY, spawnZ);
        rootPart.Transparency = 1;
        rootPart.Anchored = false;
        rootPart.CanCollide = true;
        rootPart.CastShadow = false;
        rootPart.Locked = true;
        rootPart.Parent = char;

        // Visible body parts — authentic Roblox R6 character parts
        const torso = new Part();
        torso.Name = 'Torso';
        torso.Size = new Vector3(2, 2, 1);
        torso.Position = new Vector3(spawnX, rootCenterY + 0.5, spawnZ);
        torso.Color = Color3.fromRGB(13, 105, 172);
        torso.Material = 'SmoothPlastic';
        torso.Transparency = 0;
        torso.Anchored = false;
        torso.CanCollide = false;
        torso.CastShadow = true;
        torso.Locked = true;
        torso.Parent = char;

        const head = new Part();
        head.Name = 'Head';
        head.Size = new Vector3(2, 1.25, 1.25);
        head.Position = new Vector3(spawnX, rootCenterY + 2.1, spawnZ);
        head.Color = Color3.fromRGB(245, 205, 47);
        head.Material = 'SmoothPlastic';
        head.Transparency = 0;
        head.Anchored = false;
        head.CanCollide = false;
        head.CastShadow = true;
        head.Locked = true;
        head.Parent = char;

        // Face Decal on Head
        const face = new Decal();
        face.Name = 'face';
        face.Face = 'Front';
        face.Parent = head;

        const leftArm = new Part();
        leftArm.Name = 'Left Arm';
        leftArm.Size = new Vector3(1, 2, 1);
        leftArm.Position = new Vector3(spawnX - 1.5, rootCenterY + 0.5, spawnZ);
        leftArm.Color = Color3.fromRGB(245, 205, 47);
        leftArm.Material = 'SmoothPlastic';
        leftArm.Transparency = 0;
        leftArm.Anchored = false;
        leftArm.CanCollide = false;
        leftArm.CastShadow = true;
        leftArm.Locked = true;
        leftArm.Parent = char;

        const rightArm = new Part();
        rightArm.Name = 'Right Arm';
        rightArm.Size = new Vector3(1, 2, 1);
        rightArm.Position = new Vector3(spawnX + 1.5, rootCenterY + 0.5, spawnZ);
        rightArm.Color = Color3.fromRGB(245, 205, 47);
        rightArm.Material = 'SmoothPlastic';
        rightArm.Transparency = 0;
        rightArm.Anchored = false;
        rightArm.CanCollide = false;
        rightArm.CastShadow = true;
        rightArm.Locked = true;
        rightArm.Parent = char;

        const leftLeg = new Part();
        leftLeg.Name = 'Left Leg';
        leftLeg.Size = new Vector3(1, 2, 1);
        leftLeg.Position = new Vector3(spawnX - 0.5, rootCenterY - 1.5, spawnZ);
        leftLeg.Color = Color3.fromRGB(40, 127, 70);
        leftLeg.Material = 'SmoothPlastic';
        leftLeg.Transparency = 0;
        leftLeg.Anchored = false;
        leftLeg.CanCollide = false;
        leftLeg.CastShadow = true;
        leftLeg.Locked = true;
        leftLeg.Parent = char;

        const rightLeg = new Part();
        rightLeg.Name = 'Right Leg';
        rightLeg.Size = new Vector3(1, 2, 1);
        rightLeg.Position = new Vector3(spawnX + 0.5, rootCenterY - 1.5, spawnZ);
        rightLeg.Color = Color3.fromRGB(40, 127, 70);
        rightLeg.Material = 'SmoothPlastic';
        rightLeg.Transparency = 0;
        rightLeg.Anchored = false;
        rightLeg.CanCollide = false;
        rightLeg.CastShadow = true;
        rightLeg.Locked = true;
        rightLeg.Parent = char;

        // Authentic Roblox R6 Motor6D joints connecting all body parts to HumanoidRootPart
        // RootJoint: HumanoidRootPart -> Torso
        const rootJoint = new Motor6D();
        rootJoint.Name = 'RootJoint';
        rootJoint.Part0 = rootPart;
        rootJoint.Part1 = torso;
        rootJoint.Parent = rootPart;

        // Neck: Torso -> Head
        const neck = new Motor6D();
        neck.Name = 'Neck';
        neck.Part0 = torso;
        neck.Part1 = head;
        neck.Parent = torso;

        // Left Shoulder: Torso -> Left Arm
        const leftShoulder = new Motor6D();
        leftShoulder.Name = 'Left Shoulder';
        leftShoulder.Part0 = torso;
        leftShoulder.Part1 = leftArm;
        leftShoulder.Parent = torso;

        // Right Shoulder: Torso -> Right Arm
        const rightShoulder = new Motor6D();
        rightShoulder.Name = 'Right Shoulder';
        rightShoulder.Part0 = torso;
        rightShoulder.Part1 = rightArm;
        rightShoulder.Parent = torso;

        // Left Hip: Torso -> Left Leg
        const leftHip = new Motor6D();
        leftHip.Name = 'Left Hip';
        leftHip.Part0 = torso;
        leftHip.Part1 = leftLeg;
        leftHip.Parent = torso;

        // Right Hip: Torso -> Right Leg
        const rightHip = new Motor6D();
        rightHip.Name = 'Right Hip';
        rightHip.Part0 = torso;
        rightHip.Part1 = rightLeg;
        rightHip.Parent = torso;

        char.PrimaryPart = rootPart;
        char.Parent = this.dataModel.Workspace;

        this.character = char;
        this.rootPart = rootPart;
        this.parts = { rootPart, torso, head, leftArm, rightArm, leftLeg, rightLeg };

        // Connect Character Model to LocalPlayer
        if (this.dataModel.Players) {
            if (!this.dataModel.Players.LocalPlayer) {
                const localPlayer = new Instance('Player');
                localPlayer.Name = 'Player';
                localPlayer.CharacterAdded = new Signal();
                localPlayer.Parent = this.dataModel.Players;
                this.dataModel.Players.LocalPlayer = localPlayer;
            }
            this.dataModel.Players.LocalPlayer.Character = char;
            if (this.dataModel.Players.LocalPlayer.CharacterAdded) {
                this.dataModel.Players.LocalPlayer.CharacterAdded.Fire(char);
            }
        }

        // Default CameraSubject to spawned character humanoid
        if (this.dataModel.Workspace && this.dataModel.Workspace.CurrentCamera) {
            this.dataModel.Workspace.CurrentCamera.CameraSubject = this.humanoid || char;
        }
        this.currentCameraFocus = new THREE.Vector3(spawnX, rootCenterY + this.cameraFocusOffsetY, spawnZ);
        this.currentCameraSubject = this.humanoid || char;
        this.subjectTransitionOffset = null;
        this.isRightMouseDown = false;
        this.isOrbitMouseDown = false;

        // Authentic Roblox: Move/clone all items from StarterPlayer.StarterCharacterScripts into Character
        const starterPlayer = this.dataModel.StarterPlayer;
        if (starterPlayer && starterPlayer.StarterCharacterScripts) {
            for (const item of starterPlayer.StarterCharacterScripts.GetChildren()) {
                const cloned = item.Clone();
                if (cloned) {
                    cloned.Parent = char;
                    // If the object is a Script or LocalScript, execute it only upon entering the character
                    if ((cloned.ClassName === 'Script' || cloned.ClassName === 'LocalScript') && window.conbloxStudio?.scriptRunner) {
                        window.conbloxStudio.scriptRunner.runScript(cloned);
                    }
                }
            }
        }

        // Humanoid death handler
        this.humanoid.Died.Connect(() => {
            this._handleDeath();
        });

        // Add physics body
        if (this.physicsEngine && this.physicsEngine.running) {
            this.physicsEngine.addPart(rootPart);
            const body = this.physicsEngine.bodyMap.get(rootPart);
            if (body) {
                if (this.physicsEngine.characterMaterial) {
                    body.material = this.physicsEngine.characterMaterial;
                }
                body.mass = 80;
                body.linearDamping = 0;
                body.angularDamping = 1;
                body.fixedRotation = true;
                body.angularFactor = new CANNON.Vec3(0, 0, 0);
                body.updateMassProperties();
            }
        }

        // Reset camera and character state
        this.cameraYaw = 0; // behind character looking along -Z
        this.cameraPitch = 0.3;
        this.cameraDistance = 12;
        this.targetCameraDistance = 12;
        this.characterYaw = 0;
        this.jumpConsumed = false;
        this.lastJumpTime = 0;
        this.isJumping = false;

        this.active = true;
        this.resetKeys();
        this._bindEvents();
    }

    handleDeath() {
        this._handleDeath();
    }

    _handleDeath() {
        if (this.isDead) return;
        this.isDead = true;

        if (this.soundEngine) {
            this.soundEngine.playOof();
        }

        // Break apart limbs
        for (const [name, part] of Object.entries(this.parts)) {
            if (part && part !== this.rootPart) {
                part.CanCollide = true;
                part.Anchored = false;
                if (this.physicsEngine && this.physicsEngine.running) {
                    this.physicsEngine.addPart(part);
                    const b = this.physicsEngine.bodyMap.get(part);
                    if (b) {
                        b.velocity.set(
                            (Math.random() - 0.5) * 16,
                            Math.random() * 12 + 4,
                            (Math.random() - 0.5) * 16
                        );
                    }
                }
            }
        }

        // Respawn after delay
        setTimeout(() => {
            if (this.active) {
                this.spawn();
            }
        }, 1500);
    }

    despawn() {
        this.active = false;
        this.resetKeys();
        this._unbindEvents();
        this.isRightMouseDown = false;
        this.isOrbitMouseDown = false;
        nativeInputManager.unlock({ restorePos: true });

        if (this.character) {
            if (this.dataModel.Players && this.dataModel.Players.LocalPlayer) {
                this.dataModel.Players.LocalPlayer.Character = null;
            }
            this.character.Destroy();
            this.character = null;
            this.rootPart = null;
            this.humanoid = null;
            this.parts = {};
        }
        this.currentCameraFocus = null;
        this.currentCameraSubject = null;
        this.subjectTransitionOffset = null;
    }

    // ─── INPUT EVENTS ──────────────────────────────────────────────

    resetKeys() {
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
        };
        this.jumpConsumed = false;
        this.isJumping = false;
        this.isRightMouseDown = false;
        this.isOrbitMouseDown = false;
        nativeInputManager.unlock({ restorePos: true });
    }

    setPaused(paused) {
        this.isPaused = Boolean(paused);
        if (this.isPaused) this.resetKeys();
    }

    _bindEvents() {
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('wheel', this.onWheel, { passive: false });
        window.addEventListener('contextmenu', this.onContextMenu);
        this.onWindowBlur = () => this.resetKeys();
        window.addEventListener('blur', this.onWindowBlur);

        const viewportEl = document.getElementById('viewport-3d');
        if (viewportEl) {
            this.onMouseEnter = () => { this.isHovered = true; };
            this.onMouseLeave = () => { this.isHovered = false; };
            viewportEl.addEventListener('mouseenter', this.onMouseEnter);
            viewportEl.addEventListener('mouseleave', this.onMouseLeave);
            this.isHovered = true;
        }
    }

    _unbindEvents() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('wheel', this.onWheel);
        window.removeEventListener('contextmenu', this.onContextMenu);
        if (this.onWindowBlur) window.removeEventListener('blur', this.onWindowBlur);

        const viewportEl = document.getElementById('viewport-3d');
        if (viewportEl && this.onMouseEnter) {
            viewportEl.removeEventListener('mouseenter', this.onMouseEnter);
            viewportEl.removeEventListener('mouseleave', this.onMouseLeave);
        }
    }

    _onKeyDown(e) {
        if (!this.active || this.isPaused || this.isDead) return;
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        switch (e.code) {
            case 'KeyW': case 'ArrowUp':    this.keys.forward = true; break;
            case 'KeyS': case 'ArrowDown':  this.keys.backward = true; break;
            case 'KeyA': case 'ArrowLeft':  this.keys.left = true; break;
            case 'KeyD': case 'ArrowRight': this.keys.right = true; break;
            case 'Space':
                this.keys.jump = true;
                e.preventDefault();
                break;
        }
    }

    _onKeyUp(e) {
        switch (e.code) {
            case 'KeyW': case 'ArrowUp':    this.keys.forward = false; break;
            case 'KeyS': case 'ArrowDown':  this.keys.backward = false; break;
            case 'KeyA': case 'ArrowLeft':  this.keys.left = false; break;
            case 'KeyD': case 'ArrowRight': this.keys.right = false; break;
            case 'Space':
                this.keys.jump = false;
                this.jumpConsumed = false; // allow next jump when space released
                break;
        }
    }

    _onMouseDown(e) {
        if (!this.active || this.isPaused) return;
        const targetEl = this.viewport?.renderer?.domElement || document.getElementById('viewport-3d');

        if (this.isFirstPerson) {
            // First Person: clicking inside viewport seamlessly locks mouse
            nativeInputManager.lock({
                targetEl,
                mode: 'character_first_person',
                clientX: e.clientX,
                clientY: e.clientY,
                screenX: e.screenX,
                screenY: e.screenY
            });
            return;
        }

        // Third Person: ONLY Right Mouse Button (RMB, button === 2) controls camera rotation
        // LMB (button === 0) is strictly disabled for camera rotation
        if (e.button === 2) {
            this.isRightMouseDown = true;
            this.isOrbitMouseDown = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            e.preventDefault();

            nativeInputManager.lock({
                targetEl,
                mode: 'character_rmb',
                clientX: e.clientX,
                clientY: e.clientY,
                screenX: e.screenX,
                screenY: e.screenY
            });
        }
    }

    _onMouseMove(e) {
        if (!this.active || this.isPaused) return;

        // In 3rd person: rotation happens EXCLUSIVELY when holding RMB (button 2)
        // In 1st person: mouse freely rotates camera without holding any buttons
        if (!this.isFirstPerson && !this.isRightMouseDown) return;

        const delta = nativeInputManager.getDelta(e);
        if (delta.isTeleport) return;

        const dx = delta.dx;
        const dy = delta.dy;
        if (dx === 0 && dy === 0) return;

        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;

        const sensitivity = 0.0035;

        // Yaw: mouse right = orbit / look right
        this.cameraYaw -= dx * sensitivity;

        // Pitch: mouse down = look down
        this.cameraPitch += dy * sensitivity;
        const maxPitch = (89 * Math.PI) / 180; // 1.55334 rad ([-89°, +89°])
        this.cameraPitch = Math.max(-maxPitch, Math.min(maxPitch, this.cameraPitch));

        if (this.isFirstPerson) {
            this.characterYaw = this.cameraYaw;
        }
    }

    _onMouseUp(e) {
        if (e.button === 2) {
            this.isRightMouseDown = false;
            this.isOrbitMouseDown = false;
            // Restore default cursor and release lock in third person
            if (!this.isFirstPerson) {
                nativeInputManager.unlock({ mode: 'character_rmb', restorePos: true });
            }
        }
    }

    _onWheel(e) {
        if (!this.active || this.isPaused) return;
        const viewportEl = document.getElementById('viewport-3d');
        if (viewportEl && e.target && !viewportEl.contains(e.target)) return;

        e.preventDefault();
        const zoomStep = Math.max(0.8, this.targetCameraDistance * 0.15);
        this.targetCameraDistance += (e.deltaY > 0 ? zoomStep : -zoomStep);
        this.targetCameraDistance = Math.max(this.minCameraDistance, Math.min(this.maxCameraDistance, this.targetCameraDistance));

        const targetEl = this.viewport?.renderer?.domElement || document.getElementById('viewport-3d');

        if (this.targetCameraDistance <= 0.5) {
            const wasFirstPerson = this.isFirstPerson;
            this.isFirstPerson = true;
            this.targetCameraDistance = 0;
            if (!wasFirstPerson) {
                // First Person entered: seamlessly lock pointer
                nativeInputManager.lock({
                    targetEl,
                    mode: 'character_first_person'
                });
            }
        } else {
            const wasFirstPerson = this.isFirstPerson;
            this.isFirstPerson = false;
            if (wasFirstPerson) {
                // Third Person restored: unlock pointer
                nativeInputManager.unlock({ mode: 'character_first_person', restorePos: true });
            }
        }
    }

    // ─── GROUND DETECTION (STRICT & RELIABLE, NO INFINITE JUMPS) ────

    _isOnGround(body) {
        if (!this.physicsEngine || !this.physicsEngine.world) return false;
        const world = this.physicsEngine.world;

        // If the character is rising rapidly upwards, they are airborne
        if (body.velocity.y > 0.5) {
            return false;
        }

        // 1. Check physical contacts in Cannon simulation
        if (world.contacts && world.contacts.length > 0) {
            for (let i = 0; i < world.contacts.length; i++) {
                const c = world.contacts[i];
                if (c.bi === body && c.ni.y < -0.45) {
                    return true;
                } else if (c.bj === body && c.ni.y > 0.45) {
                    return true;
                }
            }
        }

        // 2. Downward raycasts from 5 sample points on the feet
        // Feet bottom is at body.position.y - 2.5
        const footY = body.position.y - 2.5;
        const rayCheckDist = 0.35; // check 0.35 studs below feet

        // Candidate bodies for ground: exclude player's own body
        const candidateBodies = [];
        for (let i = 0; i < world.bodies.length; i++) {
            const b = world.bodies[i];
            if (b !== body && b.collisionResponse) {
                candidateBodies.push(b);
            }
        }
        if (candidateBodies.length === 0) return false;

        const sampleOffsets = [
            [0, 0],
            [0.55, 0.25],
            [-0.55, 0.25],
            [0.55, -0.25],
            [-0.55, -0.25]
        ];

        const rayResult = new CANNON.RaycastResult();
        for (let i = 0; i < sampleOffsets.length; i++) {
            const [ox, oz] = sampleOffsets[i];
            const from = new CANNON.Vec3(body.position.x + ox, footY + 0.1, body.position.z + oz);
            const to = new CANNON.Vec3(body.position.x + ox, footY - rayCheckDist, body.position.z + oz);

            const ray = new CANNON.Ray(from, to);
            ray.mode = CANNON.Ray.CLOSEST;
            ray.skipBackfaces = true;
            ray.checkCollisionResponse = true;

            rayResult.reset();
            ray.intersectBodies(candidateBodies, rayResult);

            if (rayResult.hasHit) {
                return true;
            }
        }

        return false;
    }

    // ─── CAMERA OCCLUSION / COLLISION ───────────────────────────────

    _computeCameraDistance(focus, dir, desiredDist, viewport) {
        let maxAllowedDist = desiredDist;

        // 1. Raycast against Three.js visual meshes (accurate triangle mesh test)
        const vp = viewport || this.viewport;
        if (vp && vp.partMeshes && typeof THREE !== 'undefined') {
            const candidates = [];
            for (const [part, mesh] of vp.partMeshes.entries()) {
                // Ignore character parts
                if (this.parts && Object.values(this.parts).includes(part)) continue;
                if (this.character && part.IsDescendantOf && part.IsDescendantOf(this.character)) continue;
                // Ignore non-collidable parts
                if (part.CanCollide === false) continue;
                // Ignore fully transparent parts (invisible triggers)
                if (part.Transparency >= 0.95) continue;

                if (mesh && mesh.visible) {
                    candidates.push(mesh);
                }
            }

            if (candidates.length > 0) {
                const threeDir = new THREE.Vector3(dir.x, dir.y, dir.z).normalize();
                const threeFocus = new THREE.Vector3(focus.x, focus.y, focus.z);
                const raycaster = new THREE.Raycaster(threeFocus, threeDir, 0.1, desiredDist);
                const hits = raycaster.intersectObjects(candidates, false);

                if (hits.length > 0) {
                    const hitDist = hits[0].distance;
                    // Buffer of 0.35 studs keeps the camera from clipping into the wall
                    maxAllowedDist = Math.min(maxAllowedDist, Math.max(0.6, hitDist - 0.35));
                }
            }
        }

        // 2. Also test CANNON physics bodies
        if (this.physicsEngine && this.physicsEngine.world && typeof CANNON !== 'undefined') {
            const world = this.physicsEngine.world;
            const body = this.rootPart ? this.physicsEngine.bodyMap.get(this.rootPart) : null;

            const candidateBodies = [];
            for (let i = 0; i < world.bodies.length; i++) {
                const b = world.bodies[i];
                if (b !== body && b.collisionResponse) {
                    candidateBodies.push(b);
                }
            }

            if (candidateBodies.length > 0) {
                const toX = focus.x + dir.x * desiredDist;
                const toY = focus.y + dir.y * desiredDist;
                const toZ = focus.z + dir.z * desiredDist;

                const from = new CANNON.Vec3(focus.x, focus.y, focus.z);
                const to = new CANNON.Vec3(toX, toY, toZ);

                const ray = new CANNON.Ray(from, to);
                ray.mode = CANNON.Ray.CLOSEST;
                ray.skipBackfaces = true;
                ray.checkCollisionResponse = true;

                const result = new CANNON.RaycastResult();
                ray.intersectBodies(candidateBodies, result);

                if (result.hasHit && result.distance < maxAllowedDist) {
                    maxAllowedDist = Math.max(0.6, result.distance - 0.35);
                }
            }
        }

        return maxAllowedDist;
    }

    // ─── MAIN UPDATE LOOP ──────────────────────────────────────────

    update(dt, camera, viewport = null) {
        if (!this.active || !this.rootPart || !this.physicsEngine || this.isDead) return;

        const body = this.physicsEngine.bodyMap.get(this.rootPart);
        if (!body) return;

        if (viewport) {
            this.viewport = viewport;
        }

        // ── Void kill ──
        if (body.position.y < -50) {
            this._handleDeath();
            return;
        }

        // ── Movement Direction ──
        const inputF = (this.keys.forward ? 1 : 0) - (this.keys.backward ? 1 : 0);
        const inputR = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
        const hasInput = (inputF !== 0 || inputR !== 0);

        if (hasInput) {
            const camForwardX = -Math.sin(this.cameraYaw);
            const camForwardZ = -Math.cos(this.cameraYaw);
            const camRightX = Math.cos(this.cameraYaw);
            const camRightZ = -Math.sin(this.cameraYaw);

            let moveX = camForwardX * inputF + camRightX * inputR;
            let moveZ = camForwardZ * inputF + camRightZ * inputR;

            const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
            if (len > 0.001) {
                moveX /= len;
                moveZ /= len;
            }

            const speed = this.humanoid ? (this.humanoid.WalkSpeed !== undefined ? Number(this.humanoid.WalkSpeed) : 16) : 16;
            body.velocity.x = moveX * speed;
            body.velocity.z = moveZ * speed;

            // Target facing direction based on movement (forward is -Z, right is +X)
            if (this.isFirstPerson) {
                this.characterYaw = this.cameraYaw;
            } else {
                const targetYaw = Math.atan2(-moveX, -moveZ);
                // Smooth character rotation towards target direction
                let angleDiff = targetYaw - this.characterYaw;
                angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff)); // shortest path [-PI, PI]
                const turnSpeed = 22; // smooth and responsive Roblox turning
                this.characterYaw += angleDiff * Math.min(1, dt * turnSpeed);
                // Normalize
                this.characterYaw = (this.characterYaw + Math.PI * 3) % (Math.PI * 2) - Math.PI;
            }
        } else {
            if (this.isFirstPerson) {
                this.characterYaw = this.cameraYaw;
            }
            // Immediate crisp stop (no ice skating)
            body.velocity.x = 0;
            body.velocity.z = 0;
        }

        // ── Jump Handling (Continuous jumping when holding Space, strict ground check) ──
        const onGround = this._isOnGround(body);
        const now = performance.now();
        const jumpPower = this.humanoid ? (this.humanoid.JumpPower !== undefined ? Number(this.humanoid.JumpPower) : 50) : 50;
        const canJump = onGround && (now - this.lastJumpTime > 250) && (body.velocity.y <= 0.5) && (jumpPower > 0);

        if (this.keys.jump && canJump) {
            body.velocity.y = jumpPower * 0.38; // Authentic Roblox jump height (~4.8 studs) and snappy instant ascent
            this.lastJumpTime = now;
            this.isJumping = true;
            if (this.soundEngine) {
                this.soundEngine.playJump();
            }
        }

        // Authentic Roblox snappy air physics: eliminate floatiness near apex & during fall
        if (!onGround) {
            if (body.velocity.y < 6) {
                body.velocity.y -= 24 * dt;
            }
        }

        if (onGround && (now - this.lastJumpTime > 250)) {
            this.isJumping = false;
        }

        // ── Keep body upright and facing movement angle ──
        body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), this.characterYaw);

        // ── Position limbs rigidly relative to rootPart ──
        this._positionLimbs(body);

        // Optional direct camera update if camera passed
        if (camera) {
            this.updateCamera(camera, dt, viewport);
        }
    }

    // ─── LIMB POSITIONING ──────────────────────────────────────────

    _positionLimbs(body) {
        const cx = body.position.x;
        const cy = body.position.y;
        const cz = body.position.z;

        const cosY = Math.cos(this.characterYaw);
        const sinY = Math.sin(this.characterYaw);
        const orientDeg = new Vector3(0, (this.characterYaw * 180) / Math.PI, 0);

        const worldPos = (lx, ly, lz) => {
            return new Vector3(
                cx + lx * cosY + lz * sinY,
                cy + ly,
                cz - lx * sinY + lz * cosY
            );
        };

        const vp = this.viewport || (window.conbloxStudio && window.conbloxStudio.viewport);

        const syncTransform = (part, pos) => {
            if (!part) return;
            part.Position = pos;
            part.Orientation = orientDeg;
            if (vp && vp.partMeshes) {
                const mesh = vp.partMeshes.get(part);
                if (mesh) {
                    mesh.position.set(pos.x, pos.y, pos.z);
                    mesh.rotation.set(0, this.characterYaw, 0, 'XYZ');
                    if (this.isFirstPerson) {
                        mesh.visible = false;
                    } else {
                        mesh.visible = (part !== this.rootPart);
                    }
                }
            }
        };

        if (this.rootPart) {
            syncTransform(this.rootPart, new Vector3(cx, cy, cz));
        }
        if (this.parts.torso) {
            syncTransform(this.parts.torso, worldPos(0, 0.5, 0));
        }
        if (this.parts.head) {
            syncTransform(this.parts.head, worldPos(0, 2.1, 0));
        }
        if (this.parts.leftArm) {
            syncTransform(this.parts.leftArm, worldPos(-1.5, 0.5, 0));
        }
        if (this.parts.rightArm) {
            syncTransform(this.parts.rightArm, worldPos(1.5, 0.5, 0));
        }
        if (this.parts.leftLeg) {
            syncTransform(this.parts.leftLeg, worldPos(-0.5, -1.5, 0));
        }
        if (this.parts.rightLeg) {
            syncTransform(this.parts.rightLeg, worldPos(0.5, -1.5, 0));
        }
    }

    // ─── CAMERA ────────────────────────────────────────────────────

    updateCamera(camera, dt = 0.016, viewport = null) {
        if (!camera) return;
        if (!this.active && !this.character) return;

        const body = (this.physicsEngine?.bodyMap && this.rootPart)
            ? this.physicsEngine.bodyMap.get(this.rootPart)
            : null;

        // Current actual position of the character root in this frame (synchronized with physics & render)
        const rootPos = this.rootPart?.Position || (body?.position ? new Vector3(body.position.x, body.position.y, body.position.z) : new Vector3(0, 3, 0));

        const currentCam = this.dataModel?.Workspace?.CurrentCamera;
        let subj = currentCam?.CameraSubject;
        if (subj && subj.Parent === null && subj !== this.dataModel) {
            subj = null;
            if (currentCam) currentCam.CameraSubject = this.humanoid || this.character;
        }
        if (!subj) {
            subj = this.humanoid || this.character;
        }

        const isFocusingPlayer = (!subj || subj === this.humanoid || subj === this.character || subj === this.rootPart);

        let targetX = rootPos.x;
        let targetY = rootPos.y + this.cameraFocusOffsetY;
        let targetZ = rootPos.z;

        if (!isFocusingPlayer && subj) {
            if (subj.IsA && subj.IsA('Humanoid')) {
                const charModel = subj.Parent;
                const root = charModel?.FindFirstChild?.('HumanoidRootPart') || charModel?.FindFirstChild?.('Torso') || charModel?.PrimaryPart;
                if (root && root.Position) {
                    targetX = root.Position.x;
                    targetY = root.Position.y + 1.5;
                    targetZ = root.Position.z;
                }
            } else if (subj.IsA && subj.IsA('BasePart') && subj.Position) {
                targetX = subj.Position.x;
                targetY = subj.Position.y;
                targetZ = subj.Position.z;
            } else if (subj.IsA && subj.IsA('Model')) {
                const part = subj.PrimaryPart || subj.GetDescendants().find(d => d.IsA && d.IsA('BasePart'));
                if (part && part.Position) {
                    targetX = part.Position.x;
                    targetY = part.Position.y;
                    targetZ = part.Position.z;
                }
            }
        }

        const desiredTarget = new THREE.Vector3(targetX, targetY, targetZ);

        // Subject transition smoothing:
        // When CameraSubject changes to another object, smoothly interpolate transition offset to 0.
        // When following the same subject (especially the player running), tracking is 1:1 synchronized with rootPart!
        if (this.currentCameraSubject !== subj) {
            if (this.currentCameraFocus) {
                this.subjectTransitionOffset = this.currentCameraFocus.clone().sub(desiredTarget);
            } else {
                this.subjectTransitionOffset = new THREE.Vector3(0, 0, 0);
            }
            this.currentCameraSubject = subj;
        }

        if (this.subjectTransitionOffset && this.subjectTransitionOffset.lengthSq() > 0.0001) {
            this.subjectTransitionOffset.lerp(new THREE.Vector3(0, 0, 0), Math.min(1, dt * 14));
            this.currentCameraFocus = desiredTarget.clone().add(this.subjectTransitionOffset);
        } else {
            this.subjectTransitionOffset = null;
            this.currentCameraFocus = desiredTarget.clone();
        }

        const focusX = this.currentCameraFocus.x;
        const focusY = this.currentCameraFocus.y;
        const focusZ = this.currentCameraFocus.z;

        const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);
        const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -this.cameraPitch);
        const qCam = qYaw.multiply(qPitch);

        if (this.isFirstPerson && isFocusingPlayer) {
            this.cameraDistance = 0;
            const eyeY = rootPos.y + 2.1; // Head eye level
            camera.position.set(rootPos.x, eyeY, rootPos.z);
            camera.quaternion.copy(qCam);
            this.characterYaw = this.cameraYaw;
        } else {
            // Direction from focus to camera (backward)
            const backward = new THREE.Vector3(0, 0, 1).applyQuaternion(qCam);
            const dir = { x: backward.x, y: backward.y, z: backward.z };

            // Camera collision check
            const targetDist = (this.isFirstPerson && !isFocusingPlayer) ? 10 : this.targetCameraDistance;
            const allowedDist = this._computeCameraDistance(
                { x: focusX, y: focusY, z: focusZ },
                dir,
                targetDist,
                viewport
            );

            // When obstructed by a wall: snap closer immediately to prevent any clipping
            // When unobstructed: smoothly zoom back out towards desired distance
            if (allowedDist < this.cameraDistance) {
                this.cameraDistance = allowedDist;
            } else {
                this.cameraDistance += (allowedDist - this.cameraDistance) * Math.min(1, dt * 12);
            }

            const camX = focusX + backward.x * this.cameraDistance;
            const camY = focusY + backward.y * this.cameraDistance;
            const camZ = focusZ + backward.z * this.cameraDistance;

            camera.position.set(camX, camY, camZ);
            camera.quaternion.copy(qCam);
        }

        if (viewport && viewport.syncWorkspaceCamera) {
            viewport.syncWorkspaceCamera();
        }
    }

    _updateCamera(camera, body, dt = 0.016, viewport = null) {
        return this.updateCamera(camera, dt, viewport);
    }
}
