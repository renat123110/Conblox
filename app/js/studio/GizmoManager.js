/**
 * Conblox Gizmo Manager
 * Integrates Three.js TransformControls for Translate & Rotate,
 * and an authentic Roblox Studio 6-Face-Handle Scaler for Scale.
 */

import { Vector3 } from '../engine/Math3D.js';

export class GizmoManager {
    constructor(viewport, onTransformChange, onTransformEnd) {
        this.viewport = viewport;
        this.onTransformChange = onTransformChange;
        this.onTransformEnd = onTransformEnd;

        this.controls = null;
        this.currentMode = 'select'; // 'select', 'translate', 'rotate', 'scale'
        this.targetPart = null;

        // Snapping settings
        this.snapEnabled = true;
        this.moveSnap = 1.0; // 1 stud
        this.rotateSnap = 5; // 5 degrees default
        this.scaleSnap = 1.0;

        // Roblox 6-Face Scale Tool state
        this.scaleGizmoGroup = null;
        this.scaleHandles = [];
        this.hoveredScaleHandle = null;
        this.activeScaleHandle = null;
        this.isScaleDragging = false;
        this.scaleDragStartSize = null;
        this.scaleDragStartPos = null;
        this.scaleDragPlane = new THREE.Plane();
        this.scaleDragPlaneIntersect = new THREE.Vector3();
        this.scaleDragStartHit = new THREE.Vector3();

        this.init();
    }

