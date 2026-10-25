/**
 * Conblox Instance base class
 * Foundation of the Roblox DataModel tree
 */

import { Signal } from './Signal.js';

let nextId = 1;

export class Instance {
    static classRegistry = new Map();

    static register(className, classConstructor) {
        this.classRegistry.set(className, classConstructor);
    }

    static new(className, parent = null) {
        const ctor = this.classRegistry.get(className) || Instance;
        const inst = new ctor();
        if (parent) {
            inst.Parent = parent;
        }
        return inst;
    }

    constructor(className = 'Instance') {
        this.id = 'inst_' + (nextId++) + '_' + Math.random().toString(36).substr(2, 6);
        this._name = className;
        this.className = className;
        this._parent = null;
        this._children = [];
        this.archivable = true;
        this.attributes = new Map();
        this.tags = new Set();

        // Signals
        this.Changed = new Signal();
        this.ChildAdded = new Signal();
        this.ChildRemoved = new Signal();
        this.DescendantAdded = new Signal();
        this.DescendantRemoved = new Signal();
        this.AncestryChanged = new Signal();
        this.Destroying = new Signal();

        // Roblox Luau-style dynamic child & property access proxy
        return new Proxy(this, {
            get(target, prop, receiver) {
                if (typeof prop === 'symbol' || prop in target) {
                    return Reflect.get(target, prop, receiver);
                }
                if (typeof prop === 'string') {
                    const child = target.FindFirstChild(prop);
                    if (child) return child;
                }
                return Reflect.get(target, prop, receiver);
            },
            set(target, prop, value, receiver) {
                return Reflect.set(target, prop, value, receiver);
            }
        });
    }

    get Name() {
        return this._name;
    }

    set Name(val) {
        if (this._name !== val) {
            const old = this._name;
            this._name = String(val);
            this.Changed.Fire('Name', this._name, old);
        }
    }

    get ClassName() {
        return this.className;
    }

    get Parent() {
        return this._parent;
    }

    set Parent(newParent) {
        if (this._parent === newParent) return;

        // Prevent circular parenting
        let ancestor = newParent;
        while (ancestor) {
            if (ancestor === this) {
                throw new Error(`Attempt to set ${this.Name} as its own ancestor`);
            }
            ancestor = ancestor.Parent;
        }

        const oldParent = this._parent;
        if (oldParent) {
            const idx = oldParent._children.indexOf(this);
            if (idx !== -1) {
                oldParent._children.splice(idx, 1);
            }
            oldParent.ChildRemoved.Fire(this);

            // Fire DescendantRemoved up the old ancestor tree
            let p = oldParent;
            const descendants = [this, ...this.GetDescendants()];
            while (p) {
                for (const d of descendants) {
                    p.DescendantRemoved.Fire(d);
                }
                p = p.Parent;
            }
        }

        this._parent = newParent;

        if (newParent) {
            newParent._children.push(this);
            newParent.ChildAdded.Fire(this);

            // Fire DescendantAdded up the new ancestor tree
            let p = newParent;
            const descendants = [this, ...this.GetDescendants()];
            while (p) {
                for (const d of descendants) {
                    p.DescendantAdded.Fire(d);
                }
                p = p.Parent;
            }
        }

        this.AncestryChanged.Fire(this, newParent);
        this.Changed.Fire('Parent', newParent, oldParent);
    }

    FindFirstChild(name, recursive = false) {
        for (const child of this._children) {
            if (child.Name === name) return child;
        }
        if (recursive) {
            for (const child of this._children) {
                const found = child.FindFirstChild(name, true);
                if (found) return found;
            }
        }
        return null;
    }

    FindFirstChildOfClass(className, recursive = false) {
        for (const child of this._children) {
            if (child.ClassName === className || child.IsA(className)) {
                return child;
            }
        }
        if (recursive) {
            for (const child of this._children) {
                const found = child.FindFirstChildOfClass(className, true);
                if (found) return found;
            }
        }
        return null;
    }

    FindFirstChildWhichIsA(className, recursive = false) {
        return this.FindFirstChildOfClass(className, recursive);
    }

    WaitForChild(name, timeout = 5000) {
        const existing = this.FindFirstChild(name);
        if (existing) return Promise.resolve(existing);

        return new Promise((resolve) => {
            let timer = null;
            let conn = null;

            const cleanup = () => {
                if (timer) clearTimeout(timer);
                if (conn) conn.Disconnect();
            };

            conn = this.ChildAdded.Connect((child) => {
                if (child.Name === name) {
                    cleanup();
                    resolve(child);
                }
            });

            if (timeout > 0) {
                timer = setTimeout(() => {
                    cleanup();
                    resolve(null);
                }, timeout);
            }
        });
    }

    GetChildren() {
        return [...this._children];
    }

    GetDescendants() {
        const result = [];
        const collect = (node) => {
            for (const child of node._children) {
                result.push(child);
                collect(child);
            }
        };
        collect(this);
        return result;
    }

