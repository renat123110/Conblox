/**
 * Conblox BasePart & Part instances
 */

import { Instance } from './Instance.js';
import { Vector3, Color3, CFrame } from './Math3D.js';
import { Signal } from './Signal.js';

export class BasePart extends Instance {
    constructor(className = 'BasePart') {
        super(className);

        this._position = new Vector3(0, 0.5, 0);
        this._size = new Vector3(4, 1, 2);
        this._orientation = new Vector3(0, 0, 0); // degrees
        this._color = Color3.fromRGB(163, 162, 165); // Medium stone grey default
        this._material = 'Plastic';
        this._transparency = 0;
        this._reflectance = 0;
        this._anchored = false;
        this._locked = false;
        this._canCollide = true;
        this._castShadow = true;
        this._shape = 'Block'; // 'Block', 'Ball', 'Cylinder', 'Wedge'
        this._velocity = new Vector3(0, 0, 0);
        this._rotVelocity = new Vector3(0, 0, 0);

        // Physics signals
        this.Touched = new Signal();
        this.TouchEnded = new Signal();
    }

    get Position() { return this._position; }
    set Position(val) {
        const v = val instanceof Vector3 ? val : Vector3.fromJSON(val);
        this._position = v;
        this.Changed.Fire('Position', v);
    }

    get Size() { return this._size; }
    set Size(val) {
        const v = val instanceof Vector3 ? val : Vector3.fromJSON(val);
        // Ensure size is never negative or zero
        this._size = new Vector3(
            Math.max(0.05, Math.abs(v.x)),
            Math.max(0.05, Math.abs(v.y)),
            Math.max(0.05, Math.abs(v.z))
        );
        this.Changed.Fire('Size', this._size);
    }

    get Orientation() { return this._orientation; }
    set Orientation(val) {
        const v = val instanceof Vector3 ? val : Vector3.fromJSON(val);
        this._orientation = v;
        this.Changed.Fire('Orientation', v);
    }

    get CFrame() {
        return new CFrame(this._position.clone(), this._orientation.clone());
    }
    set CFrame(val) {
        const cf = (val instanceof CFrame) ? val : CFrame.fromJSON(val);
        if (cf && cf.position) {
            this.Position = cf.position;
            if (cf.orientation) {
                this.Orientation = cf.orientation;
            }
            this.Changed.Fire('CFrame', this.CFrame);
        }
    }

    get Color() { return this._color; }
    set Color(val) {
        const c = val instanceof Color3 ? val : (typeof val === 'string' ? Color3.fromHex(val) : Color3.fromJSON(val));
        this._color = c;
        this.Changed.Fire('Color', c);
    }

    get BrickColor() {
        return {
            Name: this._color ? this._color.toHex() : '#ffffff',
            Color: this._color,
            toString() { return this.Name; }
        };
    }
    set BrickColor(val) {
        if (!val) return;
        if (typeof val === 'string') {
            this.Color = Color3.fromHex(val.startsWith('#') ? val : '#a0a0a0');
        } else if (val.Color) {
            this.Color = val.Color;
        }
    }

    get Material() { return this._material; }
    set Material(val) {
        this._material = String(val);
        this.Changed.Fire('Material', this._material);
    }

    get Transparency() { return this._transparency; }
    set Transparency(val) {
        this._transparency = Math.max(0, Math.min(1, Number(val) || 0));
        this.Changed.Fire('Transparency', this._transparency);
    }

    get Reflectance() { return this._reflectance; }
    set Reflectance(val) {
        this._reflectance = Math.max(0, Math.min(1, Number(val) || 0));
        this.Changed.Fire('Reflectance', this._reflectance);
    }

    get Anchored() { return this._anchored; }
    set Anchored(val) {
        this._anchored = Boolean(val);
        this.Changed.Fire('Anchored', this._anchored);
    }

