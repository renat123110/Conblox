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
        "--remote-debugging-port=9360",
        "http://127.0.0.1:28888/"
    ])
    await asyncio.sleep(2.5)
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get("http://127.0.0.1:9360/json") as r:
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

                # Adjust camera to front view of CuteRobot (orbit angle to see front face and hair/ears)
                await eval_js("""
                (() => {
                    const cc = window.conbloxStudio.characterController;
                    cc.cameraYaw = Math.PI; // Face the character from front
                    cc.cameraPitch = 0.1;
                    cc.cameraDistance = 8.0;
                })()
                """)
                await asyncio.sleep(0.5)

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

                # 1. Front view showing attached robot ears / hair
                await take_screenshot("cuterobot_accessories_front.png")

                # 2. Back view showing attached plug tail
                await eval_js("""
                (() => {
                    const cc = window.conbloxStudio.characterController;
                    cc.cameraYaw = 0.3; // Back-quarter view to clearly see the tail
                    cc.cameraPitch = 0.25;
                    cc.cameraDistance = 7.0;
                })()
                """)
                await asyncio.sleep(0.5)
                await take_screenshot("cuterobot_accessories_back.png")

                # 3. Test walk movement and check smooth blending
                # Press 'W' to walk forward
                await eval_js("window.conbloxStudio.characterController.keys.forward = true;")
                
                # Check weights and positions during walk transition
                blend_samples = []
                for step in range(5):
                    await asyncio.sleep(0.08)
                    sample = await eval_js("""
                    (() => {
                        const hum = window.conbloxStudio.characterController.humanoid;
                        const tracks = hum ? Array.from(hum._activeAnimationTracks) : [];
                        const char = window.conbloxStudio.characterController.character;
                        const hrp = char?.FindFirstChild('HumanoidRootPart');
                        const head = char?.FindFirstChild('Head');
                        const handles = char ? char.GetDescendants().filter(x => x.Name === 'Handle') : [];
                        return {
                            tracks: tracks.map(t => ({ name: t.name, weight: t.weight, isPlaying: t.isPlaying })),
                            handles: handles.map(h => ({ name: h.Parent?.Name, y: h.Position.y }))
                        };
                    })()
                    """)
                    blend_samples.append(sample)

                print("Transition samples:", json.dumps(blend_samples, indent=2))

                # Screenshot while walking mid-stride
                await asyncio.sleep(0.4)
                await take_screenshot("cuterobot_walking_accessories.png")

                # Release 'W' to return to idle
                await eval_js("window.conbloxStudio.characterController.keys.forward = false;")
                await asyncio.sleep(0.5)
                await take_screenshot("cuterobot_returned_idle.png")

    finally:
        proc.kill()

asyncio.run(test())
