// Persistent scratchpad vectors to eliminate GC allocations during state updates
let _scratchPos = null;
let _scratchVel = null;

function getScratchVectors() {
    if (!_scratchPos) {
        const T = (typeof window !== 'undefined' && window.THREE) || (typeof globalThis !== 'undefined' && globalThis.THREE) || (typeof THREE !== 'undefined' ? THREE : null);
        if (T) {
            _scratchPos = new T.Vector3();
            _scratchVel = new T.Vector3();
        }
    }
    return { pos: _scratchPos, vel: _scratchVel };
}

// Snapshot object pool to prevent GC pauses during high player count updates
const _snapshotPool = [];
function acquireSnapshot(time, pos, vel, yaw) {
    const s = _snapshotPool.pop();
    if (s) {
        s.time = time;
        s.position.copy(pos);
        s.velocity.copy(vel);
        s.yaw = yaw;
        return s;
    }
    return {
        time,
        position: pos.clone(),
        velocity: vel.clone(),
        yaw
    };
}

function releaseSnapshot(s) {
    if (s && _snapshotPool.length < 256) {
        _snapshotPool.push(s);
    }
}

export class MultiplayerClient {
    constructor(app) {
        this.app = app;
        this.playerId = crypto.randomUUID();
        this.playerName = (typeof localStorage !== 'undefined' ? localStorage.getItem('conbloxPlayerName') : null) || 'Player';
        this.room = '';
        this.socket = null;
        this.isConnectedState = false;
        this.remotePlayers = new Map();
        this._activeIds = new Set();
        this.playerNames = new Map();
        this.panel = null;
        this.serverClockOffsetMs = null;
        this.interpolationDelay = 100;

        // Automatically upgrade remote player avatars if StarterCharacter finishes loading later
        if (this.app?.starterCharacterPromise) {
            this.app.starterCharacterPromise.then(() => {
                this.rebuildAllRemoteAvatars();
            }).catch(() => {});
        }

        // Explicit network tickrate synchronized with engine and rAF
        this.networkTickRate = 20; // 20 Hz (50 ms tick interval)
        this.networkTickInterval = 1 / this.networkTickRate;
        this.networkTickAccumulator = 0;
        this._lastEngineUpdate = 0;
        this._rafId = null;

        // Serialization mode: compact JSON by default, binary supported
        this.binaryMode = false;
        this._sendBinaryBuffer = null;
        this._sendBinaryView = null;
        this._textDecoder = null;
    }

    mountControls() {
        if (this.panel) {
            this.panel.hidden = false;
            return;
        }
        const params = new URLSearchParams(location.search);
        this.panel = document.createElement('section');
        this.panel.className = 'multiplayer-panel';
        this.panel.innerHTML = `
            <strong>Multiplayer</strong>
            <label>Server <input class="mp-server" type="url" placeholder="ws://127.0.0.1:28888"></label>
            <label>Room <input class="mp-room" maxlength="48" autocomplete="off"></label>
            <label>Name <input class="mp-name" maxlength="24" autocomplete="nickname"></label>
            <div class="mp-actions"><span class="mp-status">Not connected</span><button type="button">Connect</button></div>`;
        document.body.appendChild(this.panel);

        const defaultServer = params.get('server') || location.origin;
        this.panel.querySelector('.mp-server').value = defaultServer;
        this.panel.querySelector('.mp-room').value = params.get('room') || this.app.currentPlaceName.replace(/\.cblx$/i, '') || 'default';
        this.panel.querySelector('.mp-name').value = this.playerName;
        this.panel.querySelector('button').addEventListener('click', () => {
            if (this.isConnected() || this.socket) this.disconnect();
            else this.connect();
        });
        if (params.has('server')) this.connect();
    }

    isConnected() {
        return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
    }

    buildWebSocketUrl(rawServer) {
        const parsed = new URL(rawServer || location.origin, location.href);
        let wsProto = parsed.protocol;
        if (wsProto === 'http:') wsProto = 'ws:';
        else if (wsProto === 'https:') wsProto = 'wss:';
        else if (wsProto !== 'ws:' && wsProto !== 'wss:') {
            throw new Error('Invalid protocol: server must be HTTP(S) or WS(S)');
        }

        let pathname = parsed.pathname;
        if (!pathname || pathname === '/' || pathname === '/api/multiplayer/sync') {
            pathname = '/api/multiplayer/ws';
        }
        return `${wsProto}//${parsed.host}${pathname}`;
    }

