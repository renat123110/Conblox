import { spawn } from 'child_process';
import os from 'os';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const tmpDir = path.join(os.tmpdir(), 'edge-debug-' + Date.now());

const edgeProc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=' + tmpDir,
    '--no-first-run',
    '--no-default-browser-check',
    'http://127.0.0.1:28888/'
]);

await new Promise(r => setTimeout(r, 2500));

try {
    const res = await fetch('http://127.0.0.1:9222/json');
    const tabs = await res.json();
    console.log('Tabs:', tabs.map(t => ({ title: t.title, url: t.url, wsUrl: t.webSocketDebuggerUrl })));
    
    const pageTab = tabs.find(t => t.url.includes('127.0.0.1:28888'));
    if (pageTab && pageTab.webSocketDebuggerUrl) {
        const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
        ws.onopen = () => {
            console.log('Connected to CDP websocket');
            ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
            ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
            ws.send(JSON.stringify({ id: 3, method: 'Page.enable' }));
            ws.send(JSON.stringify({ id: 4, method: 'Page.reload' }));
        };
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.method === 'Runtime.consoleAPICalled') {
                console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
            } else if (msg.method === 'Runtime.exceptionThrown') {
                console.log('[BROWSER EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description || '', msg.params.exceptionDetails.url, msg.params.exceptionDetails.lineNumber);
            }
        };
        await new Promise(r => setTimeout(r, 5000));
        ws.close();
    }
} catch (e) {
    console.error('CDP error:', e);
} finally {
    edgeProc.kill();
}