    IsA(className) {
        if (this.ClassName === className) return true;
        let proto = Object.getPrototypeOf(this);
        while (proto && proto.constructor && proto.constructor.name) {
            if (proto.constructor.name === className) return true;
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }

    IsDescendantOf(ancestor) {
        if (!ancestor) return false;
        let p = this.Parent;
        while (p) {
            if (p === ancestor) return true;
            p = p.Parent;
        }
        return false;
    }

    IsAncestorOf(descendant) {
        if (!descendant || !descendant.IsDescendantOf) return false;
        return descendant.IsDescendantOf(this);
    }

    Clone() {
        if (!this.archivable) return null;
        const serialized = this.serialize();
        // Give new IDs during deserialize
        const clone = Instance.deserialize(serialized, true);
        clone.Parent = null;
        return clone;
    }

    Destroy() {
        this.Destroying.Fire();
        // Remove from parent
        this.Parent = null;
        // Destroy all children
        const children = [...this._children];
        for (const child of children) {
            child.Destroy();
        }
        // Destroy all signals
        this.Changed.Destroy();
        this.ChildAdded.Destroy();
        this.ChildRemoved.Destroy();
        this.AncestryChanged.Destroy();
        this.Destroying.Destroy();
    }

    ClearAllChildren() {
        const children = [...this._children];
        for (const child of children) {
            if (child.ClassName === 'Terrain' || child.ClassName === 'Camera') continue;
            child.Destroy();
        }
    }

    SetAttribute(name, value) {
        this.attributes.set(name, value);
        this.Changed.Fire(`Attribute:${name}`, value);
    }

    GetAttribute(name) {
        return this.attributes.get(name);
    }

    GetAttributes() {
        return Object.fromEntries(this.attributes);
    }

    AddTag(tag) {
        this.tags.add(tag);
    }

    RemoveTag(tag) {
        this.tags.delete(tag);
    }

    HasTag(tag) {
        return this.tags.has(tag);
    }

    GetTags() {
        return Array.from(this.tags);
    }

    serialize() {
        const data = {
            id: this.id,
            name: this.Name,
            className: this.ClassName,
            archivable: this.archivable,
            attributes: Object.fromEntries(this.attributes),
            tags: Array.from(this.tags),
            properties: this.serializeProperties(),
            children: []
        };

        for (const child of this._children) {
            if (child.archivable) {
                data.children.push(child.serialize());
            }
        }
        return data;
    }

    serializeProperties() {
        return {};
    }

    deserializeProperties(props) {
        // Subclasses override
    }

    static deserialize(data, generateNewIds = false) {
        const ctor = Instance.classRegistry.get(data.className) || Instance;
        const inst = new ctor();
        if (!generateNewIds && data.id) {
            inst.id = data.id;
        }
        inst.Name = data.name || data.className;
        inst.archivable = data.archivable !== undefined ? data.archivable : true;

        if (data.attributes) {
            inst.attributes = new Map(Object.entries(data.attributes));
        }
        if (data.tags) {
            inst.tags = new Set(data.tags);
        }
        if (data.properties) {
            inst.deserializeProperties(data.properties);
        }
        if (data.children && Array.isArray(data.children)) {
            for (const childData of data.children) {
                // If deserializing into DataModel, check for existing registered service
                const existingService = (inst.ClassName === 'DataModel' && inst.GetService)
                    ? inst.GetService(childData.name || childData.className)
                    : null;

                if (existingService) {
                    if (!generateNewIds && childData.id) {
                        existingService.id = childData.id;
                    }
                    if (childData.attributes) {
                        existingService.attributes = new Map(Object.entries(childData.attributes));
                    }
                    if (childData.tags) {
                        existingService.tags = new Set(childData.tags);
                    }
                    if (childData.properties) {
                        existingService.deserializeProperties(childData.properties);
                    }
                    existingService.ClearAllChildren();
                    if (childData.children && Array.isArray(childData.children)) {
                        for (const subChildData of childData.children) {
                            if (existingService.ClassName === 'Workspace' && (subChildData.className === 'Terrain' || subChildData.className === 'Camera')) {
                                const existingSingleton = existingService.FindFirstChild(subChildData.className);
                                if (existingSingleton) {
                                    if (subChildData.properties) existingSingleton.deserializeProperties(subChildData.properties);
                                    if (subChildData.children && Array.isArray(subChildData.children)) {
                                        existingSingleton.ClearAllChildren();
                                        for (const deepChildData of subChildData.children) {
                                            const deepChild = Instance.deserialize(deepChildData, generateNewIds);
                                            deepChild.Parent = existingSingleton;
                                        }
                                    }
                                    continue;
                                }
                            }
                            const subChild = Instance.deserialize(subChildData, generateNewIds);
                            subChild.Parent = existingService;
                        }
                    }
                } else {
                    const child = Instance.deserialize(childData, generateNewIds);
                    child.Parent = inst;
                }
            }
        }
        return inst;
    }
}
