/**
 * Conblox Studio - Seamless Native Mouse Lock & Raw Input Manager
 * 
 * Replaces standard browser requestPointerLock() completely:
 * - Zero Chromium security overlay warnings ("Press ESC to exit").
 * - System-level cursor hiding via Win32 ShowCursor(FALSE) through the local server.
 * - Hardware cursor pinning to fixed click anchor coordinates via Win32 SetCursorPos.
 * - Strict filtering and rejection of programmatic reset / teleport events.
 * - Purely accumulative rotation model for camera Yaw & Pitch without spring-back.
 * - Frees up the Escape key for in-game Roblox Experience / Pause menu.
 */

export class NativeInputManager {
    constructor() {
        this.isLocked = false;
        this.lockMode = null; // 'viewport_rmb' | 'character_first_person' | 'character_rmb'
        this.activeTargetEl = null;

        // Anchor coordinates of initial RMB click / lock
        this.anchorScreenX = 0;
        this.anchorScreenY = 0;
        this.anchorClientX = 0;
        this.anchorClientY = 0;

        // Last client position for incremental delta calculation
        this.lastClientX = 0;
        this.lastClientY = 0;

        // Teleport / reset tracking
        this.pendingTeleports = 0;
        this._teleportActive = false;
        this.hasNativeHost = false;

        this._checkNativeSupport();

        // Safety fallback on window blur
        window.addEventListener('blur', () => {
            if (this.isLocked) {
                this.unlock({ restorePos: true });
            }
        });
    }

    async _checkNativeSupport() {
        try {
            const res = await fetch('/api/native/status');
            if (res.ok) {
                const data = await res.json();
                this.hasNativeHost = !!data.canCapture;
            }
        } catch (e) {
            this.hasNativeHost = false;
        }
    }

