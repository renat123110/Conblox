/**
 * Conblox Studio Roblox Account Authentication UI
 * Allows users to log in to their Roblox account (via auto-detection from Roblox Studio or .ROBLOSECURITY cookie)
 * to authorize downloading restricted, UGC, and private assets from Roblox Asset Delivery endpoints.
 */

export class RobloxAuthUI {
    constructor(app) {
        this.app = app;
        this.overlayEl = null;
        this.user = null;
        this.isAuthenticated = false;
        this.hasAutoDetect = true;
        this.onLoginCallbacks = [];
        this.customMessage = null;

        this.createDOM();
        this.checkStatus();
    }

    createDOM() {
        this.overlayEl = document.createElement('div');
        this.overlayEl.id = 'studio-roblox-auth-overlay';
        this.overlayEl.className = 'studio-settings-backdrop';
        this.overlayEl.style.display = 'none';

        this.overlayEl.innerHTML = `
            <div class="studio-settings-modal roblox-auth-modal" role="dialog" aria-modal="true" style="width: 540px; height: auto; max-height: 85vh;">
                <!-- Header -->
                <div class="settings-modal-header" style="background: #181b22; border-bottom: 1px solid #2a2e39;">
                    <div class="settings-header-title">
                        <i data-lucide="shield-check" class="settings-header-icon" style="color: #00e5ff;"></i>
                        <span style="font-weight: 600;">Roblox Account Authorization</span>
                    </div>
                    <button class="settings-close-btn" id="btn-close-roblox-auth" title="Close (Esc)">
                        <i data-lucide="x"></i>
                    </button>
                </div>

                <!-- Custom Alert Banner (when opened by a failed download) -->
                <div id="roblox-auth-custom-banner" style="display: none; padding: 12px 18px; background: rgba(255, 170, 0, 0.12); border-bottom: 1px solid rgba(255, 170, 0, 0.3); color: #ffca4a; font-size: 13px; line-height: 1.4; display: flex; align-items: center; gap: 10px;">
                    <i data-lucide="alert-triangle" style="flex-shrink: 0; width: 18px; height: 18px;"></i>
                    <span id="roblox-auth-custom-banner-text"></span>
                </div>

                <!-- Body -->
                <div class="roblox-auth-body" style="padding: 24px; overflow-y: auto;">
                    
                    <!-- 1. Logged In View -->
                    <div id="roblox-auth-logged-in-view" style="display: none; flex-direction: column; align-items: center; text-align: center;">
                        <div style="position: relative; width: 96px; height: 96px; margin-bottom: 16px;">
                            <img id="roblox-user-avatar-img" src="" alt="Avatar" style="width: 96px; height: 96px; border-radius: 50%; border: 3px solid #00e5ff; object-fit: cover; background: #222631; box-shadow: 0 4px 18px rgba(0, 229, 255, 0.25);" />
                            <div style="position: absolute; bottom: 2px; right: 2px; width: 22px; height: 22px; background: #00e676; border: 3px solid #181b22; border-radius: 50%;" title="Connected"></div>
                        </div>

                        <div id="roblox-user-displayname" style="font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 4px;">Player</div>
                        <div id="roblox-user-username" style="font-size: 14px; color: #9aa0b0; margin-bottom: 16px;">@username</div>

                        <div style="background: rgba(0, 230, 118, 0.08); border: 1px solid rgba(0, 230, 118, 0.25); border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; width: 100%; text-align: left; font-size: 13px; color: #b9f6ca; line-height: 1.5;">
                            <div style="font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                                <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i> Active Session Ready
                            </div>
                            Restricted meshes, private assets, and UGC models will now automatically download using your authenticated Roblox token.
                        </div>

                        <div style="display: flex; gap: 12px; width: 100%;">
                            <button class="settings-btn btn-secondary" id="btn-roblox-logout" style="flex: 1; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                <i data-lucide="log-out" style="width: 16px; height: 16px;"></i> Disconnect
                            </button>
                            <button class="settings-btn btn-primary" id="btn-roblox-done" style="flex: 1; padding: 10px; background: #0084ff; border-color: #0084ff; color: #fff; font-weight: 600;">
                                Done
                            </button>
                        </div>
                    </div>

                    <!-- 2. Logged Out View -->
                    <div id="roblox-auth-logged-out-view" style="display: flex; flex-direction: column;">
                        <p style="font-size: 13.5px; color: #a4abbc; line-height: 1.5; margin-bottom: 20px;">
                            Log in to your Roblox account to download private, UGC, and restricted meshes and textures directly into Conblox Studio without authorization errors.
                        </p>

                        <!-- Auto-Detect One-Click Button -->
                        <div id="roblox-autodetect-container" style="margin-bottom: 20px;">
                            <button id="btn-roblox-autodetect" style="width: 100%; padding: 14px 18px; background: linear-gradient(135deg, #0066cc 0%, #0099ff 100%); border: none; border-radius: 8px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 14px rgba(0, 153, 255, 0.3); transition: all 0.15s ease;">
                                <i data-lucide="zap" style="width: 20px; height: 20px;"></i>
                                <div style="text-align: left;">
                                    <div style="font-weight: 600; font-size: 14px;">Connect Active Roblox Session</div>
                                    <div style="font-size: 11.5px; opacity: 0.85;">Auto-detects your login from Roblox Studio on this PC</div>
                                </div>
                            </button>
                        </div>

                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 18px; color: #5a6275; font-size: 11px; font-weight: 600; text-transform: uppercase;">
                            <div style="flex: 1; height: 1px; background: #2a2e39;"></div>
                            <span>or paste .ROBLOSECURITY cookie</span>
                            <div style="flex: 1; height: 1px; background: #2a2e39;"></div>
                        </div>

                        <!-- Manual Cookie Input -->
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 6px;">
                                .ROBLOSECURITY Cookie:
                            </label>
                            <div style="position: relative;">
                                <textarea id="roblox-cookie-input" rows="3" placeholder="_|WARNING:-DO-NOT-SHARE-THIS... (paste your cookie here)" style="width: 100%; box-sizing: border-box; background: #13151b; border: 1px solid #2d3342; border-radius: 6px; padding: 10px 42px 10px 12px; color: #fff; font-family: monospace; font-size: 12px; resize: vertical;"></textarea>
                                <button id="btn-paste-roblox-cookie" title="Paste from clipboard" style="position: absolute; right: 8px; top: 8px; background: #232834; border: 1px solid #3d4558; border-radius: 4px; padding: 5px 8px; color: #a4abbc; cursor: pointer;">
                                    <i data-lucide="clipboard" style="width: 14px; height: 14px;"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Step-by-Step Cookie Guide (Collapsible) -->
                        <details style="background: #141720; border: 1px solid #252a38; border-radius: 6px; padding: 10px 14px; margin-bottom: 20px; font-size: 12px; color: #9aa0b0;">
                            <summary style="cursor: pointer; font-weight: 600; color: #00e5ff; display: flex; align-items: center; gap: 6px;">
                                <i data-lucide="help-circle" style="width: 14px; height: 14px;"></i>
                                Where do I find my .ROBLOSECURITY cookie?
                            </summary>
                            <ol style="margin: 10px 0 0 16px; padding: 0; line-height: 1.6;">
                                <li>Open <b>roblox.com</b> in your browser and ensure you are logged in.</li>
                                <li>Press <b>F12</b> (or Right Click -> Inspect) to open Developer Tools.</li>
                                <li>Click on <b>Application</b> (or <b>Storage</b>) tab -> <b>Cookies</b> -> <b>https://www.roblox.com</b>.</li>
                                <li>Find the cookie named <b>.ROBLOSECURITY</b>, double-click its Value, copy and paste it above.</li>
                            </ol>
                        </details>

                        <!-- Error Message Container -->
                        <div id="roblox-auth-error-msg" style="display: none; padding: 10px 14px; background: rgba(255, 68, 68, 0.12); border: 1px solid rgba(255, 68, 68, 0.35); border-radius: 6px; color: #ff6b6b; font-size: 12.5px; margin-bottom: 16px;"></div>

                        <!-- Buttons -->
                        <div style="display: flex; gap: 12px;">
                            <button class="settings-btn btn-secondary" id="btn-cancel-roblox-auth" style="flex: 1; padding: 10px;">Cancel</button>
                            <button class="settings-btn btn-primary" id="btn-submit-roblox-auth" style="flex: 2; padding: 10px; background: #0084ff; border-color: #0084ff; color: #fff; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <i data-lucide="key" style="width: 16px; height: 16px;"></i> Connect Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlayEl);
        this.bindEvents();
    }

    bindEvents() {
        // Close on X or Cancel or backdrop click
        const closeBtn = this.overlayEl.querySelector('#btn-close-roblox-auth');
        closeBtn?.addEventListener('click', () => this.hide());

        const cancelBtn = this.overlayEl.querySelector('#btn-cancel-roblox-auth');
        cancelBtn?.addEventListener('click', () => this.hide());

        const doneBtn = this.overlayEl.querySelector('#btn-roblox-done');
        doneBtn?.addEventListener('click', () => this.hide());

        this.overlayEl.addEventListener('click', (e) => {
            if (e.target === this.overlayEl) this.hide();
        });

        // Esc key closes modal
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlayEl.style.display !== 'none') {
                this.hide();
            }
        });

        // Auto-detect button
        const autoDetectBtn = this.overlayEl.querySelector('#btn-roblox-autodetect');
        autoDetectBtn?.addEventListener('click', () => this.loginWithAutoDetect());

        // Paste from clipboard button
        const pasteBtn = this.overlayEl.querySelector('#btn-paste-roblox-cookie');
        const cookieInput = this.overlayEl.querySelector('#roblox-cookie-input');
        pasteBtn?.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text && cookieInput) {
                    cookieInput.value = text.trim();
                    cookieInput.focus();
                }
            } catch (err) {
                console.warn('Clipboard read error:', err);
            }
        });

        // Connect button
        const submitBtn = this.overlayEl.querySelector('#btn-submit-roblox-auth');
        submitBtn?.addEventListener('click', () => {
            const cookie = cookieInput?.value?.trim() || '';
            if (!cookie) {
                this.showError('Please enter a .ROBLOSECURITY cookie or click Auto-Detect.');
                return;
            }
            this.loginWithCookie(cookie);
        });

        // Logout button
        const logoutBtn = this.overlayEl.querySelector('#btn-roblox-logout');
        logoutBtn?.addEventListener('click', () => this.logout());
    }

    show(options = {}) {
        if (options.onLogin && typeof options.onLogin === 'function') {
            this.onLoginCallbacks.push(options.onLogin);
        }

        const bannerEl = this.overlayEl.querySelector('#roblox-auth-custom-banner');
        const bannerTextEl = this.overlayEl.querySelector('#roblox-auth-custom-banner-text');
        if (options.message && bannerEl && bannerTextEl) {
            bannerTextEl.textContent = options.message;
            bannerEl.style.display = 'flex';
        } else if (bannerEl) {
            bannerEl.style.display = 'none';
        }

        this.hideError();
        this.renderView();
        this.overlayEl.style.display = 'flex';

        if (window.lucide) {
            window.lucide.createIcons({ root: this.overlayEl });
        }

        // If logged out, focus the cookie input or auto-detect
        if (!this.isAuthenticated) {
            setTimeout(() => {
                const input = this.overlayEl.querySelector('#roblox-cookie-input');
                input?.focus();
            }, 50);
        }
    }

    hide() {
        this.overlayEl.style.display = 'none';
        this.onLoginCallbacks = [];
    }

    showError(msg) {
        const errorEl = this.overlayEl.querySelector('#roblox-auth-error-msg');
        if (errorEl) {
            errorEl.textContent = msg;
            errorEl.style.display = 'block';
        }
    }

    hideError() {
        const errorEl = this.overlayEl.querySelector('#roblox-auth-error-msg');
        if (errorEl) {
            errorEl.style.display = 'none';
            errorEl.textContent = '';
        }
    }

    renderView() {
        const loggedInView = this.overlayEl.querySelector('#roblox-auth-logged-in-view');
        const loggedOutView = this.overlayEl.querySelector('#roblox-auth-logged-out-view');

        if (this.isAuthenticated && this.user) {
            if (loggedInView) loggedInView.style.display = 'flex';
            if (loggedOutView) loggedOutView.style.display = 'none';

            const avatarEl = this.overlayEl.querySelector('#roblox-user-avatar-img');
            const displayNameEl = this.overlayEl.querySelector('#roblox-user-displayname');
            const usernameEl = this.overlayEl.querySelector('#roblox-user-username');

            if (avatarEl) {
                avatarEl.src = this.user.avatarUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="%239aa0b0" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
            }
            if (displayNameEl) displayNameEl.textContent = this.user.displayName || this.user.username || 'Roblox User';
            if (usernameEl) usernameEl.textContent = `@${this.user.username || 'unknown'} (ID: ${this.user.userId || 'N/A'})`;
        } else {
            if (loggedInView) loggedInView.style.display = 'none';
            if (loggedOutView) loggedOutView.style.display = 'flex';
        }

        if (window.lucide) {
            window.lucide.createIcons({ root: this.overlayEl });
        }
    }

    async checkStatus() {
        try {
            const resp = await fetch('/api/roblox-account');
            if (resp.ok) {
                const data = await resp.json();
                this.isAuthenticated = Boolean(data.authenticated && data.user);
                this.user = data.user || null;
                this.hasAutoDetect = Boolean(data.hasAutoDetect);
                this.renderView();
                this.updateTopbarButton();

                if (data.autoDetected && this.app?.outputUI) {
                    this.app.outputUI.log('info', `[Roblox Auth] Connected Roblox account: ${this.user.displayName} (@${this.user.username})`);
                }
            }
        } catch (err) {
            console.warn('[RobloxAuth] Failed to check status:', err);
        }
    }

    async loginWithAutoDetect() {
        this.hideError();
        const autoDetectBtn = this.overlayEl.querySelector('#btn-roblox-autodetect');
        if (autoDetectBtn) autoDetectBtn.disabled = true;

        try {
            const resp = await fetch('/api/roblox-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ autoDetect: true })
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) {
                throw new Error(data.error || 'Auto-detect failed. Please enter cookie manually.');
            }

            this.isAuthenticated = true;
            this.user = data.user;
            this.renderView();
            this.updateTopbarButton();

            if (this.app?.outputUI) {
                this.app.outputUI.log('info', `[Roblox Auth] Successfully connected: ${this.user.displayName} (@${this.user.username})`);
            }

            this.triggerLoginCallbacks();
        } catch (err) {
            this.showError(err.message || 'Auto-detect failed.');
        } finally {
            if (autoDetectBtn) autoDetectBtn.disabled = false;
        }
    }

    async loginWithCookie(cookie) {
        this.hideError();
        const submitBtn = this.overlayEl.querySelector('#btn-submit-roblox-auth');
        if (submitBtn) submitBtn.disabled = true;

        try {
            const resp = await fetch('/api/roblox-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cookie })
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) {
                throw new Error(data.error || 'Failed to authenticate with Roblox cookie.');
            }

            this.isAuthenticated = true;
            this.user = data.user;
            this.renderView();
            this.updateTopbarButton();

            if (this.app?.outputUI) {
                this.app.outputUI.log('info', `[Roblox Auth] Successfully connected: ${this.user.displayName} (@${this.user.username})`);
            }

            this.triggerLoginCallbacks();
        } catch (err) {
            this.showError(err.message || 'Invalid or expired Roblox cookie.');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    }

    async logout() {
        try {
            await fetch('/api/roblox-account/logout', { method: 'POST' });
            this.isAuthenticated = false;
            this.user = null;
            this.renderView();
            this.updateTopbarButton();

            if (this.app?.outputUI) {
                this.app.outputUI.log('info', '[Roblox Auth] Disconnected from Roblox account.');
            }
        } catch (err) {
            console.warn('[RobloxAuth] Logout error:', err);
        }
    }

    triggerLoginCallbacks() {
        const callbacks = [...this.onLoginCallbacks];
        this.onLoginCallbacks = [];
        for (const cb of callbacks) {
            try {
                cb(this.user);
            } catch (e) {
                console.error('[RobloxAuth] Callback error:', e);
            }
        }
    }

    updateTopbarButton() {
        const btn = document.getElementById('btn-roblox-account');
        if (!btn) return;

        if (this.isAuthenticated && this.user) {
            btn.className = 'topbar-user-btn logged-in';
            btn.title = `Roblox Account: ${this.user.displayName} (@${this.user.username}) - Click to manage`;
            btn.innerHTML = `
                <img class="topbar-user-avatar" src="${this.user.avatarUrl || ''}" alt="Avatar" onerror="this.style.display='none'" />
                <span class="topbar-username">${this.user.displayName || this.user.username}</span>
            `;
        } else {
            btn.className = 'topbar-user-btn';
            btn.title = 'Log into Roblox Account';
            btn.innerHTML = `
                <i data-lucide="shield-check"></i>
                <span>Roblox Login</span>
            `;
        }

        if (window.lucide) {
            window.lucide.createIcons({ root: btn });
        }
    }
}
