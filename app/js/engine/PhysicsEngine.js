/**
 * Conblox Physics Engine
 * Bridges Cannon.js with the Conblox DataModel
 */

import { Vector3, Color3 } from './Math3D.js';

export class PhysicsEngine {
    constructor(dataModel) {
        this.dataModel = dataModel;
        this.world = null;
        this.bodyMap = new Map(); // Part -> CANNON.Body
        this.reverseMap = new Map(); // CANNON.Body -> Part
        this.running = false;
        this.gravityScale = 35; // Responsive Roblox feel
        this.isSyncing = false;
    }

    init() {
        if (typeof CANNON === 'undefined') {
            console.warn('CANNON.js is not loaded');
            return;
        }

        this.world = new CANNON.World();
        this.world.gravity.set(0, -this.gravityScale, 0);
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 10;
        this.world.defaultContactMaterial.friction = 0.0;
        this.world.defaultContactMaterial.restitution = 0.0;

        // Character material with zero friction for responsive, unhindered ground movement
        this.characterMaterial = new CANNON.Material('characterMaterial');
        this.characterMaterial.friction = 0.0;
        this.characterMaterial.restitution = 0.0;

        // Part material with realistic physical friction for props/blocks
        this.partMaterial = new CANNON.Material('partMaterial');
        this.partMaterial.friction = 0.4;
        this.partMaterial.restitution = 0.15;

        // Part against Part
        const partPartContact = new CANNON.ContactMaterial(this.partMaterial, this.partMaterial, {
            friction: 0.4,
            restitution: 0.15
        });
        this.world.addContactMaterial(partPartContact);

        // Character against Part: ZERO friction
        const charPartContact = new CANNON.ContactMaterial(this.characterMaterial, this.partMaterial, {
            friction: 0.0,
            restitution: 0.0
        });
        this.world.addContactMaterial(charPartContact);

        // Character against Character
        const charCharContact = new CANNON.ContactMaterial(this.characterMaterial, this.characterMaterial, {
            friction: 0.0,
            restitution: 0.0
        });
        this.world.addContactMaterial(charCharContact);
    }

    start() {
        this.init();
        this.buildPhysicsWorld();
        this.running = true;

        if (this.dataModel && this.dataModel.Workspace) {
            this.descendantAddedConn = this.dataModel.Workspace.DescendantAdded.Connect((inst) => {
                if (this.running && inst && inst.IsA && inst.IsA('BasePart')) {
                    this.addPart(inst);
                }
            });
            this.descendantRemovedConn = this.dataModel.Workspace.DescendantRemoved.Connect((inst) => {
                if (inst && inst.IsA && inst.IsA('BasePart')) {
                    this.removePart(inst);
                }
            });
        }
    }

    stop() {
        this.running = false;
        if (this.descendantAddedConn) {
            this.descendantAddedConn.Disconnect();
            this.descendantAddedConn = null;
        }
        if (this.descendantRemovedConn) {
            this.descendantRemovedConn.Disconnect();
            this.descendantRemovedConn = null;
        }
        this.clear();
    }

    clear() {
        if (!this.world) return;
        for (const [part, body] of this.bodyMap.entries()) {
            this.world.removeBody(body);
        }
        this.bodyMap.clear();
        this.reverseMap.clear();
        this.world = null;
    }

    buildPhysicsWorld() {
        if (!this.world) return;
        const workspace = this.dataModel.Workspace;
        const parts = workspace.GetDescendants().filter(i => i.IsA('BasePart'));

        for (const part of parts) {
            this.addPart(part);
        }
    }

    attachShapeToBody(body, part) {
        const size = part.Size;
        if (part.Shape === 'Ball') {
            const radius = Math.max(0.1, size.x / 2);
            body.addShape(new CANNON.Sphere(radius));
        } else if (part.Shape === 'Cylinder') {
            const radius = Math.max(0.1, size.x / 2);
            const height = Math.max(0.1, size.y);
            const shape = new CANNON.Cylinder(radius, radius, height, 16);
            // In CANNON, Cylinder is along Z axis; rotate 90 deg around X to align with Three.js Y axis
            const q = new CANNON.Quaternion();
            q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
            body.addShape(shape, new CANNON.Vec3(0, 0, 0), q);
        } else {
            // Block or Wedge fallback
            const shape = new CANNON.Box(new CANNON.Vec3(
                Math.max(0.05, size.x / 2),
                Math.max(0.05, size.y / 2),
                Math.max(0.05, size.z / 2)
            ));
            body.addShape(shape);
        }
    }

