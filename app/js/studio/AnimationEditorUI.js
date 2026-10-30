import { Instance } from '../engine/Instance.js';
import { CFrame, Vector3, nearestEulerYXZ } from '../engine/Math3D.js';
import { Keyframe, KeyframeSequence, Motor6D } from '../engine/OtherInstances.js';
import { parseRbxm } from './RbxmImporter.js';

export class AnimationEditorUI {
    constructor(studioApp) {
        this.app = studioApp;
        this.model = null;
        this.sequence = null;
        this.rig = null;
        this.samples = [];
        this.selectedTrack = null;
        this.playhead = 0;
        this.duration = 1;
        this.frameRate = 30;
        this.playbackFrame = 0;
        this.playbackAccumulator = 0;
        this.isPlaying = false;
        this.playFrame = null;
        this.lastFrameTime = 0;
        this.selectedKeyframe = null;
        this.keyframeClipboard = null;
        this.keyframeDrag = null;
        this.basePose = null;
        this.lastRigPartFrames = null;
        this.isScrubbing = false;
        this.createWindow();
    }

    createWindow() {
        this.backdrop = document.getElementById('animation-editor-container');
        this.backdrop.className = 'animation-editor-dock';
        this.backdrop.hidden = true;
        this.backdrop.innerHTML = `
            <section class="animation-editor-window" role="region" aria-labelledby="animation-editor-title">
                <header class="animation-editor-header">
                    <h2 id="animation-editor-title">Animation Editor</h2>
                    <span id="animation-editor-status">Select a rig to begin</span>
                    <button class="animation-icon-button" data-action="close" title="Hide Animation Editor" aria-label="Hide Animation Editor"><i data-lucide="x"></i></button>
                </header>
                <div class="animation-editor-toolbar">
                    <div class="animation-rig-controls">
                        <label class="animation-select-field"><span>Rig</span><select id="animation-rig-select"></select></label>
                        <label class="animation-select-field"><span>Sequence</span><select id="animation-sequence-select"></select></label>
                        <button class="animation-icon-button" data-action="new" title="New animation" aria-label="New animation"><i data-lucide="file-plus-2"></i></button>
                        <button class="animation-icon-button" data-action="import" title="Import animation" aria-label="Import animation"><i data-lucide="folder-open"></i></button>
                        <button class="animation-icon-button" data-action="export" title="Export animation" aria-label="Export animation"><i data-lucide="download"></i></button>
                        <button class="animation-icon-button animation-save-button" data-action="save" title="Save animation" aria-label="Save animation"><i data-lucide="save"></i></button>
                    </div>
                    <div class="animation-transport-buttons">
                        <button class="animation-icon-button" data-action="start" title="Go to start" aria-label="Go to start"><i data-lucide="skip-back"></i></button>
                        <button class="animation-icon-button" data-action="previous-key" title="Previous keyframe" aria-label="Previous keyframe"><i data-lucide="step-back"></i></button>
                        <button class="animation-icon-button" data-action="play" title="Play animation" aria-label="Play"><i data-lucide="play"></i></button>
                        <button class="animation-icon-button" data-action="stop" title="Stop animation" aria-label="Stop"><i data-lucide="square"></i></button>
                        <button class="animation-icon-button" data-action="next-key" title="Next keyframe" aria-label="Next keyframe"><i data-lucide="step-forward"></i></button>
                        <button class="animation-icon-button" data-action="end" title="Go to end" aria-label="Go to end"><i data-lucide="skip-forward"></i></button>
                        <button class="animation-icon-button" data-action="add-keyframe" title="Add keyframe" aria-label="Add keyframe"><i data-lucide="plus"></i></button>
                        <button class="animation-icon-button" data-action="delete-keyframe" title="Delete keyframe at current time" aria-label="Delete keyframe"><i data-lucide="trash-2"></i></button>
                        <label class="animation-loop-control"><input id="animation-loop" type="checkbox"><span>Loop</span></label>
                    </div>
                    <div class="animation-time-controls">
                        <label class="animation-fps-control"><span>FPS</span><input id="animation-fps" type="number" min="1" max="120" step="1" value="30" aria-label="Animation playback FPS"></label>
                        <label class="animation-time-entry"><input id="animation-time-input" class="animation-current-time" type="number" min="0" step="0.01" value="0.00" aria-label="Current time"><span>/</span><input id="animation-duration" class="animation-duration-input" type="number" min="0.1" step="0.1" value="1.0" aria-label="Animation duration"></label>
                    </div>
                </div>
                <div class="animation-editor-workspace">
                    <aside class="animation-editor-sidebar">
                        <div class="animation-rig-root" id="animation-rig-root"></div>
                        <div class="animation-track-tree" id="animation-track-tree"></div>
                    </aside>
                    <main class="animation-editor-timeline">
                        <div class="animation-timeline-scroll"><div class="animation-timeline-content">
                            <div class="animation-ruler" id="animation-ruler"></div>
                            <div class="animation-timeline-tracks" id="animation-timeline-tracks"></div>
                            <div class="animation-playhead-line" id="animation-playhead-line"></div>
                        </div></div>
                    </main>
                </div>
            </section>
            <input id="animation-import-file" type="file" accept=".json,.rbxm,.rbxl" hidden>
        `;
        this.cacheElements();
        this.bindEvents();
        if (window.lucide) window.lucide.createIcons({ root: this.backdrop });
    }

