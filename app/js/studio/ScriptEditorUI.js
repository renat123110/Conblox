/**
 * Conblox Script Editor Tabs & CodeMirror Integration
 * Exact Roblox Studio Luau Syntax Highlighting & Full Tab Indentation
 */

import { ScriptAutocomplete } from './ScriptAutocomplete.js';

export class ScriptEditorUI {
    constructor(tabsBarEl, editorContainerEl, viewportContainerEl, dataModel = null) {
        this.tabsBar = tabsBarEl;
        this.editorContainer = editorContainerEl;
        this.viewportContainer = viewportContainerEl;
        this.dataModel = dataModel;

        this.openScripts = new Map(); // Script instance -> { tabEl, cmInstance }
        this.activeTab = 'viewport'; // 'viewport' or script.id
        this.cm = null;
        this.currentScript = null;
        this.autocomplete = null;

        this.init();
    }

    init() {
        if (typeof CodeMirror === 'undefined') {
            console.warn('[ScriptEditorUI] CodeMirror not found');
            return;
        }

        // 1. Register Exact Roblox Luau Language Mode
        this.registerRobloxLuauMode();

        // 2. Initialize CodeMirror Editor Instance with Tab Support
        this.cm = CodeMirror(this.editorContainer, {
            value: '',
            mode: 'roblox-lua',
            theme: 'roblox-dark',
            lineNumbers: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            tabSize: 4,
            indentUnit: 4,
            indentWithTabs: false,
            electricChars: true,
            lineWrapping: false,
            extraKeys: {
                "Tab": (cm) => {
                    if (this.autocomplete && this.autocomplete.isOpen) {
                        this.autocomplete.acceptSelection();
                        return;
                    }
                    if (cm.somethingSelected()) {
                        cm.indentSelection("add");
                    } else {
                        // 4-space tab indentation
                        cm.replaceSelection("    ", "end");
                    }
                },
                "Enter": (cm) => {
                    if (this.autocomplete && this.autocomplete.isOpen) {
                        this.autocomplete.close();
                    }
                    return CodeMirror.Pass;
                },
                "Shift-Tab": function(cm) {
                    cm.indentSelection("subtract");
                }
            }
        });

        // 3. Initialize Roblox Studio / Visual Studio Autocomplete Engine
        this.autocomplete = new ScriptAutocomplete(this.cm, this.dataModel);

        this.cm.on('change', () => {
            if (this.currentScript) {
                this.currentScript.Source = this.cm.getValue();
            }
        });

        // 3. Viewport tab click
        const vpTab = this.tabsBar.querySelector('#tab-viewport');
        if (vpTab) {
            vpTab.addEventListener('click', () => this.showViewport());
        }
    }