    addPart(part) {
        if (!this.world || this.bodyMap.has(part)) return;

        // Skip non-root character limbs if character has an alive Humanoid (handled by CharacterController)
        if (part.Parent && part.Parent.IsA && part.Parent.IsA('Model')) {
            const hum = part.Parent.FindFirstChild ? part.Parent.FindFirstChild('Humanoid') : null;
            if (hum && hum.Health > 0 && part.Name !== 'HumanoidRootPart') {
                return;
            }
        }

        const size = part.Size;
        const mass = part.Anchored ? 0 : (size.x * size.y * size.z * 1.2);
        const body = new CANNON.Body({
            mass: mass,
            type: part.Anchored ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC,
            position: new CANNON.Vec3(part.Position.x, part.Position.y, part.Position.z),
            material: this.partMaterial
        });

        this.attachShapeToBody(body, part);

        // Set rotation from Euler degrees
        const radX = (part.Orientation.x * Math.PI) / 180;
        const radY = (part.Orientation.y * Math.PI) / 180;
        const radZ = (part.Orientation.z * Math.PI) / 180;
        if (typeof THREE !== 'undefined') {
            const euler = new THREE.Euler(radX, radY, radZ, 'XYZ');
            const q = new THREE.Quaternion().setFromEuler(euler);
            body.quaternion.set(q.x, q.y, q.z, q.w);
        } else {
            body.quaternion.setFromEuler(radX, radY, radZ, 'XYZ');
        }

        if (!part.CanCollide) {
            body.collisionResponse = false;
        }

        // Collision listener for Touched events
        body.addEventListener('collide', (event) => {
            const otherBody = event.body;
            const otherPart = this.reverseMap.get(otherBody);
            if (otherPart) {
                part.Touched.Fire(otherPart);
                otherPart.Touched.Fire(part);
            }
        });

        // Listen for part property changes to keep physics in sync (ignored when physics itself is syncing)
        const changeConn = part.Changed.Connect(() => {
            if (this.isSyncing) return;
            if (this.bodyMap.has(part)) {
                this.updateBodyFromPart(part);
            }
        });
        body._partChangedConn = changeConn;

        this.world.addBody(body);
        this.bodyMap.set(part, body);
        this.reverseMap.set(body, part);
    }

    removePart(part) {
        const body = this.bodyMap.get(part);
        if (body && this.world) {
            if (body._partChangedConn) {
                body._partChangedConn.Disconnect();
                body._partChangedConn = null;
            }
            this.world.removeBody(body);
            this.bodyMap.delete(part);
            this.reverseMap.delete(body);
        }
    }

    updateBodyFromPart(part) {
        if (this.isSyncing) return;
        const body = this.bodyMap.get(part);
        if (!body) return;

        body.position.set(part.Position.x, part.Position.y, part.Position.z);
        const radX = (part.Orientation.x * Math.PI) / 180;
        const radY = (part.Orientation.y * Math.PI) / 180;
        const radZ = (part.Orientation.z * Math.PI) / 180;
        if (typeof THREE !== 'undefined') {
            const euler = new THREE.Euler(radX, radY, radZ, 'XYZ');
            const q = new THREE.Quaternion().setFromEuler(euler);
            body.quaternion.set(q.x, q.y, q.z, q.w);
        } else {
            body.quaternion.setFromEuler(radX, radY, radZ, 'XYZ');
        }

        body.collisionResponse = Boolean(part.CanCollide);

        // Update collision shape size
        const size = part.Size;
        if (body.shapes && body.shapes.length > 0) {
            const sh = body.shapes[0];
            if (part.Shape === 'Ball' && sh instanceof CANNON.Sphere) {
                sh.radius = Math.max(0.1, size.x / 2);
                if (sh.updateBoundingSphereRadius) sh.updateBoundingSphereRadius();
            } else if (sh instanceof CANNON.Box && (part.Shape === 'Block' || part.Shape === 'Wedge')) {
                sh.halfExtents.set(
                    Math.max(0.05, size.x / 2),
                    Math.max(0.05, size.y / 2),
                    Math.max(0.05, size.z / 2)
                );
                if (sh.updateConvexPolyhedronRepresentation) sh.updateConvexPolyhedronRepresentation();
                if (sh.updateBoundingSphereRadius) sh.updateBoundingSphereRadius();
            } else if (part.Shape === 'Cylinder' && sh instanceof CANNON.Cylinder) {
                const radius = Math.max(0.1, size.x / 2);
                const height = Math.max(0.1, size.y);
                const newShape = new CANNON.Cylinder(radius, radius, height, 16);
                body.shapes[0] = newShape;
                if (body.updateBoundingRadius) body.updateBoundingRadius();
            } else {
                // Re-attach shape in-place without removing the body
                body.shapes = [];
                body.shapeOffsets = [];
                body.shapeOrientations = [];
                this.attachShapeToBody(body, part);
            }
        }

        const mass = part.Anchored ? 0 : (part.Size.x * part.Size.y * part.Size.z * 1.2);
        body.mass = mass;
        body.type = part.Anchored ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC;
        body.updateMassProperties();
        if (body.updateBoundingRadius) body.updateBoundingRadius();
    }

    step(dt) {
        if (!this.running || !this.world) return;

        const fixedTimeStep = 1 / 60;
        this.world.step(fixedTimeStep, dt, 3);

        // Sync dynamic bodies back to BasePart instances
        this.isSyncing = true;
        try {
            for (const [part, body] of this.bodyMap.entries()) {
                if (body.type === CANNON.Body.DYNAMIC) {
                    part.Position = new Vector3(body.position.x, body.position.y, body.position.z);

                    // Convert CANNON quaternion to Euler angles in degrees using THREE for reliable XYZ order
                    if (typeof THREE !== 'undefined') {
                        const q = new THREE.Quaternion(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
                        const euler = new THREE.Euler().setFromQuaternion(q, 'XYZ');
                        part.Orientation = new Vector3(
                            (euler.x * 180) / Math.PI,
                            (euler.y * 180) / Math.PI,
                            (euler.z * 180) / Math.PI
                        );
                    } else {
                        const euler = new CANNON.Vec3();
                        body.quaternion.toEuler(euler, 'YZX');
                        part.Orientation = new Vector3(
                            (euler.x * 180) / Math.PI,
                            (euler.y * 180) / Math.PI,
                            (euler.z * 180) / Math.PI
                        );
                    }
                }
            }
        } finally {
            this.isSyncing = false;
        }
    }
}