    cacheElements() {
        this.rigSelect = this.backdrop.querySelector('#animation-rig-select');
        this.sequenceSelect = this.backdrop.querySelector('#animation-sequence-select');
        this.status = this.backdrop.querySelector('#animation-editor-status');
        this.trackTree = this.backdrop.querySelector('#animation-track-tree');
        this.rigRoot = this.backdrop.querySelector('#animation-rig-root');
        this.timelineTracks = this.backdrop.querySelector('#animation-timeline-tracks');
        this.timelineScroll = this.backdrop.querySelector('.animation-timeline-scroll');
        this.timelineContent = this.backdrop.querySelector('.animation-timeline-content');
        this.ruler = this.backdrop.querySelector('#animation-ruler');
        this.playheadLine = this.backdrop.querySelector('#animation-playhead-line');
        this.timeInput = this.backdrop.querySelector('#animation-time-input');
        this.durationInput = this.backdrop.querySelector('#animation-duration');
        this.fpsInput = this.backdrop.querySelector('#animation-fps');
        this.loopInput = this.backdrop.querySelector('#animation-loop');
        this.fileInput = this.backdrop.querySelector('#animation-import-file');
    }

    bindEvents() {
        this.backdrop.querySelector('[data-action="close"]').addEventListener('click', () => this.close());
        this.backdrop.querySelector('[data-action="new"]').addEventListener('click', () => this.newAnimation());
        this.backdrop.querySelector('[data-action="import"]').addEventListener('click', () => this.fileInput.click());
        this.backdrop.querySelector('[data-action="export"]').addEventListener('click', () => this.exportSequence());
        this.backdrop.querySelector('[data-action="save"]').addEventListener('click', () => this.saveSequence());
        this.backdrop.querySelector('[data-action="play"]').addEventListener('click', () => this.play());
        this.backdrop.querySelector('[data-action="stop"]').addEventListener('click', () => this.stop());
        this.backdrop.querySelector('[data-action="start"]').addEventListener('click', () => this.setTime(0));
        this.backdrop.querySelector('[data-action="previous-key"]').addEventListener('click', () => this.seekKeyframe(-1));
        this.backdrop.querySelector('[data-action="next-key"]').addEventListener('click', () => this.seekKeyframe(1));
        this.backdrop.querySelector('[data-action="end"]').addEventListener('click', () => this.setTime(this.duration));
        this.backdrop.querySelector('[data-action="add-keyframe"]').addEventListener('click', () => this.addKeyframe());
        this.backdrop.querySelector('[data-action="delete-keyframe"]').addEventListener('click', () => this.deleteKeyframe());
        this.rigSelect.addEventListener('change', () => this.setModel(this.findInstance(this.rigSelect.value)));
        this.sequenceSelect.addEventListener('change', () => this.loadSequence(this.findInstance(this.sequenceSelect.value)));
        this.timeInput.addEventListener('change', () => this.setTime(Number(this.timeInput.value)));
        this.timeInput.addEventListener('keydown', event => {
            if (event.key === 'Enter') this.setTime(Number(this.timeInput.value));
        });
        this.durationInput.addEventListener('change', () => {
            this.duration = Math.max(0.1, Number(this.durationInput.value) || 0.1);
            if (this.sequence) this.sequence.Duration = this.duration;
            this.updateTimeline();
        });
        this.fpsInput.addEventListener('change', () => {
            this.frameRate = Math.max(1, Math.min(120, Math.round(Number(this.fpsInput.value) || 30)));
            this.fpsInput.value = String(this.frameRate);
            this.setTime(this.playhead);
            this.setStatus(`Playback set to ${this.frameRate} FPS`);
        });
        this.loopInput.addEventListener('change', () => {
            if (this.sequence) this.sequence.Loop = this.loopInput.checked;
        });
        this.fileInput.addEventListener('change', event => this.importFile(event.target.files?.[0]));
        this.timelineScroll.addEventListener('pointerdown', event => {
            if (event.button !== 0) return;
            const marker = event.target.closest('.animation-key-marker');
            if (marker) {
                const path = marker.dataset.path;
                const time = Number(marker.dataset.time);
                this.selectedKeyframe = { path, time };
                this.timelineTracks.querySelectorAll('.animation-key-marker').forEach(item => {
                    item.classList.toggle('selected', item === marker);
                });
                const track = this.rig?.tracks.find(item => item.path === path);
                if (track) this.selectTrack(track);
                this.keyframeDrag = { pointerId: event.pointerId, path, time, moved: false };
                this.timelineScroll.setPointerCapture(event.pointerId);
                marker.focus({ preventScroll: true });
                this.setTime(time);
                return;
            }
            this.selectedKeyframe = null;
            this.timelineTracks.querySelectorAll('.animation-key-marker').forEach(item => item.classList.remove('selected'));
            this.isScrubbing = true;
            this.timelineScroll.setPointerCapture(event.pointerId);
            this.setTimeFromPointer(event.clientX);
        });
        this.timelineScroll.addEventListener('pointermove', event => {
            if (this.keyframeDrag?.pointerId === event.pointerId) {
                const time = this.frameToTime(this.timeToFrame(this.timeFromPointer(event.clientX)));
                if (this.timeToFrame(time) !== this.timeToFrame(this.keyframeDrag.time)) {
                    const { path, time: previousTime } = this.keyframeDrag;
                    if (this.moveKeyframe(path, previousTime, time)) {
                        this.keyframeDrag.time = time;
                        this.keyframeDrag.moved = true;
                        this.selectedKeyframe = { path, time };
                        this.updateTimeline();
                        this.setTime(time);
                    }
                }
            } else if (this.isScrubbing) {
                this.setTimeFromPointer(event.clientX);
            }
        });
        const stopPointerAction = event => {
            if (this.keyframeDrag?.pointerId === event.pointerId) {
                const drag = this.keyframeDrag;
                this.keyframeDrag = null;
                if (drag.moved) this.setStatus(`Keyframe moved to ${drag.time.toFixed(2)} s`);
                this.focusKeyframe(drag.path, drag.time);
            }
            this.isScrubbing = false;
        };
        this.timelineScroll.addEventListener('pointerup', stopPointerAction);
        this.timelineScroll.addEventListener('pointercancel', stopPointerAction);
        this.backdrop.addEventListener('keydown', event => {
            if (event.code === 'Escape') {
                this.close();
                return;
            }
            if (!(event.ctrlKey || event.metaKey) || event.altKey || !['KeyC', 'KeyV'].includes(event.code)) return;
            if (event.code === 'KeyC' && !this.selectedKeyframe) return;
            if (event.code === 'KeyV' && !this.keyframeClipboard) return;
            const target = event.target;
            if (target instanceof HTMLElement && target.closest('input, textarea, [contenteditable="true"]')) return;
            event.preventDefault();
            event.stopPropagation();
            if (event.code === 'KeyC') this.copyKeyframe();
            else this.pasteKeyframe();
        });
        document.addEventListener('keydown', event => {
            if (this.backdrop.hidden || event.code !== 'Space' || event.repeat) return;
            const target = event.target;
            if (target instanceof HTMLElement && target.closest('input, select, textarea, [contenteditable="true"]')) return;
            event.preventDefault();
            if (this.isPlaying) this.stop();
            else this.play();
        });
    }