    get Locked() { return this._locked; }
    set Locked(val) {
        this._locked = Boolean(val);
        this.Changed.Fire('Locked', this._locked);
    }

    get CanCollide() { return this._canCollide; }
    set CanCollide(val) {
        this._canCollide = Boolean(val);
        this.Changed.Fire('CanCollide', this._canCollide);
    }

    get CastShadow() { return this._castShadow; }
    set CastShadow(val) {
        this._castShadow = Boolean(val);
        this.Changed.Fire('CastShadow', this._castShadow);
    }

    get Shape() { return this._shape; }
    set Shape(val) {
        this._shape = String(val);
        this.Changed.Fire('Shape', this._shape);
    }

    get Velocity() { return this._velocity; }
    set Velocity(val) {
        this._velocity = val instanceof Vector3 ? val : Vector3.fromJSON(val);
        this.Changed.Fire('Velocity', this._velocity);
    }

    get RotVelocity() { return this._rotVelocity; }
    set RotVelocity(val) {
        this._rotVelocity = val instanceof Vector3 ? val : Vector3.fromJSON(val);
        this.Changed.Fire('RotVelocity', this._rotVelocity);
    }

    ApplyImpulse(impulseVector) {
        if (this._anchored) return;
        const imp = impulseVector instanceof Vector3 ? impulseVector : Vector3.fromJSON(impulseVector);
        this.Velocity = this.Velocity.add(imp);
    }

    serializeProperties() {
        return {
            cframe: this.CFrame.toJSON(),
            position: this._position.toJSON(),
            size: this._size.toJSON(),
            orientation: this._orientation.toJSON(),
            color: this._color.toJSON(),
            material: this._material,
            transparency: this._transparency,
            reflectance: this._reflectance,
            anchored: this._anchored,
            locked: this._locked,
            canCollide: this._canCollide,
            castShadow: this._castShadow,
            shape: this._shape
        };
    }

    deserializeProperties(props) {
        if (props.cframe) {
            const cf = CFrame.fromJSON(props.cframe);
            if (cf) {
                if (cf.position) this._position = cf.position;
                if (cf.orientation) this._orientation = cf.orientation;
            }
        }
        if (props.position) this._position = Vector3.fromJSON(props.position);
        if (props.size) this._size = Vector3.fromJSON(props.size);
        if (props.orientation) this._orientation = Vector3.fromJSON(props.orientation);
        if (props.color) this._color = Color3.fromJSON(props.color);
        if (props.material !== undefined) this._material = props.material;
        if (props.transparency !== undefined) this._transparency = props.transparency;
        if (props.reflectance !== undefined) this._reflectance = props.reflectance;
        if (props.anchored !== undefined) this._anchored = props.anchored;
        if (props.locked !== undefined) this._locked = Boolean(props.locked);
        if (props.canCollide !== undefined) this._canCollide = props.canCollide;
        if (props.castShadow !== undefined) this._castShadow = props.castShadow;
        if (props.shape !== undefined) this._shape = props.shape;
    }
}

export class Part extends BasePart {
    constructor() {
        super('Part');
    }
}

export class SpawnLocation extends BasePart {
    constructor() {
        super('SpawnLocation');
        this.Name = 'SpawnLocation';
        this.Size = new Vector3(6, 1, 6);
        this.Color = Color3.fromRGB(163, 162, 165);
        this.Anchored = true;
        this.enabled = true;
    }

    get Enabled() { return this.enabled; }
    set Enabled(val) {
        this.enabled = Boolean(val);
        this.Changed.Fire('Enabled', this.enabled);
    }

    serializeProperties() {
        return {
            ...super.serializeProperties(),
            enabled: this.enabled
        };
    }

    deserializeProperties(props) {
        super.deserializeProperties(props);
        if (props.enabled !== undefined) this.enabled = props.enabled;
    }
}

Instance.register('BasePart', BasePart);
Instance.register('Part', Part);
Instance.register('SpawnLocation', SpawnLocation);
