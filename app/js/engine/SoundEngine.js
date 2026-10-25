/**
 * Conblox Sound Engine
 * Synthesizes classic Roblox-style retro sound effects using Web Audio API
 */

export class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    getContext() {
        if (!this.ctx && typeof AudioContext !== 'undefined') {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    // Classic Roblox "Oof!" hurt sound
    playOof() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        // Pitch drops from 400Hz to 160Hz over 0.22 seconds
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.22);

        // Lowpass filter to give it that vocal/body resonance
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(350, now + 0.22);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.22);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Jump sound
    playJump() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.12);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Trampoline bounce
    playBounce() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.2);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Coin collect chime
    playCoin() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(987.77, now); // B5
        osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.08);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.4);
    }

    // Click / placement sound
    playClick() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(400, now + 0.03);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }
}
