import asyncio
import aiohttp
import json
import base64
import subprocess
import os

app_dir = r"C:\Users\Renat\Desktop\Conblox"
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

async def main():
    # Make sure Chrome is running with remote debugging port 9222
    # Check if 9222 is responding
    proc = None
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get("http://127.0.0.1:9222/json/version") as r:
                pass
    except Exception:
        proc = subprocess.Popen([
            chrome_path,
            "--headless=new",
            "--no-sandbox",
            "--disable-gpu",
            "--window-size=1280,720",
            "--remote-debugging-port=9222",
            "http://127.0.0.1:28888/?import_rbxm=R6TemplateCat.rbxm"
        ])
        await asyncio.sleep(2)

    async with aiohttp.ClientSession() as session:
        # Get targets
        async with session.get("http://127.0.0.1:9222/json") as resp:
            targets = await resp.json()

        target = None
        for t in targets:
            if "Conblox Studio" in t.get("title", "") or "127.0.0.1:28888" in t.get("url", ""):
                target = t
                break
        if not target and targets:
            target = targets[0]

        ws_url = target["webSocketDebuggerUrl"]
        print("Connected to:", ws_url)

        async with session.ws_connect(ws_url) as ws:
            msg_id = 1
            responses = {}

            async def send_cmd(method, params=None):
                nonlocal msg_id
                cid = msg_id
                msg_id += 1
                payload = {"id": cid, "method": method}
                if params:
                    payload["params"] = params
                await ws.send_json(payload)
                while cid not in responses:
                    msg = await ws.receive_json()
                    if "id" in msg:
                        responses[msg["id"]] = msg
                return responses.pop(cid)

            # Navigate to the import page
            await send_cmd("Page.navigate", {"url": "http://127.0.0.1:28888/?import_rbxm=R6TemplateCat.rbxm"})
            print("Navigated, waiting for load...")
            await asyncio.sleep(4)

            # Check if import is done and textures loaded
            for _ in range(30):
                res = await send_cmd("Runtime.evaluate", {
                    "expression": "Boolean(window.__IMPORT_RBXM_DONE && window.conbloxStudio)",
                    "returnByValue": True
                })
                done = res.get("result", {}).get("result", {}).get("value")
                if done:
                    print("Import done!")
                    break
                await asyncio.sleep(0.5)

            # Wait 2 more seconds for textures to load
            await asyncio.sleep(2)

            # Let's hide the output panel and dock so the 3D viewport takes full screen!
            await send_cmd("Runtime.evaluate", {
                "expression": """
                (() => {
                    const bottomDock = document.getElementById('bottom-dock');
                    if (bottomDock) bottomDock.style.display = 'none';
                    const split = document.getElementById('output-panel-split');
                    if (split) split.style.display = 'none';
                    window.dispatchEvent(new Event('resize'));
                })()
                """
            })
            await asyncio.sleep(0.5)

            # Focus camera on the character from the FRONT
            # Remember: Character front is -Z. Camera in front should be at -Z looking at +Z!
            script_front = """
            (() => {
                const app = window.conbloxStudio;
                const vp = app.viewport;
                // Find imported model
                const model = app.dataModel.Workspace.FindFirstChild('R6TemplateCat') 
                    || app.dataModel.Workspace.GetChildren().find(c => c.Name.includes('R6Template'));
                if (!model) return 'Model not found';
                const torso = model.FindFirstChild('Torso', true);
                if (!torso) return 'Torso not found';
                const pos = torso.Position;
                // Position camera in front of character (towards -Z)
                vp.camera.position.set(pos.x, pos.y + 0.3, pos.z - 5.5);
                vp.controls.target.set(pos.x, pos.y + 0.3, pos.z);
                vp.controls.update();
                return 'OK, pos=' + JSON.stringify(pos);
            })()
            """
            res = await send_cmd("Runtime.evaluate", {"expression": script_front, "returnByValue": True})
            print("Set front camera:", res.get("result", {}).get("result", {}).get("value"))
            await asyncio.sleep(1)

            # Screenshot Front
            snap = await send_cmd("Page.captureScreenshot")
            if "result" in snap:
                img_data = base64.b64decode(snap["result"]["data"])
                path = os.path.join(app_dir, "scratch", "live_cat_front.png")
                with open(path, "wb") as f:
                    f.write(img_data)
                print("Saved:", path)

            # Focus camera on the character from the BACK (+Z)
            script_back = """
            (() => {
                const app = window.conbloxStudio;
                const vp = app.viewport;
                const model = app.dataModel.Workspace.FindFirstChild('R6TemplateCat') 
                    || app.dataModel.Workspace.GetChildren().find(c => c.Name.includes('R6Template'));
                const torso = model.FindFirstChild('Torso', true);
                const pos = torso.Position;
                vp.camera.position.set(pos.x, pos.y + 0.3, pos.z + 5.5);
                vp.controls.target.set(pos.x, pos.y + 0.3, pos.z);
                vp.controls.update();
                return 'OK';
            })()
            """
            await send_cmd("Runtime.evaluate", {"expression": script_back, "returnByValue": True})
            await asyncio.sleep(0.5)

            # Screenshot Back
            snap = await send_cmd("Page.captureScreenshot")
            if "result" in snap:
                img_data = base64.b64decode(snap["result"]["data"])
                path = os.path.join(app_dir, "scratch", "live_cat_back.png")
                with open(path, "wb") as f:
                    f.write(img_data)
                print("Saved:", path)

            # Test PLAY MODE: CharacterController spawn!
            script_play = """
            (() => {
                const app = window.conbloxStudio;
                app.startSimulation('Test');
                return 'Simulation started';
            })()
            """
            res = await send_cmd("Runtime.evaluate", {"expression": script_play, "returnByValue": True})
            print("Play mode:", res.get("result", {}).get("result", {}).get("value"))
            await asyncio.sleep(2)

            # In play mode, look at player character from front
            script_player_front = """
            (() => {
                const app = window.conbloxStudio;
                const vp = app.viewport;
                const ctrl = app.characterController;
                if (!ctrl || !ctrl.parts || !ctrl.parts.torso) return 'No player parts';
                const pos = ctrl.parts.torso.Position;
                vp.camera.position.set(pos.x, pos.y + 0.3, pos.z - 5.5);
                if (vp.controls) {
                    vp.controls.target.set(pos.x, pos.y + 0.3, pos.z);
                    vp.controls.update();
                }
                return 'Player pos=' + JSON.stringify(pos);
            })()
            """
            res = await send_cmd("Runtime.evaluate", {"expression": script_player_front, "returnByValue": True})
            print("Set player camera:", res.get("result", {}).get("result", {}).get("value"))
            await asyncio.sleep(1)

            # Screenshot Player in simulation
            snap = await send_cmd("Page.captureScreenshot")
            if "result" in snap:
                img_data = base64.b64decode(snap["result"]["data"])
                path = os.path.join(app_dir, "scratch", "live_player_simulation.png")
                with open(path, "wb") as f:
                    f.write(img_data)
                print("Saved:", path)

if __name__ == "__main__":
    asyncio.run(main())
