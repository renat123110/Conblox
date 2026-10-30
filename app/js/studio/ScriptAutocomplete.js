/**
 * Conblox Script Editor Autocomplete & IntelliSense
 * Visual Studio / Roblox Studio style command prediction, snippet expansion, and Tab-completion
 */

export class ScriptAutocomplete {
    constructor(cm, dataModel) {
        this.cm = cm;
        this.dataModel = dataModel;

        this.popupEl = null;
        this.docEl = null;
        this.listEl = null;
        this.isOpen = false;
        this.items = [];
        this.selectedIndex = 0;
        this.activeTokenRange = null; // { from, to, prefix, context }

        this.buildCatalog();
        this.createDOM();
        this.bindEvents();
    }

    buildCatalog() {
        // 1. Luau & Lua Keywords
        this.keywords = [
            { label: 'local', kind: 'keyword', insert: 'local', type: 'keyword', desc: 'Declares a local variable in the current scope.' },
            { label: 'function', kind: 'keyword', insert: 'function $1()\n    \nend', type: 'keyword', desc: 'Defines a named or anonymous function block.' },
            { label: 'if', kind: 'keyword', insert: 'if $1 then\n    \nend', type: 'keyword', desc: 'Begins a conditional statement block.' },
            { label: 'then', kind: 'keyword', insert: 'then', type: 'keyword', desc: 'Precedes the body of an if or elseif statement.' },
            { label: 'else', kind: 'keyword', insert: 'else\n    ', type: 'keyword', desc: 'Specifies alternative code block if condition is false.' },
            { label: 'elseif', kind: 'keyword', insert: 'elseif $1 then\n    ', type: 'keyword', desc: 'Adds an additional condition test.' },
            { label: 'end', kind: 'keyword', insert: 'end', type: 'keyword', desc: 'Closes a code block (if, function, for, while, do).' },
            { label: 'for', kind: 'keyword', insert: 'for $1 = 1, 10 do\n    \nend', type: 'keyword', desc: 'Iterates a numeric loop over a range of numbers.' },
            { label: 'while', kind: 'keyword', insert: 'while $1 do\n    \nend', type: 'keyword', desc: 'Loops while a boolean condition remains true.' },
            { label: 'repeat', kind: 'keyword', insert: 'repeat\n    \nuntil $1', type: 'keyword', desc: 'Executes a block until a condition evaluates to true.' },
            { label: 'until', kind: 'keyword', insert: 'until $1', type: 'keyword', desc: 'Terminates a repeat-until loop.' },
            { label: 'do', kind: 'keyword', insert: 'do\n    \nend', type: 'keyword', desc: 'Begins a localized scope block.' },
            { label: 'return', kind: 'keyword', insert: 'return $1', type: 'keyword', desc: 'Returns values from a function.' },
            { label: 'break', kind: 'keyword', insert: 'break', type: 'keyword', desc: 'Terminates the closest enclosing loop.' },
            { label: 'continue', kind: 'keyword', insert: 'continue', type: 'keyword', desc: 'Skips to the next iteration of the enclosing loop.' },
            { label: 'true', kind: 'value', insert: 'true', type: 'boolean', desc: 'Boolean true value.' },
            { label: 'false', kind: 'value', insert: 'false', type: 'boolean', desc: 'Boolean false value.' },
            { label: 'nil', kind: 'value', insert: 'nil', type: 'nil', desc: 'Represents the absence of any value.' },
            { label: 'and', kind: 'keyword', insert: 'and ', type: 'operator', desc: 'Logical AND operator.' },
            { label: 'or', kind: 'keyword', insert: 'or ', type: 'operator', desc: 'Logical OR operator.' },
            { label: 'not', kind: 'keyword', insert: 'not ', type: 'operator', desc: 'Logical NOT operator.' }
        ];

        // 2. Roblox Global Singletons & Services
        this.globals = [
            { label: 'game', kind: 'global', insert: 'game', type: 'DataModel', desc: 'The root DataModel instance containing all services and objects.' },
            { label: 'workspace', kind: 'global', insert: 'workspace', type: 'Workspace', desc: 'The 3D physical workspace where all BasePart instances exist.' },
            { label: 'script', kind: 'global', insert: 'script', type: 'Script', desc: 'Reference to this running script instance.' },
            { label: 'Instance', kind: 'class', insert: 'Instance', type: 'Instance', desc: 'Roblox API for creating and querying game instances.' },
            { label: 'Vector3', kind: 'class', insert: 'Vector3', type: 'Vector3', desc: '3D spatial vector (x, y, z) representing size or position in studs.' },
            { label: 'Vector2', kind: 'class', insert: 'Vector2', type: 'Vector2', desc: '2D spatial vector (x, y) for screen-space and UI coordinates.' },
            { label: 'Color3', kind: 'class', insert: 'Color3', type: 'Color3', desc: 'RGB color representation with red, green, and blue components.' },
            { label: 'CFrame', kind: 'class', insert: 'CFrame', type: 'CFrame', desc: 'Coordinate frame representing 3D position and rotation in world space.' },
            { label: 'BrickColor', kind: 'class', insert: 'BrickColor', type: 'BrickColor', desc: 'Classic palette of named colors for Roblox parts.' },
            { label: 'task', kind: 'class', insert: 'task', type: 'task', desc: 'Task scheduler library for managing threads, waiting, and delays.' },
            { label: 'TweenInfo', kind: 'class', insert: 'TweenInfo.new($1)', type: 'TweenInfo', desc: 'Defines animation parameters for TweenService.' },
            { label: 'Enum', kind: 'class', insert: 'Enum', type: 'Enum', desc: 'Roblox enumerations collection (e.g. Enum.KeyCode, Enum.Material).' },
            { label: 'UserInputService', kind: 'class', insert: 'UserInputService', type: 'UserInputService', desc: 'Service that detects and handles mouse, keyboard, and touch input events.' },
            { label: 'RunService', kind: 'class', insert: 'RunService', type: 'RunService', desc: 'Service that provides frame-by-frame management of code execution (Heartbeat, RenderStepped, Stepped).' },
            { label: 'Sound', kind: 'class', insert: 'Sound', type: 'Sound', desc: 'Roblox audio instance for sound playback.' },
            { label: 'Decal', kind: 'class', insert: 'Decal', type: 'Decal', desc: 'Visual image overlaid on the surface face of a Part.' },
            { label: 'Texture', kind: 'class', insert: 'Texture', type: 'Texture', desc: 'Repeating tiled image pattern overlaid on the surface face of a Part.' },
            { label: 'math', kind: 'global', insert: 'math', type: 'math', desc: 'Standard Lua mathematical functions library.' },
            { label: 'string', kind: 'global', insert: 'string', type: 'string', desc: 'Standard Lua string manipulation library.' },
            { label: 'table', kind: 'global', insert: 'table', type: 'table', desc: 'Standard Lua table and array manipulation library.' }
        ];

        // 3. Builtin Global Functions
        this.builtins = [
            { label: 'print', kind: 'function', insert: 'print($1)', type: 'void', desc: 'print(...)\nOutputs messages to the Output console.' },
            { label: 'warn', kind: 'function', insert: 'warn($1)', type: 'void', desc: 'warn(...)\nOutputs warning messages highlighted in yellow.' },
            { label: 'error', kind: 'function', insert: 'error($1)', type: 'void', desc: 'error(...)\nThrows a runtime script error.' },
            { label: 'wait', kind: 'function', insert: 'wait($1)', type: 'number', desc: 'wait([seconds])\nPauses execution for the specified duration.' },
            { label: 'typeof', kind: 'function', insert: 'typeof($1)', type: 'string', desc: 'typeof(object)\nReturns exact Roblox datatype as a string.' },
            { label: 'type', kind: 'function', insert: 'type($1)', type: 'string', desc: 'type(object)\nReturns standard Lua type of the value.' },
            { label: 'tonumber', kind: 'function', insert: 'tonumber($1)', type: 'number?', desc: 'tonumber(value)\nConverts value to a number or nil.' },
            { label: 'tostring', kind: 'function', insert: 'tostring($1)', type: 'string', desc: 'tostring(value)\nConverts any value to its string representation.' },
            { label: 'pcall', kind: 'function', insert: 'pcall($1)', type: 'boolean, any', desc: 'pcall(func, ...)\nCalls function in protected mode without terminating script.' },
            { label: 'assert', kind: 'function', insert: 'assert($1, "$2")', type: 'any', desc: 'assert(value, [message])\nThrows error if value is false or nil.' }
        ];

        // 4. Instance Classes for Instance.new("...")
        this.instanceClasses = [
            { label: 'Part', kind: 'class', insert: 'Part', type: 'BasePart', desc: 'Basic 3D physical block in the Workspace.' },
            { label: 'SpawnLocation', kind: 'class', insert: 'SpawnLocation', type: 'SpawnLocation', desc: 'Location where players spawn into the place.' },
            { label: 'Model', kind: 'class', insert: 'Model', type: 'Model', desc: 'Container for grouping parts and instances together.' },
            { label: 'Folder', kind: 'class', insert: 'Folder', type: 'Folder', desc: 'Organizational container without physical properties.' },
            { label: 'Script', kind: 'class', insert: 'Script', type: 'Script', desc: 'Luau script execution unit.' },
            { label: 'PointLight', kind: 'class', insert: 'PointLight', type: 'PointLight', desc: 'Omnidirectional point light source.' },
            { label: 'SpotLight', kind: 'class', insert: 'SpotLight', type: 'SpotLight', desc: 'Directional cone light attached to a part face.' },
            { label: 'SurfaceLight', kind: 'class', insert: 'SurfaceLight', type: 'SurfaceLight', desc: 'Broad directional light emitted from a part face.' },
            { label: 'Clouds', kind: 'class', insert: 'Clouds', type: 'Clouds', desc: 'Volumetric dynamic sky clouds.' },
            { label: 'Sound', kind: 'class', insert: 'Sound', type: 'Sound', desc: 'Audio sound source object.' },
            { label: 'Humanoid', kind: 'class', insert: 'Humanoid', type: 'Humanoid', desc: 'Controls character movement, health, and animations.' },
            { label: 'Highlight', kind: 'class', insert: 'Highlight', type: 'Highlight', desc: 'Visual outline and fill highlight effect for objects.' },
            { label: 'Weld', kind: 'class', insert: 'Weld', type: 'Weld', desc: 'Rigid joint connecting two parts together at fixed relative C0/C1 offsets.' },
            { label: 'WeldConstraint', kind: 'class', insert: 'WeldConstraint', type: 'WeldConstraint', desc: 'Physically locks two parts together without altering their relative offset.' },
            { label: 'Motor6D', kind: 'class', insert: 'Motor6D', type: 'Motor6D', desc: 'Animated rigid joint connecting two parts with a rotational Transform.' },
            { label: 'Camera', kind: 'class', insert: 'Camera', type: 'Camera', desc: 'Roblox 3D perspective camera instance in Workspace.' }
        ];

        // 5. Context Members after '.'
        this.staticMembers = {
            'Instance': [
                { label: 'new', kind: 'method', insert: 'new("$1")', type: 'Instance', desc: 'Instance.new(className, [parent])\nInstantiates a new instance of the specified class.' }
            ],
            'Vector3': [
                { label: 'new', kind: 'method', insert: 'new($1, $2, $3)', type: 'Vector3', desc: 'Vector3.new(x, y, z)\nConstructs a 3D vector with components x, y, z.' },
                { label: 'zero', kind: 'property', insert: 'zero', type: 'Vector3', desc: 'Vector3(0, 0, 0)' },
                { label: 'one', kind: 'property', insert: 'one', type: 'Vector3', desc: 'Vector3(1, 1, 1)' },
                { label: 'xAxis', kind: 'property', insert: 'xAxis', type: 'Vector3', desc: 'Vector3(1, 0, 0)' },
                { label: 'yAxis', kind: 'property', insert: 'yAxis', type: 'Vector3', desc: 'Vector3(0, 1, 0)' },
                { label: 'zAxis', kind: 'property', insert: 'zAxis', type: 'Vector3', desc: 'Vector3(0, 0, 1)' }
            ],
            'Color3': [
                { label: 'fromRGB', kind: 'method', insert: 'fromRGB($1, $2, $3)', type: 'Color3', desc: 'Color3.fromRGB(r, g, b)\nConstructs a Color3 from 0-255 RGB integers.' },
                { label: 'new', kind: 'method', insert: 'new($1, $2, $3)', type: 'Color3', desc: 'Color3.new(r, g, b)\nConstructs a Color3 from 0-1 floating point values.' },
                { label: 'fromHex', kind: 'method', insert: 'fromHex("$1")', type: 'Color3', desc: 'Color3.fromHex(hexString)\nConstructs a Color3 from a hex string (e.g. "#FF0000").' },
                { label: 'fromHSV', kind: 'method', insert: 'fromHSV($1, $2, $3)', type: 'Color3', desc: 'Color3.fromHSV(h, s, v)\nConstructs a Color3 from Hue, Saturation, and Value.' }
            ],
            'CFrame': [
                { label: 'new', kind: 'method', insert: 'new($1, $2, $3)', type: 'CFrame', desc: 'CFrame.new(x, y, z)\nConstructs a CFrame at position (x, y, z).' },
                { label: 'Angles', kind: 'method', insert: 'Angles($1, $2, $3)', type: 'CFrame', desc: 'CFrame.Angles(rx, ry, rz)\nConstructs a rotation CFrame from Euler angles in radians.' },
                { label: 'identity', kind: 'property', insert: 'identity', type: 'CFrame', desc: 'The identity CFrame (0, 0, 0) with no rotation.' }
            ],
            'task': [
                { label: 'wait', kind: 'method', insert: 'wait($1)', type: 'number', desc: 'task.wait([seconds])\nYields the current thread for the specified duration.' },
                { label: 'spawn', kind: 'method', insert: 'spawn($1)', type: 'thread', desc: 'task.spawn(functionOrThread, ...)\nExecutes a function in a new thread immediately.' },
                { label: 'delay', kind: 'method', insert: 'delay($1, $2)', type: 'thread', desc: 'task.delay(duration, functionOrThread, ...)\nSchedules execution after duration seconds.' },
                { label: 'defer', kind: 'method', insert: 'defer($1)', type: 'thread', desc: 'task.defer(functionOrThread, ...)\nSchedules execution at the next resumption point.' },
                { label: 'cancel', kind: 'method', insert: 'cancel($1)', type: 'void', desc: 'task.cancel(thread)\nCancels a currently active or scheduled thread.' }
            ],
            'math': [
                { label: 'floor', kind: 'method', insert: 'floor($1)', type: 'number', desc: 'math.floor(x)\nReturns the largest integer less than or equal to x.' },
                { label: 'ceil', kind: 'method', insert: 'ceil($1)', type: 'number', desc: 'math.ceil(x)\nReturns the smallest integer greater than or equal to x.' },
                { label: 'round', kind: 'method', insert: 'round($1)', type: 'number', desc: 'math.round(x)\nRounds x to the nearest integer.' },
                { label: 'abs', kind: 'method', insert: 'abs($1)', type: 'number', desc: 'math.abs(x)\nReturns the absolute value of x.' },
                { label: 'min', kind: 'method', insert: 'min($1, $2)', type: 'number', desc: 'math.min(...)\nReturns the minimum value from the arguments.' },
                { label: 'max', kind: 'method', insert: 'max($1, $2)', type: 'number', desc: 'math.max(...)\nReturns the maximum value from the arguments.' },
                { label: 'clamp', kind: 'method', insert: 'clamp($1, $2, $3)', type: 'number', desc: 'math.clamp(x, min, max)\nClamps x within the range [min, max].' },
                { label: 'random', kind: 'method', insert: 'random($1, $2)', type: 'number', desc: 'math.random([m, [n]])\nReturns a pseudo-random integer or float.' },
                { label: 'sqrt', kind: 'method', insert: 'sqrt($1)', type: 'number', desc: 'math.sqrt(x)\nReturns the square root of x.' },
                { label: 'sin', kind: 'method', insert: 'sin($1)', type: 'number', desc: 'math.sin(rad)\nReturns the sine of rad (in radians).' },
                { label: 'cos', kind: 'method', insert: 'cos($1)', type: 'number', desc: 'math.cos(rad)\nReturns the cosine of rad (in radians).' },
                { label: 'rad', kind: 'method', insert: 'rad($1)', type: 'number', desc: 'math.rad(deg)\nConverts degrees to radians.' },
                { label: 'deg', kind: 'method', insert: 'deg($1)', type: 'number', desc: 'math.deg(rad)\nConverts radians to degrees.' },
                { label: 'pi', kind: 'property', insert: 'pi', type: 'number', desc: 'The mathematical constant Pi (3.14159...).' },
                { label: 'huge', kind: 'property', insert: 'huge', type: 'number', desc: 'Positive infinity float value.' }
            ],
            'table': [
                { label: 'insert', kind: 'method', insert: 'insert($1, $2)', type: 'void', desc: 'table.insert(t, [pos], val)\nInserts value into table.' },
                { label: 'remove', kind: 'method', insert: 'remove($1, $2)', type: 'any', desc: 'table.remove(t, [pos])\nRemoves and returns element from table.' },
                { label: 'find', kind: 'method', insert: 'find($1, $2)', type: 'number?', desc: 'table.find(t, val)\nReturns index of first occurrence of val.' },
                { label: 'sort', kind: 'method', insert: 'sort($1)', type: 'void', desc: 'table.sort(t, [comparator])\nSorts table elements in-place.' },
                { label: 'concat', kind: 'method', insert: 'concat($1, "$2")', type: 'string', desc: 'table.concat(t, [sep])\nJoins table array values with separator.' },
                { label: 'clear', kind: 'method', insert: 'clear($1)', type: 'void', desc: 'table.clear(t)\nRemoves all keys and elements from table.' },
                { label: 'clone', kind: 'method', insert: 'clone($1)', type: 'table', desc: 'table.clone(t)\nCreates a shallow copy of table.' }
            ],
            'string': [
                { label: 'format', kind: 'method', insert: 'format("$1", $2)', type: 'string', desc: 'string.format(format, ...)\nFormats string using printf syntax.' },
                { label: 'sub', kind: 'method', insert: 'sub($1, $2, $3)', type: 'string', desc: 'string.sub(s, i, [j])\nReturns substring from index i to j.' },
                { label: 'len', kind: 'method', insert: 'len($1)', type: 'number', desc: 'string.len(s)\nReturns length of string in bytes.' },
                { label: 'lower', kind: 'method', insert: 'lower($1)', type: 'string', desc: 'string.lower(s)\nConverts string to lowercase.' },
                { label: 'upper', kind: 'method', insert: 'upper($1)', type: 'string', desc: 'string.upper(s)\nConverts string to uppercase.' },
                { label: 'split', kind: 'method', insert: 'split($1, "$2")', type: 'table', desc: 'string.split(s, sep)\nSplits string into a table of substrings.' }
            ],
            'UserInputService': [
                { label: 'InputBegan', kind: 'event', insert: 'InputBegan', type: 'RBXScriptSignal', desc: 'Fires when an input begins (key pressed, mouse clicked).' },
                { label: 'InputEnded', kind: 'event', insert: 'InputEnded', type: 'RBXScriptSignal', desc: 'Fires when an input ends (key released, mouse released).' },
                { label: 'InputChanged', kind: 'event', insert: 'InputChanged', type: 'RBXScriptSignal', desc: 'Fires when an input changes (mouse moved, mouse wheel).' },
                { label: 'IsKeyDown', kind: 'method', insert: 'IsKeyDown($1)', type: 'boolean', desc: ':IsKeyDown(keyCode)\nChecks if given key is currently pressed.' },
                { label: 'IsMouseButtonPressed', kind: 'method', insert: 'IsMouseButtonPressed($1)', type: 'boolean', desc: ':IsMouseButtonPressed(mouseButton)\nChecks if mouse button is held down.' },
                { label: 'GetMouseLocation', kind: 'method', insert: 'GetMouseLocation()', type: 'Vector2', desc: ':GetMouseLocation()\nReturns 2D screen coordinates of mouse cursor.' },
                { label: 'GetFocusedTextBox', kind: 'method', insert: 'GetFocusedTextBox()', type: 'Instance?', desc: ':GetFocusedTextBox()\nReturns currently focused text box.' },
                { label: 'MouseBehavior', kind: 'property', insert: 'MouseBehavior', type: 'MouseBehavior', desc: 'Controls mouse lock behavior.' },
                { label: 'MouseIconEnabled', kind: 'property', insert: 'MouseIconEnabled', type: 'boolean', desc: 'Whether system mouse cursor is visible.' }
            ],
            'RunService': [
                { label: 'Heartbeat', kind: 'event', insert: 'Heartbeat', type: 'RBXScriptSignal', desc: 'Fires every frame after physics simulation has completed.' },
                { label: 'RenderStepped', kind: 'event', insert: 'RenderStepped', type: 'RBXScriptSignal', desc: 'Fires every frame prior to frame rendering (client only).' },
                { label: 'Stepped', kind: 'event', insert: 'Stepped', type: 'RBXScriptSignal', desc: 'Fires every frame prior to physics simulation.' },
                { label: 'IsClient', kind: 'method', insert: 'IsClient()', type: 'boolean', desc: ':IsClient()\nReturns true if code is running on client.' },
                { label: 'IsServer', kind: 'method', insert: 'IsServer()', type: 'boolean', desc: ':IsServer()\nReturns true if code is running on server.' },
                { label: 'IsStudio', kind: 'method', insert: 'IsStudio()', type: 'boolean', desc: ':IsStudio()\nReturns true if running within Conblox Studio.' },
                { label: 'IsRunMode', kind: 'method', insert: 'IsRunMode()', type: 'boolean', desc: ':IsRunMode()\nReturns true if simulation is running.' },
                { label: 'IsEdit', kind: 'method', insert: 'IsEdit()', type: 'boolean', desc: ':IsEdit()\nReturns true if Studio is in edit mode.' },
                { label: 'BindToRenderStep', kind: 'method', insert: 'BindToRenderStep("$1", $2, $3)', type: 'void', desc: ':BindToRenderStep(name, priority, callback)\nBinds callback to render step.' },
                { label: 'UnbindFromRenderStep', kind: 'method', insert: 'UnbindFromRenderStep("$1")', type: 'void', desc: ':UnbindFromRenderStep(name)\nUnbinds render step function.' }
            ],
            'Enum': [
                { label: 'KeyCode', kind: 'property', insert: 'KeyCode', type: 'Enum', desc: 'Keyboard key enumeration.' },
                { label: 'UserInputType', kind: 'property', insert: 'UserInputType', type: 'Enum', desc: 'Input device and event type enumeration.' },
                { label: 'UserInputState', kind: 'property', insert: 'UserInputState', type: 'Enum', desc: 'State of input (Begin, Change, End).' },
                { label: 'NormalId', kind: 'property', insert: 'NormalId', type: 'Enum', desc: 'Cube surface face enumeration (Front, Back, Top, etc.).' },
                { label: 'Material', kind: 'property', insert: 'Material', type: 'Enum', desc: 'Part surface material appearance enumeration.' }
            ],
            'KeyCode': [
                { label: 'Space', kind: 'value', insert: 'Space', type: 'KeyCode', desc: 'Spacebar key.' },
                { label: 'Return', kind: 'value', insert: 'Return', type: 'KeyCode', desc: 'Enter/Return key.' },
                { label: 'Escape', kind: 'value', insert: 'Escape', type: 'KeyCode', desc: 'Escape key.' },
                { label: 'Tab', kind: 'value', insert: 'Tab', type: 'KeyCode', desc: 'Tab key.' },
                { label: 'LeftShift', kind: 'value', insert: 'LeftShift', type: 'KeyCode', desc: 'Left Shift key.' },
                { label: 'RightShift', kind: 'value', insert: 'RightShift', type: 'KeyCode', desc: 'Right Shift key.' },
                { label: 'LeftControl', kind: 'value', insert: 'LeftControl', type: 'KeyCode', desc: 'Left Ctrl key.' },
                { label: 'RightControl', kind: 'value', insert: 'RightControl', type: 'KeyCode', desc: 'Right Ctrl key.' },
                { label: 'W', kind: 'value', insert: 'W', type: 'KeyCode', desc: 'W key (Forward).' },
                { label: 'A', kind: 'value', insert: 'A', type: 'KeyCode', desc: 'A key (Left).' },
                { label: 'S', kind: 'value', insert: 'S', type: 'KeyCode', desc: 'S key (Backward).' },
                { label: 'D', kind: 'value', insert: 'D', type: 'KeyCode', desc: 'D key (Right).' },
                { label: 'E', kind: 'value', insert: 'E', type: 'KeyCode', desc: 'E key (Interact).' },
                { label: 'Q', kind: 'value', insert: 'Q', type: 'KeyCode', desc: 'Q key.' },
                { label: 'R', kind: 'value', insert: 'R', type: 'KeyCode', desc: 'R key.' },
                { label: 'F', kind: 'value', insert: 'F', type: 'KeyCode', desc: 'F key.' }
            ],
            'UserInputType': [
                { label: 'Keyboard', kind: 'value', insert: 'Keyboard', type: 'UserInputType', desc: 'Keyboard input event.' },
                { label: 'MouseButton1', kind: 'value', insert: 'MouseButton1', type: 'UserInputType', desc: 'Left mouse button click/press.' },
                { label: 'MouseButton2', kind: 'value', insert: 'MouseButton2', type: 'UserInputType', desc: 'Right mouse button click/press.' },
                { label: 'MouseButton3', kind: 'value', insert: 'MouseButton3', type: 'UserInputType', desc: 'Middle mouse button click/press.' },
                { label: 'MouseMovement', kind: 'value', insert: 'MouseMovement', type: 'UserInputType', desc: 'Mouse movement across screen.' },
                { label: 'MouseWheel', kind: 'value', insert: 'MouseWheel', type: 'UserInputType', desc: 'Mouse scroll wheel action.' }
            ],
            'UserInputState': [
                { label: 'Begin', kind: 'value', insert: 'Begin', type: 'UserInputState', desc: 'Input just began (e.g. key pressed).' },
                { label: 'Change', kind: 'value', insert: 'Change', type: 'UserInputState', desc: 'Input changed (e.g. cursor moved).' },
                { label: 'End', kind: 'value', insert: 'End', type: 'UserInputState', desc: 'Input ended (e.g. key released).' },
                { label: 'Cancel', kind: 'value', insert: 'Cancel', type: 'UserInputState', desc: 'Input was cancelled.' }
            ],
            'Sound': [
                { label: 'Play', kind: 'method', insert: 'Play()', type: 'void', desc: ':Play()\nStarts audio playback.' },
                { label: 'Pause', kind: 'method', insert: 'Pause()', type: 'void', desc: ':Pause()\nPauses audio playback.' },
                { label: 'Stop', kind: 'method', insert: 'Stop()', type: 'void', desc: ':Stop()\nStops audio playback and resets position.' },
                { label: 'Resume', kind: 'method', insert: 'Resume()', type: 'void', desc: ':Resume()\nResumes audio playback.' },
                { label: 'SoundId', kind: 'property', insert: 'SoundId', type: 'string', desc: 'Audio source data URL or ID.' },
                { label: 'Playing', kind: 'property', insert: 'Playing', type: 'boolean', desc: 'Whether audio is currently playing.' },
                { label: 'Looped', kind: 'property', insert: 'Looped', type: 'boolean', desc: 'Whether sound loops upon reaching end.' },
                { label: 'Volume', kind: 'property', insert: 'Volume', type: 'number', desc: 'Volume multiplier (0.0 to 1.0).' },
                { label: 'PlaybackSpeed', kind: 'property', insert: 'PlaybackSpeed', type: 'number', desc: 'Playback speed rate.' },
                { label: 'TimePosition', kind: 'property', insert: 'TimePosition', type: 'number', desc: 'Current playback position in seconds.' }
            ]
        };

        // 6. Generic Instance Properties & Methods (BasePart, Model, etc.)
        this.instanceMembers = [
            // Properties
            { label: 'Position', kind: 'property', insert: 'Position', type: 'Vector3', desc: 'World position of the part in studs.' },
            { label: 'Size', kind: 'property', insert: 'Size', type: 'Vector3', desc: 'Dimensions of the part (X, Y, Z) in studs.' },
            { label: 'CFrame', kind: 'property', insert: 'CFrame', type: 'CFrame', desc: 'Coordinate frame representing position and orientation.' },
            { label: 'Orientation', kind: 'property', insert: 'Orientation', type: 'Vector3', desc: 'Rotation in degrees around X, Y, Z axes.' },
            { label: 'Anchored', kind: 'property', insert: 'Anchored', type: 'boolean', desc: 'Whether the part is physically pinned in place.' },
            { label: 'CanCollide', kind: 'property', insert: 'CanCollide', type: 'boolean', desc: 'Whether the part interacts physically with other objects.' },
            { label: 'Transparency', kind: 'property', insert: 'Transparency', type: 'number', desc: 'Visual opacity from 0.0 (opaque) to 1.0 (invisible).' },
            { label: 'Color', kind: 'property', insert: 'Color', type: 'Color3', desc: 'Color3 tint of the part surface.' },
            { label: 'Material', kind: 'property', insert: 'Material', type: 'string', desc: 'Material surface appearance (Plastic, Neon, Wood, etc.).' },
            { label: 'CastShadow', kind: 'property', insert: 'CastShadow', type: 'boolean', desc: 'Whether the part casts realistic shadows.' },
            { label: 'Name', kind: 'property', insert: 'Name', type: 'string', desc: 'The identifier name of this instance.' },
            { label: 'Parent', kind: 'property', insert: 'Parent', type: 'Instance?', desc: 'The parent instance of this object in the hierarchy.' },
            { label: 'ClassName', kind: 'property', insert: 'ClassName', type: 'string', desc: 'The class name of this instance.' },
            { label: 'PrimaryPart', kind: 'property', insert: 'PrimaryPart', type: 'BasePart?', desc: 'The primary anchor part of a Model.' },
            { label: 'WalkSpeed', kind: 'property', insert: 'WalkSpeed', type: 'number', desc: 'Humanoid movement speed in studs per second.' },
            { label: 'JumpPower', kind: 'property', insert: 'JumpPower', type: 'number', desc: 'Humanoid jump impulse power.' },
            { label: 'Health', kind: 'property', insert: 'Health', type: 'number', desc: 'Current humanoid health points.' },
            { label: 'MaxHealth', kind: 'property', insert: 'MaxHealth', type: 'number', desc: 'Maximum humanoid health capacity.' },
            { label: 'SoundId', kind: 'property', insert: 'SoundId', type: 'string', desc: 'Sound asset ID or base64 data URL.' },
            { label: 'Playing', kind: 'property', insert: 'Playing', type: 'boolean', desc: 'Whether the sound is playing.' },
            { label: 'Looped', kind: 'property', insert: 'Looped', type: 'boolean', desc: 'Whether sound playback loops.' },
            { label: 'Volume', kind: 'property', insert: 'Volume', type: 'number', desc: 'Sound volume from 0.0 to 1.0.' },
            { label: 'PlaybackSpeed', kind: 'property', insert: 'PlaybackSpeed', type: 'number', desc: 'Sound playback speed multiplier.' },
            { label: 'TimePosition', kind: 'property', insert: 'TimePosition', type: 'number', desc: 'Playback position in seconds.' },
            { label: 'Texture', kind: 'property', insert: 'Texture', type: 'string', desc: 'Decal or Texture image data URL.' },
            { label: 'Face', kind: 'property', insert: 'Face', type: 'string', desc: 'Face of the part where Decal or Texture is placed (Front, Back, etc.).' },
            { label: 'Locked', kind: 'property', insert: 'Locked', type: 'boolean', desc: 'Whether the part can be clicked and selected in the 3D viewport.' },
            { label: 'StudsPerTileU', kind: 'property', insert: 'StudsPerTileU', type: 'number', desc: 'Horizontal repeat tile size in studs for Texture.' },
            { label: 'StudsPerTileV', kind: 'property', insert: 'StudsPerTileV', type: 'number', desc: 'Vertical repeat tile size in studs for Texture.' },
            { label: 'Part0', kind: 'property', insert: 'Part0', type: 'BasePart?', desc: 'The first BasePart connected by the joint or constraint.' },
            { label: 'Part1', kind: 'property', insert: 'Part1', type: 'BasePart?', desc: 'The second BasePart connected by the joint or constraint.' },
            { label: 'C0', kind: 'property', insert: 'C0', type: 'CFrame', desc: 'The offset CFrame of the joint relative to Part0.' },
            { label: 'C1', kind: 'property', insert: 'C1', type: 'CFrame', desc: 'The offset CFrame of the joint relative to Part1.' },
            { label: 'Transform', kind: 'property', insert: 'Transform', type: 'CFrame', desc: 'Dynamic transform CFrame applied to the joint (used by animations).' },
            { label: 'CurrentAngle', kind: 'property', insert: 'CurrentAngle', type: 'number', desc: 'Current rotational angle of the Motor6D joint.' },
            { label: 'DesiredAngle', kind: 'property', insert: 'DesiredAngle', type: 'number', desc: 'Target rotational angle of the Motor6D joint.' },
            { label: 'MaxVelocity', kind: 'property', insert: 'MaxVelocity', type: 'number', desc: 'Maximum rotational velocity of the Motor6D joint.' },
            { label: 'Enabled', kind: 'property', insert: 'Enabled', type: 'boolean', desc: 'Whether this joint or constraint is active.' },
            { label: 'FieldOfView', kind: 'property', insert: 'FieldOfView', type: 'number', desc: 'Camera horizontal field of view in degrees.' },
            { label: 'CameraType', kind: 'property', insert: 'CameraType', type: 'string', desc: 'Behavior type of the Camera (Custom, Scriptable, etc.).' },
            { label: 'CameraSubject', kind: 'property', insert: 'CameraSubject', type: 'Instance?', desc: 'The instance focused by the camera.' },
            { label: 'Focus', kind: 'property', insert: 'Focus', type: 'CFrame', desc: 'World CFrame focus point of the camera.' },
            { label: 'HeadLocked', kind: 'property', insert: 'HeadLocked', type: 'boolean', desc: 'Whether the camera orientation locks with VR head tracking.' },
            { label: 'ViewportSize', kind: 'property', insert: 'ViewportSize', type: 'Vector2', desc: 'Screen resolution dimensions of the camera viewport.' },

            // Events
            { label: 'Touched', kind: 'event', insert: 'Touched', type: 'RBXScriptSignal', desc: 'Fires when this part touches another physically collidable part.' },
            { label: 'TouchEnded', kind: 'event', insert: 'TouchEnded', type: 'RBXScriptSignal', desc: 'Fires when another part stops touching this part.' },
            { label: 'Changed', kind: 'event', insert: 'Changed', type: 'RBXScriptSignal', desc: 'Fires when any property of this instance is changed.' },
            { label: 'Died', kind: 'event', insert: 'Died', type: 'RBXScriptSignal', desc: 'Fires when humanoid health drops to 0.' },

            // Methods
            { label: 'Destroy', kind: 'method', insert: 'Destroy()', type: 'void', desc: 'Destroys the instance and removes it from the DataModel.' },
            { label: 'Clone', kind: 'method', insert: 'Clone()', type: 'Instance', desc: 'Creates an exact deep copy of the instance and its children.' },
            { label: 'FindFirstChild', kind: 'method', insert: 'FindFirstChild("$1")', type: 'Instance?', desc: 'Returns the first child matching the given name.' },
            { label: 'WaitForChild', kind: 'method', insert: 'WaitForChild("$1")', type: 'Instance', desc: 'Yields the current thread until child with name exists.' },
            { label: 'GetChildren', kind: 'method', insert: 'GetChildren()', type: 'table', desc: 'Returns an array table of direct children.' },
            { label: 'GetDescendants', kind: 'method', insert: 'GetDescendants()', type: 'table', desc: 'Returns an array table of all descendants recursively.' },
            { label: 'IsA', kind: 'method', insert: 'IsA("$1")', type: 'boolean', desc: 'Returns true if instance is or inherits from className.' },
            { label: 'ClearAllChildren', kind: 'method', insert: 'ClearAllChildren()', type: 'void', desc: 'Destroys and removes all children of this instance.' }
        ];

        // 7. Colon Event / Method calls (e.g. part.Touched:Connect(...))
        this.colonMethods = [
            { label: 'Connect', kind: 'method', insert: 'Connect(function($1)\n    \nend)', type: 'RBXScriptConnection', desc: ':Connect(listener)\nConnects a listener function to this signal event.' },
            { label: 'Once', kind: 'method', insert: 'Once(function($1)\n    \nend)', type: 'RBXScriptConnection', desc: ':Once(listener)\nConnects a listener function that runs only once.' },
            { label: 'Wait', kind: 'method', insert: 'Wait()', type: 'any', desc: ':Wait()\nYields current thread until signal fires, returning fired arguments.' },
            { label: 'Disconnect', kind: 'method', insert: 'Disconnect()', type: 'void', desc: ':Disconnect()\nDisconnects the active signal connection.' },
            { label: 'Fire', kind: 'method', insert: 'Fire($1)', type: 'void', desc: ':Fire(...)\nFires the signal, invoking all connected listeners.' },
            { label: 'Destroy', kind: 'method', insert: 'Destroy()', type: 'void', desc: ':Destroy()\nDestroys the instance.' },
            { label: 'Clone', kind: 'method', insert: 'Clone()', type: 'Instance', desc: ':Clone()\nCreates a deep copy of the instance.' },
            { label: 'FindFirstChild', kind: 'method', insert: 'FindFirstChild("$1")', type: 'Instance?', desc: ':FindFirstChild(name)\nFinds first child matching name.' },
            { label: 'WaitForChild', kind: 'method', insert: 'WaitForChild("$1")', type: 'Instance', desc: ':WaitForChild(name)\nYields until child exists.' },
            { label: 'GetChildren', kind: 'method', insert: 'GetChildren()', type: 'table', desc: ':GetChildren()\nReturns array of direct children.' },
            { label: 'GetDescendants', kind: 'method', insert: 'GetDescendants()', type: 'table', desc: ':GetDescendants()\nReturns array of all descendants.' },
            { label: 'GetService', kind: 'method', insert: 'GetService("$1")', type: 'Instance', desc: ':GetService(serviceName)\nRetrieves game service (e.g. "Players", "TweenService").' },
            { label: 'IsA', kind: 'method', insert: 'IsA("$1")', type: 'boolean', desc: ':IsA(className)\nChecks inheritance of instance.' },
            { label: 'ClearAllChildren', kind: 'method', insert: 'ClearAllChildren()', type: 'void', desc: ':ClearAllChildren()\nRemoves all children.' }
        ];
    }