    connect() {
        const serverInput = this.panel?.querySelector('.mp-server');
        const roomInput = this.panel?.querySelector('.mp-room');
        const nameInput = this.panel?.querySelector('.mp-name');

        const rawServer = (serverInput ? serverInput.value.trim() : '') || location.origin;
        let wsUrl;
        try {
            wsUrl = this.buildWebSocketUrl(rawServer);
        } catch {
            this.setStatus('Enter a valid server URL (e.g. http:// or ws://)', true);
            return;
        }

        const room = (roomInput ? roomInput.value.trim() : '') || 'default';
        if (!/^[A-Za-z0-9_-]{1,48}$/.test(room)) {
            this.setStatus('Room: letters, numbers, _ or -', true);
            return;
        }

        this.disconnect();

        this.room = room;
        this.playerName = (nameInput ? nameInput.value.trim().slice(0, 24) : '') || 'Player';
        if (typeof localStorage !== 'undefined') localStorage.setItem('conbloxPlayerName', this.playerName);

        this.networkTickAccumulator = 0;
        this.setStatus('Connecting to WebSocket...');
        if (this.panel) this.panel.querySelector('button').textContent = 'Disconnect';

        try {
            const socket = new WebSocket(wsUrl);
            socket.binaryType = 'arraybuffer';
            this.socket = socket;

            socket.onopen = () => {
                if (this.socket !== socket) return;
                this.isConnectedState = true;
                this.setStatus('Connected');
                this.sendJoin();
                this.startRafLoop();
                this.sendLocalState();
            };

            socket.onmessage = (event) => {
                if (this.socket !== socket) return;
                this.handleMessage(event.data);
            };

            socket.onerror = () => {
                if (this.socket !== socket) return;
                this.setStatus('WebSocket connection error', true);
            };

            socket.onclose = (event) => {
                if (this.socket !== socket) return;
                this.cleanupConnectionState();
                this.setStatus(event.wasClean ? 'Disconnected' : 'Connection closed', !event.wasClean);
            };
        } catch (error) {
            this.setStatus(error.message || 'Connection failed', true);
            this.cleanupConnectionState();
        }
    }

    sendJoin() {
        if (!this.isConnected()) return;
        this.socket.send(JSON.stringify({
            t: 'join',
            room: this.room,
            playerId: this.playerId,
            name: this.playerName
        }));
    }

    startRafLoop() {
        this.stopRafLoop();
        if (typeof requestAnimationFrame !== 'function') return;
        let lastTime = performance.now();
        const loop = (currentTime) => {
            if (!this.isConnected()) return;
            const dt = (currentTime - lastTime) / 1000;
            lastTime = currentTime;

            // If the main engine simulation loop has not ticked recently (e.g. paused or standalone),
            // this fallback rAF loop maintains quantized network synchronization with rendering
            if (currentTime - this._lastEngineUpdate > 120) {
                this.update(Math.min(dt, 0.1));
            }
            this._rafId = requestAnimationFrame(loop);
        };
        this._rafId = requestAnimationFrame(loop);
    }