    findInstance(id) {
        if (!id) return null;
        return this.app.dataModel.GetDescendants().find(instance => instance.id === id) || null;
    }

    timeToFrame(time) {
        return Math.max(0, Math.round((Number(time) || 0) * this.frameRate));
    }

    frameToTime(frame) {
        return Math.max(0, Math.round(frame)) / this.frameRate;
    }

    frameTime(time) {
        return this.frameToTime(this.timeToFrame(time));
    }

    findModels() {
        return this.app.dataModel.GetDescendants().filter(instance =>
            instance.ClassName === 'Model' && instance.FindFirstChildOfClass('Humanoid', true)
        );
    }

    open(preferredModel = this.app.selectedInstance) {
        this.backdrop.hidden = false;
        this.refreshRigOptions(preferredModel);
        requestAnimationFrame(() => this.app.viewport.onResize());
    }

    close() {
        this.stop();
        this.restoreBasePose();
        this.backdrop.hidden = true;
        requestAnimationFrame(() => this.app.viewport.onResize());
    }

    refreshRigOptions(preferredModel = this.model) {
        const models = this.findModels();
        this.rigSelect.replaceChildren();
        for (const model of models) {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.Name;
            this.rigSelect.appendChild(option);
        }
        const candidate = models.includes(preferredModel) ? preferredModel : models[0];
        if (candidate) {
            this.rigSelect.value = candidate.id;
            this.setModel(candidate);
        } else {
            this.model = null;
            this.rig = null;
            this.status.textContent = 'No Model with a Humanoid is available';
            this.renderTracks();
        }
    }

    isAnimationTrack(instance) {
        let parent = instance.Parent;
        while (parent) {
            if (parent.ClassName === 'KeyframeSequence') return true;
            parent = parent.Parent;
        }
        return false;
    }

    buildRig(model) {
        if (!model || model.ClassName !== 'Model' || !model.FindFirstChildOfClass('Humanoid', true)) return null;
        const parts = model.GetDescendants().filter(instance => instance.IsA && instance.IsA('BasePart'));
        const partSet = new Set(parts);
        let primaryPart = model.PrimaryPart;
        if (!partSet.has(primaryPart)) {
            primaryPart = parts.find(part => part.Name === 'HumanoidRootPart') || parts[0] || null;
            if (primaryPart) model.PrimaryPart = primaryPart;
        }
        if (!primaryPart) return null;

        const motors = model.GetDescendants().filter(instance =>
            instance.ClassName === 'Motor6D' && !this.isAnimationTrack(instance) &&
            instance.Enabled && partSet.has(instance.Part0) && partSet.has(instance.Part1)
        );
        const byPart0 = new Map();
        for (const motor of motors) {
            if (!byPart0.has(motor.Part0)) byPart0.set(motor.Part0, []);
            byPart0.get(motor.Part0).push(motor);
        }

        const tracks = [];
        const visited = new Set();
        const buildChildren = (part, parentPath = '', parentTrack = null) => {
            const children = byPart0.get(part) || [];
            return children.map((motor, index) => {
                if (visited.has(motor)) return null;
                visited.add(motor);
                const path = `${parentPath}/${motor.Name}[${index}]`;
                const track = { motor, path, parent: parentTrack, children: [] };
                tracks.push(track);
                track.children = buildChildren(motor.Part1, path, track).filter(Boolean);
                return track;
            }).filter(Boolean);
        };
        const roots = buildChildren(primaryPart);
        return { model, primaryPart, tracks, roots, parts };
    }

    setModel(model) {
        if (model === this.model) return;
        this.stop();
        this.restoreBasePose();
        this.model = model;
        this.sequence = null;
        this.samples = [];
        this.selectedTrack = null;
        this.selectedKeyframe = null;
        this.playhead = 0;
        this.duration = 1;
        this.rig = this.buildRig(model);
        this.basePose = this.captureBasePose();
        this.lastRigPartFrames = this.captureRigPartFrames();
        this.refreshSequenceOptions();
        this.renderTracks();
        this.updateTimeline();
        this.status.textContent = this.rig
            ? `${this.rig.tracks.length} connected Motor6D joints`
            : 'This Model needs a Humanoid, BasePart and connected Motor6D joints';
    }