    /**
     * Lock the cursor seamlessly at fixed anchor coordinates
     */
    async lock({
        targetEl = null,
        mode = 'default',
        clientX = null,
        clientY = null,
        screenX = null,
        screenY = null
    } = {}) {
        this.isLocked = true;
        this.lockMode = mode;
        this.activeTargetEl = targetEl || document.getElementById('viewport-3d');
        const hideCursor = mode !== 'character_rmb';

        document.body.style.cursor = hideCursor ? 'none' : 'default';
        if (this.activeTargetEl) {
            this.activeTargetEl.style.cursor = hideCursor ? 'none' : 'default';
        }

        // Store exact anchor coordinates where mouse was pressed
        const cX = (clientX !== null) ? clientX : Math.round(window.innerWidth / 2);
        const cY = (clientY !== null) ? clientY : Math.round(window.innerHeight / 2);
        const sX = (screenX !== null) ? screenX : ((window.screenX || window.screenLeft || 0) + cX);
        const sY = (screenY !== null) ? screenY : ((window.screenY || window.screenTop || 0) + cY);

        this.anchorClientX = cX;
        this.anchorClientY = cY;
        this.anchorScreenX = sX;
        this.anchorScreenY = sY;

        const rect = this.activeTargetEl?.getBoundingClientRect();
        const screenOriginX = sX - cX;
        const screenOriginY = sY - cY;
        const clipRect = rect ? [
            Math.floor(screenOriginX + rect.left),
            Math.floor(screenOriginY + rect.top),
            Math.ceil(screenOriginX + rect.right),
            Math.ceil(screenOriginY + rect.bottom)
        ] : null;

        this.lastClientX = cX;
        this.lastClientY = cY;
        this.pendingTeleports = 0;
        this._teleportActive = false;

        // Inform Win32 host to hide OS cursor and record anchor
        try {
            await fetch('/api/native/mouse/lock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    screenX: this.anchorScreenX,
                    screenY: this.anchorScreenY,
                    mode: mode,
                    hideCursor,
                    clipRect
                })
            });
        } catch (err) {
            // Web fallback
        }
    }

    /**
     * Unlock the cursor and restore system cursor visibility and position
     */
    async unlock({ restorePos = true, mode = null } = {}) {
        if (mode && this.lockMode !== mode) {
            return;
        }

        this.isLocked = false;
        this.lockMode = null;
        this.pendingTeleports = 0;
        this._teleportActive = false;

        // Restore web cursor
        document.body.style.cursor = 'default';
        if (this.activeTargetEl) {
            this.activeTargetEl.style.cursor = 'default';
            this.activeTargetEl = null;
        }

        // Inform Win32 server host to restore ShowCursor(TRUE) and position
        try {
            await fetch('/api/native/mouse/unlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restorePos })
            });
        } catch (err) {
            // Ignored
        }
    }

    /**
     * Calculate relative incremental mouse deltas (dx, dy)
     * Strictly filters out programmatic teleport / reset events to prevent camera spring-back
     */
    getDelta(e) {
        if (!this.isLocked) {
            this.lastClientX = e.clientX;
            this.lastClientY = e.clientY;
            return { dx: 0, dy: 0, isTeleport: false, isLocked: false };
        }

        const distToAnchor = Math.hypot(e.clientX - this.anchorClientX, e.clientY - this.anchorClientY);
        const jumpFromLast = Math.hypot(e.clientX - this.lastClientX, e.clientY - this.lastClientY);

        // 1. Detect if this event is a programmatic teleport / reset return
        let isTeleport = false;

        // If cursor returned to the fixed anchor point after moving away
        if (distToAnchor <= 3 && jumpFromLast > 2) {
            isTeleport = true;
            if (this.pendingTeleports > 0) {
                this.pendingTeleports--;
            }
            this._teleportActive = false;
        } else if (this.pendingTeleports > 0 || this._teleportActive) {
            // Or if we were expecting a recenter and it landed within 35px of target
            if (distToAnchor <= 35) {
                isTeleport = true;
                if (this.pendingTeleports > 0) {
                    this.pendingTeleports--;
                }
                this._teleportActive = false;
            }
        }

        // If this is the reset/teleport event, swallow the jump completely so no reverse delta is applied
        if (isTeleport) {
            this.lastClientX = e.clientX;
            this.lastClientY = e.clientY;
            return { dx: 0, dy: 0, isTeleport: true, isLocked: true };
        }

        // 2. Real user mouse movement: compute relative delta
        let dx = e.movementX;
        let dy = e.movementY;

        if (dx === undefined || (dx === 0 && dy === 0 && (e.clientX !== this.lastClientX || e.clientY !== this.lastClientY))) {
            dx = e.clientX - this.lastClientX;
            dy = e.clientY - this.lastClientY;
        }

        this.lastClientX = e.clientX;
        this.lastClientY = e.clientY;

        // 3. Edge-boundary recentering:
        // Only schedule a hardware recenter when the cursor nears the window boundary (35px margin)
        // to prevent hitting the screen edge while keeping normal rotation completely free of SetCursorPos churn
        const rect = this.activeTargetEl?.getBoundingClientRect();
        const edgeThreshold = 35;
        const isNearEdge = rect ? (
            e.clientX <= rect.left + edgeThreshold ||
            e.clientX >= rect.right - edgeThreshold ||
            e.clientY <= rect.top + edgeThreshold ||
            e.clientY >= rect.bottom - edgeThreshold
        ) : (
            e.clientX <= edgeThreshold ||
            e.clientX >= (window.innerWidth - edgeThreshold) ||
            e.clientY <= edgeThreshold ||
            e.clientY >= (window.innerHeight - edgeThreshold)
        );

        if (this.hasNativeHost && isNearEdge && !this._teleportActive) {
            this._teleportActive = true;
            this.pendingTeleports++;
            fetch('/api/native/mouse/recenter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ x: this.anchorScreenX, y: this.anchorScreenY })
            }).catch(() => {}).finally(() => {
                setTimeout(() => {
                    this._teleportActive = false;
                }, 30);
            });
        }

        return { dx: dx || 0, dy: dy || 0, isTeleport: false, isLocked: true };
    }
}

export const nativeInputManager = new NativeInputManager();
