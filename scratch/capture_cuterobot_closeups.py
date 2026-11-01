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
        "--remote-debugging-port=9363",
        "http://127.0.0.1:28888/"
    ])
    await asyncio.sleep(2.5)
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get("http://127.0.0.1:9363/json") as r:
                targets = await r.json()
            target = next(t for t in targets if "127.0.0.1:28888" in t.get("url", ""))
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
                            if "exceptionDetails" in res:
                                print("JS Exception:", res["exceptionDetails"])
                            return res.get("result", {}).get("value")

                await asyncio.sleep(2.0)

                # Clean UI for unobstructed views: hide bottom dock and multiplayer overlay
                await eval_js("""
                (() => {
                    const bd = document.getElementById('bottom-dock');
                    if (bd) bd.style.display = 'none';
                    const split = document.getElementById('output-panel-split');
                    if (split) split.style.display = 'none';
                    const mp = document.querySelector('.multiplayer-panel');
                    if (mp) mp.style.display = 'none';
                    window.dispatchEvent(new Event('resize'));
                    if (window.conbloxStudio?.viewport?.onResize) window.conbloxStudio.viewport.onResize();
                })()
                """)

                # Load CuteRobot into StarterPlayer
                js_load = """
                (async () => {
                    const resp = await fetch('/CuteRobot.rbxm');
                    const { parseRbxm } = await import('/js/studio/RbxmImporter.js');
                    const { roots } = parseRbxm(new Uint8Array(await resp.arrayBuffer()));
                    const model = roots[0];
                    model.Parent = window.conbloxStudio.dataModel.StarterPlayer;
                    return { name: model.Name };
                })()
                """
                await eval_js(js_load)

                # Start simulation Test
                await eval_js("window.conbloxStudio.startSimulation('Test')")
                await asyncio.sleep(2.0)

                async def take_screenshot(filename):
                    res = await cmd("Page.captureScreenshot", {"format": "png"})
                    while True:
                        msg = await ws.receive_json()
                        if msg.get("id") == res:
                            data = msg["result"]["data"]
                            filepath = os.path.join(ARTIFACT_DIR, filename)
                            with open(filepath, "wb") as f:
                                f.write(base64.b64decode(data))
                            print("Saved screenshot:", filepath)
                            return filepath

                # 1. Close-up Front: CuteRobot Face, Robot Cat Ears and Hair
                await eval_js("""
                (() => {
                    const cc = window.conbloxStudio.characterController;
                    cc.cameraYaw = Math.PI; // Face front
                    cc.cameraPitch = 0.05;
                    cc.cameraDistance = 4.0;
                    cc.cameraFocusOffsetY = 1.0;
                })()
                """)
                await asyncio.sleep(0.5)
                await take_screenshot("cuterobot_front_closeup.png")

                # 2. Close-up Back: Plug Tail attached to Torso lower back
                await eval_js("""
                (() => {
                    const cc = window.conbloxStudio.characterController;
                    cc.cameraYaw = 0.45; // Back quarter
                    cc.cameraPitch = 0.25;
                    cc.cameraDistance = 4.2;
                    cc.cameraFocusOffsetY = 0.5;
                })()
                """)
                await asyncio.sleep(0.5)
                await take_screenshot("cuterobot_tail_closeup.png")

                # 3. Dynamic Walking View: Limbs swinging with smooth blending & accessories locked to rig
                await eval_js("window.conbloxStudio.characterController.keys.forward = true;")
                await asyncio.sleep(0.35)
                await eval_js("""
                (() => {
                    const cc = window.conbloxStudio.characterController;
                    cc.cameraYaw = 1.35; // Side perspective
                    cc.cameraPitch = 0.15;
                    cc.cameraDistance = 5.2;
                    cc.cameraFocusOffsetY = 0.6;
                })()
                """)
                await asyncio.sleep(0.2)
                await take_screenshot("cuterobot_walking_action.png")

                # Return to idle
                await eval_js("window.conbloxStudio.characterController.keys.forward = false;")
                await asyncio.sleep(0.5)
                await take_screenshot("cuterobot_smooth_idle.png")
    finally:
        proc.kill()

asyncio.run(test())