    captureBasePose() {
        if (!this.rig) return null;
        return {
            motors: new Map(this.rig.tracks.map(track => [track.motor, track.motor.Transform.clone()])),
            parts: new Map(this.rig.parts.map(part => [part, part.CFrame.clone()]))
        };
    }

    captureRigPartFrames() {
        if (!this.rig) return null;
        return new Map(this.rig.parts.map(part => [part, part.CFrame.clone()]));
    }

    restoreBasePose() {
        if (!this.basePose) return;
        for (const [motor, transform] of this.basePose.motors) {
            if (motor.Parent) motor.Transform = transform.clone();
        }
        for (const [part, cframe] of this.basePose.parts) {
            if (part.Parent) {
                part.CFrame = cframe.clone();
                this.app.viewport.syncPartMesh(part);
            }
        }
        this.lastRigPartFrames = this.captureRigPartFrames();
    }

    refreshSequenceOptions() {
        const sequences = this.app.dataModel.GetDescendants().filter(instance => instance.ClassName === 'KeyframeSequence');
        this.sequenceSelect.replaceChildren();
        const none = document.createElement('option');
        none.value = '';
        none.textContent = 'Unsaved animation';
        this.sequenceSelect.appendChild(none);
        for (const sequence of sequences) {
            const option = document.createElement('option');
            option.value = sequence.id;
            option.textContent = `${sequence.Name} · ${sequence.Parent?.Name || 'Workspace'}`;
            this.sequenceSelect.appendChild(option);
        }
    }

    newAnimation() {
        if (!this.rig) return this.setStatus('Choose a valid rig first');
        this.stop();
        this.sequence = null;
        this.samples = [];
        this.selectedKeyframe = null;
        this.playhead = 0;
        this.duration = 1;
        this.loopInput.checked = false;
        this.sequenceSelect.value = '';
        for (const track of this.rig.tracks) track.motor.Transform = new CFrame();
        this.applyRigPose();
        this.updateTimeline();
        this.setStatus('New animation');
    }

    loadSequence(sequence) {
        if (!sequence || sequence.ClassName !== 'KeyframeSequence') {
            this.sequence = null;
            this.samples = [];
            this.selectedKeyframe = null;
            this.loopInput.checked = false;
            this.updateTimeline();
            return;
        }
        this.stop();
        this.restoreBasePose();
        this.sequence = sequence;
        this.selectedKeyframe = null;
        this.loopInput.checked = sequence.Loop;
        this.samples = [];
        const root = sequence.GetChildren().find(child =>
            child.ClassName === 'Keyframe' && child.GetChildren().some(descendant =>
                descendant.ClassName === 'Motor6D' && descendant.GetAttribute('AnimationMotorPath')
            )
        );
        if (root) {
            const readTracks = marker => {
                if (marker.ClassName !== 'Motor6D') return;
                const path = marker.GetAttribute('AnimationMotorPath');
                const motorTrack = path ? this.rig?.tracks.find(track => track.path === path) : null;
                for (const child of marker.GetChildren()) {
                    if (child.ClassName === 'Keyframe' && motorTrack) {
                        let sample = this.samples.find(entry => Math.abs(entry.time - child.Time) < 1e-4);
                        if (!sample) {
                            sample = { time: child.Time, poses: new Map() };
                            this.samples.push(sample);
                        }
                        sample.poses.set(path, child.CFrame.clone());
                    } else if (child.ClassName === 'Motor6D') {
                        readTracks(child);
                    }
                }
            };
            for (const child of root.GetChildren()) readTracks(child);
        } else {
            const keyframes = sequence.GetChildren().filter(child => child.ClassName === 'Keyframe');
            const readPose = (pose, time, parentTrack = null) => {
                const candidates = parentTrack ? parentTrack.children : this.rig?.roots;
                const matchesPose = candidate => candidate.motor.Part1?.Name === pose.Name || candidate.motor.Name === pose.Name;
                let track = candidates?.find(matchesPose);
                if (!track) track = this.rig?.tracks.find(matchesPose);
                if (track) {
                    let sample = this.samples.find(entry => Math.abs(entry.time - time) < 1e-4);
                    if (!sample) {
                        sample = { time, poses: new Map() };
                        this.samples.push(sample);
                    }
                    sample.poses.set(track.path, pose.CFrame.clone());
                }
                for (const child of pose.GetChildren()) {
                    if (child.ClassName === 'Pose') readPose(child, time, track || parentTrack);
                }
            };
            for (const keyframe of keyframes) {
                for (const pose of keyframe.GetChildren()) {
                    if (pose.ClassName === 'Pose') readPose(pose, keyframe.Time);
                }
            }
        }
        this.samples.sort((a, b) => a.time - b.time);
        this.duration = Math.max(sequence.Duration, sequence.Length, this.samples.at(-1)?.time || 0, 0.1);
        this.playhead = 0;
        this.sequenceSelect.value = sequence.id;
        this.updateTimeline();
        this.applyAtTime(0);
        this.setStatus(`Loaded ${sequence.Name}`);
    }