    registerRobloxLuauMode() {
        if (CodeMirror.modes['roblox-lua']) return;

        CodeMirror.defineMode('roblox-lua', function(config) {
            const indentUnit = config.indentUnit || 4;

            function regexMatcher(words) {
                return new RegExp("^(?:" + words.join("|") + ")$", "i");
            }

            // Luau Keywords
            const keywords = regexMatcher([
                "and", "break", "do", "else", "elseif", "end", "false", "for",
                "function", "if", "in", "local", "nil", "not", "or", "repeat",
                "return", "then", "true", "until", "while", "continue", "export", "type", "self"
            ]);

            // Roblox Globals, Services & Datatypes
            const robloxGlobals = regexMatcher([
                "game", "workspace", "script", "shared", "_G", "plugin",
                "Vector3", "Vector2", "Color3", "CFrame", "BrickColor", "Instance", "Enum",
                "task", "TweenInfo", "RaycastParams", "Ray", "UDim2", "UDim", "NumberRange",
                "NumberSequence", "ColorSequence", "Random", "DateTime", "Font", "PhysicalProperties",
                "OverlapParams", "math", "table", "string", "os", "debug", "utf8", "buffer", "bit32", "coroutine"
            ]);

            // Built-in Lua & Roblox functions
            const builtins = regexMatcher([
                "print", "warn", "error", "assert", "pcall", "xpcall", "select", "type",
                "typeof", "tonumber", "tostring", "rawget", "rawset", "rawequal",
                "setmetatable", "getmetatable", "require", "tick", "time", "wait", "delay", "spawn"
            ]);

            // Roblox Methods and Signals
            const robloxMethods = regexMatcher([
                "Connect", "Once", "Wait", "Disconnect", "Fire", "FindFirstChild",
                "FindFirstChildOfClass", "FindFirstAncestor", "WaitForChild", "GetChildren",
                "GetDescendants", "Destroy", "Clone", "ClearAllChildren", "IsA", "GetService",
                "IsDescendantOf", "Touched", "TouchEnded", "Changed", "AncestryChanged"
            ]);

            const indentTokens = regexMatcher(["function", "if", "repeat", "do", "\\(", "{"]);
            const dedentTokens = regexMatcher(["end", "until", "\\)", "}"]);
            const electricRegex = new RegExp("^(?:" + ["end", "until", "\\)", "}", "else", "elseif"].join("|") + ")$", "i");

            function tokenizer(stream, state) {
                if (stream.eatSpace()) return null;

                const ch = stream.next();

                // Comments: single-line -- and multi-line --[[ ... ]]
                if (ch === '-' && stream.eat('-')) {
                    if (stream.eat('[')) {
                        while (!stream.eol()) {
                            if (stream.eat(']') && stream.eat(']')) break;
                            stream.next();
                        }
                        return 'comment';
                    }
                    stream.skipToEnd();
                    return 'comment';
                }

                // Strings: "..." and '...'
                if (ch === '"' || ch === "'") {
                    let escaped = false;
                    let next;
                    while ((next = stream.next()) != null) {
                        if (next === ch && !escaped) break;
                        escaped = !escaped && next === '\\';
                    }
                    return 'string';
                }

                // Multiline String [[ ... ]]
                if (ch === '[' && stream.eat('[')) {
                    while (!stream.eol()) {
                        if (stream.eat(']') && stream.eat(']')) break;
                        stream.next();
                    }
                    return 'string';
                }

                // Numbers: integers, decimals, scientific, hex
                if (/\d/.test(ch)) {
                    stream.eatWhile(/[\w.%]/);
                    return 'number';
                }

                // Identifiers & Keywords
                if (/[\w_]/.test(ch)) {
                    stream.eatWhile(/[\w_\d]/);
                    const word = stream.current();

                    if (keywords.test(word)) {
                        if (word === 'true' || word === 'false' || word === 'nil') return 'atom';
                        return 'keyword';
                    }
                    if (robloxGlobals.test(word)) return 'roblox-global';
                    if (builtins.test(word)) return 'builtin';
                    if (robloxMethods.test(word)) return 'roblox-method';

                    return 'variable';
                }

                // Operators
                if (/[+\-*\/%^#=~<>:,.]/.test(ch)) {
                    stream.eatWhile(/[+\-*\/%^#=~<>=.]/);
                    return 'operator';
                }

                return null;
            }

            return {
                startState: function() {
                    return { indentDepth: 0, cur: tokenizer };
                },
                token: function(stream, state) {
                    const style = state.cur(stream, state);
                    const cur = stream.current();
                    if (style !== 'comment' && style !== 'string') {
                        if (indentTokens.test(cur)) state.indentDepth++;
                        else if (dedentTokens.test(cur)) state.indentDepth = Math.max(0, state.indentDepth - 1);
                    }
                    return style;
                },
                indent: function(state, textAfter) {
                    const isDedent = electricRegex.test(textAfter);
                    return Math.max(0, state.indentDepth - (isDedent ? 1 : 0)) * indentUnit;
                },
                electricInput: /^\s*(?:end|until|else|elseif|\)|\})$/,
                lineComment: "--",
                blockCommentStart: "--[[",
                blockCommentEnd: "]]"
            };
        });
    }

    openScript(script) {
        if (!script) return;

        if (!this.openScripts.has(script)) {
            // Create tab element
            const iconName = script.ClassName === 'LocalScript' ? 'file-terminal' : 'file-code';
            const tabEl = document.createElement('div');
            tabEl.className = 'center-tab';
            tabEl.innerHTML = `
                <i data-lucide="${iconName}" class="tab-icon"></i>
                <span class="tab-name">${script.Name}</span>
                <span class="tab-close" title="Close"><i data-lucide="x"></i></span>
            `;

            tabEl.addEventListener('click', (e) => {
                if (!e.target.closest('.tab-close')) {
                    this.activateScript(script);
                }
            });

            tabEl.querySelector('.tab-close').addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeScript(script);
            });

            this.tabsBar.appendChild(tabEl);
            if (window.lucide) window.lucide.createIcons({ root: tabEl });

            this.openScripts.set(script, { tabEl });

            // Listen to rename
            script.Changed.Connect((prop) => {
                if (prop === 'Name') {
                    const nameSpan = tabEl.querySelector('.tab-name');
                    if (nameSpan) nameSpan.textContent = script.Name;
                }
            });
        }

        this.activateScript(script);
    }

    activateScript(script) {
        this.currentScript = script;
        this.activeTab = script.id;

        // Update tabs active class
        this.tabsBar.querySelectorAll('.center-tab').forEach(t => t.classList.remove('active'));
        const entry = this.openScripts.get(script);
        if (entry) entry.tabEl.classList.add('active');

        // Show editor, hide viewport
        this.viewportContainer.style.display = 'none';
        this.editorContainer.style.display = 'block';

        if (this.cm) {
            this.cm.setValue(script.Source || '');
            this.cm.refresh();
            this.cm.focus();
        }
    }

    showViewport() {
        this.activeTab = 'viewport';
        this.currentScript = null;

        this.tabsBar.querySelectorAll('.center-tab').forEach(t => t.classList.remove('active'));
        const vpTab = this.tabsBar.querySelector('#tab-viewport');
        if (vpTab) vpTab.classList.add('active');

        this.editorContainer.style.display = 'none';
        this.viewportContainer.style.display = 'block';

        // Trigger viewport resize sync
        window.dispatchEvent(new Event('resize'));
    }

    closeScript(script) {
        const entry = this.openScripts.get(script);
        if (entry) {
            entry.tabEl.remove();
            this.openScripts.delete(script);
        }

        if (this.currentScript === script) {
            this.showViewport();
        }
    }
}
