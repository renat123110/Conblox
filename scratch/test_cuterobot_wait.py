import asyncio
import aiohttp
import json
import tempfile
import subprocess
import base64
import os

ARTIFACT_DIR = r"C:\Users\Renat\Desktop\Conblox\scratch"

async def test():
    temp_profile = tempfile.mkdtemp()
    proc = subprocess.Popen([
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--window-size=1280,720",
        f"--user-data-dir={temp_profile}",
        "--remote-debugging-port=9357",
        "http://127.0.0.1:28888/"
    ])
    await asyncio.sleep(3.0)
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get("http://127.0.0.1:9357/json") as r:
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
                print("Loaded into StarterPlayer:", await eval_js(js_load))

                # Start simulation Test (character mode) and wait for character to spawn
                await eval_js("window.conbloxStudio.startSimulation('Test')")
                for _ in range(10):
                    await asyncio.sleep(0.5)
                    has_char = await eval_js("Boolean(window.conbloxStudio.characterController.character)")
                    if has_char:
                        break

                # Check character status
                status = await eval_js("""
                (() => {
                    const char = window.conbloxStudio.characterController.character;
                    if (!char) return { error: 'No character' };
                    const head = char.FindFirstChild('Head');
                    const torso = char.FindFirstChild('Torso');
                    const hrp = char.FindFirstChild('HumanoidRootPart');
                    const welds = char.GetDescendants().filter(x => x.Name === 'AccessoryWeld');
                    const handles = char.GetDescendants().filter(x => x.Name === 'Handle');
                    return {
                        charName: char.Name,
                        hrpPos: hrp ? {x: hrp.Position.x, y: hrp.Position.y, z: hrp.Position.z} : null,
                        headPos: head ? {x: head.Position.x, y: head.Position.y, z: head.Position.z} : null,
                        torsoPos: torso ? {x: torso.Position.x, y: torso.Position.y, z: torso.Position.z} : null,
                        welds: welds.map(w => ({
                            name: w.Name,
                            part0: w.Part0 ? w.Part0.Name : null,
                            part1: w.Part1 ? w.Part1.Name : null,
                            enabled: w.Enabled
                        })),
                        handles: handles.map(h => ({
                            parent: h.Parent ? h.Parent.Name : null,
                            pos: {x: h.Position.x, y: h.Position.y, z: h.Position.z}
                        }))
                    };
                })()
                """)
                print("Status:", json.dumps(status, indent=2))

                # Screenshot
                screenshot_res = await cmd("Page.captureScreenshot", {"format": "png"})
                while True:
                    msg = await ws.receive_json()
                    if msg.get("id") == screenshot_res:
                        data = msg["result"]["data"]
                        path = r"C:\Users\Renat\.gemini\antigravity\brain\49e69d24-e071-4685-b5da-2bf81f94a438\cuterobot_sim_verified.png"
                        with open(path, "wb") as f:
                            f.write(base64.b64decode(data))
                        print("Saved screenshot to", path)
                        break
    finally:
        proc.kill()

asyncio.run(test())