    createDOM() {
        this.popupEl = document.createElement('div');
        this.popupEl.className = 'roblox-autocomplete-popup';
        this.popupEl.style.display = 'none';

        this.listEl = document.createElement('div');
        this.listEl.className = 'roblox-autocomplete-list';
        this.popupEl.appendChild(this.listEl);

        this.docEl = document.createElement('div');
        this.docEl.className = 'roblox-autocomplete-doc';
        this.popupEl.appendChild(this.docEl);

        document.body.appendChild(this.popupEl);
    }

    bindEvents() {
        // 1. As user types characters, trigger smart autocomplete
        this.cm.on('inputRead', (cm, change) => {
            // If typing alphanumeric, dot, colon, quote
            if (change.origin === '+input' && change.text && change.text.length > 0) {
                const char = change.text[0];
                if (/[\w_.:"']/.test(char)) {
                    this.triggerAutocomplete();
                } else {
                    this.close();
                }
            }
        });

        // 2. Intercept keys in keydown: Tab, Enter, Arrows, Escape
        this.cm.on('keydown', (cm, event) => {
            if (!this.isOpen) return;

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                event.stopPropagation();
                this.navigate(1);
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                event.stopPropagation();
                this.navigate(-1);
            } else if (event.key === 'Tab') {
                event.preventDefault();
                event.stopPropagation();
                this.acceptSelection();
            } else if (event.key === 'Enter') {
                this.close();
                // Allow Enter to naturally create a new line without inserting suggestion
            } else if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                this.close();
            }
        });