    init() {
        if (typeof THREE.TransformControls === 'undefined') {
            console.warn('TransformControls not available');
            return;
        }

        // 1. Three.js TransformControls for Translate and Rotate
        this.controls = new THREE.TransformControls(this.viewport.camera, this.viewport.renderer.domElement);
        this.controls.size = 0.85;
        this.controls.setSpace('local');
        this.viewport.scene.add(this.controls);

        // Dedicated pivot object for positioning the gizmo at the exact bounding box center of Models / multi-selections
        this.pivotObject = new THREE.Object3D();
        this.pivotObject.name = 'ConbloxGizmoPivot';
        this.viewport.scene.add(this.pivotObject);
        this.initRotateSnapGuides();

        // Ctrl+L to toggle between Local and World coordinate space (Roblox standard)
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                this.toggleSpace();
            }
        });

        this.updateSnapping();

        this.controls.addEventListener('dragging-changed', (event) => {
            this.viewport.isTransformDragging = event.value;

            if (event.value) {
                // Record initial positions & orientations of all selected parts for simultaneous transform
                this.multiDragStartPositions = new Map();
                const selParts = this.getPivotParts();
                for (const p of selParts) {
                    if (p.Position) {
                        this.multiDragStartPositions.set(p, {
                            pos: p.Position.clone(),
                            ori: p.Orientation ? p.Orientation.clone() : new Vector3()
                        });
                    }
                }
                this.multiDragAnchorStartPos = this.pivotObject.position.clone();
                this.multiDragAnchorStartQuat = this.pivotObject.quaternion.clone();
                this.clearRotateSnapArc();
            } else {
                // Drag ended: protect click selection
                this.viewport.justFinishedTransformDrag = true;
                setTimeout(() => {
                    this.viewport.justFinishedTransformDrag = false;
                }, 150);

                this.updatePivotPosition();
                this.clearRotateSnapArc();

                if (this.onTransformEnd && this.targetPart) {
                    this.onTransformEnd(this.targetPart);
                }
                window.conbloxStudio?.historyManager?.recordState();
            }
        });

        this.controls.addEventListener('change', () => {
            if (!this.pivotObject || !this.controls.object) return;
            // CRITICAL: Only mutate part transform when actively dragging!
            if (!this.viewport.isTransformDragging) return;
            if (this.currentMode === 'rotate') this.updateRotateSnapArc();

            if (this.currentMode === 'translate') {
                const deltaX = this.pivotObject.position.x - this.multiDragAnchorStartPos.x;
                const deltaY = this.pivotObject.position.y - this.multiDragAnchorStartPos.y;
                const deltaZ = this.pivotObject.position.z - this.multiDragAnchorStartPos.z;
                const delta = new Vector3(deltaX, deltaY, deltaZ);

                this.viewport.isBatchTransformSync = true;
                try {
                    for (const [p, startData] of this.multiDragStartPositions.entries()) {
                        p.Position = startData.pos.clone().add(delta);
                    }
                } finally {
                    this.viewport.isBatchTransformSync = false;
                }
                this.viewport.updateSelectionBox();
            } else if (this.currentMode === 'rotate') {
                const deltaQuat = this.pivotObject.quaternion.clone().multiply(this.multiDragAnchorStartQuat.clone().invert());
                const anchor = this.multiDragAnchorStartPos;

                this.viewport.isBatchTransformSync = true;
                try {
                    for (const [p, startData] of this.multiDragStartPositions.entries()) {
                        // 1. Rotate position around pivot anchor
                        const rel = new THREE.Vector3(startData.pos.x - anchor.x, startData.pos.y - anchor.y, startData.pos.z - anchor.z);
                        rel.applyQuaternion(deltaQuat);
                        p.Position = new Vector3(anchor.x + rel.x, anchor.y + rel.y, anchor.z + rel.z);

                        // 2. Rotate orientation
                        const partStartQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(
                            (startData.ori.x * Math.PI) / 180,
                            (startData.ori.y * Math.PI) / 180,
                            (startData.ori.z * Math.PI) / 180,
                            'YXZ'
                        ));
                        const finalQuat = deltaQuat.clone().multiply(partStartQuat);
                        const finalEuler = new THREE.Euler().setFromQuaternion(finalQuat, 'YXZ');
                        p.Orientation = new Vector3(
                            (finalEuler.x * 180) / Math.PI,
                            (finalEuler.y * 180) / Math.PI,
                            (finalEuler.z * 180) / Math.PI
                        );
                    }
                } finally {
                    this.viewport.isBatchTransformSync = false;
                }
                this.viewport.updateSelectionBox();
            }

            if (this.onTransformChange && this.targetPart) {
                this.onTransformChange(this.targetPart);
            }
        });

        // 2. Roblox Studio 6-Face Scale Tool
        this.initScaleHandles();
    }

    initRotateSnapGuides() {
        const rotateGizmo = this.controls?._gizmo?.gizmo?.rotate;
        if (!rotateGizmo) return;

        this.rotateSnapTicks = new Map();
        this.rotateSnapGuides = new Map();

        for (const axis of ['X', 'Y', 'Z']) {
            const disk = new THREE.Mesh(
                this.createRotateFanGeometry(axis, 0.82, 0, Math.PI * 2),
                new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    side: THREE.DoubleSide,
                    depthTest: false,
                    depthWrite: false,
                    transparent: true,
                    opacity: 0.18,
                    toneMapped: false
                })
            );
            const ticks = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({
                color: 0x252b33,
                depthTest: false,
                depthWrite: false,
                transparent: true,
                opacity: 0.82,
                toneMapped: false
            }));
            const sector = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({
                color: 0x536273,
                side: THREE.DoubleSide,
                depthTest: false,
                depthWrite: false,
                transparent: true,
                opacity: 0.32,
                toneMapped: false
            }));

            for (const guide of [disk, ticks, sector]) {
                guide.name = axis;
                guide.userData.rotateSnapGuide = true;
                guide.renderOrder = Infinity;
                guide.frustumCulled = false;
                rotateGizmo.add(guide);
            }
            this.rotateSnapTicks.set(axis, ticks);
            this.rotateSnapGuides.set(axis, { disk, ticks, sector });
        }
        this.updateRotateSnapTicks();
    }

    createRotateFanGeometry(axis, radius, startAngle, sweepAngle) {
        const geometry = new THREE.BufferGeometry();
        const sweep = Math.min(Math.abs(sweepAngle), Math.PI * 2);
        if (sweep < 0.001) return geometry;

        const segments = Math.max(2, Math.ceil(sweep / (Math.PI / 36)));
        const direction = Math.sign(sweepAngle) || 1;
        const actualStart = direction < 0 ? startAngle + sweepAngle : startAngle;
        const points = [new THREE.Vector3()];
        for (let index = 0; index <= segments; index++) {
            const angle = actualStart + direction * sweep * index / segments;
            points.push(this.getRotateRingPoint(axis, angle, radius));
        }

        geometry.setFromPoints(points);
        const indices = [];
        for (let index = 1; index < points.length - 1; index++) {
            indices.push(0, index, index + 1);
        }
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        return geometry;
    }

    getRotateRingPoint(axis, angle, radius) {
        const cosine = Math.cos(angle) * radius;
        const sine = Math.sin(angle) * radius;
        if (axis === 'X') return new THREE.Vector3(0, cosine, sine);
        if (axis === 'Y') return new THREE.Vector3(cosine, 0, sine);
        return new THREE.Vector3(sine, cosine, 0);
    }

    updateRotateSnapTicks() {
        if (!this.rotateSnapTicks) return;
        const step = this.rotateSnap;
        for (const [axis, line] of this.rotateSnapTicks) {
            const points = [];
            if (step > 0) {
                const tickCount = Math.min(360, Math.max(1, Math.ceil(360 / step)));
                for (let index = 0; index < tickCount; index++) {
                    const degrees = index * step;
                    const angle = (degrees * Math.PI) / 180;
                    points.push(
                        this.getRotateRingPoint(axis, angle, 0.65),
                        this.getRotateRingPoint(axis, angle, 0.8)
                    );
                }
            }
            line.geometry.dispose();
            line.geometry = new THREE.BufferGeometry().setFromPoints(points);
        }
    }

    updateRotateSnapArc() {
        if (!this.rotateSnapGuides || !this.controls) return;
        const axis = this.controls.axis;
        for (const [ringAxis, guide] of this.rotateSnapGuides) {
            const isActiveRing = this.controls.dragging && ringAxis === axis;
            guide.disk.visible = isActiveRing;
            guide.ticks.visible = isActiveRing;
            guide.sector.visible = isActiveRing;

            if (isActiveRing) {
                const inverseRotation = this.controls.worldQuaternion.clone().invert();
                const start = this.controls.pointStart.clone().applyQuaternion(inverseRotation);
                let startAngle = 0;
                if (axis === 'X') startAngle = Math.atan2(start.z, start.y);
                else if (axis === 'Y') startAngle = Math.atan2(start.z, start.x);
                else startAngle = Math.atan2(start.x, start.y);

                const angle = this.controls.rotationAngleRaw || 0;
                const nextGeometry = this.createRotateFanGeometry(axis, 0.62, startAngle, angle);
                guide.sector.geometry.dispose();
                guide.sector.geometry = nextGeometry;
            }
        }
    }

    clearRotateSnapArc() {
        if (!this.rotateSnapGuides) return;
        for (const guide of this.rotateSnapGuides.values()) {
            guide.disk.visible = false;
            guide.ticks.visible = false;
            guide.sector.visible = false;
            guide.sector.geometry.dispose();
            guide.sector.geometry = new THREE.BufferGeometry();
        }
    }

    initScaleHandles() {
        this.scaleGizmoGroup = new THREE.Group();
        this.scaleGizmoGroup.visible = false;
        this.viewport.scene.add(this.scaleGizmoGroup);

        const handleConfigs = [
            { id: '+X', axis: 'x', dir: 1,  color: 0xff3b30, hoverColor: 0xff7b74, label: 'Right' },
            { id: '-X', axis: 'x', dir: -1, color: 0xcc2929, hoverColor: 0xff6b6b, label: 'Left' },
            { id: '+Y', axis: 'y', dir: 1,  color: 0x34c759, hoverColor: 0x6be689, label: 'Top' },
            { id: '-Y', axis: 'y', dir: -1, color: 0x248a3d, hoverColor: 0x58c271, label: 'Bottom' },
            { id: '+Z', axis: 'z', dir: 1,  color: 0x007aff, hoverColor: 0x54a5ff, label: 'Front' },
            { id: '-Z', axis: 'z', dir: -1, color: 0x0052b3, hoverColor: 0x4796fa, label: 'Back' }
        ];

        const sphereGeo = new THREE.SphereGeometry(0.28, 16, 16);

        handleConfigs.forEach(cfg => {
            const mat = new THREE.MeshBasicMaterial({
                color: cfg.color,
                depthTest: false,
                transparent: true,
                opacity: 0.95
            });
            const mesh = new THREE.Mesh(sphereGeo, mat);
            mesh.renderOrder = 1000;
            mesh.userData.handleConfig = cfg;

            this.scaleGizmoGroup.add(mesh);
            this.scaleHandles.push(mesh);
        });

        // Bind DOM pointer events for face scaling
        const dom = this.viewport.renderer.domElement;
        dom.addEventListener('pointerdown', (e) => this.onScalePointerDown(e), { capture: true });
        window.addEventListener('pointermove', (e) => this.onScalePointerMove(e));
        window.addEventListener('pointerup', (e) => this.onScalePointerUp(e));
    }

    updateScaleHandles() {
        if (!this.scaleGizmoGroup) return;

        if (this.currentMode !== 'scale' || !this.targetPart) {
            this.scaleGizmoGroup.visible = false;
            this.viewport.setSelectionGroupBounds?.(null);
            return;
        }

        const mesh = this.viewport.partMeshes.get(this.targetPart);
        if (!mesh) {
            this.scaleGizmoGroup.visible = false;
            this.viewport.setSelectionGroupBounds?.(null);
            return;
        }

        this.scaleGizmoGroup.visible = true;
        const parts = this.getPivotParts();
        const isGroup = parts.length > 1;
        const bounds = isGroup ? this.computePartsBoundingBox(parts) : null;
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        const orientation = new THREE.Quaternion();

        if (isGroup && !bounds.isEmpty()) {
            bounds.getCenter(center);
            bounds.getSize(size);
            this.viewport.setSelectionGroupBounds?.(bounds);
        } else {
            this.viewport.setSelectionGroupBounds?.(null);
            center.copy(mesh.position);
            const partSize = this.targetPart.Size || new Vector3(4, 1, 2);
            size.set(partSize.x, partSize.y, partSize.z);
            orientation.copy(mesh.quaternion);
        }

        const hx = (size.x / 2) + 0.16;
        const hy = (size.y / 2) + 0.16;
        const hz = (size.z / 2) + 0.16;

        this.scaleHandles.forEach(h => {
            const cfg = h.userData.handleConfig;
            const localPos = new THREE.Vector3(
                cfg.axis === 'x' ? cfg.dir * hx : 0,
                cfg.axis === 'y' ? cfg.dir * hy : 0,
                cfg.axis === 'z' ? cfg.dir * hz : 0
            );
            localPos.applyQuaternion(orientation);
            localPos.add(center);
            h.position.copy(localPos);
        });
    }

    getPointerRay(clientX, clientY) {
        const rect = this.viewport.renderer.domElement.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((clientY - rect.top) / rect.height) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.viewport.camera);
        return raycaster;
    }

    onScalePointerDown(e) {
        if (e.button !== 0 || this.currentMode !== 'scale' || !this.targetPart) return;

        const raycaster = this.getPointerRay(e.clientX, e.clientY);
        const intersects = raycaster.intersectObjects(this.scaleHandles, false);

        if (intersects.length > 0) {
            e.stopPropagation();
            const hit = intersects[0];
            const handleMesh = hit.object;
            const cfg = handleMesh.userData.handleConfig;

            this.isScaleDragging = true;
            this.viewport.isTransformDragging = true;
            this.activeScaleHandle = handleMesh;

            this.scaleDragStartSize = new Vector3(this.targetPart.Size.x, this.targetPart.Size.y, this.targetPart.Size.z);
            this.scaleDragStartPos = new Vector3(this.targetPart.Position.x, this.targetPart.Position.y, this.targetPart.Position.z);
            this.scaleDragStartMouse = new THREE.Vector2(e.clientX || 0, e.clientY || 0);
            this.scaleDragHandleStartWorld = handleMesh.position.clone();

            // Record the selection and its shared bounds for group scaling.
            this.multiScaleStartSizes = new Map();
            this.multiScaleStartPositions = new Map();
            const selParts = this.getPivotParts();
            this.scaleDragIsGroup = selParts.length > 1;
            for (const p of selParts) {
                if (p.Size) this.multiScaleStartSizes.set(p, p.Size.clone());
                if (p.Position) this.multiScaleStartPositions.set(p, p.Position.clone());
            }

            if (this.scaleDragIsGroup) {
                const bounds = this.computePartsBoundingBox(selParts);
                this.scaleDragGroupCenter = bounds.getCenter(new THREE.Vector3());
                this.scaleDragGroupSize = bounds.getSize(new THREE.Vector3());
            }

            const mesh = this.viewport.partMeshes.get(this.targetPart);
            const localNormal = new THREE.Vector3(
                cfg.axis === 'x' ? cfg.dir : 0,
                cfg.axis === 'y' ? cfg.dir : 0,
                cfg.axis === 'z' ? cfg.dir : 0
            );
            this.scaleDragWorldNormal = this.scaleDragIsGroup
                ? localNormal
                : (mesh ? localNormal.clone().applyQuaternion(mesh.quaternion).normalize() : localNormal);

            // Camera-facing fallback plane
            const normal = new THREE.Vector3();
            this.viewport.camera.getWorldDirection(normal).negate();
            this.scaleDragPlane.setFromNormalAndCoplanarPoint(normal, handleMesh.position);
            raycaster.ray.intersectPlane(this.scaleDragPlane, this.scaleDragStartHit);
        }
    }

    onScalePointerMove(e) {
        if (this.currentMode !== 'scale') return;

        // 1. Handle hover visual cues when not dragging
        if (!this.isScaleDragging) {
            const raycaster = this.getPointerRay(e.clientX, e.clientY);
            const intersects = raycaster.intersectObjects(this.scaleHandles, false);
            const hitHandle = intersects.length > 0 ? intersects[0].object : null;

            if (hitHandle !== this.hoveredScaleHandle) {
                if (this.hoveredScaleHandle) {
                    this.hoveredScaleHandle.material.color.setHex(this.hoveredScaleHandle.userData.handleConfig.color);
                    this.hoveredScaleHandle.scale.set(1, 1, 1);
                }
                this.hoveredScaleHandle = hitHandle;
                if (this.hoveredScaleHandle) {
                    this.hoveredScaleHandle.material.color.setHex(this.hoveredScaleHandle.userData.handleConfig.hoverColor);
                    this.hoveredScaleHandle.scale.set(1.25, 1.25, 1.25);
                }
            }
            return;
        }

        // 2. Actively dragging a face handle
        if (!this.activeScaleHandle || !this.targetPart) return;

        const cfg = this.activeScaleHandle.userData.handleConfig;
        const mesh = this.viewport.partMeshes.get(this.targetPart);
        if (!mesh) return;

        let delta = 0;
        if (this.scaleDragManualDelta !== undefined && this.scaleDragManualDelta !== null) {
            delta = this.scaleDragManualDelta;
        } else if (e.clientX !== undefined && e.clientY !== undefined) {
            // Screen-space 2D projection of 3D face normal
            const rect = this.viewport.renderer.domElement.getBoundingClientRect();
            const projectToScreen = (v) => {
                const p = v.clone().project(this.viewport.camera);
                return new THREE.Vector2(((p.x + 1) * rect.width) / 2, ((-p.y + 1) * rect.height) / 2);
            };

            const p0 = projectToScreen(this.scaleDragHandleStartWorld);
            const p1 = projectToScreen(this.scaleDragHandleStartWorld.clone().add(this.scaleDragWorldNormal));
            const dir2D = p1.sub(p0);
            const len2D = dir2D.length();

            const mouseDelta = new THREE.Vector2(e.clientX - this.scaleDragStartMouse.x, e.clientY - this.scaleDragStartMouse.y);

            if (len2D > 5) {
                delta = mouseDelta.dot(dir2D) / (len2D * len2D);
            } else {
                delta = -mouseDelta.y / 25;
            }
        }

        // Apply Snap (Roblox Stud Snap)
        const snap = this.snapEnabled ? (this.moveSnap || 1.0) : 0.1;
        delta = Math.round(delta / snap) * snap;

        const axisKey = cfg.axis; // 'x', 'y', or 'z'
        const minDim = Math.max(0.2, snap);
        if (this.scaleDragIsGroup && this.scaleDragGroupSize[axisKey] > 0) {
            const groupDimension = this.scaleDragGroupSize[axisKey];
            const nextDimension = Math.max(minDim, Math.round((groupDimension + delta * 2) / snap) * snap);
            const factor = nextDimension / groupDimension;

            for (const [part, startSize] of this.multiScaleStartSizes.entries()) {
                const startPos = this.multiScaleStartPositions.get(part);
                const nextDim = Math.max(minDim, Math.round(startSize[axisKey] * factor * 100) / 100);
                const nextSize = new Vector3(startSize.x, startSize.y, startSize.z);
                nextSize[axisKey] = nextDim;
                const nextPos = startPos.clone();
                nextPos[axisKey] = this.scaleDragGroupCenter[axisKey] +
                    (startPos[axisKey] - this.scaleDragGroupCenter[axisKey]) * factor;

                part.Size = nextSize;
                part.Position = nextPos;
                this.viewport.syncPartMesh(part);
            }
        } else {
            const origDim = this.scaleDragStartSize[axisKey];
            const newDim = Math.max(minDim, Math.round((origDim + delta) * 100) / 100);
            const actualDelta = newDim - origDim;
            const posShift = this.scaleDragWorldNormal.clone().multiplyScalar(actualDelta / 2);
            const newPos = this.scaleDragStartPos.clone().add(posShift);
            const newSizeVec = new Vector3(
                axisKey === 'x' ? newDim : this.scaleDragStartSize.x,
                axisKey === 'y' ? newDim : this.scaleDragStartSize.y,
                axisKey === 'z' ? newDim : this.scaleDragStartSize.z
            );

            this.targetPart.Size = newSizeVec;
            this.targetPart.Position = newPos;
            mesh.position.set(newPos.x, newPos.y, newPos.z);
        }

        // Update visuals and handles
        this.updateScaleHandles();
        if (this.viewport && this.viewport.updateSelectionBox) {
            this.viewport.updateSelectionBox();
        }
        if (this.onTransformChange) {
            this.onTransformChange(this.targetPart);
        }
    }

    onScalePointerUp(e) {
        if (!this.isScaleDragging) return;

        this.isScaleDragging = false;
        this.viewport.isTransformDragging = false;
        this.activeScaleHandle = null;
        this.scaleDragManualDelta = null;

        this.viewport.justFinishedTransformDrag = true;
        setTimeout(() => {
            this.viewport.justFinishedTransformDrag = false;
        }, 150);

        if (this.onTransformEnd && this.targetPart) {
            this.onTransformEnd(this.targetPart);
        }
    }

    updateSnapping() {
        if (!this.controls) return;

        if (this.snapEnabled) {
            this.controls.setTranslationSnap(this.moveSnap);
            this.controls.setRotationSnap(this.rotateSnap > 0 ? (this.rotateSnap * Math.PI) / 180 : null);
            this.controls.setScaleSnap(null); // Managed by custom face handles
        } else {
            this.controls.setTranslationSnap(null);
            this.controls.setRotationSnap(null);
            this.controls.setScaleSnap(null);
        }
    }

    setSnapEnabled(enabled) {
        this.snapEnabled = Boolean(enabled);
        this.updateSnapping();
    }

    setMoveSnap(studs) {
        this.moveSnap = Number(studs) || 1.0;
        this.updateSnapping();
    }

    setRotateSnap(degrees) {
        const d = Number(degrees);
        this.rotateSnap = !isNaN(d) && d >= 0 ? d : 5;
        this.updateSnapping();
        this.updateRotateSnapTicks();
    }

    getPivotParts() {
        if (this.targetModel) {
            return Array.from(new Set(this.targetModel.GetDescendants().filter(d => d && d.IsA && d.IsA('BasePart'))));
        }
        if (this.viewport?.selectedParts && this.viewport.selectedParts.length > 0) {
            return Array.from(new Set(this.viewport.selectedParts));
        }
        if (this.targetPart) {
            return [this.targetPart];
        }
        return [];
    }

    computePartsBoundingBox(parts) {
        const bounds = new THREE.Box3();
        for (const part of parts) {
            const mesh = this.viewport?.partMeshes?.get(part);
            if (mesh) {
                bounds.expandByObject(mesh);
            } else if (part.Position && part.Size) {
                const halfSize = new THREE.Vector3(part.Size.x / 2, part.Size.y / 2, part.Size.z / 2);
                const center = new THREE.Vector3(part.Position.x, part.Position.y, part.Position.z);
                bounds.expandByPoint(center.clone().sub(halfSize));
                bounds.expandByPoint(center.add(halfSize));
            }
        }
        return bounds;
    }

    computeBoundingBoxCenter(parts) {
        if (this.targetModel) {
            if (this.targetModel.PrimaryPart) {
                const pp = this.targetModel.PrimaryPart;
                if (pp.CFrame && pp.CFrame.Position) {
                    return new THREE.Vector3(pp.CFrame.Position.x, pp.CFrame.Position.y, pp.CFrame.Position.z);
                } else if (pp.Position) {
                    return new THREE.Vector3(pp.Position.x, pp.Position.y, pp.Position.z);
                }
            }
            if (this.targetModel.WorldPivot) {
                const wp = this.targetModel.WorldPivot.Position || this.targetModel.WorldPivot.position;
                if (wp) {
                    return new THREE.Vector3(wp.x, wp.y, wp.z);
                }
            }
        }
        if (!parts || parts.length === 0) {
            return new THREE.Vector3();
        }
        if (parts.length === 1 && !this.targetModel) {
            const p = parts[0];
            return p.Position ? new THREE.Vector3(p.Position.x, p.Position.y, p.Position.z) : new THREE.Vector3();
        }

        const box = new THREE.Box3();
        for (const p of parts) {
            const mesh = this.viewport?.partMeshes?.get(p);
            if (mesh) {
                box.expandByObject(mesh);
            } else if (p.Position && p.Size) {
                const hx = p.Size.x / 2, hy = p.Size.y / 2, hz = p.Size.z / 2;
                box.expandByPoint(new THREE.Vector3(p.Position.x - hx, p.Position.y - hy, p.Position.z - hz));
                box.expandByPoint(new THREE.Vector3(p.Position.x + hx, p.Position.y + hy, p.Position.z + hz));
            }
        }
        if (box.isEmpty()) {
            const p = parts[0];
            return p.Position ? new THREE.Vector3(p.Position.x, p.Position.y, p.Position.z) : new THREE.Vector3();
        }
        const center = new THREE.Vector3();
        box.getCenter(center);
        return center;
    }

    updatePivotPosition() {
        if (!this.pivotObject) return;
        const parts = this.getPivotParts();
        if (parts.length === 0) return;
        const center = this.computeBoundingBoxCenter(parts);
        this.pivotObject.position.copy(center);
        this.pivotObject.quaternion.set(0, 0, 0, 1);
    }

    setMode(mode) {
        this.currentMode = mode;
        if (mode !== 'scale') this.viewport.setSelectionGroupBounds?.(null);
        if (!this.controls) return;

        if (mode === 'select' || (!this.targetPart && !this.targetModel)) {
            this.controls.detach();
            if (this.scaleGizmoGroup) this.scaleGizmoGroup.visible = false;
            return;
        }

        if (mode === 'translate') {
            if (this.scaleGizmoGroup) this.scaleGizmoGroup.visible = false;
            this.controls.setMode('translate');
            this.updatePivotPosition();
            this.controls.attach(this.pivotObject);
        } else if (mode === 'rotate') {
            if (this.scaleGizmoGroup) this.scaleGizmoGroup.visible = false;
            this.controls.setMode('rotate');
            this.updatePivotPosition();
            this.controls.attach(this.pivotObject);
        } else if (mode === 'scale') {
            // In Scale mode, detach TransformControls and activate Roblox face handles
            this.controls.detach();
            this.updateScaleHandles();
        }
    }

    attachTo(partOrModel, selectionInstances = null) {
        if (!this.controls) return;

        if (!partOrModel) {
            this.targetPart = null;
            this.targetModel = null;
            this.controls.detach();
            if (this.scaleGizmoGroup) this.scaleGizmoGroup.visible = false;
            this.viewport.setSelectionGroupBounds?.(null);
            return;
        }

        let effectivePart = partOrModel;
        if (partOrModel.IsA && partOrModel.IsA('Model')) {
            const parts = partOrModel.GetDescendants().filter(d => d.IsA && d.IsA('BasePart'));
            this.targetModel = selectionInstances?.length > 1 ? null : partOrModel;
            effectivePart = partOrModel.PrimaryPart || parts[0] || this.viewport.selectedParts?.[0] || null;
        } else {
            this.targetModel = null;
        }

        this.targetPart = effectivePart;

        if ((!effectivePart && !this.targetModel) || this.currentMode === 'select') {
            this.controls.detach();
            if (this.scaleGizmoGroup) this.scaleGizmoGroup.visible = false;
            return;
        }

        if (this.currentMode === 'scale') {
            this.controls.detach();
            this.updateScaleHandles();
            return;
        }

        this.updatePivotPosition();
        this.controls.attach(this.pivotObject);
    }

    detach() {
        this.targetPart = null;
        this.targetModel = null;
        if (this.controls) {
            this.controls.detach();
        }
        if (this.scaleGizmoGroup) {
            this.scaleGizmoGroup.visible = false;
        }
        this.viewport.setSelectionGroupBounds?.(null);
    }

    update() {
        if (this.currentMode === 'scale') {
            this.updateScaleHandles();
        }
    }

    toggleSpace() {
        if (!this.controls) return;
        const newSpace = this.controls.space === 'local' ? 'world' : 'local';
        this.controls.setSpace(newSpace);
    }

    isHovered() {
        return Boolean(
            (this.controls && this.controls.axis !== null) ||
            (this.hoveredScaleHandle !== null) ||
            this.isScaleDragging
        );
    }
}