    renderTracks() {
        this.trackTree.replaceChildren();
        this.timelineTracks.replaceChildren();
        const tracks = this.rig?.tracks || [];
        const rootRow = document.createElement('div');
        rootRow.className = 'animation-rig-root-row';
        rootRow.innerHTML = '<i data-lucide="chevron-down"></i>';
        const rootName = document.createElement('span');
        rootName.textContent = this.model?.Name || 'Rig';
        rootRow.appendChild(rootName);
        this.rigRoot.replaceChildren(rootRow);
        if (!tracks.length) {
            this.trackTree.innerHTML = '<div class="animation-empty-state">No connected Motor6D joints</div>';
            if (window.lucide) window.lucide.createIcons({ root: this.backdrop });
            return;
        }
        const renderTrack = (track, depth) => {
            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'animation-track-item';
            row.dataset.path = track.path;
            row.style.paddingInlineStart = `${12 + depth * 14}px`;
            const caret = document.createElement('span');
            caret.className = `animation-track-caret${track.children.length ? ' has-children' : ''}`;
            caret.textContent = track.children.length ? '▸' : '';
            const partName = document.createElement('span');
            partName.className = 'animation-track-name';
            partName.textContent = track.motor.Part1?.Name || track.motor.Name;
            row.append(caret, partName);
            row.title = track.path;
            row.addEventListener('click', () => this.selectTrack(track));
            this.trackTree.appendChild(row);

            const timelineRow = document.createElement('div');
            timelineRow.className = 'animation-timeline-row';
            timelineRow.dataset.path = track.path;
            const lane = document.createElement('div');
            lane.className = 'animation-timeline-lane';
            for (const sample of this.samples) {
                if (!sample.poses.has(track.path)) continue;
                const marker = document.createElement('button');
                marker.type = 'button';
                marker.className = 'animation-key-marker';
                marker.dataset.path = track.path;
                marker.dataset.time = String(sample.time);
                if (this.selectedKeyframe?.path === track.path && Math.abs(this.selectedKeyframe.time - sample.time) < 1e-4) {
                    marker.classList.add('selected');
                }
                marker.style.left = `${Math.max(0, Math.min(100, (sample.time / this.duration) * 100))}%`;
                marker.title = `${sample.time.toFixed(2)} s`;
                lane.appendChild(marker);
            }
            timelineRow.appendChild(lane);
            this.timelineTracks.appendChild(timelineRow);
            for (const child of track.children) renderTrack(child, depth + 1);
        };
        for (const track of this.rig.roots) renderTrack(track, 0);
        if (window.lucide) window.lucide.createIcons({ root: this.backdrop });
    }

    selectTrack(track) {
        this.selectedTrack = track;
        this.trackTree.querySelectorAll('.animation-track-item').forEach(button => {
            button.classList.toggle('active', button.dataset.path === track.path);
        });
        this.timelineTracks.querySelectorAll('.animation-timeline-row').forEach(row => {
            row.classList.toggle('active', row.dataset.path === track.path);
        });
    }

    addKeyframe() {
        if (!this.rig?.tracks.length) return this.setStatus('This rig has no connected Motor6D joints');
        const { sample } = this.storeCurrentPose();
        this.updateTimeline();
        this.setStatus(`Keyframe set at ${sample.time.toFixed(2)} s`);
    }

    storeCurrentPose() {
        const frame = this.timeToFrame(this.playhead);
        const time = this.frameToTime(frame);
        let sample = this.samples.find(entry => this.timeToFrame(entry.time) === frame);
        const isNew = !sample;
        if (!sample) {
            sample = { time, poses: new Map() };
            this.samples.push(sample);
        }
        sample.time = time;
        for (const track of this.rig.tracks) sample.poses.set(track.path, track.motor.Transform.clone());
        this.samples.sort((a, b) => a.time - b.time);
        this.duration = Math.max(this.duration, time, 0.1);
        return { sample, isNew };
    }

    deleteKeyframe() {
        const currentFrame = this.timeToFrame(this.playhead);
        const existing = this.samples.findIndex(sample => this.timeToFrame(sample.time) === currentFrame);
        if (existing < 0) return this.setStatus('No keyframe at the current time');
        this.samples.splice(existing, 1);
        this.updateTimeline();
        this.setStatus('Keyframe deleted');
    }

    moveKeyframe(path, fromTime, toTime) {
        const sourceIndex = this.samples.findIndex(sample =>
            Math.abs(sample.time - fromTime) < 1e-4 && sample.poses.has(path)
        );
        if (sourceIndex < 0) return false;
        const source = this.samples[sourceIndex];
        const pose = source.poses.get(path);
        source.poses.delete(path);
        if (!source.poses.size) this.samples.splice(sourceIndex, 1);

        const targetFrame = this.timeToFrame(toTime);
        let target = this.samples.find(sample => this.timeToFrame(sample.time) === targetFrame);
        if (!target) {
            target = { time: toTime, poses: new Map() };
            this.samples.push(target);
        }
        target.poses.set(path, pose);
        this.samples.sort((a, b) => a.time - b.time);
        return true;
    }

    copyKeyframe() {
        if (!this.selectedKeyframe) return;
        const sample = this.samples.find(entry =>
            Math.abs(entry.time - this.selectedKeyframe.time) < 1e-4 && entry.poses.has(this.selectedKeyframe.path)
        );
        if (!sample) return;
        this.keyframeClipboard = {
            path: this.selectedKeyframe.path,
            pose: sample.poses.get(this.selectedKeyframe.path).clone()
        };
        this.setStatus(`Keyframe copied at ${sample.time.toFixed(2)} s`);
    }

