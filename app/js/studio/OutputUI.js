/**
 * Conblox Output Console & Command Bar
 * Displays studio logs, warnings, errors, and provides interactive command execution
 */

export class OutputUI {
    constructor(containerEl, onExecuteCommand) {
        this.container = containerEl;
        this.onExecuteCommand = onExecuteCommand;
        this.filter = 'all'; // 'all', 'info', 'warn', 'error'
        this.messages = [];
        this.logContainer = null;
        this.history = [];
        this.historyIndex = -1;

        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="panel-header">
                <span class="panel-title">Output</span>
            </div>
            <div class="output-toolbar">
                <div class="output-filters">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="info">Logs</button>
                    <button class="filter-btn" data-filter="warn">Warnings</button>
                    <button class="filter-btn" data-filter="error">Errors</button>
                </div>
                <div class="panel-header-actions">
                    <button class="panel-action-btn" id="output-clear" title="Clear Output">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
            <div class="output-logs" id="output-logs-body"></div>
            <div class="output-command-bar">
                <span class="command-prompt">&gt;</span>
                <input type="text" id="output-cmd-input" placeholder="Execute a command with Ctrl or use Ctrl+Up/Down for history" />
            </div>
        `;

        this.logContainer = this.container.querySelector('#output-logs-body');

        // Filters
        this.container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filter = btn.dataset.filter;
                this.render();
            });
        });

        // Clear
        this.container.querySelector('#output-clear').addEventListener('click', () => {
            this.messages = [];
            this.render();
        });

        // Command Bar input
        const input = this.container.querySelector('#output-cmd-input');
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                if (cmd) {
                    this.history.push(cmd);
                    this.historyIndex = this.history.length;
                    this.log('command', '> ' + cmd);
                    input.value = '';
                    if (this.onExecuteCommand) {
                        this.onExecuteCommand(cmd);
                    }
                }
            } else if (e.key === 'ArrowUp') {
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    input.value = this.history[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    input.value = this.history[this.historyIndex];
                } else {
                    this.historyIndex = this.history.length;
                    input.value = '';
                }
            }
        });

        if (window.lucide) window.lucide.createIcons({ root: this.container });

        // Initial welcome log
        this.log('info', 'Conblox Studio [Version 1.0.0] Ready.');
        this.log('info', 'Type a command in the bar below or insert a Script to start coding.');
    }

    log(type, text) {
        const time = new Date().toTimeString().split(' ')[0];
        const msg = { type, text, time };
        this.messages.push(msg);

        // Keep maximum 500 messages
        if (this.messages.length > 500) {
            this.messages.shift();
        }

        if (this.shouldShow(type)) {
            this.appendMessageEl(msg);
        }
    }

    shouldShow(type) {
        if (this.filter === 'all') return true;
        if (this.filter === 'info') return type === 'info' || type === 'command';
        if (this.filter === 'warn') return type === 'warn';
        if (this.filter === 'error') return type === 'error';
        return true;
    }

    appendMessageEl(msg) {
        if (!this.logContainer) return;
        const line = document.createElement('div');
        line.className = `log-line log-${msg.type}`;

        line.innerHTML = `<span class="log-time">${msg.time}</span> <span class="log-msg">${this.escapeHtml(msg.text)}</span>`;
        this.logContainer.appendChild(line);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    render() {
        if (!this.logContainer) return;
        this.logContainer.innerHTML = '';
        for (const msg of this.messages) {
            if (this.shouldShow(msg.type)) {
                this.appendMessageEl(msg);
            }
        }
    }

    escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
}
