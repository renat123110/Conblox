/**
 * Conblox Core Engine Services & Enum System
 * Roblox-compatible UserInputService, RunService, and Enum hierarchy
 */

import { Instance } from './Instance.js';
import { Vector3, Vector2 } from './Math3D.js';
import { Signal } from './Signal.js';

// --- Enum Implementation ---

export class EnumItem {
    constructor(name, value, enumType) {
        this.Name = name;
        this.Value = value;
        this.EnumType = enumType;
    }

    toString() {
        return `Enum.${this.EnumType}.${this.Name}`;
    }

    [Symbol.toPrimitive](hint) {
        if (hint === 'number') return this.Value;
        return this.Name;
    }
}

export class EnumCollection {
    constructor(name, items) {
        this._name = name;
        this._items = {};
        for (const [key, val] of Object.entries(items)) {
            const item = new EnumItem(key, val, name);
            this[key] = item;
            this._items[key] = item;
        }
    }

    GetEnumItems() {
        return Object.values(this._items);
    }

    from(val) {
        if (val instanceof EnumItem) return val;
        if (typeof val === 'string') {
            const found = this._items[val] || Object.values(this._items).find(i => i.Name.toLowerCase() === val.toLowerCase());
            if (found) return found;
        }
        if (typeof val === 'number') {
            const found = Object.values(this._items).find(i => i.Value === val);
            if (found) return found;
        }
        return this._items.Unknown || null;
    }
}

export const Enum = {
    KeyCode: new EnumCollection('KeyCode', {
        Unknown: 0,
        Backspace: 8,
        Tab: 9,
        Clear: 12,
        Return: 13,
        Enter: 13,
        Pause: 19,
        Escape: 27,
        Space: 32,
        Quote: 39,
        Comma: 44,
        Minus: 45,
        Period: 46,
        Slash: 47,
        Zero: 48,
        One: 49,
        Two: 50,
        Three: 51,
        Four: 52,
        Five: 53,
        Six: 54,
        Seven: 55,
        Eight: 56,
        Nine: 57,
        Semicolon: 59,
        Equals: 61,
        LeftBracket: 91,
        Backslash: 92,
        RightBracket: 93,
        Backquote: 96,
        A: 97,
        B: 98,
        C: 99,
        D: 100,
        E: 101,
        F: 102,
        G: 103,
        H: 104,
        I: 105,
        J: 106,
        K: 107,
        L: 108,
        M: 109,
        N: 110,
        O: 111,
        P: 112,
        Q: 113,
        R: 114,
        S: 115,
        T: 116,
        U: 117,
        V: 118,
        W: 119,
        X: 120,
        Y: 121,
        Z: 122,
        Delete: 127,
        Up: 273,
        Down: 274,
        Right: 275,
        Left: 276,
        Insert: 277,
        Home: 278,
        End: 279,
        PageUp: 280,
        PageDown: 281,
        F1: 282,
        F2: 283,
        F3: 284,
        F4: 285,
        F5: 286,
        F6: 287,
        F7: 288,
        F8: 289,
        F9: 290,
        F10: 291,
        F11: 292,
        F12: 293,
        CapsLock: 301,
        RightShift: 303,
        LeftShift: 304,
        RightControl: 305,
        LeftControl: 306,
        RightAlt: 307,
        LeftAlt: 308
    }),

    UserInputType: new EnumCollection('UserInputType', {
        MouseButton1: 0,
        MouseButton2: 1,
        MouseButton3: 2,
        MouseWheel: 3,
        MouseMovement: 4,
        Touch: 7,
        Keyboard: 8,
        Focus: 9,
        None: 0
    }),

    UserInputState: new EnumCollection('UserInputState', {
        Begin: 0,
        Change: 1,
        End: 2,
        Cancel: 3,
        None: 4
    }),

    NormalId: new EnumCollection('NormalId', {
        Front: 0,
        Back: 1,
        Top: 2,
        Bottom: 3,
        Left: 4,
        Right: 5
    }),

    Material: new EnumCollection('Material', {
        Plastic: 256,
        SmoothPlastic: 272,
        Neon: 288,
        Wood: 512,
        Slate: 800,
        Concrete: 816,
        CorrodedMetal: 1040,
        DiamondPlate: 1056,
        Foil: 1072,
        Grass: 1280,
        Ice: 1536,
        Brick: 1552,
        Sand: 1568,
        Fabric: 1584,
        Granite: 1600,
        Marble: 1616,
        Pebble: 1632,
        Cobblestone: 1648,
        Glass: 1664,
        ForceField: 1680
    }),

    MouseBehavior: new EnumCollection('MouseBehavior', {
        Default: 0,
        LockCenter: 1,
        LockCurrentPosition: 2
    })
};