    pasteKeyframe() {
        if (!this.keyframeClipboard || !this.rig) return;
        const path = this.selectedTrack?.path || this.keyframeClipboard.path;
        if (!this.rig.tracks.some(track => track.path === path)) return;
        const time = this.frameToTime(this.timeToFrame(this.playhead));
        let sample = this.samples.find(entry => this.timeToFrame(entry.time) === this.timeToFrame(time));
        if (!sample) {
            sample = { time, poses: new Map() };
            this.samples.push(sample);
        }
        sample.poses.set(path, this.keyframeClipboard.pose.clone());
        this.samples.sort((a, b) => a.time - b.time);
        this.selectedKeyframe = { path, time: sample.time };
        this.updateTimeline();
        this.setTime(sample.time);
        this.focusKeyframe(path, sample.time);
        this.setStatus(`Keyframe pasted at ${sample.time.toFixed(2)} s`);
    }

    focusKeyframe(path, time) {
        const marker = [...this.timelineTracks.querySelectorAll('.animation-key-marker')].find(item =>
            item.dataset.path === path && Math.abs(Number(item.dataset.time) - time) < 1e-4
        );
        marker?.focus({ preventScroll: true });
    }

    updateTimeline() {
        const duration = Math.max(this.duration, this.samples.at(-1)?.time || 0, 0.1);
        this.duration = duration;
        this.durationInput.value = duration.toFixed(2);
        this.ruler.replaceChildren();
        for (let index = 0; index <= 5; index++) {
            const tick = document.createElement('span');
            tick.textContent = (duration * index / 5).toFixed(1);
            tick.style.left = `${index * 20}%`;
            this.ruler.appendChild(tick);
        }
        this.renderTracks();
        this.updateReadouts();
    }

    updateReadouts() {
        this.timeInput.value = this.frameToTime(this.timeToFrame(this.playhead)).toFixed(2);
        this.playheadLine.style.left = `${Math.max(0, Math.min(100, (this.playhead / this.duration) * 100))}%`;
    }

    setTime(time) {
        const numericTime = Number(time);
        const clampedTime = Math.max(0, Math.min(this.duration, Number.isFinite(numericTime) ? numericTime : 0));
        this.playhead = this.frameTime(clampedTime);
        this.playbackFrame = this.timeToFrame(this.playhead);
        this.playbackAccumulator = 0;
        this.updateReadouts();
        this.applyAtTime(this.playhead);
    }

    setTimeFromPointer(clientX) {
        this.setTime(this.timeFromPointer(clientX));
    }

    timeFromPointer(clientX) {
        const rulerRect = this.ruler.getBoundingClientRect();
        if (!rulerRect.width) return this.playhead;
        const progress = Math.max(0, Math.min(1, (clientX - rulerRect.left) / rulerRect.width));
        return progress * this.duration;
    }

    seekKeyframe(direction) {
        const times = [...new Set(this.samples.map(sample => sample.time))].sort((a, b) => a - b);
        if (direction > 0) {
            this.setTime(times.find(time => time > this.playhead + 0.005) ?? this.duration);
        } else {
            this.setTime(times.filter(time => time < this.playhead - 0.005).at(-1) ?? 0);
        }
    }

    interpolateCFrame(a, b, alpha) {
        if (!a) return b.clone();
        if (!b) return a.clone();
        const position = a.position.lerp(b.position, alpha);
        const toQuaternion = frame => new THREE.Quaternion().setFromEuler(new THREE.Euler(
            frame.orientation.x * Math.PI / 180,
            frame.orientation.y * Math.PI / 180,
            frame.orientation.z * Math.PI / 180,
            'YXZ'
        ));
        const quaternion = toQuaternion(a).slerp(toQuaternion(b), alpha);
        const euler = new THREE.Euler().setFromQuaternion(quaternion, 'YXZ');
        return new CFrame(position, nearestEulerYXZ(euler, a.orientation));
    }

    poseAt(path, time) {
        const keys = this.samples
            .filter(sample => sample.poses.has(path))
            .sort((a, b) => a.time - b.time);
        if (!keys.length) return null;
        if (time <= keys[0].time) return keys[0].poses.get(path).clone();
        if (time >= keys[keys.length - 1].time) return keys[keys.length - 1].poses.get(path).clone();
        const nextIndex = keys.findIndex(sample => sample.time >= time);
        const previous = keys[nextIndex - 1];
        const next = keys[nextIndex];
        return this.interpolateCFrame(previous.poses.get(path), next.poses.get(path), (time - previous.time) / Math.max(1e-6, next.time - previous.time));
    }

    applyAtTime(time) {
        if (!this.rig) return;
        for (const track of this.rig.tracks) {
            const pose = this.poseAt(track.path, time);
            if (pose) track.motor.Transform = pose;
        }
        this.applyRigPose();
    }

    applyRigPose() {
        if (!this.rig || typeof THREE === 'undefined') return;
        const toMatrix = frame => {
            const object = new THREE.Object3D();
            object.position.set(frame.position.x, frame.position.y, frame.position.z);
            object.rotation.set(
                frame.orientation.x * Math.PI / 180,
                frame.orientation.y * Math.PI / 180,
                frame.orientation.z * Math.PI / 180,
                'YXZ'
            );
            object.updateMatrix();
            return object.matrix;
        };
        const visit = track => {
            const motor = track.motor;
            if (!motor.Part0 || !motor.Part1) return;
            const part1Matrix = toMatrix(motor.Part0.CFrame)
                .multiply(toMatrix(motor.C0))
                .multiply(toMatrix(motor.Transform))
                .multiply(new THREE.Matrix4().makeRotationX(motor.CurrentAngle))
                .multiply(toMatrix(motor.C1).invert());
            const position = new THREE.Vector3();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3();
            part1Matrix.decompose(position, quaternion, scale);
            const euler = new THREE.Euler().setFromQuaternion(quaternion, 'YXZ');
            motor.Part1.CFrame = new CFrame(
                new Vector3(position.x, position.y, position.z),
                nearestEulerYXZ(euler, motor.Part1.Orientation)
            );
            this.app.viewport.syncPartMesh(motor.Part1);
            for (const child of track.children) visit(child);
        };
        for (const root of this.rig.roots) visit(root);
        this.lastRigPartFrames = this.captureRigPartFrames();
    }

