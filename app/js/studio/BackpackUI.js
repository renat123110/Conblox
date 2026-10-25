export class BackpackUI {
    constructor(container, onSelectTool) {
        this.container = container;
        this.onSelectTool = onSelectTool;
        this.player = null;
        this.character = null;
        this.backpack = null;
        this.connections = [];
        this.buttons = new Map();
        this.tools = [];
        this.onKeyDown = (event) => this._handleKeyDown(event);
        window.addEventListener('keydown', this.onKeyDown, true);

        this.element = document.createElement('div');
        this.element.className = 'backpack-bar';
        this.element.setAttribute('role', 'toolbar');
        this.element.setAttribute('aria-label', 'Backpack');
        this.element.hidden = true;
        container.appendChild(this.element);
    }

    setPlayer(player, character = player?.Character || null) {
        this._disconnect();
        this.player = player;
        this.character = character;
        this.backpack = player?.FindFirstChild('Backpack') || null;
        this._watch(this.backpack);
        this._watch(this.character);
        this._renderTools();
    }

    setCharacter(character) {
        if (this.character === character) return;
        this._disconnect();
        this.character = character;
        this.backpack = this.player?.FindFirstChild('Backpack') || null;
        this._watch(this.backpack);
        this._watch(this.character);
        this._renderTools();
    }

    setVisible(visible) {
        this.element.hidden = !visible;
    }

    _handleKeyDown(event) {
        if (this.element.hidden || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
        const target = event.target;
        if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return;

        const match = /^(?:Digit|Numpad)([0-9])$/.exec(event.code);
        if (!match) return;
        const digit = Number(match[1]);
        const tool = this.tools[digit === 0 ? 9 : digit - 1];
        if (!tool) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        this.onSelectTool(tool);
    }

    _watch(instance) {
        if (!instance) return;
        this.connections.push(instance.ChildAdded.Connect(() => queueMicrotask(() => this._renderTools())));
        this.connections.push(instance.ChildRemoved.Connect(() => queueMicrotask(() => this._renderTools())));
    }

    _disconnect() {
        for (const connection of this.connections) connection.Disconnect();
        this.connections = [];
    }

    _renderTools() {
        const availableTools = new Set([
            ...(this.backpack?.GetChildren() || []).filter(child => child.IsA('Tool')),
            ...(this.character?.GetChildren() || []).filter(child => child.IsA('Tool'))
        ]);

        for (const [tool, button] of this.buttons) {
            if (!availableTools.has(tool)) {
                button.remove();
                this.buttons.delete(tool);
            }
        }

        for (const tool of availableTools) {
            let button = this.buttons.get(tool);
            if (!button) {
                button = document.createElement('button');
                button.className = 'backpack-slot';
                button.type = 'button';
                button.innerHTML = '<span class="backpack-slot-number"></span><i data-lucide="wrench" class="backpack-slot-icon"></i>';
                if (window.lucide) window.lucide.createIcons({ root: button });
                button.addEventListener('click', () => this.onSelectTool(tool));
                this.buttons.set(tool, button);
            }
        }

        this.tools = [...this.buttons.keys()];
        for (const [index, tool] of this.tools.entries()) {
            const button = this.buttons.get(tool);
            button.querySelector('.backpack-slot-number').textContent = String((index + 1) % 10);
            button.title = tool.Name;
            button.setAttribute('aria-label', `${(index + 1) % 10}: ${tool.Name}`);
            button.setAttribute('aria-pressed', String(tool.Parent === this.character));
            button.classList.toggle('equipped', tool.Parent === this.character);
            this.element.appendChild(button);
        }
    }
}