        // 3. Cursor movement outside token closes popup
        this.cm.on('cursorActivity', () => {
            if (!this.isOpen) return;
            const cur = this.cm.getCursor();
            if (this.activeTokenRange) {
                if (cur.line !== this.activeTokenRange.line ||
                    cur.ch < this.activeTokenRange.fromCh ||
                    cur.ch > this.activeTokenRange.fromCh + this.activeTokenRange.prefix.length + 10) {
                    this.close();
                }
            }
        });

        // 4. On editor blur
        this.cm.on('blur', () => {
            // Small timeout to allow click event to register
            setTimeout(() => {
                if (!this.popupEl.contains(document.activeElement)) {
                    this.close();
                }
            }, 150);
        });
    }

    triggerAutocomplete() {
        const cur = this.cm.getCursor();
        const lineText = this.cm.getLine(cur.line);
        const textBefore = lineText.slice(0, cur.ch);

        // Skip if inside a comment
        const commentIdx = textBefore.indexOf('--');
        if (commentIdx !== -1 && commentIdx <= textBefore.length) {
            this.close();
            return;
        }

        // Determine context & token
        const match = this.analyzeContext(textBefore);
        if (!match) {
            this.close();
            return;
        }

        const { context, access, prefix, fromCh } = match;
        const candidates = this.getCandidates(context, access);

        // Filter and score candidates
        const prefixLower = prefix.toLowerCase();
        const matches = candidates.filter(item => {
            if (!prefixLower) return true;
            return item.label.toLowerCase().includes(prefixLower);
        });

        // Sort: exact prefix match first, then alphabetical
        matches.sort((a, b) => {
            const aStarts = a.label.toLowerCase().startsWith(prefixLower);
            const bStarts = b.label.toLowerCase().startsWith(prefixLower);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return a.label.localeCompare(b.label);
        });

        if (matches.length === 0) {
            this.close();
            return;
        }

        this.items = matches;
        this.selectedIndex = 0;
        this.activeTokenRange = {
            line: cur.line,
            fromCh: fromCh,
            toCh: cur.ch,
            prefix: prefix
        };

        this.render();
        this.positionPopup();
        this.open();
    }

    analyzeContext(textBefore) {
        // 1. Inside Instance.new("...") or Instance.new('...')
        const instNewMatch = textBefore.match(/Instance\.new\s*\(\s*["']([^"']*)$/);
        if (instNewMatch) {
            const prefix = instNewMatch[1];
            return {
                context: 'Instance.new',
                access: 'string',
                prefix: prefix,
                fromCh: textBefore.length - prefix.length
            };
        }

        // 2. Colon method call (e.g. part:Connect, script:Destroy)
        const colonMatch = textBefore.match(/([\w_]+)\s*:\s*([\w_]*)$/);
        if (colonMatch) {
            const objName = colonMatch[1];
            const prefix = colonMatch[2];
            return {
                context: objName,
                access: ':',
                prefix: prefix,
                fromCh: textBefore.length - prefix.length
            };
        }

        // 3. Dot member access (e.g. Instance.new, Vector3.zero, workspace.Part, part.Position)
        const dotMatch = textBefore.match(/([\w_]+)\s*\.\s*([\w_]*)$/);
        if (dotMatch) {
            const objName = dotMatch[1];
            const prefix = dotMatch[2];
            return {
                context: objName,
                access: '.',
                prefix: prefix,
                fromCh: textBefore.length - prefix.length
            };
        }

        // 4. General identifier at cursor (e.g. "loc", "gam", "pri", "func")
        const wordMatch = textBefore.match(/([\w_]+)$/);
        if (wordMatch) {
            const prefix = wordMatch[1];
            return {
                context: 'global',
                access: 'none',
                prefix: prefix,
                fromCh: textBefore.length - prefix.length
            };
        }

        return null;
    }

    getCandidates(context, access) {
        if (context === 'Instance.new') {
            return this.instanceClasses;
        }

        if (access === ':') {
            return this.colonMethods;
        }

        if (access === '.') {
            // Static members for Vector3, Color3, CFrame, Instance, task, math, table, string
            if (this.staticMembers[context]) {
                return this.staticMembers[context];
            }

            // Workspace dynamic children
            if (context === 'workspace' || context === 'Workspace') {
                const dynamicWorkspaceItems = this.getWorkspaceChildCandidates();
                return [...this.instanceMembers, ...dynamicWorkspaceItems];
            }

            // Game service / singleton
            if (context === 'game') {
                return [
                    { label: 'Workspace', kind: 'property', insert: 'Workspace', type: 'Workspace', desc: 'The 3D physical workspace.' },
                    { label: 'Lighting', kind: 'property', insert: 'Lighting', type: 'Lighting', desc: 'Global environmental lighting and atmosphere settings.' },
                    { label: 'Players', kind: 'property', insert: 'Players', type: 'Players', desc: 'Service managing player sessions and characters.' },
                    { label: 'UserInputService', kind: 'property', insert: 'UserInputService', type: 'UserInputService', desc: 'Core user input service.' },
                    { label: 'RunService', kind: 'property', insert: 'RunService', type: 'RunService', desc: 'Core frame simulation service.' },
                    { label: 'SoundService', kind: 'property', insert: 'SoundService', type: 'SoundService', desc: 'Core audio playback service.' },
                    { label: 'GetService', kind: 'method', insert: 'GetService("$1")', type: 'Instance', desc: 'Returns the specified game service.' },
                    ...this.instanceMembers
                ];
            }

            // Default instance members for any part / object
            return this.instanceMembers;
        }

        // General global scope: Local variables + Keywords + Globals + Builtins
        const localVars = this.getLocalVariables();
        return [
            ...localVars,
            ...this.keywords,
            ...this.globals,
            ...this.builtins
        ];
    }

    getLocalVariables() {
        const text = this.cm ? this.cm.getValue() : '';
        if (!text) return [];

        const vars = new Map();

        // 1. local function funcName(...)
        const localFuncRegex = /\blocal\s+function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        let match;
        while ((match = localFuncRegex.exec(text)) !== null) {
            const name = match[1];
            if (name && !vars.has(name)) {
                vars.set(name, {
                    label: name,
                    kind: 'function',
                    insert: name,
                    type: 'function',
                    desc: `Local function: ${name}()`
                });
            }
        }

        // 2. local var1, var2 = ... or local var1
        const localDeclRegex = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)/g;
        while ((match = localDeclRegex.exec(text)) !== null) {
            const decl = match[1];
            const names = decl.split(',').map(s => s.trim());
            for (const name of names) {
                if (name && name !== 'function' && !vars.has(name)) {
                    vars.set(name, {
                        label: name,
                        kind: 'variable',
                        insert: name,
                        type: 'local',
                        desc: `Local variable: ${name}`
                    });
                }
            }
        }

        // 3. Regular function funcName(...)
        const funcRegex = /\bfunction\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
        while ((match = funcRegex.exec(text)) !== null) {
            const name = match[1];
            if (name && !vars.has(name)) {
                vars.set(name, {
                    label: name,
                    kind: 'function',
                    insert: name,
                    type: 'function',
                    desc: `Function: ${name}()`
                });
            }
        }

        // 4. for loops: for i = 1, 10 do OR for k, v in ...
        const forRegex = /\bfor\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\s*(?:=|in\b)/g;
        while ((match = forRegex.exec(text)) !== null) {
            const decl = match[1];
            const names = decl.split(',').map(s => s.trim());
            for (const name of names) {
                if (name && !vars.has(name)) {
                    vars.set(name, {
                        label: name,
                        kind: 'variable',
                        insert: name,
                        type: 'local',
                        desc: `Loop variable: ${name}`
                    });
                }
            }
        }

        return Array.from(vars.values());
    }

    getWorkspaceChildCandidates() {
        const items = [];
        if (this.dataModel && this.dataModel.Workspace) {
            const children = this.dataModel.Workspace.GetChildren();
            for (const child of children) {
                if (child && child.Name && !items.find(i => i.label === child.Name)) {
                    items.push({
                        label: child.Name,
                        kind: 'property',
                        insert: child.Name,
                        type: child.ClassName,
                        desc: `Child instance of Workspace: ${child.Name} (${child.ClassName})`
                    });
                }
            }
        }
        return items;
    }

    render() {
        this.listEl.innerHTML = '';
        const prefix = this.activeTokenRange ? this.activeTokenRange.prefix : '';

        this.items.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = `roblox-ac-item ${index === this.selectedIndex ? 'selected' : ''}`;

            // 1. Icon badge with Visual Studio / Roblox Studio symbol
            const iconBadge = document.createElement('span');
            iconBadge.className = `ac-icon ac-icon-${item.kind}`;
            iconBadge.textContent = this.getKindSymbol(item.kind);
            row.appendChild(iconBadge);

            // 2. Label with highlighted match substring
            const labelSpan = document.createElement('span');
            labelSpan.className = 'ac-label';
            labelSpan.innerHTML = this.highlightMatch(item.label, prefix);
            row.appendChild(labelSpan);

            // 3. Type hint on right
            const typeSpan = document.createElement('span');
            typeSpan.className = 'ac-type';
            typeSpan.textContent = item.type || item.kind;
            row.appendChild(typeSpan);

            row.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.selectedIndex = index;
                this.acceptSelection();
            });

            this.listEl.appendChild(row);
        });

        this.renderDoc();
    }

    getKindSymbol(kind) {
        switch (kind) {
            case 'keyword': return 'K';
            case 'class': return 'C';
            case 'global': return 'G';
            case 'method': return 'M';
            case 'property': return 'P';
            case 'event': return 'E';
            case 'function': return 'F';
            case 'variable': return 'V';
            case 'value': return 'V';
            default: return '•';
        }
    }

    highlightMatch(text, prefix) {
        if (!prefix) return text;
        const idx = text.toLowerCase().indexOf(prefix.toLowerCase());
        if (idx === -1) return text;
        const before = text.slice(0, idx);
        const match = text.slice(idx, idx + prefix.length);
        const after = text.slice(idx + prefix.length);
        return `${before}<strong class="ac-highlight">${match}</strong>${after}`;
    }

    renderDoc() {
        const item = this.items[this.selectedIndex];
        if (!item || !item.desc) {
            this.docEl.style.display = 'none';
            return;
        }

        this.docEl.style.display = 'block';
        const lines = item.desc.split('\n');
        const signature = lines[0];
        const description = lines.slice(1).join('\n');

        this.docEl.innerHTML = `
            <div class="ac-doc-signature">${signature}</div>
            ${description ? `<div class="ac-doc-desc">${description}</div>` : ''}
        `;
    }

    navigate(dir) {
        this.selectedIndex = (this.selectedIndex + dir + this.items.length) % this.items.length;

        // Update selected class
        const rows = this.listEl.querySelectorAll('.roblox-ac-item');
        rows.forEach((r, idx) => {
            if (idx === this.selectedIndex) {
                r.classList.add('selected');
                r.scrollIntoView({ block: 'nearest' });
            } else {
                r.classList.remove('selected');
            }
        });

        this.renderDoc();
    }

    acceptSelection() {
        const item = this.items[this.selectedIndex];
        if (!item || !this.activeTokenRange) {
            this.close();
            return;
        }

        const { line, fromCh, toCh } = this.activeTokenRange;
        const from = { line: line, ch: fromCh };
        const to = { line: line, ch: toCh };

        let insertText = item.insert || item.label;
        let cursorOffset = insertText.length;

        // Snippet placeholder handling: $1, $2, etc.
        const pIndex = insertText.indexOf('$1');
        if (pIndex !== -1) {
            cursorOffset = pIndex;
            insertText = insertText.replace(/\$\d+/g, '');
        }

        // Commit text replacement into CodeMirror
        this.cm.replaceRange(insertText, from, to);

        // Set cursor to target insertion point
        this.cm.setCursor({
            line: line,
            ch: fromCh + cursorOffset
        });

        this.close();
        this.cm.focus();
    }

    positionPopup() {
        const coords = this.cm.cursorCoords(true, 'page');
        const top = coords.bottom + 4;
        let left = coords.left;

        // Clamp to window boundaries
        const popupWidth = 360;
        const popupHeight = 280;
        if (left + popupWidth > window.innerWidth) {
            left = Math.max(10, window.innerWidth - popupWidth - 20);
        }
        if (top + popupHeight > window.innerHeight) {
            this.popupEl.style.top = `${Math.max(10, coords.top - popupHeight - 4)}px`;
        } else {
            this.popupEl.style.top = `${top}px`;
        }
        this.popupEl.style.left = `${left}px`;
    }

    open() {
        this.isOpen = true;
        this.popupEl.style.display = 'flex';
    }

    close() {
        this.isOpen = false;
        if (this.popupEl) {
            this.popupEl.style.display = 'none';
        }
        this.activeTokenRange = null;
        this.items = [];
    }

    destroy() {
        this.close();
        if (this.popupEl && this.popupEl.parentNode) {
            this.popupEl.parentNode.removeChild(this.popupEl);
        }
    }
}