    containsPart(part) {
        return Boolean(this.rig?.parts.includes(part));
    }

    getJointWorldPivot(part) {
        if (this.backdrop.hidden || !this.rig || typeof THREE === 'undefined') return null;
        const track = this.rig.tracks.find(candidate => candidate.motor.Part1 === part);
        const motor = track?.motor;
        if (!motor?.Part0) return null;
        const mesh = this.app.viewport.partMeshes.get(motor.Part0);
        if (!mesh) return null;
        mesh.updateMatrixWorld(true);
        return new THREE.Vector3(motor.C0.position.x, motor.C0.position.y, motor.C0.position.z)
            .applyMatrix4(mesh.matrixWorld);
    }

    positionGizmoAtJoint(part) {
        const pivot = this.getJointWorldPivot(part);
        if (!pivot) return false;
        this.app.gizmoManager.pivotObject.position.copy(pivot);
        this.app.gizmoManager.pivotObject.updateMatrixWorld(true);
        this.app.gizmoManager.controls?.updateMatrixWorld(true);
        return true;
    }

    syncMotorTransformsFromParts({ autoKeyframe = false } = {}) {
        if (!this.rig || typeof THREE === 'undefined') return;
        this.carryUnchangedMotorDescendants();
        const toMatrix = frame => {
            const object = new THREE.Object3D();
            object.position.set(frame.position.x, frame.position.y, frame.position.z);
            object.rotation.set(
                frame.orientation.x * Math.PI / 180,
                frame.orientation.y * Math.PI / 180,
                frame.orientation.z * Math.PI / 180,
                'YXZ'
            );
            object.updateMatrix();
            return object.matrix;
        };
        for (const track of this.rig.tracks) {
            const motor = track.motor;
            if (!motor.Part0 || !motor.Part1) continue;
            const transformMatrix = toMatrix(motor.C0).invert()
                .multiply(toMatrix(motor.Part0.CFrame).invert())
                .multiply(toMatrix(motor.Part1.CFrame))
                .multiply(toMatrix(motor.C1))
                .multiply(new THREE.Matrix4().makeRotationX(-motor.CurrentAngle));
            const position = new THREE.Vector3();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3();
            transformMatrix.decompose(position, quaternion, scale);
            const euler = new THREE.Euler().setFromQuaternion(quaternion, 'YXZ');
            motor.Transform = new CFrame(
                new Vector3(position.x, position.y, position.z),
                nearestEulerYXZ(euler, motor.Transform.orientation)
            );
        }
        if (this.basePose) {
            for (const track of this.rig.tracks) {
                this.basePose.motors.set(track.motor, track.motor.Transform.clone());
            }
            for (const part of this.rig.parts) this.basePose.parts.set(part, part.CFrame.clone());
        }
        if (autoKeyframe) {
            const { isNew } = this.storeCurrentPose();
            if (isNew) this.renderTracks();
        }
        this.lastRigPartFrames = this.captureRigPartFrames();
        this.setStatus('Motor6D poses updated from viewport');
    }

    carryUnchangedMotorDescendants() {
        const previousFrames = this.lastRigPartFrames;
        if (!previousFrames || !this.rig) {
            this.lastRigPartFrames = this.captureRigPartFrames();
            return;
        }

        const toMatrix = frame => {
            const object = new THREE.Object3D();
            object.position.set(frame.position.x, frame.position.y, frame.position.z);
            object.rotation.set(
                frame.orientation.x * Math.PI / 180,
                frame.orientation.y * Math.PI / 180,
                frame.orientation.z * Math.PI / 180,
                'YXZ'
            );
            object.updateMatrix();
            return object.matrix.clone();
        };
        const toFrame = (matrix, reference) => {
            const position = new THREE.Vector3();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3();
            matrix.decompose(position, quaternion, scale);
            const euler = new THREE.Euler().setFromQuaternion(quaternion, 'YXZ');
            return new CFrame(
                new Vector3(position.x, position.y, position.z),
                nearestEulerYXZ(euler, reference.orientation)
            );
        };
        const rotationQuaternion = frame => new THREE.Quaternion().setFromEuler(new THREE.Euler(
            frame.orientation.x * Math.PI / 180,
            frame.orientation.y * Math.PI / 180,
            frame.orientation.z * Math.PI / 180,
            'YXZ'
        ));
        const changedParts = new Set();
        for (const part of this.rig.parts) {
            const previous = previousFrames.get(part);
            if (!previous) continue;
            const positionChanged = part.Position.sub(previous.position).magnitude() > 1e-5;
            const rotationChanged = Math.abs(rotationQuaternion(part.CFrame).dot(rotationQuaternion(previous))) < 1 - 1e-8;
            if (positionChanged || rotationChanged) changedParts.add(part);
        }
        if (!changedParts.size) return;

        const parentByPart = new Map(this.rig.tracks.map(track => [track.motor.Part1, track.motor.Part0]));
        const changedRoots = [...changedParts].filter(part => {
            let parent = parentByPart.get(part);
            while (parent) {
                if (changedParts.has(parent)) return false;
                parent = parentByPart.get(parent);
            }
            return true;
        });
        const carryChildren = (parentPart, parentDelta) => {
            for (const track of this.rig.tracks.filter(item => item.motor.Part0 === parentPart)) {
                const childPart = track.motor.Part1;
                const previousChild = previousFrames.get(childPart);
                if (!previousChild) continue;
                let childDelta = parentDelta;
                if (changedParts.has(childPart)) {
                    childDelta = toMatrix(childPart.CFrame).multiply(toMatrix(previousChild).invert());
                } else {
                    childPart.CFrame = toFrame(parentDelta.clone().multiply(toMatrix(previousChild)), previousChild);
                    this.app.viewport.syncPartMesh(childPart);
                }
                carryChildren(childPart, childDelta);
            }
        };

        for (const part of changedRoots) {
            const previous = previousFrames.get(part);
            if (!previous) continue;
            const worldDelta = toMatrix(part.CFrame).multiply(toMatrix(previous).invert());
            carryChildren(part, worldDelta);
        }
    }

