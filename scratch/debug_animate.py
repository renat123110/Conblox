import asyncio
import aiohttp
import json
import tempfile
import subprocess

async def test():
    temp_profile = tempfile.mkdtemp()
    proc = subprocess.Popen([
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        f"--user-data-dir={temp_profile}",
        "--remote-debugging-port=9346",
        "http://127.0.0.1:28888/"
    ])
    await asyncio.sleep(2.5)
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get("http://127.0.0.1:9346/json") as r:
                targets = await r.json()
            target = None
            for t in targets:
                if "Conblox" in t.get("title", "") or "127.0.0.1:28888" in t.get("url", ""):
                    target = t
                    break
            if not target:
                target = targets[0]
            ws_url = target["webSocketDebuggerUrl"]
            async with s.ws_connect(ws_url) as ws:
                cid = 1
                async def cmd(m, p=None):
                    nonlocal cid
                    c = cid
                    cid += 1
                    msg = {"id": c, "method": m}
                    if p:
                        msg["params"] = p
                    await ws.send_json(msg)
                    return c

                await cmd("Runtime.enable")

                async def eval_js(expr):
                    c = await cmd("Runtime.evaluate", {
                        "expression": expr,
                        "returnByValue": True,
                        "awaitPromise": True
                    })
                    while True:
                        msg = await ws.receive_json()
                        if msg.get("id") == c:
                            res = msg.get("result", {})
                            if res.get("exceptionDetails"):
                                print("JS Exception in eval:", res.get("exceptionDetails"))
                            return res.get("result", {}).get("value")

                for _ in range(40):
                    ready = await eval_js("Boolean(window.conbloxStudio && window.conbloxStudio.viewport)")
                    if ready:
                        break
                    await asyncio.sleep(0.2)

                print("Starting Test simulation...")
                await eval_js("window.conbloxStudio.startSimulation('Test')")
                await asyncio.sleep(3.0)

                # Check animate script status and humanoid signals
                diag = await eval_js("""
                    (() => {
                        const studio = window.conbloxStudio;
                        const ctrl = studio.characterController;
                        const hum = ctrl.humanoid;
                        const char = ctrl.character;
                        const animScript = char.FindFirstChild('Animate');

                        return {
                            humanoidRunningConnections: hum.Running ? hum.Running.connections.length : 0,
                            humanoidDiedConnections: hum.Died ? hum.Died.connections.length : 0,
                            humanoidJumpingConnections: hum.Jumping ? hum.Jumping.connections.length : 0,
                            animScriptExists: Boolean(animScript),
                            animScriptClass: animScript?.ClassName,
                            animScriptSourceLen: animScript?.Source?.length,
                            animScriptChildren: animScript?.GetChildren()?.map(c => c.Name),
                            activeTracks: Array.from(hum._activeAnimationTracks || []).map(t => ({
                                name: t.name,
                                isPlaying: t.isPlaying,
                                timePos: t.timePosition
                            }))
                        };
                    })()
                """)
                print("Diagnostic 1 (at spawn):", json.dumps(diag, indent=2))

                # Fire Running manually with speed 16
                print("Firing Running manually with 16...")
                res_fire = await eval_js("""
                    (() => {
                        const ctrl = window.conbloxStudio.characterController;
                        const hum = ctrl.humanoid;
                        try {
                            hum.Running.Fire(16);
                            return { fired: true };
                        } catch (e) {
                            return { fired: false, error: e.toString() };
                        }
                    })()
                """)
                print("Res fire:", res_fire)
                await asyncio.sleep(1.0)

                diag2 = await eval_js("""
                    (() => {
                        const ctrl = window.conbloxStudio.characterController;
                        const hum = ctrl.humanoid;
                        return {
                            activeTracks: Array.from(hum._activeAnimationTracks || []).map(t => ({
                                name: t.name,
                                isPlaying: t.isPlaying,
                                timePos: t.timePosition
                            }))
                        };
                    })()
                """)
                print("Diagnostic 2 (after Running fire):", json.dumps(diag2, indent=2))

    finally:
        proc.terminate()

if __name__ == "__main__":
    asyncio.run(test())