// --- InputObject Class ---

export class InputObject {
    constructor(keyCode, userInputType, userInputState, position = null, delta = null) {
        this.KeyCode = keyCode || Enum.KeyCode.Unknown;
        this.UserInputType = userInputType || Enum.UserInputType.None;
        this.UserInputState = userInputState || Enum.UserInputState.None;
        this.Position = position || new Vector3(0, 0, 0);
        this.Delta = delta || new Vector3(0, 0, 0);
    }

    IsModifierKeyDown(key) {
        if (!key) return false;
        const name = typeof key === 'string' ? key : key.Name;
        if (name === 'LeftShift' || name === 'RightShift' || name === 'Shift') {
            return window.conbloxStudio?.viewport?.flyKeys?.shift || false;
        }
        if (name === 'LeftControl' || name === 'RightControl' || name === 'Ctrl') {
            return window.conbloxStudio?.viewport?.isCtrlDown || false;
        }
        return false;
    }
}

// Map browser KeyboardEvent.code/key to Enum.KeyCode
export function mapBrowserKeyToEnum(e) {
    if (!e) return Enum.KeyCode.Unknown;
    const code = e.code;
    const key = e.key;

    if (code) {
        if (code.startsWith('Key')) {
            const letter = code.substring(3).toUpperCase();
            if (Enum.KeyCode[letter]) return Enum.KeyCode[letter];
        }
        if (code.startsWith('Digit')) {
            const digitNames = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
            const digit = parseInt(code.substring(5), 10);
            if (!isNaN(digit) && digitNames[digit] && Enum.KeyCode[digitNames[digit]]) {
                return Enum.KeyCode[digitNames[digit]];
            }
        }
        if (code === 'Space') return Enum.KeyCode.Space;
        if (code === 'Enter') return Enum.KeyCode.Return;
        if (code === 'Escape') return Enum.KeyCode.Escape;
        if (code === 'Tab') return Enum.KeyCode.Tab;
        if (code === 'Backspace') return Enum.KeyCode.Backspace;
        if (code === 'Delete') return Enum.KeyCode.Delete;
        if (code === 'ShiftLeft') return Enum.KeyCode.LeftShift;
        if (code === 'ShiftRight') return Enum.KeyCode.RightShift;
        if (code === 'ControlLeft') return Enum.KeyCode.LeftControl;
        if (code === 'ControlRight') return Enum.KeyCode.RightControl;
        if (code === 'AltLeft') return Enum.KeyCode.LeftAlt;
        if (code === 'AltRight') return Enum.KeyCode.RightAlt;
        if (code === 'ArrowUp') return Enum.KeyCode.Up;
        if (code === 'ArrowDown') return Enum.KeyCode.Down;
        if (code === 'ArrowLeft') return Enum.KeyCode.Left;
        if (code === 'ArrowRight') return Enum.KeyCode.Right;
        if (code.startsWith('F') && code.length <= 3) {
            if (Enum.KeyCode[code]) return Enum.KeyCode[code];
        }
    }

    // Fallback from key string
    if (key) {
        const u = key.toUpperCase();
        if (u.length === 1 && Enum.KeyCode[u]) return Enum.KeyCode[u];
        if (u === ' ') return Enum.KeyCode.Space;
        if (u === 'ENTER') return Enum.KeyCode.Return;
        if (u === 'ESCAPE') return Enum.KeyCode.Escape;
        if (u === 'TAB') return Enum.KeyCode.Tab;
        if (u === 'BACKSPACE') return Enum.KeyCode.Backspace;
        if (u === 'SHIFT') return Enum.KeyCode.LeftShift;
        if (u === 'CONTROL') return Enum.KeyCode.LeftControl;
        if (u === 'ALT') return Enum.KeyCode.LeftAlt;
    }

    return Enum.KeyCode.Unknown;
}

// --- UserInputService ---