    stopRafLoop() {
        if (this._rafId && typeof cancelAnimationFrame === 'function') {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    /**
     * Engine loop hook called every render / simulation frame via requestAnimationFrame.
     * Synchronizes avatar interpolation and quantized network state dispatch.
     */
    update(dt = 1 / 60) {
        this._lastEngineUpdate = performance.now();

        // 1. Interpolate remote player avatars for rendering
        this.updateRemoteAvatars(dt);

        // 2. Quantized network ticks tied to engine frame
        if (this.isConnected()) {
            this.networkTickAccumulator += Math.min(dt, 0.2);
            if (this.networkTickAccumulator >= this.networkTickInterval) {
                while (this.networkTickAccumulator >= this.networkTickInterval) {
                    this.networkTickAccumulator -= this.networkTickInterval;
                }
                this.sendLocalState();
            }
        }
    }

    sendLocalState() {
        if (!this.isConnected()) return;
        const charCtrl = this.app?.characterController;
        const rootPart = charCtrl?.rootPart;
        const position = rootPart?.Position;
        if (!position) return;

        const body = this.app?.physicsEngine?.bodyMap?.get(rootPart);
        const velocity = body?.velocity;
        const vx = velocity ? velocity.x : 0;
        const vy = velocity ? velocity.y : 0;
        const vz = velocity ? velocity.z : 0;
        const yaw = charCtrl?.characterYaw || 0;
        const clientTime = performance.now();

        if (this.binaryMode) {
            this.sendBinaryState(position.x, position.y, position.z, vx, vy, vz, yaw, clientTime);
        } else {
            this.sendCompactState(position.x, position.y, position.z, vx, vy, vz, yaw, clientTime);
        }
    }

    sendCompactState(x, y, z, vx, vy, vz, yaw, clientTime) {
        // Ultra-compact JSON packet (~65 bytes vs ~800 bytes HTTP fetch)
        const packet = JSON.stringify({
            t: 'p',
            p: [Math.round(x * 100) / 100, Math.round(y * 100) / 100, Math.round(z * 100) / 100],
            v: [Math.round(vx * 100) / 100, Math.round(vy * 100) / 100, Math.round(vz * 100) / 100],
            y: Math.round(yaw * 1000) / 1000,
            ct: Math.round(clientTime)
        });
        this.socket.send(packet);
    }

    sendBinaryState(x, y, z, vx, vy, vz, yaw, clientTime) {
        if (!this._sendBinaryBuffer) {
            this._sendBinaryBuffer = new ArrayBuffer(37);
            this._sendBinaryView = new DataView(this._sendBinaryBuffer);
        }
        const v = this._sendBinaryView;
        v.setUint8(0, 1); // Opcode 1: position update
        v.setFloat32(1, x, true);
        v.setFloat32(5, y, true);
        v.setFloat32(9, z, true);
        v.setFloat32(13, vx, true);
        v.setFloat32(17, vy, true);
        v.setFloat32(21, vz, true);
        v.setFloat32(25, yaw, true);
        v.setFloat64(29, clientTime, true);
        this.socket.send(this._sendBinaryBuffer);
    }

    handleMessage(data) {
        const receivedAt = performance.now();

        // Binary frame
        if (data instanceof ArrayBuffer) {
            this.handleBinaryMessage(data, receivedAt);
            return;
        }

        if (typeof data !== 'string') return;

        let msg;
        try {
            msg = JSON.parse(data);
        } catch {
            return;
        }

        // Server clock synchronization
        const serverTime = Number.isFinite(msg.st) ? msg.st : (Number.isFinite(msg.serverTime) ? msg.serverTime : null);
        if (serverTime !== null) {
            const clientTime = Number.isFinite(msg.ct) ? msg.ct : null;
            const offsetSample = clientTime !== null
                ? serverTime - (clientTime + receivedAt) / 2
                : serverTime - receivedAt;

            if (this.serverClockOffsetMs === null || Math.abs(offsetSample - this.serverClockOffsetMs) > 5000) {
                if (this.serverClockOffsetMs !== null) this.resetSnapshotBuffers();
                this.serverClockOffsetMs = offsetSample;
            } else {
                this.serverClockOffsetMs += (offsetSample - this.serverClockOffsetMs) * 0.08;
            }
        }

        const type = msg.t || msg.type || (msg.players ? 'sync' : '');

        if (type === 'sync' || Array.isArray(msg.players)) {
            const players = msg.players || [];
            const count = players.length;
            this.setStatus(`${count} player${count === 1 ? '' : 's'} connected`);
            for (let i = 0; i < players.length; i++) {
                const p = players[i];
                const pid = p.id || p.i;
                const pname = p.name || p.n;
                if (pid && pname) this.playerNames.set(pid, pname);
            }
            this.updateRemotePlayers(players, receivedAt);
        } else if (type === 'p') {
            const playerId = msg.id || msg.playerId;
            const playerName = msg.name || msg.n;
            if (playerId && playerId !== this.playerId) {
                if (playerName) this.playerNames.set(playerId, playerName);
                const { pos, vel } = getScratchVectors();
                if (pos && vel) {
                    const px = msg.p ? msg.p[0] : (msg.position?.x ?? 0);
                    const py = msg.p ? msg.p[1] : (msg.position?.y ?? 0);
                    const pz = msg.p ? msg.p[2] : (msg.position?.z ?? 0);
                    pos.set(px, py, pz);

                    const vx = msg.v ? msg.v[0] : (msg.velocity?.x ?? 0);
                    const vy = msg.v ? msg.v[1] : (msg.velocity?.y ?? 0);
                    const vz = msg.v ? msg.v[2] : (msg.velocity?.z ?? 0);
                    vel.set(vx, vy, vz);

                    const yaw = msg.y !== undefined ? msg.y : (msg.yaw || 0);
                    const snapshotTime = msg.ts !== undefined ? msg.ts : (msg.timestamp !== undefined ? msg.timestamp : (typeof msg.t === 'number' ? msg.t : undefined));
                    this.applyPlayerSnapshot(playerId, pos, vel, yaw, snapshotTime, receivedAt, playerName);
                }
            }
        } else if (type === 'leave') {
            const playerId = msg.id || msg.playerId;
            if (playerId) this.removeRemotePlayer(playerId);
        } else if (type === 'error') {
            this.setStatus(msg.error || 'Server error', true);
        }
    }

    handleBinaryMessage(buffer, receivedAt) {
        if (buffer.byteLength < 1) return;
        const view = new DataView(buffer);
        const opcode = view.getUint8(0);

        if (opcode === 2) {
            // Opcode 2: Full World Snapshot
            if (buffer.byteLength < 11) return;
            const serverTime = view.getFloat64(1, true);
            const playerCount = view.getUint16(9, true);

            const offsetSample = serverTime - receivedAt;
            if (this.serverClockOffsetMs === null || Math.abs(offsetSample - this.serverClockOffsetMs) > 5000) {
                if (this.serverClockOffsetMs !== null) this.resetSnapshotBuffers();
                this.serverClockOffsetMs = offsetSample;
            } else {
                this.serverClockOffsetMs += (offsetSample - this.serverClockOffsetMs) * 0.08;
            }

            this._activeIds.clear();
            let offset = 11;
            const decoder = this._textDecoder || (this._textDecoder = new TextDecoder());
            const { pos, vel } = getScratchVectors();
            if (!pos || !vel) return;

            for (let i = 0; i < playerCount; i++) {
                if (offset + 1 > buffer.byteLength) break;
                const idLen = view.getUint8(offset++);
                if (offset + idLen + 36 > buffer.byteLength) break;

                const idBytes = new Uint8Array(buffer, offset, idLen);
                const playerId = decoder.decode(idBytes);
                offset += idLen;

                const x = view.getFloat32(offset, true); offset += 4;
                const y = view.getFloat32(offset, true); offset += 4;
                const z = view.getFloat32(offset, true); offset += 4;
                const vx = view.getFloat32(offset, true); offset += 4;
                const vy = view.getFloat32(offset, true); offset += 4;
                const vz = view.getFloat32(offset, true); offset += 4;
                const yaw = view.getFloat32(offset, true); offset += 4;
                const timestamp = view.getFloat64(offset, true); offset += 8;

                if (playerId === this.playerId) continue;
                this._activeIds.add(playerId);

                pos.set(x, y, z);
                vel.set(vx, vy, vz);
                this.applyPlayerSnapshot(playerId, pos, vel, yaw, timestamp, receivedAt);
            }

            this.cleanupInactiveAvatars();
            const count = this._activeIds.size + 1;
            this.setStatus(`${count} player${count === 1 ? '' : 's'} connected`);
        }
    }

    /**
     * Zero-allocation remote players processor.
     * Reuses scratchpad vectors and object-pooled snapshots to eliminate GC pauses.
     */
    updateRemotePlayers(players, receivedAt = performance.now()) {
        this._activeIds.clear();
        const { pos, vel } = getScratchVectors();
        if (!pos || !vel) return;

        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            const playerId = player.id || player.i;
            if (!playerId || playerId === this.playerId) continue;
            this._activeIds.add(playerId);

            const playerName = player.name || player.n;
            if (playerName) this.playerNames.set(playerId, playerName);

            // Support both compact arrays [x, y, z] and legacy objects {x, y, z}
            const px = player.p ? player.p[0] : (player.position ? player.position.x : 0);
            const py = player.p ? player.p[1] : (player.position ? player.position.y : 0);
            const pz = player.p ? player.p[2] : (player.position ? player.position.z : 0);
            pos.set(px, py, pz);

            const vx = player.v ? player.v[0] : (player.velocity ? player.velocity.x : 0);
            const vy = player.v ? player.v[1] : (player.velocity ? player.velocity.y : 0);
            const vz = player.v ? player.v[2] : (player.velocity ? player.velocity.z : 0);
            vel.set(vx, vy, vz);

            const yaw = player.y !== undefined ? player.y : (player.yaw || 0);
            const timestamp = player.ts !== undefined ? player.ts : (player.timestamp !== undefined ? player.timestamp : (typeof player.t === 'number' ? player.t : undefined));

            this.applyPlayerSnapshot(playerId, pos, vel, yaw, timestamp, receivedAt, playerName);
        }

        this.cleanupInactiveAvatars();
    }

    applyPlayerSnapshot(playerId, pos, vel, yaw, snapshotTime, receivedAt, playerName = null) {
        let avatar = this.remotePlayers.get(playerId);
        const effectiveName = playerName || this.playerNames.get(playerId) || 'Player';
        if (!avatar) {
            avatar = this.createAvatar(playerId, effectiveName);
            this.remotePlayers.set(playerId, avatar);
            this.app?.viewport?.scene?.add(avatar);
        } else if (effectiveName && avatar.userData.playerName !== effectiveName) {
            this.updateAvatarBillboard(avatar, effectiveName);
        }

        const snapshots = avatar.userData.snapshots;
        const latest = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;

        const effectiveTime = Number.isFinite(snapshotTime)
            ? snapshotTime
            : receivedAt + (this.serverClockOffsetMs || 0);

        const transit = receivedAt + (this.serverClockOffsetMs || 0) - effectiveTime;
        if (Number.isFinite(transit)) {
            if (avatar.userData.lastTransitMs !== null) {
                const transitVariation = Math.abs(transit - avatar.userData.lastTransitMs);
                avatar.userData.jitterMs += (transitVariation - avatar.userData.jitterMs) / 16;
            }
            avatar.userData.lastTransitMs = transit;
            const targetDelay = Math.max(80, Math.min(180, 80 + avatar.userData.jitterMs * 2));
            avatar.userData.interpolationDelayMs += (targetDelay - avatar.userData.interpolationDelayMs) * 0.1;
        }

        // Reuse scratch vectors to compute movement thresholds without allocating new objects
        const hasMoved = !latest
            || pos.distanceToSquared(latest.position) > 0.0001
            || vel.distanceToSquared(latest.velocity) > 0.01
            || Math.abs(Math.atan2(Math.sin(yaw - latest.yaw), Math.cos(yaw - latest.yaw))) > 0.005;

        if (hasMoved && (!latest || effectiveTime > latest.time)) {
            if (snapshots.length >= 20) {
                // In-place recycling of the oldest snapshot in the ring buffer
                const recycled = snapshots.shift();
                recycled.time = effectiveTime;
                recycled.position.copy(pos);
                recycled.velocity.copy(vel);
                recycled.yaw = yaw;
                snapshots.push(recycled);
            } else {
                snapshots.push(acquireSnapshot(effectiveTime, pos, vel, yaw));
            }

            if (snapshots.length === 1) {
                avatar.position.copy(pos);
                avatar.rotation.y = yaw;
            }
        }
    }

    cleanupInactiveAvatars() {
        for (const [playerId, avatar] of this.remotePlayers) {
            if (this._activeIds.has(playerId)) continue;
            this.removeAvatarMesh(avatar);
            this.remotePlayers.delete(playerId);
        }
    }

    removeRemotePlayer(playerId) {
        const avatar = this.remotePlayers.get(playerId);
        if (avatar) {
            this.removeAvatarMesh(avatar);
            this.remotePlayers.delete(playerId);
        }
    }

    removeAvatarMesh(avatar) {
        this.app?.viewport?.scene?.remove(avatar);
        avatar.traverse((child) => {
            if (child.isMesh || child.isSprite) {
                child.geometry?.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        for (let i = 0; i < child.material.length; i++) {
                            child.material[i].map?.dispose();
                            child.material[i].dispose();
                        }
                    } else {
                        child.material.map?.dispose();
                        child.material.dispose();
                    }
                }
            }
        });
        const snapshots = avatar.userData?.snapshots;
        if (snapshots) {
            for (let i = 0; i < snapshots.length; i++) {
                releaseSnapshot(snapshots[i]);
            }
            snapshots.length = 0;
        }
    }

    createAvatar(playerId, playerName = 'Player') {
        const THREE = (typeof window !== 'undefined' && window.THREE) || (typeof globalThis !== 'undefined' && globalThis.THREE) || null;
        const avatar = new THREE.Group();
        avatar.name = `RemotePlayer_${playerId}`;
        avatar.userData.playerId = playerId;
        avatar.userData.playerName = playerName;
        avatar.userData.snapshots = [];
        avatar.userData.renderPosition = new THREE.Vector3();
        avatar.userData.velocity = new THREE.Vector3();
        avatar.userData.lastTransitMs = null;
        avatar.userData.jitterMs = 0;
        avatar.userData.interpolationDelayMs = this.interpolationDelay;
        avatar.userData.billboardSprite = null;

        this.buildAvatarVisuals(avatar, playerName);
        return avatar;
    }

    buildAvatarVisuals(avatar, playerName = 'Player') {
        const toRemove = [];
        for (let i = 0; i < avatar.children.length; i++) {
            toRemove.push(avatar.children[i]);
        }
        for (let i = 0; i < toRemove.length; i++) {
            const child = toRemove[i];
            avatar.remove(child);
            child.traverse((node) => {
                if (node.isMesh || node.isSprite) {
                    node.geometry?.dispose();
                    if (node.material) {
                        if (Array.isArray(node.material)) {
                            for (let m = 0; m < node.material.length; m++) {
                                node.material[m].map?.dispose();
                                node.material[m].dispose();
                            }
                        } else {
                            node.material.map?.dispose();
                            node.material.dispose();
                        }
                    }
                }
            });
        }
        avatar.userData.billboardSprite = null;

        const template = this.app?.characterController?.starterCharacterTemplate;
        if (template) {
            this._buildAvatarFromTemplate(avatar, template);
        } else {
            this._buildFallbackAvatar(avatar);
            if (this.app?.starterCharacterPromise) {
                this.app.starterCharacterPromise.then(() => {
                    if (avatar.parent) {
                        this.buildAvatarVisuals(avatar, avatar.userData.playerName || playerName);
                    }
                }).catch(() => {});
            }
        }

        this.updateAvatarBillboard(avatar, playerName);
    }

    _buildAvatarFromTemplate(avatar, template) {
        const THREE = (typeof window !== 'undefined' && window.THREE) || (typeof globalThis !== 'undefined' && globalThis.THREE) || null;
        const vp = this.app?.viewport;
        const rootPart = template.FindFirstChild('HumanoidRootPart', true);
        const rootPos = rootPart?.Position || { x: 0, y: 3, z: 0 };

        const parts = template.GetDescendants ? template.GetDescendants().filter(i => i.IsA && i.IsA('BasePart')) : [];
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part === rootPart || part.Name === 'HumanoidRootPart') continue;

            const relX = part.Position.x - rootPos.x;
            const relY = part.Position.y - rootPos.y;
            const relZ = part.Position.z - rootPos.z;

            const geo = vp?.createGeometryForPart
                ? vp.createGeometryForPart(part)
                : new THREE.BoxGeometry(part.Size?.x || 1, part.Size?.y || 1, part.Size?.z || 1);

            const mat = vp?.getMaterialForPart
                ? vp.getMaterialForPart(part)
                : new THREE.MeshStandardMaterial({
                    color: new THREE.Color(part.Color?.r ?? 0.639, part.Color?.g ?? 0.635, part.Color?.b ?? 0.647),
                    roughness: 0.5,
                    metalness: 0.05
                });

            const mesh = new THREE.Mesh(geo, mat);
            mesh.name = part.Name;
            mesh.position.set(relX, relY, relZ);
            mesh.rotation.order = 'YXZ';

            if (part.Name === 'Head') {
                mesh.rotation.set(-Math.PI / 2, 0, Math.PI);
            } else if (part.Orientation) {
                mesh.rotation.set(
                    (part.Orientation.x * Math.PI) / 180,
                    (part.Orientation.y * Math.PI) / 180,
                    (part.Orientation.z * Math.PI) / 180
                );
            }

            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData.part = part;

            // Iconic top stud if Head has no SpecialMesh
            if (part.Name === 'Head' && !part.FindFirstChildOfClass?.('SpecialMesh')) {
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

            avatar.add(mesh);

            // Sync projected decals/textures (e.g. iconic smiley face on head)
            if (vp?.syncDecalOverlays) {
                vp.syncDecalOverlays(part, mesh);
            }
        }
    }

    _buildFallbackAvatar(avatar) {
        const THREE = (typeof window !== 'undefined' && window.THREE) || (typeof globalThis !== 'undefined' && globalThis.THREE) || null;
        const vp = this.app?.viewport;
        const color = 0xa3a2a5; // Authentic Medium Stone Grey R6 baseplate dummy

        const makeMat = () => new THREE.MeshStandardMaterial({
            color,
            roughness: 0.5,
            metalness: 0.05
        });

        const addPart = (size, pos, name) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), makeMat());
            mesh.position.set(...pos);
            mesh.name = name;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            avatar.add(mesh);
            return mesh;
        };

        // Torso: (0, 0, 0)
        addPart([2, 2, 1], [0, 0, 0], 'Torso');

        // Limbs: 1 x 2 x 1
        addPart([1, 2, 1], [-1.5, 0, 0], 'Left Arm');
        addPart([1, 2, 1], [1.5, 0, 0], 'Right Arm');
        addPart([1, 2, 1], [-0.5, -2, 0], 'Left Leg');
        addPart([1, 2, 1], [0.5, -2, 0], 'Right Leg');

        // Head: rounded box or standard 2 x 1 x 1
        const headGeo = vp?.createRoundedBoxGeometry
            ? vp.createRoundedBoxGeometry(1.2078, 1.21242, 1.207847)
            : new THREE.BoxGeometry(2, 1, 1);
        const headMat = makeMat();
        const headMesh = new THREE.Mesh(headGeo, headMat);
        headMesh.position.set(0, 1.5, 0);
        headMesh.rotation.order = 'YXZ';
        headMesh.rotation.set(-Math.PI / 2, 0, Math.PI);
        headMesh.name = 'Head';
        headMesh.castShadow = true;
        headMesh.receiveShadow = true;
        avatar.add(headMesh);
    }

    updateAvatarBillboard(avatar, name) {
        if (!avatar || !name) return;
        if (avatar.userData.playerName === name && avatar.userData.billboardSprite) return;
        avatar.userData.playerName = name;
        if (avatar.userData.billboardSprite) {
            avatar.remove(avatar.userData.billboardSprite);
            avatar.userData.billboardSprite.material?.map?.dispose();
            avatar.userData.billboardSprite.material?.dispose();
            avatar.userData.billboardSprite = null;
        }
        const vp = this.app?.viewport;
        const sprite = vp?.createPlayerBillboard ? vp.createPlayerBillboard(name) : this._createFallbackBillboard(name);
        if (sprite) {
            sprite.position.set(0, 2.45, 0);
            avatar.userData.billboardSprite = sprite;
            avatar.add(sprite);
        }
    }

    _createFallbackBillboard(name) {
        if (typeof document === 'undefined') return null;
        const THREE = (typeof window !== 'undefined' && window.THREE) || (typeof globalThis !== 'undefined' && globalThis.THREE) || null;
        if (!THREE) return null;

        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.lineWidth = 6;
        ctx.lineJoin = 'round';
        ctx.strokeText(name, 128, 32);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(name, 128, 32);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(2.4, 0.6, 1.0);
        sprite.renderOrder = 2000;
        return sprite;
    }

    rebuildAllRemoteAvatars() {
        for (const [playerId, avatar] of this.remotePlayers) {
            const name = avatar.userData?.playerName || this.playerNames.get(playerId) || 'Player';
            this.buildAvatarVisuals(avatar, name);
        }
    }

    updateRemoteAvatars(dt) {
        const serverNow = performance.now() + (this.serverClockOffsetMs || 0);
        for (const avatar of this.remotePlayers.values()) {
            const snapshots = avatar.userData.snapshots;
            if (!snapshots.length) continue;
            const renderTime = serverNow - avatar.userData.interpolationDelayMs;

            while (snapshots.length > 2 && snapshots[1].time < renderTime) {
                releaseSnapshot(snapshots.shift());
            }

            const first = snapshots[0];
            const last = snapshots[snapshots.length - 1];
            let renderYaw = first.yaw;
            const renderPosition = avatar.userData.renderPosition;

            if (renderTime <= first.time) {
                renderPosition.copy(first.position);
            } else if (renderTime <= last.time && snapshots.length > 1) {
                let nextIndex = 1;
                while (nextIndex < snapshots.length && snapshots[nextIndex].time < renderTime) nextIndex++;
                const previous = snapshots[nextIndex - 1];
                const next = snapshots[nextIndex];
                const blend = (renderTime - previous.time) / Math.max(1, next.time - previous.time);
                const yawDelta = Math.atan2(Math.sin(next.yaw - previous.yaw), Math.cos(next.yaw - previous.yaw));
                renderPosition.copy(previous.position).lerp(next.position, blend);
                renderYaw = previous.yaw + yawDelta * blend;
            } else {
                renderPosition.copy(last.position);
                renderYaw = last.yaw;
                if (snapshots.length > 1) {
                    const previous = snapshots[snapshots.length - 2];
                    const sampleSeconds = (last.time - previous.time) / 1000;
                    const extrapolateSeconds = Math.min(0.15, Math.max(0, (renderTime - last.time) / 1000));
                    if (sampleSeconds > 0) {
                        const yawDelta = Math.atan2(Math.sin(last.yaw - previous.yaw), Math.cos(last.yaw - previous.yaw));
                        avatar.userData.velocity.copy(last.velocity);
                        renderPosition.addScaledVector(avatar.userData.velocity, extrapolateSeconds);
                        renderYaw += yawDelta / sampleSeconds * extrapolateSeconds;
                    }
                }
            }

            avatar.position.copy(renderPosition);
            avatar.rotation.y = renderYaw;
        }
    }

    resetSnapshotBuffers() {
        for (const avatar of this.remotePlayers.values()) {
            const snapshots = avatar.userData.snapshots;
            for (let i = 0; i < snapshots.length; i++) {
                releaseSnapshot(snapshots[i]);
            }
            snapshots.length = 0;
            avatar.userData.lastTransitMs = null;
            avatar.userData.jitterMs = 0;
            avatar.userData.interpolationDelayMs = this.interpolationDelay;
        }
    }

    setStatus(message, isError = false) {
        if (!this.panel) return;
        const status = this.panel.querySelector('.mp-status');
        if (!status) return;
        status.textContent = message;
        status.classList.toggle('error', isError);
    }

    cleanupConnectionState() {
        this.isConnectedState = false;
        this.stopRafLoop();
        this.socket = null;
        this.playerNames.clear();
        this.updateRemotePlayers([]);
        if (this.panel) {
            const button = this.panel.querySelector('button');
            if (button) button.textContent = 'Connect';
        }
    }

    disconnect() {
        this.stopRafLoop();
        this.isConnectedState = false;
        if (this.socket) {
            try {
                if (this.socket.readyState === WebSocket.OPEN) {
                    this.socket.send(JSON.stringify({ t: 'leave', room: this.room, playerId: this.playerId }));
                    this.socket.close(1000, 'Client left');
                } else {
                    this.socket.close();
                }
            } catch (_) {}
            this.socket = null;
        }
        this.cleanupConnectionState();
        this.setStatus('Not connected');
    }
}
