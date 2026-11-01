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
        "--remote-debugging-port=9364",
        "http://127.0.0.1:28888/"
    ])
    await asyncio.sleep(2.5)
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get("http://127.0.0.1:9364/json") as r:
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

                # Clean UI
                await eval_js("""
                (() => {
                    const bd = document.getElementById('bottom-dock');
                    if (bd) bd.style.display = 'none';
                    const split = document.getElementById('output-panel-split');
                    if (split) split.style.display = 'none';
                    const mp = document.querySelector('.multiplayer-panel');
                    if (mp) mp.style.display = 'none';
                })()
                """)

                # Load CuteRobot directly into Workspace
                js_load = """
                (async () => {
                    const resp = await fetch('/CuteRobot.rbxm');
                    const { parseRbxm } = await import('/js/studio/RbxmImporter.js');
                    const { roots } = parseRbxm(new Uint8Array(await resp.arrayBuffer()));
                    const model = roots[0];
                    model.Parent = window.conbloxStudio.dataModel.Workspace;

                    // Position model slightly in front of default camera
                    const hrp = model.FindFirstChild('HumanoidRootPart');
                    const spawn = window.conbloxStudio.dataModel.Workspace.FindFirstChild('SpawnLocation');
                    const baseY = spawn ? spawn.Position.y + 3.0 : 3.0;

                    const parts = model.GetDescendants().filter(x => x.IsA && x.IsA('BasePart'));
                    const deltaY = baseY - (hrp ? hrp.Position.y : 0);
                    const deltaX = 0 - (hrp ? hrp.Position.x : 0);
                    const deltaZ = -5 - (hrp ? hrp.Position.z : 0);

                    for (const p of parts) {
                        p.Position = new p.Position.constructor(p.Position.x + deltaX, p.Position.y + deltaY, p.Position.z + deltaZ);
                        p.Anchored = true; // Anchor parts as NPC exhibition
                    }

                    window.conbloxStudio.viewport.syncAllParts();
                    return { name: model.Name, partsCount: parts.length };
                })()
                """
                load_res = await eval_js(js_load)
                print("Workspace model loaded:", load_res)

                # Start simulation Run
                await eval_js("window.conbloxStudio.startSimulation('Run')")
                await asyncio.sleep(1.5)

                # Move viewport camera to frame the CuteRobot model in Workspace
                await eval_js("""
                (() => {
                    const vp = window.conbloxStudio.viewport;
                    vp.cameraPos.set(0, 4.5, 2.5);
                    vp.cameraPitch = -0.15;
                    vp.cameraYaw = 0;
                    vp.camera.position.copy(vp.cameraPos);
                    vp.camera.lookAt(0, 4.0, -5);
                })()
                """)
                await asyncio.sleep(0.5)

                res = await cmd("Page.captureScreenshot", {"format": "png"})
                while True:
                    msg = await ws.receive_json()
                    if msg.get("id") == res:
                        data = msg["result"]["data"]
                        filepath = os.path.join(ARTIFACT_DIR, "cuterobot_workspace_npc.png")
                        with open(filepath, "wb") as f:
                            f.write(base64.b64decode(data))
                        print("Saved screenshot:", filepath)
                        break
    finally:
        proc.kill()

asyncio.run(test())
