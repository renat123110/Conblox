/**
 * Conblox Signal implementation (Roblox RBXScriptSignal)
 */

export class Connection {
    constructor(signal, handler) {
        this.signal = signal;
        this.handler = handler;
        this.connected = true;
    }

    Disconnect() {
        if (!this.connected) return;
        this.connected = false;
        if (this.signal) {
            this.signal._disconnect(this);
            this.signal = null;
        }
    }

    disconnect() {
        this.Disconnect();
    }
}

export class Signal {
    constructor() {
        this.connections = [];
    }

    Connect(handler) {
        if (typeof handler !== 'function') {
            throw new Error('Signal::Connect requires a callback function');
        }
        const conn = new Connection(this, handler);
        this.connections.push(conn);
        return conn;
    }

    connect(handler) {
        return this.Connect(handler);
    }

    _disconnect(conn) {
        const idx = this.connections.indexOf(conn);
        if (idx !== -1) {
            this.connections.splice(idx, 1);
        }
    }

    Fire(...args) {
        const list = [...this.connections];
        for (const conn of list) {
            if (conn.connected) {
                try {
                    conn.handler(...args);
                } catch (err) {
                    console.error('Error in Signal handler:', err);
                }
            }
        }
    }

    Wait() {
        return new Promise((resolve) => {
            let conn;
            conn = this.Connect((...args) => {
                conn.Disconnect();
                resolve(...args);
            });
        });
    }

    Destroy() {
        for (const conn of this.connections) {
            conn.connected = false;
        }
        this.connections = [];
    }
}