export class UserInputService extends Instance {
    constructor() {
        super('UserInputService');
        this.Name = 'UserInputService';

        // Signals
        this.InputBegan = new Signal();
        this.InputEnded = new Signal();
        this.InputChanged = new Signal();
        this.TextBoxFocused = new Signal();
        this.TextBoxFocusReleased = new Signal();

        // Properties
        this.MouseBehavior = Enum.MouseBehavior.Default;
        this.MouseIconEnabled = true;
        this.KeyboardEnabled = true;
        this.MouseEnabled = true;
        this.TouchEnabled = false;

        // Internal tracking
        this._pressedKeys = new Set();
        this._pressedMouseButtons = new Set();
        this._mousePosition = new Vector2(0, 0);

        this._setupListeners();
    }

    _setupListeners() {
        if (typeof window === 'undefined') return;

        const isInputTarget = (target) => {
            if (!target) return false;
            const tag = target.tagName ? target.tagName.toUpperCase() : '';
            return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable || Boolean(target.closest && target.closest('.CodeMirror'));
        };

        // Keydown
        window.addEventListener('keydown', (e) => {
            const keyCode = mapBrowserKeyToEnum(e);
            const gpe = isInputTarget(e.target);

            this._pressedKeys.add(keyCode.Name);
            this._pressedKeys.add(keyCode.Value);
            if (keyCode.Name.length === 1) {
                this._pressedKeys.add(keyCode.Name.toLowerCase());
            }

            const input = new InputObject(
                keyCode,
                Enum.UserInputType.Keyboard,
                Enum.UserInputState.Begin,
                new Vector3(this._mousePosition.x, this._mousePosition.y, 0)
            );
            this.InputBegan.Fire(input, gpe);
        }, false);

        // Keyup
        window.addEventListener('keyup', (e) => {
            const keyCode = mapBrowserKeyToEnum(e);
            const gpe = isInputTarget(e.target);

            this._pressedKeys.delete(keyCode.Name);
            this._pressedKeys.delete(keyCode.Value);
            if (keyCode.Name.length === 1) {
                this._pressedKeys.delete(keyCode.Name.toLowerCase());
            }

            const input = new InputObject(
                keyCode,
                Enum.UserInputType.Keyboard,
                Enum.UserInputState.End,
                new Vector3(this._mousePosition.x, this._mousePosition.y, 0)
            );
            this.InputEnded.Fire(input, gpe);
        }, false);

        // Mouse Down
        window.addEventListener('mousedown', (e) => {
            const gpe = isInputTarget(e.target);
            this._mousePosition = new Vector2(e.clientX, e.clientY);

            let uType = Enum.UserInputType.MouseButton1;
            if (e.button === 1) uType = Enum.UserInputType.MouseButton3;
            else if (e.button === 2) uType = Enum.UserInputType.MouseButton2;

            this._pressedMouseButtons.add(e.button);
            this._pressedMouseButtons.add(uType.Name);

            const input = new InputObject(
                Enum.KeyCode.Unknown,
                uType,
                Enum.UserInputState.Begin,
                new Vector3(e.clientX, e.clientY, 0)
            );
            this.InputBegan.Fire(input, gpe);
        }, false);

        // Mouse Up
        window.addEventListener('mouseup', (e) => {
            const gpe = isInputTarget(e.target);
            this._mousePosition = new Vector2(e.clientX, e.clientY);

            let uType = Enum.UserInputType.MouseButton1;
            if (e.button === 1) uType = Enum.UserInputType.MouseButton3;
            else if (e.button === 2) uType = Enum.UserInputType.MouseButton2;

            this._pressedMouseButtons.delete(e.button);
            this._pressedMouseButtons.delete(uType.Name);

            const input = new InputObject(
                Enum.KeyCode.Unknown,
                uType,
                Enum.UserInputState.End,
                new Vector3(e.clientX, e.clientY, 0)
            );
            this.InputEnded.Fire(input, gpe);
        }, false);

        // Mouse Move
        window.addEventListener('mousemove', (e) => {
            const gpe = isInputTarget(e.target);
            const prev = this._mousePosition;
            this._mousePosition = new Vector2(e.clientX, e.clientY);
            const delta = new Vector3(e.movementX || (e.clientX - prev.x), e.movementY || (e.clientY - prev.y), 0);

            const input = new InputObject(
                Enum.KeyCode.Unknown,
                Enum.UserInputType.MouseMovement,
                Enum.UserInputState.Change,
                new Vector3(e.clientX, e.clientY, 0),
                delta
            );
            this.InputChanged.Fire(input, gpe);
        }, false);

        // Mouse Wheel
        window.addEventListener('wheel', (e) => {
            const gpe = isInputTarget(e.target);
            const input = new InputObject(
                Enum.KeyCode.Unknown,
                Enum.UserInputType.MouseWheel,
                Enum.UserInputState.Change,
                new Vector3(e.clientX, e.clientY, -Math.sign(e.deltaY))
            );
            this.InputChanged.Fire(input, gpe);
        }, { passive: true });
    }

