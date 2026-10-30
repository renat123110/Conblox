/**
 * Conblox Core Math Library
 * Vector3, Color3, CFrame
 */

export class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = Number(x) || 0;
        this.y = Number(y) || 0;
        this.z = Number(z) || 0;
    }

    static new(x = 0, y = 0, z = 0) {
        return new Vector3(x, y, z);
    }

    static get zero() { return new Vector3(0, 0, 0); }
    static get one() { return new Vector3(1, 1, 1); }
    static get up() { return new Vector3(0, 1, 0); }
    static get down() { return new Vector3(0, -1, 0); }
    static get left() { return new Vector3(-1, 0, 0); }
    static get right() { return new Vector3(1, 0, 0); }
    static get forward() { return new Vector3(0, 0, -1); }
    static get back() { return new Vector3(0, 0, 1); }

    add(other) {
        return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    sub(other) {
        return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    mul(scalarOrVec) {
        if (typeof scalarOrVec === 'number') {
            return new Vector3(this.x * scalarOrVec, this.y * scalarOrVec, this.z * scalarOrVec);
        }
        return new Vector3(this.x * scalarOrVec.x, this.y * scalarOrVec.y, this.z * scalarOrVec.z);
    }

    div(scalar) {
        if (scalar === 0) return new Vector3(0, 0, 0);
        return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
    }

    dot(other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    cross(other) {
        return new Vector3(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x
        );
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    unit() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector3(0, 0, 0);
        return this.div(mag);
    }

    lerp(other, alpha) {
        return this.add(other.sub(this).mul(alpha));
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    toArray() {
        return [this.x, this.y, this.z];
    }

    static fromArray(arr) {
        return new Vector3(arr[0] || 0, arr[1] || 0, arr[2] || 0);
    }

    toJSON() {
        return { x: this.x, y: this.y, z: this.z };
    }

    static fromJSON(json) {
        if (!json) return new Vector3();
        return new Vector3(json.x, json.y, json.z);
    }

    toString() {
        return `${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)}`;
    }
}

export function nearestEulerYXZ(euler, reference = Vector3.zero) {
    const radiansPerDegree = Math.PI / 180;
    const previous = [reference.x, reference.y, reference.z].map(value => value * radiansPerDegree);
    const candidates = [
        [euler.x, euler.y, euler.z],
        [Math.PI - euler.x, euler.y + Math.PI, euler.z + Math.PI]
    ];
    let bestAngles = null;
    let bestDistance = Infinity;

    for (const candidate of candidates) {
        const angles = candidate.map((angle, index) => {
            const nearestTurn = Math.round((previous[index] - angle) / (Math.PI * 2));
            return angle + nearestTurn * Math.PI * 2;
        });
        const distance = angles.reduce((sum, angle, index) => sum + (angle - previous[index]) ** 2, 0);
        if (distance < bestDistance) {
            bestAngles = angles;
            bestDistance = distance;
        }
    }

    return new Vector3(...bestAngles.map(angle => angle / radiansPerDegree));
}

export class Color3 {
    constructor(r = 1, g = 1, b = 1) {
        // Stored as 0.0 - 1.0
        this.r = Math.max(0, Math.min(1, Number(r) || 0));
        this.g = Math.max(0, Math.min(1, Number(g) || 0));
        this.b = Math.max(0, Math.min(1, Number(b) || 0));
    }

    static new(r = 1, g = 1, b = 1) {
        return new Color3(r, g, b);
    }

    static fromRGB(r = 255, g = 255, b = 255) {
        return new Color3(r / 255, g / 255, b / 255);
    }

    static fromHex(hex) {
        if (!hex) return new Color3(1, 1, 1);
        let clean = hex.replace('#', '');
        if (clean.length === 3) {
            clean = clean.split('').map(c => c + c).join('');
        }
        const num = parseInt(clean, 16);
        return new Color3(
            ((num >> 16) & 255) / 255,
            ((num >> 8) & 255) / 255,
            (num & 255) / 255
        );
    }

    toHex() {
        const r = Math.round(this.r * 255).toString(16).padStart(2, '0');
        const g = Math.round(this.g * 255).toString(16).padStart(2, '0');
        const b = Math.round(this.b * 255).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }

    toRGB() {
        return {
            r: Math.round(this.r * 255),
            g: Math.round(this.g * 255),
            b: Math.round(this.b * 255)
        };
    }

    lerp(other, alpha) {
        return new Color3(
            this.r + (other.r - this.r) * alpha,
            this.g + (other.g - this.g) * alpha,
            this.b + (other.b - this.b) * alpha
        );
    }

    clone() {
        return new Color3(this.r, this.g, this.b);
    }

    toJSON() {
        return { r: this.r, g: this.g, b: this.b };
    }

    static fromJSON(json) {
        if (!json) return new Color3();
        return new Color3(json.r, json.g, json.b);
    }

    toString() {
        const rgb = this.toRGB();
        return `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }
}

export class CFrame {
    constructor(position = new Vector3(), orientation = new Vector3()) {
        this.position = position instanceof Vector3 ? position : Vector3.fromJSON(position);
        this.orientation = orientation instanceof Vector3 ? orientation : Vector3.fromJSON(orientation); // in degrees
    }

    get Position() { return this.position; }
    get p() { return this.position; }
    get Orientation() { return this.orientation; }
    get X() { return this.position.x; }
    get Y() { return this.position.y; }
    get Z() { return this.position.z; }

    get LookVector() {
        const radX = (this.orientation.x * Math.PI) / 180;
        const radY = (this.orientation.y * Math.PI) / 180;
        const cosX = Math.cos(radX), sinX = Math.sin(radX);
        const cosY = Math.cos(radY), sinY = Math.sin(radY);
        return new Vector3(-sinY * cosX, sinX, -cosY * cosX);
    }

    get RightVector() {
        const radY = (this.orientation.y * Math.PI) / 180;
        return new Vector3(Math.cos(radY), 0, -Math.sin(radY));
    }

    get UpVector() {
        return new Vector3(0, 1, 0);
    }

    static new(x = 0, y = 0, z = 0) {
        if (x instanceof Vector3) {
            return new CFrame(x.clone());
        }
        return new CFrame(new Vector3(Number(x) || 0, Number(y) || 0, Number(z) || 0));
    }

    static Angles(rx = 0, ry = 0, rz = 0) {
        // rx, ry, rz in radians
        const toDeg = 180 / Math.PI;
        return new CFrame(new Vector3(), new Vector3(rx * toDeg, ry * toDeg, rz * toDeg));
    }

    PointToWorldSpace(v) {
        const vec = (v instanceof Vector3) ? v : Vector3.fromJSON(v);
        const radY = (this.orientation.y * Math.PI) / 180;
        const cosY = Math.cos(radY), sinY = Math.sin(radY);
        return new Vector3(
            this.position.x + vec.x * cosY + vec.z * sinY,
            this.position.y + vec.y,
            this.position.z - vec.x * sinY + vec.z * cosY
        );
    }

    PointToObjectSpace(v) {
        const vec = (v instanceof Vector3) ? v : Vector3.fromJSON(v);
        const dx = vec.x - this.position.x;
        const dy = vec.y - this.position.y;
        const dz = vec.z - this.position.z;
        const radY = (this.orientation.y * Math.PI) / 180;
        const cosY = Math.cos(radY), sinY = Math.sin(radY);
        return new Vector3(
            dx * cosY - dz * sinY,
            dy,
            dx * sinY + dz * cosY
        );
    }

    Inverse() {
        return new CFrame(
            new Vector3(-this.position.x, -this.position.y, -this.position.z),
            new Vector3(-this.orientation.x, -this.orientation.y, -this.orientation.z)
        );
    }

    Lerp(goal, alpha) {
        const a = Math.max(0, Math.min(1, Number(alpha) || 0));
        const g = (goal instanceof CFrame) ? goal : CFrame.fromJSON(goal);
        const newPos = this.position.lerp(g.position, a);
        const newOri = this.orientation.lerp(g.orientation, a);
        return new CFrame(newPos, newOri);
    }

    clone() {
        return new CFrame(this.position.clone(), this.orientation.clone());
    }

    toJSON() {
        return {
            position: this.position.toJSON(),
            orientation: this.orientation.toJSON()
        };
    }

    static fromJSON(json) {
        if (!json) return new CFrame();
        return new CFrame(Vector3.fromJSON(json.position), Vector3.fromJSON(json.orientation));
    }

    toString() {
        return `${this.position.x.toFixed(3)}, ${this.position.y.toFixed(3)}, ${this.position.z.toFixed(3)}`;
    }
}

export class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = Number(x) || 0;
        this.y = Number(y) || 0;
    }

    static new(x = 0, y = 0) {
        return new Vector2(x, y);
    }

    static get zero() { return new Vector2(0, 0); }
    static get one() { return new Vector2(1, 1); }

    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    sub(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    mul(scalarOrVec) {
        if (typeof scalarOrVec === 'number') {
            return new Vector2(this.x * scalarOrVec, this.y * scalarOrVec);
        }
        return new Vector2(this.x * scalarOrVec.x, this.y * scalarOrVec.y);
    }

    div(scalar) {
        if (scalar === 0) return new Vector2(0, 0);
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    toJSON() {
        return { x: this.x, y: this.y };
    }

    static fromJSON(json) {
        if (!json) return new Vector2();
        return new Vector2(json.x, json.y);
    }

    toString() {
        return `${this.x.toFixed(2)}, ${this.y.toFixed(2)}`;
    }
}
