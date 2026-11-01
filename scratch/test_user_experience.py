import asyncio
import aiohttp
import json
import tempfile
import subprocess
import base64
import os

async def test():
    temp_profile = tempfile.mkdtemp()
    proc = subprocess.Popen([
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        f"--user-data-dir={temp_profile}",
        "--remote-debugging-port=9345",
        "http://127.0.0.1:28888/"
    ])
    await asyncio.sleep(2.5)
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get("http://127.0.0.1:9345/json") as r:
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
                await cmd("Log.enable")

                async def screenshot(filename):
                    res = await cmd("Page.captureScreenshot", {"format": "png"})
                    while True:
                        msg = await ws.receive_json()
                        if msg.get("id") == res:
                            data = base64.b64decode(msg["result"]["data"])
                            filepath = os.path.join(r"C:\Users\Renat\.gemini\antigravity\brain\49e69d24-e071-4685-b5da-2bf81f94a438", filename)
                            with open(filepath, "wb") as f:
                                f.write(data)
                            print(f"Captured screenshot: {filename}")
                            return filepath
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

                # Wait for studio app to be ready
                for _ in range(40):
                    ready = await eval_js("Boolean(window.conbloxStudio && window.conbloxStudio.viewport)")
                    if ready:
                        break
                    await asyncio.sleep(0.2)

                print("Starting Test mode...")
                await eval_js("window.conbloxStudio.startSimulation('Test')")
                await asyncio.sleep(3.0)

                # Collect console messages and check character state
                status = await eval_js("""
                    (() => {
                        const studio = window.conbloxStudio;
                        const ctrl = studio.characterController;
                        const char = ctrl ? ctrl.character : null;
                        const hum = ctrl ? ctrl.humanoid : null;
                        const animScript = char ? char.FindFirstChild('Animate') : null;
                        
                        const tracks = hum ? Array.from(hum._activeAnimationTracks || []).map(t => ({
                            name: t.name,
                            isPlaying: t.isPlaying,
                            speed: t.speed,
                            length: t.length,
                            timePos: t.timePosition,
                            samplesCount: t._samples ? t._samples.length : 0
                        })) : [];

                        const motors = char ? char.GetDescendants().filter(i => i.ClassName === 'Motor6D').map(m => ({
                            name: m.Name,
                            part0: m.Part0 ? m.Part0.Name : null,
                            part1: m.Part1 ? m.Part1.Name : null,
                            c0: m.C0 ? { pos: m.C0.position, rot: m.C0.orientation } : null,
                            c1: m.C1 ? { pos: m.C1.position, rot: m.C1.orientation } : null,
                            transform: m.Transform ? { pos: m.Transform.position, rot: m.Transform.orientation } : null,
                            enabled: m.Enabled
                        })) : [];

                        const meshTransforms = [];
                        if (char && studio.viewport && studio.viewport.partMeshes) {
                            for (const p of char.GetDescendants().filter(i => i.IsA && i.IsA('BasePart'))) {
                                const m = studio.viewport.partMeshes.get(p);
                                if (m) {
                                    meshTransforms.push({
                                        partName: p.Name,
                                        position: { x: m.position.x, y: m.position.y, z: m.position.z },
                                        rotation: { x: m.rotation.x, y: m.rotation.y, z: m.rotation.z }
                                    });
                                }
                            }
                        }

                        const outputLogs = studio.outputUI ? Array.from(studio.outputUI.logs || []).map(l => l.text) : [];

                        return {
                            hasCharacter: Boolean(char),
                            charName: char?.Name,
                            hasAnimateScript: Boolean(animScript),
                            animateScriptRunning: animScript?._running,
                            tracks,
                            motors,
                            meshTransforms,
                            outputLogs
                        };
                    })()
                """)

                print("Initial Status:")
                print(json.dumps(status, indent=2))
                await screenshot("test_live_idle.png")

                # Now press forward to walk for 2 seconds
                print("\nWalking for 2 seconds...")
                await eval_js("""
                    (() => {
                        const ctrl = window.conbloxStudio.characterController;
                        ctrl.keys.forward = true;
                    })()
                """)
                await asyncio.sleep(2.0)

                walk_status = await eval_js("""
                    (() => {
                        const studio = window.conbloxStudio;
                        const ctrl = studio.characterController;
                        const hum = ctrl ? ctrl.humanoid : null;
                        const char = ctrl ? ctrl.character : null;

                        const tracks = hum ? Array.from(hum._activeAnimationTracks || []).map(t => ({
                            name: t.name,
                            isPlaying: t.isPlaying,
                            speed: t.speed,
                            length: t.length,
                            timePos: t.timePosition,
                            samplesCount: t._samples ? t._samples.length : 0
                        })) : [];

                        const motors = char ? char.GetDescendants().filter(i => i.ClassName === 'Motor6D').map(m => ({
                            name: m.Name,
                            part1: m.Part1 ? m.Part1.Name : null,
                            transform: m.Transform ? { pos: m.Transform.position, rot: m.Transform.orientation } : null
                        })) : [];

                        const meshTransforms = [];
                        if (char && studio.viewport && studio.viewport.partMeshes) {
                            for (const p of char.GetDescendants().filter(i => i.IsA && i.IsA('BasePart'))) {
                                const m = studio.viewport.partMeshes.get(p);
                                if (m) {
                                    meshTransforms.push({
                                        partName: p.Name,
                                        position: { x: m.position.x, y: m.position.y, z: m.position.z },
                                        rotation: { x: m.rotation.x, y: m.rotation.y, z: m.rotation.z }
                                    });
                                }
                            }
                        }

                        return { tracks, motors, meshTransforms };
                    })()
                """)
                print("Walk Status:")
                print(json.dumps(walk_status, indent=2))
                await screenshot("test_live_walk.png")

    finally:
        proc.terminate()

if __name__ == "__main__":
    asyncio.run(test())