    IsKeyDown(keyCode) {
        if (!keyCode) return false;
        if (typeof keyCode === 'object' && keyCode.Name) {
            return this._pressedKeys.has(keyCode.Name) || this._pressedKeys.has(keyCode.Value);
        }
        if (typeof keyCode === 'string') {
            return this._pressedKeys.has(keyCode) || this._pressedKeys.has(keyCode.toUpperCase()) || this._pressedKeys.has(keyCode.toLowerCase());
        }
        if (typeof keyCode === 'number') {
            return this._pressedKeys.has(keyCode);
        }
        return false;
    }

    IsMouseButtonPressed(mouseButton) {
        if (mouseButton === null || mouseButton === undefined) return false;
        if (typeof mouseButton === 'object' && mouseButton.Name) {
            return this._pressedMouseButtons.has(mouseButton.Name);
        }
        if (typeof mouseButton === 'number') {
            return this._pressedMouseButtons.has(mouseButton);
        }
        return false;
    }

    GetMouseLocation() {
        return new Vector2(this._mousePosition.x, this._mousePosition.y);
    }

    GetFocusedTextBox() {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
            return active;
        }
        return null;
    }

    reset() {
        this._pressedKeys.clear();
        this._pressedMouseButtons.clear();
    }
}

// --- RunService ---

export class RunService extends Instance {
    constructor() {
        super('RunService');
        this.Name = 'RunService';

        // Signals
        this.Heartbeat = new Signal();
        this.RenderStepped = new Signal();
        this.Stepped = new Signal();

        this._boundRenderSteps = new Map();
        this._totalTime = 0;
        this._studioApp = null;
    }

    setStudioApp(app) {
        this._studioApp = app;
    }

    IsClient() {
        return true;
    }

    IsServer() {
        return Boolean(this._studioApp && this._studioApp.scriptRunner && this._studioApp.scriptRunner.serverSessionId);
    }

    IsStudio() {
        return true;
    }

    IsRunMode() {
        return Boolean(this._studioApp && this._studioApp.simulationState && this._studioApp.simulationState !== 'Edit');
    }

    IsEdit() {
        return !this._studioApp || this._studioApp.simulationState === 'Edit';
    }

    BindToRenderStep(name, priority, callback) {
        if (typeof callback !== 'function') {
            throw new Error('RunService:BindToRenderStep requires a callback function');
        }
        this._boundRenderSteps.set(String(name), {
            priority: Number(priority) || 0,
            callback: callback
        });
    }

    UnbindFromRenderStep(name) {
        this._boundRenderSteps.delete(String(name));
    }

    _fireStepped(dt) {
        this._totalTime += dt;
        this.Stepped.Fire(this._totalTime, dt);
    }

    _fireHeartbeat(dt) {
        this.Heartbeat.Fire(dt);
    }

    _fireRenderStepped(dt) {
        // Execute bound render step callbacks in ascending priority
        if (this._boundRenderSteps.size > 0) {
            const sorted = Array.from(this._boundRenderSteps.values()).sort((a, b) => a.priority - b.priority);
            for (const item of sorted) {
                try {
                    item.callback(dt);
                } catch (err) {
                    console.error('Error in RunService bound render step:', err);
                }
            }
        }
        this.RenderStepped.Fire(dt);
    }

    reset() {
        if (this.Heartbeat) this.Heartbeat.Destroy();
        if (this.RenderStepped) this.RenderStepped.Destroy();
        if (this.Stepped) this.Stepped.Destroy();
        this.Heartbeat = new Signal();
        this.RenderStepped = new Signal();
        this.Stepped = new Signal();
        this._boundRenderSteps.clear();
        this._totalTime = 0;
    }
}
