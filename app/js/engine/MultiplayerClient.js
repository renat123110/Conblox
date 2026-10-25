export class MultiplayerClient {
    constructor(app) {
        this.app = app;
        this.playerId = crypto.randomUUID();
        this.playerName = localStorage.getItem('conbloxPlayerName') || 'Player';
        this.room = '';
        this.endpoint = '';
        this.timer = null;
        this.inFlight = false;
        this.remotePlayers = new Map();
        this.panel = null;
        this.serverClockOffsetMs = null;
        this.interpolationDelay = 100;
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
            <label>Server <input class="mp-server" type="url" placeholder="https://games.example.com"></label>
            <label>Room <input class="mp-room" maxlength="48" autocomplete="off"></label>
            <label>Name <input class="mp-name" maxlength="24" autocomplete="nickname"></label>
            <div class="mp-actions"><span class="mp-status">Not connected</span><button type="button">Connect</button></div>`;
        document.body.appendChild(this.panel);

        this.panel.querySelector('.mp-server').value = params.get('server') || location.origin;
        this.panel.querySelector('.mp-room').value = params.get('room') || this.app.currentPlaceName.replace(/\.cblx$/i, '') || 'default';
        this.panel.querySelector('.mp-name').value = this.playerName;
        this.panel.querySelector('button').addEventListener('click', () => {
            if (this.timer) this.disconnect();
            else this.connect();
        });
        if (params.has('server')) this.connect();
    }

    connect() {
        const serverInput = this.panel.querySelector('.mp-server');
        const roomInput = this.panel.querySelector('.mp-room');
        const nameInput = this.panel.querySelector('.mp-name');
        let serverUrl;
        try {
            serverUrl = new URL(serverInput.value.trim());
            if (!['http:', 'https:'].includes(serverUrl.protocol)) throw new Error('Invalid protocol');
        } catch {
            this.setStatus('Enter a valid HTTP(S) server URL', true);
            return;
        }

        const room = roomInput.value.trim();
        if (!/^[A-Za-z0-9_-]{1,48}$/.test(room)) {
            this.setStatus('Room: letters, numbers, _ or -', true);
            return;
        }

        this.room = room;
        this.playerName = nameInput.value.trim().slice(0, 24) || 'Player';
        localStorage.setItem('conbloxPlayerName', this.playerName);
        this.endpoint = new URL('/api/multiplayer/sync', serverUrl.origin).toString();
        this.panel.querySelector('button').textContent = 'Disconnect';
        this.setStatus('Connecting...');
        this.timer = setInterval(() => this.sync(), 50);
        this.sync();
    }

    async sync() {
        if (!this.timer || this.inFlight) return;
        const rootPart = this.app.characterController.rootPart;
        const position = rootPart?.Position;
        if (!position) return;
        const body = this.app.physicsEngine.bodyMap.get(rootPart);
        const velocity = body?.velocity || { x: 0, y: 0, z: 0 };
        this.inFlight = true;
        const sentAt = performance.now();
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room: this.room,
                    playerId: this.playerId,
                    name: this.playerName,
                    position: { x: position.x, y: position.y, z: position.z },
                    velocity: { x: velocity.x, y: velocity.y, z: velocity.z },
                    yaw: this.app.characterController.characterYaw
                })
            });
            const result = await response.json();
            const receivedAt = performance.now();
            if (!response.ok) throw new Error(result.error || 'Server rejected connection');
            if (!this.timer) return;
            if (Number.isFinite(result.serverTime)) {
                const offsetSample = result.serverTime - (sentAt + receivedAt) / 2;
                if (this.serverClockOffsetMs === null || Math.abs(offsetSample - this.serverClockOffsetMs) > 5000) {
                    if (this.serverClockOffsetMs !== null) this.resetSnapshotBuffers();
                    this.serverClockOffsetMs = offsetSample;
                } else {
                    this.serverClockOffsetMs += (offsetSample - this.serverClockOffsetMs) * 0.08;
                }
            }
            this.setStatus(`${result.players.length} player${result.players.length === 1 ? '' : 's'} connected`);
            this.updateRemotePlayers(result.players, receivedAt);
        } catch (error) {
            this.setStatus(error.message || 'Connection failed', true);
        } finally {
            this.inFlight = false;
        }
    }

    updateRemotePlayers(players, receivedAt = performance.now()) {
        const activeIds = new Set();
        for (const player of players) {
            if (player.id === this.playerId) continue;
            activeIds.add(player.id);
            let avatar = this.remotePlayers.get(player.id);
            if (!avatar) {
                avatar = this.createAvatar(player.id);
                this.remotePlayers.set(player.id, avatar);
                this.app.viewport.scene.add(avatar);
            }
            const snapshots = avatar.userData.snapshots;
            const latest = snapshots[snapshots.length - 1];
            const position = new THREE.Vector3(player.position.x, player.position.y, player.position.z);
            const velocity = new THREE.Vector3(player.velocity?.x || 0, player.velocity?.y || 0, player.velocity?.z || 0);
            const snapshotTime = Number.isFinite(player.timestamp)
                ? player.timestamp
                : receivedAt + (this.serverClockOffsetMs || 0);
            const transit = receivedAt + (this.serverClockOffsetMs || 0) - snapshotTime;
            if (Number.isFinite(transit)) {
                if (avatar.userData.lastTransitMs !== null) {
                    const transitVariation = Math.abs(transit - avatar.userData.lastTransitMs);
                    avatar.userData.jitterMs += (transitVariation - avatar.userData.jitterMs) / 16;
                }
                avatar.userData.lastTransitMs = transit;
                const targetDelay = Math.max(80, Math.min(180, 80 + avatar.userData.jitterMs * 2));
                avatar.userData.interpolationDelayMs += (targetDelay - avatar.userData.interpolationDelayMs) * 0.1;
            }
            const hasMoved = !latest
                || position.distanceToSquared(latest.position) > 0.0001
                || velocity.distanceToSquared(latest.velocity) > 0.01
                || Math.abs(Math.atan2(Math.sin(player.yaw - latest.yaw), Math.cos(player.yaw - latest.yaw))) > 0.005;
            if (hasMoved && (!latest || snapshotTime > latest.time)) {
                snapshots.push({ time: snapshotTime, position, velocity, yaw: player.yaw });
                if (snapshots.length === 1) {
                    avatar.position.copy(position);
                    avatar.rotation.y = player.yaw;
                }
                if (snapshots.length > 20) snapshots.shift();
            }
        }
        for (const [playerId, avatar] of this.remotePlayers) {
            if (activeIds.has(playerId)) continue;
            this.app.viewport.scene.remove(avatar);
            avatar.traverse((part) => {
                part.geometry?.dispose();
                part.material?.dispose();
            });
            this.remotePlayers.delete(playerId);
        }
    }

    createAvatar(playerId) {
        const palette = [0xe16b52, 0x48a999, 0xd2a23a, 0x668bd4, 0xb765a2];
        const color = palette[playerId.charCodeAt(0) % palette.length];
        const avatar = new THREE.Group();
        avatar.userData.snapshots = [];
        avatar.userData.renderPosition = new THREE.Vector3();
        avatar.userData.velocity = new THREE.Vector3();
        avatar.userData.lastTransitMs = null;
        avatar.userData.jitterMs = 0;
        avatar.userData.interpolationDelayMs = this.interpolationDelay;
        const addPart = (size, position, partColor) => {
            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry(...size),
                new THREE.MeshStandardMaterial({ color: partColor, roughness: 0.78 })
            );
            mesh.position.set(...position);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            avatar.add(mesh);
        };
        addPart([2, 2, 1], [0, 0.5, 0], color);
        addPart([1.8, 1.25, 1.25], [0, 2.1, 0], 0xf5cd2f);
        addPart([1, 2, 1], [-1.5, 0.5, 0], 0xf5cd2f);
        addPart([1, 2, 1], [1.5, 0.5, 0], 0xf5cd2f);
        addPart([1, 2, 1], [-0.5, -1.5, 0], 0x287f46);
        addPart([1, 2, 1], [0.5, -1.5, 0], 0x287f46);
        return avatar;
    }

    update(dt) {
        const serverNow = performance.now() + (this.serverClockOffsetMs || 0);
        for (const avatar of this.remotePlayers.values()) {
            const snapshots = avatar.userData.snapshots;
            if (!snapshots.length) continue;
            const renderTime = serverNow - avatar.userData.interpolationDelayMs;
            while (snapshots.length > 2 && snapshots[1].time < renderTime) snapshots.shift();

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
            avatar.userData.snapshots.length = 0;
            avatar.userData.lastTransitMs = null;
            avatar.userData.jitterMs = 0;
            avatar.userData.interpolationDelayMs = this.interpolationDelay;
        }
    }

    setStatus(message, isError = false) {
        if (!this.panel) return;
        const status = this.panel.querySelector('.mp-status');
        status.textContent = message;
        status.classList.toggle('error', isError);
    }

    disconnect() {
        if (!this.timer) return;
        clearInterval(this.timer);
        this.timer = null;
        fetch(this.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room: this.room, playerId: this.playerId, action: 'leave' }),
            keepalive: true
        }).catch(() => {});
        this.updateRemotePlayers([]);
        this.panel.querySelector('button').textContent = 'Connect';
        this.setStatus('Not connected');
    }
}