    saveSequence() {
        if (!this.rig || !this.samples.length) return this.setStatus('Add at least one keyframe before saving');
        if (!this.sequence) {
            this.sequence = new KeyframeSequence();
            this.sequence.Name = `${this.model.Name}Animation`;
            this.sequence.Parent = this.model;
        } else {
            this.sequence.ClearAllChildren();
        }
        this.sequence.Loop = this.loopInput.checked;
        this.sequence.Duration = this.duration;

        const root = new Keyframe();
        root.Name = this.rig.primaryPart.Name;
        root.Time = 0;
        root.CFrame = (this.basePose?.parts.get(this.rig.primaryPart) || this.rig.primaryPart.CFrame).clone();
        root.Parent = this.sequence;

        const buildTrackNode = (parent, track) => {
            const marker = new Motor6D();
            marker.Name = track.motor.Name;
            marker.Enabled = false;
            marker.SetAttribute('AnimationMotorPath', track.path);
            marker.Parent = parent;
            for (const sample of this.samples) {
                const pose = sample.poses.get(track.path);
                if (!pose) continue;
                const keyframe = new Keyframe();
                keyframe.Name = `Keyframe_${sample.time.toFixed(3)}`;
                keyframe.Time = sample.time;
                keyframe.CFrame = pose.clone();
                keyframe.Parent = marker;
            }
            for (const child of track.children) buildTrackNode(marker, child);
        };
        for (const track of this.rig.roots) buildTrackNode(root, track);

        this.refreshSequenceOptions();
        this.sequenceSelect.value = this.sequence.id;
        this.app.historyManager?.recordState();
        this.setStatus(`Saved ${this.sequence.Name}`);
    }

    play() {
        if (!this.rig?.tracks.length) return this.setStatus('This rig has no connected Motor6D joints');
        if (!this.samples.length && this.sequence) this.loadSequence(this.sequence);
        if (!this.samples.length) return this.setStatus('Add or load keyframes before playing');
        this.stop();
        this.isPlaying = true;
        this.playbackFrame = this.timeToFrame(this.playhead);
        this.playbackAccumulator = 0;
        this.lastFrameTime = performance.now();
        const tick = now => {
            if (!this.isPlaying) return;
            const delta = Math.max(0, (now - this.lastFrameTime) / 1000);
            this.lastFrameTime = now;
            this.playbackAccumulator += delta;
            const frameDuration = 1 / this.frameRate;
            const lastFrame = this.timeToFrame(this.duration);
            while (this.playbackAccumulator >= frameDuration && this.isPlaying) {
                this.playbackAccumulator -= frameDuration;
                this.playbackFrame++;
                if (this.playbackFrame > lastFrame) {
                    if (this.loopInput.checked && lastFrame > 0) this.playbackFrame = 0;
                    else {
                        this.playbackFrame = lastFrame;
                        this.isPlaying = false;
                    }
                }
            }
            this.playhead = this.frameToTime(this.playbackFrame);
            this.updateReadouts();
            this.applyAtTime(this.playhead);
            if (this.isPlaying) this.playFrame = requestAnimationFrame(tick);
            else this.setStatus('Playback complete');
        };
        this.playFrame = requestAnimationFrame(tick);
        this.setStatus('Playing');
    }

    stop() {
        this.isPlaying = false;
        if (this.playFrame !== null) cancelAnimationFrame(this.playFrame);
        this.playFrame = null;
    }

    setStatus(message) {
        this.status.textContent = message;
    }

    async importFile(file) {
        if (!file || !this.model) return;
        try {
            let sequence;
            if (file.name.toLowerCase().endsWith('.json')) {
                const data = JSON.parse(await file.text());
                sequence = Instance.deserialize(data, true);
            } else {
                const imported = parseRbxm(await file.arrayBuffer());
                const findSequence = instance => instance.ClassName === 'KeyframeSequence'
                    ? instance
                    : instance.GetDescendants().find(child => child.ClassName === 'KeyframeSequence');
                sequence = imported.roots.map(findSequence).find(Boolean);
            }
            if (!sequence || sequence.ClassName !== 'KeyframeSequence') throw new Error('No KeyframeSequence found in file');
            sequence.Parent = this.model;
            this.refreshSequenceOptions();
            this.sequenceSelect.value = sequence.id;
            this.loadSequence(sequence);
            this.app.historyManager?.recordState();
            this.setStatus(`Imported ${sequence.Name}`);
        } catch (error) {
            this.setStatus(`Import failed: ${error.message}`);
        } finally {
            this.fileInput.value = '';
        }
    }

    exportSequence() {
        if (!this.sequence) {
            this.saveSequence();
            if (!this.sequence) return;
        }
        const blob = new Blob([JSON.stringify(this.sequence.serialize(), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.sequence.Name || 'Animation'}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
}
