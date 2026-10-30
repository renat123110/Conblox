/**
 * Conblox Physics Engine
 * Bridges Cannon.js with the Conblox DataModel
 */

import { Vector3, Color3, nearestEulerYXZ } from './Math3D.js';

export class PhysicsEngine {
    constructor(dataModel) {
        this.dataModel = dataModel;
        this.world = null;
        this.bodyMap = new Map(); // Part -> CANNON.Body
        this.reverseMap = new Map(); // CANNON.Body -> Part
        this.jointConstraints = new Map();
        this.joints = new Set();
        this.jointConnections = new Map();
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
                } else if (this.running && this.isWeldJoint(inst)) {
                    this.addJoint(inst);
                }
            });
            this.descendantRemovedConn = this.dataModel.Workspace.DescendantRemoved.Connect((inst) => {
                if (this.isWeldJoint(inst)) {
                    this.removeJoint(inst);
                } else if (inst && inst.IsA && inst.IsA('BasePart')) {
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
        for (const joint of [...this.joints]) this.removeJoint(joint);
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
        for (const joint of workspace.GetDescendants().filter(inst => this.isWeldJoint(inst))) {
            this.addJoint(joint);
        }
    }

    isWeldJoint(inst) {
        return inst && ['Weld', 'WeldConstraint', 'WeldConstant', 'Motor6D'].includes(inst.ClassName);
    }

    addJoint(joint) {
        this.joints.add(joint);
        if (!this.jointConnections.has(joint)) {
            const connection = joint.Changed.Connect((property) => {
                if (['Part0', 'Part1', 'Enabled', 'C0', 'C1', 'Transform', 'CurrentAngle'].includes(property)) {
                    this.syncJoint(joint);
                }
            });
            this.jointConnections.set(joint, connection);
        }
        this.syncJoint(joint);
    }

    syncJoint(joint) {
        this.removeJointConstraint(joint);
        if (!this.world || !joint.Enabled || !joint.Part0 || !joint.Part1 || joint.Part0 === joint.Part1) return;

        const body0 = this.bodyMap.get(joint.Part0);
        const body1 = this.bodyMap.get(joint.Part1);
        if (!body0 || !body1 || (body0.mass === 0 && body1.mass === 0)) return;

        if (joint.ClassName === 'Weld' || joint.ClassName === 'Motor6D') {
            this.alignWeldParts(joint, body0, body1);
        }

        const constraint = new CANNON.LockConstraint(body0, body1, { maxForce: 1e6 });
        this.world.addConstraint(constraint);
        this.jointConstraints.set(joint, constraint);
    }

    alignWeldParts(joint, body0, body1) {
        const quaternionFromOrientation = (orientation) => new THREE.Quaternion().setFromEuler(new THREE.Euler(
            orientation.x * Math.PI / 180,
            orientation.y * Math.PI / 180,
            orientation.z * Math.PI / 180,
            'YXZ'
        ));
        const body0Quaternion = new THREE.Quaternion(body0.quaternion.x, body0.quaternion.y, body0.quaternion.z, body0.quaternion.w);
        const body1Quaternion = new THREE.Quaternion(body1.quaternion.x, body1.quaternion.y, body1.quaternion.z, body1.quaternion.w);
        const c0 = joint.C0 || { position: new Vector3(), orientation: new Vector3() };
        const c1 = joint.C1 || { position: new Vector3(), orientation: new Vector3() };
        const c0Quaternion = quaternionFromOrientation(c0.orientation);
        const c1Quaternion = quaternionFromOrientation(c1.orientation);
        const c0Position = new THREE.Vector3(c0.position.x, c0.position.y, c0.position.z);
        const c1Position = new THREE.Vector3(c1.position.x, c1.position.y, c1.position.z);
        if (joint.ClassName === 'Motor6D') {
            const transform = joint.Transform;
            const transformQuaternion = quaternionFromOrientation(transform.orientation);
            transformQuaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), joint.CurrentAngle));
            const transformPosition = new THREE.Vector3(transform.position.x, transform.position.y, transform.position.z);
            c0Position.add(transformPosition.applyQuaternion(c0Quaternion));
            c0Quaternion.multiply(transformQuaternion);
        }
        let targetBody;
        let targetQuaternion;
        let targetPosition;

        if (body1.mass > 0 || body0.mass === 0) {
            targetBody = body1;
            targetQuaternion = body0Quaternion.clone().multiply(c0Quaternion).multiply(c1Quaternion.clone().invert());
            targetPosition = new THREE.Vector3(body0.position.x, body0.position.y, body0.position.z)
                .add(c0Position.clone().applyQuaternion(body0Quaternion))
                .sub(c1Position.clone().applyQuaternion(targetQuaternion));
        } else {
            targetBody = body0;
            targetQuaternion = body1Quaternion.clone().multiply(c1Quaternion).multiply(c0Quaternion.clone().invert());
            targetPosition = new THREE.Vector3(body1.position.x, body1.position.y, body1.position.z)
                .add(c1Position.clone().applyQuaternion(body1Quaternion))
                .sub(c0Position.clone().applyQuaternion(targetQuaternion));
        }

        targetBody.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
        targetBody.quaternion.set(targetQuaternion.x, targetQuaternion.y, targetQuaternion.z, targetQuaternion.w);
        targetBody.velocity.set(0, 0, 0);
        targetBody.angularVelocity.set(0, 0, 0);
        targetBody.wakeUp();

        const part = this.reverseMap.get(targetBody);
        if (part) {
            const euler = new THREE.Euler().setFromQuaternion(targetQuaternion, 'YXZ');
            this.isSyncing = true;
            try {
                part.Position = new Vector3(targetPosition.x, targetPosition.y, targetPosition.z);
                part.Orientation = nearestEulerYXZ(euler, part.Orientation);
            } finally {
                this.isSyncing = false;
            }
        }
    }

    removeJointConstraint(joint) {
        const constraint = this.jointConstraints.get(joint);
        if (constraint && this.world) this.world.removeConstraint(constraint);
        this.jointConstraints.delete(joint);
    }

    removeJoint(joint) {
        this.removeJointConstraint(joint);
        const connection = this.jointConnections.get(joint);
        connection?.Disconnect();
        this.jointConnections.delete(joint);
        this.joints.delete(joint);
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
            const euler = new THREE.Euler(radX, radY, radZ, 'YXZ');
            const q = new THREE.Quaternion().setFromEuler(euler);
            body.quaternion.set(q.x, q.y, q.z, q.w);
        } else {
            body.quaternion.setFromEuler(radX, radY, radZ, 'YXZ');
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
        for (const joint of this.joints) {
            if (joint.Part0 === part || joint.Part1 === part) this.syncJoint(joint);
        }
    }

    removePart(part) {
        for (const joint of this.joints) {
            if (joint.Part0 === part || joint.Part1 === part) this.removeJointConstraint(joint);
        }
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
            const euler = new THREE.Euler(radX, radY, radZ, 'YXZ');
            const q = new THREE.Quaternion().setFromEuler(euler);
            body.quaternion.set(q.x, q.y, q.z, q.w);
        } else {
            body.quaternion.setFromEuler(radX, radY, radZ, 'YXZ');
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

        for (const joint of this.joints) {
            if (joint.ClassName !== 'Motor6D' || !joint.Enabled) continue;
            const difference = joint.DesiredAngle - joint.CurrentAngle;
            const maxStep = joint.MaxVelocity * dt;
            if (Math.abs(difference) > 1e-6 && maxStep > 0) {
                joint.CurrentAngle += Math.sign(difference) * Math.min(Math.abs(difference), maxStep);
            }
        }

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
                        const euler = new THREE.Euler().setFromQuaternion(q, 'YXZ');
                        part.Orientation = nearestEulerYXZ(euler, part.Orientation);
                    } else {
                        const euler = new CANNON.Vec3();
                        body.quaternion.toEuler(euler, 'YXZ');
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
