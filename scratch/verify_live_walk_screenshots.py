import asyncio
import aiohttp
import json
import tempfile
import subprocess
import base64
import os

ARTIFACT_DIR = r"C:\Users\Renat\.gemini\antigravity\brain\49e69d24-e071-4685-b5da-2bf81f94a438"

async def test():
    temp_profile = tempfile.mkdtemp()
    proc = subprocess.Popen([
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--window-size=1280,720",
        f"--user-data-dir={temp_profile}",
        "--remote-debugging-port=9349",
        "http://127.0.0.1:28888/"
    ])
    await asyncio.sleep(2.5)
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get("http://127.0.0.1:9349/json") as r:
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
                await cmd("Page.enable")

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
                                print("JS Exception:", res.get("exceptionDetails"))
                            return res.get("result", {}).get("value")

                async def screenshot(filename):
                    res = await cmd("Page.captureScreenshot", {"format": "png"})
                    while True:
                        msg = await ws.receive_json()
                        if msg.get("id") == res:
                            data = base64.b64decode(msg["result"]["data"])
                            filepath = os.path.join(ARTIFACT_DIR, filename)
                            with open(filepath, "wb") as f:
                                f.write(data)
                            print(f"Captured screenshot: {filename} ({len(data)} bytes)")
                            return filepath

                for _ in range(40):
                    ready = await eval_js("Boolean(window.conbloxStudio && window.conbloxStudio.viewport)")
                    if ready:
                        break
                    await asyncio.sleep(0.2)

                # Collapse docks and modals for maximum viewport visibility
                await eval_js("""
                    (() => {
                        const bd = document.getElementById('bottom-dock');
                        if (bd) bd.style.display = 'none';
                        const ops = document.getElementById('output-panel-split');
                        if (ops) ops.style.display = 'none';
                        const mm = document.getElementById('multiplayer-modal');
                        if (mm) mm.style.display = 'none';
                        window.dispatchEvent(new Event('resize'));
                    })()
                """)

                print("Starting Test simulation...")
                await eval_js("window.conbloxStudio.startSimulation('Test')")
                await asyncio.sleep(3.0)

                # Set camera to good close-up 3/4 view of character
                await eval_js("""
                    (() => {
                        const ctrl = window.conbloxStudio.characterController;
                        if (ctrl) {
                            ctrl.cameraYaw = 0.55;
                            ctrl.cameraPitch = -0.12;
                            ctrl.cameraDist = 8.0;
                        }
                    })()
                """)
                await asyncio.sleep(0.5)

                idle_info = await eval_js("""
                    (() => {
                        const ctrl = window.conbloxStudio.characterController;
                        const hum = ctrl.humanoid;
                        return {
                            tracks: Array.from(hum._activeAnimationTracks || []).map(t => ({
                                name: t.name, isPlaying: t.isPlaying, timePos: t.timePosition
                            }))
                        };
                    })()
                """)
                print("Idle info:", json.dumps(idle_info))
                await screenshot("character_idle_verified.png")

                # Walk forward
                print("Walking forward...")
                await eval_js("""
                    (() => {
                        const ctrl = window.conbloxStudio.characterController;
                        ctrl.keys.forward = true;
                    })()
                """)
                await asyncio.sleep(0.35)

                walk_info = await eval_js("""
                    (() => {
                        const ctrl = window.conbloxStudio.characterController;
                        const hum = ctrl.humanoid;
                        const char = ctrl.character;
                        const motors = char ? char.GetDescendants().filter(i => i.ClassName === 'Motor6D').map(m => ({
                            name: m.Name,
                            transform: m.Transform ? { rot: m.Transform.orientation } : null
                        })) : [];
                        return {
                            tracks: Array.from(hum._activeAnimationTracks || []).map(t => ({
                                name: t.name, isPlaying: t.isPlaying, timePos: t.timePosition
                            })),
                            motors
                        };
                    })()
                """)
                print("Walk stride 1 info:", json.dumps(walk_info, indent=2))
                await screenshot("character_walk_verified.png")

                # Next swing half a cycle later
                await asyncio.sleep(0.33)
                walk_info2 = await eval_js("""
                    (() => {
                        const ctrl = window.conbloxStudio.characterController;
                        const char = ctrl.character;
                        const hum = ctrl.humanoid;
                        return {
                            tracks: Array.from(hum._activeAnimationTracks || []).map(t => ({
                                name: t.name, isPlaying: t.isPlaying, timePos: t.timePosition
                            })),
                            motors: char ? char.GetDescendants().filter(i => i.ClassName === 'Motor6D').map(m => ({
                                name: m.Name,
                                transform: m.Transform ? { rot: m.Transform.orientation } : null
                            })) : []
                        };
                    })()
                """)
                print("Walk stride 2 info:", json.dumps(walk_info2, indent=2))
                await screenshot("character_walk_stride2_verified.png")

                # Jump
                print("Triggering jump...")
                await eval_js("""
                    (() => {
                        const ctrl = window.conbloxStudio.characterController;
                        ctrl.keys.jump = true;
                    })()
                """)
                await asyncio.sleep(0.2)
                await screenshot("character_jump_verified.png")

                # Release
                await eval_js("""
                    (() => {
                        const ctrl = window.conbloxStudio.characterController;
                        ctrl.keys.forward = false;
                        ctrl.keys.jump = false;
                    })()
                """)
                await asyncio.sleep(1.0)
                await screenshot("character_returned_to_idle.png")
                print("Verification sequence complete!")
    finally:
        proc.terminate()

if __name__ == "__main__":
    asyncio.run(test())
