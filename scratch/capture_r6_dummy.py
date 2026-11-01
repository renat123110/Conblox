import asyncio
import aiohttp
import json
import base64
import subprocess
import os

app_dir = r"C:\Users\Renat\Desktop\Conblox"
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

async def main():
    profile_dir = os.path.join(app_dir, "scratch", "chrome_profile")
    proc = subprocess.Popen([
        chrome_path,
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--window-size=1280,720",
        "--remote-debugging-port=9222",
        f"--user-data-dir={profile_dir}",
        "http://127.0.0.1:28888/?import_rbxm=R6TemplateCat.rbxm"
    ])
    await asyncio.sleep(3)

    try:
        async with aiohttp.ClientSession() as session:
            targets = None
            for _ in range(10):
                try:
                    async with session.get("http://127.0.0.1:9222/json") as resp:
                        targets = await resp.json()
                        break
                except Exception:
                    await asyncio.sleep(0.5)

            if not targets:
                print("Could not connect to Chrome debugging port!")
                return

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

                async def reader():
                    async for msg in ws:
                        if msg.type == aiohttp.WSMsgType.TEXT:
                            data = json.loads(msg.data)
                            if "id" in data:
                                responses[data["id"]] = data

                reader_task = asyncio.create_task(reader())

                async def send_cmd(method, params=None):
                    nonlocal msg_id
                    cid = msg_id
                    msg_id += 1
                    payload = {"id": cid, "method": method}
                    if params:
                        payload["params"] = params
                    await ws.send_json(payload)
                    for _ in range(100):
                        if cid in responses:
                            return responses.pop(cid)
                        await asyncio.sleep(0.1)
                    return {}

                await send_cmd("Runtime.enable")
                await send_cmd("Page.enable")

                print("Waiting for import...")
                for _ in range(40):
                    res = await send_cmd("Runtime.evaluate", {
                        "expression": "Boolean(window.__IMPORT_RBXM_DONE && window.conbloxStudio)",
                        "returnByValue": True
                    })
                    if res.get("result", {}).get("result", {}).get("value"):
                        print("Import finished!")
                        break
                    await asyncio.sleep(0.5)

                # Wait for decals
                await asyncio.sleep(3)

                # Hide docks
                await send_cmd("Runtime.evaluate", {
                    "expression": """
                    (() => {
                        const bottomDock = document.getElementById('bottom-dock');
                        if (bottomDock) bottomDock.style.display = 'none';
                        const split = document.getElementById('output-panel-split');
                        if (split) split.style.display = 'none';
                        const rightDock = document.getElementById('right-dock');
                        if (rightDock) rightDock.style.display = 'none';
                        const splitR = document.getElementById('panel-split-right');
                        if (splitR) splitR.style.display = 'none';
                        window.dispatchEvent(new Event('resize'));
                    })()
                    """
                })
                await asyncio.sleep(1)

                # Setup camera for FRONT view
                setup_front = """
                (() => {
                    const app = window.conbloxStudio;
                    const vp = app.viewport;
                    const dummy = app.dataModel.Workspace.FindFirstChild('R6 [Dummy]') 
                        || app.dataModel.Workspace.GetChildren().find(c => c.Name.includes('Dummy') || c.Name.includes('R6'));
                    const torso = dummy.FindFirstChild('Torso', true);
                    const pos = torso.Position;
                    vp.cameraPos.set(pos.x, pos.y + 0.3, pos.z - 4.5);
                    vp.cameraYaw = Math.PI;
                    vp.cameraPitch = 0.05;
                    vp.updateCameraTransform();
                    return { pos, yaw: vp.cameraYaw };
                })()
                """
                res = await send_cmd("Runtime.evaluate", {"expression": setup_front, "returnByValue": True})
                print("FRONT CAM:", res.get("result", {}).get("result", {}).get("value"))
                await asyncio.sleep(1)

                snap = await send_cmd("Page.captureScreenshot")
                if "result" in snap:
                    img_data = base64.b64decode(snap["result"]["data"])
                    p_front = os.path.join(app_dir, "scratch", "dummy_cat_front.png")
                    with open(p_front, "wb") as f:
                        f.write(img_data)
                    print("Saved:", p_front)

                # Closeup on Head
                setup_head = """
                (() => {
                    const app = window.conbloxStudio;
                    const vp = app.viewport;
                    const dummy = app.dataModel.Workspace.FindFirstChild('R6 [Dummy]') 
                        || app.dataModel.Workspace.GetChildren().find(c => c.Name.includes('Dummy') || c.Name.includes('R6'));
                    const head = dummy.FindFirstChild('Head', true);
                    const pos = head.Position;
                    vp.cameraPos.set(pos.x, pos.y, pos.z - 2.2);
                    vp.cameraYaw = Math.PI;
                    vp.cameraPitch = 0;
                    vp.updateCameraTransform();
                    return { pos };
                })()
                """
                await send_cmd("Runtime.evaluate", {"expression": setup_head, "returnByValue": True})
                await asyncio.sleep(1)

                snap = await send_cmd("Page.captureScreenshot")
                if "result" in snap:
                    img_data = base64.b64decode(snap["result"]["data"])
                    p_head = os.path.join(app_dir, "scratch", "dummy_cat_head_closeup.png")
                    with open(p_head, "wb") as f:
                        f.write(img_data)
                    print("Saved:", p_head)

                # Setup camera for BACK view (+Z)
                setup_back = """
                (() => {
                    const app = window.conbloxStudio;
                    const vp = app.viewport;
                    const dummy = app.dataModel.Workspace.FindFirstChild('R6 [Dummy]') 
                        || app.dataModel.Workspace.GetChildren().find(c => c.Name.includes('Dummy') || c.Name.includes('R6'));
                    const torso = dummy.FindFirstChild('Torso', true);
                    const pos = torso.Position;
                    vp.cameraPos.set(pos.x, pos.y + 0.3, pos.z + 4.5);
                    vp.cameraYaw = 0;
                    vp.cameraPitch = 0.05;
                    vp.updateCameraTransform();
                    return { pos };
                })()
                """
                await send_cmd("Runtime.evaluate", {"expression": setup_back, "returnByValue": True})
                await asyncio.sleep(1)

                snap = await send_cmd("Page.captureScreenshot")
                if "result" in snap:
                    img_data = base64.b64decode(snap["result"]["data"])
                    p_back = os.path.join(app_dir, "scratch", "dummy_cat_back.png")
                    with open(p_back, "wb") as f:
                        f.write(img_data)
                    print("Saved:", p_back)

                # Setup camera for RIGHT view (+X)
                setup_right = """
                (() => {
                    const app = window.conbloxStudio;
                    const vp = app.viewport;
                    const dummy = app.dataModel.Workspace.FindFirstChild('R6 [Dummy]') 
                        || app.dataModel.Workspace.GetChildren().find(c => c.Name.includes('Dummy') || c.Name.includes('R6'));
                    const torso = dummy.FindFirstChild('Torso', true);
                    const pos = torso.Position;
                    vp.cameraPos.set(pos.x + 4.5, pos.y + 0.3, pos.z);
                    vp.cameraYaw = Math.PI / 2;
                    vp.cameraPitch = 0.05;
                    vp.updateCameraTransform();
                    return { pos };
                })()
                """
                await send_cmd("Runtime.evaluate", {"expression": setup_right, "returnByValue": True})
                await asyncio.sleep(1)

                snap = await send_cmd("Page.captureScreenshot")
                if "result" in snap:
                    img_data = base64.b64decode(snap["result"]["data"])
                    p_right = os.path.join(app_dir, "scratch", "dummy_cat_right.png")
                    with open(p_right, "wb") as f:
                        f.write(img_data)
                    print("Saved:", p_right)

                # Setup camera for LEFT view (-X)
                setup_left = """
                (() => {
                    const app = window.conbloxStudio;
                    const vp = app.viewport;
                    const dummy = app.dataModel.Workspace.FindFirstChild('R6 [Dummy]') 
                        || app.dataModel.Workspace.GetChildren().find(c => c.Name.includes('Dummy') || c.Name.includes('R6'));
                    const torso = dummy.FindFirstChild('Torso', true);
                    const pos = torso.Position;
                    vp.cameraPos.set(pos.x - 4.5, pos.y + 0.3, pos.z);
                    vp.cameraYaw = -Math.PI / 2;
                    vp.cameraPitch = 0.05;
                    vp.updateCameraTransform();
                    return { pos };
                })()
                """
                await send_cmd("Runtime.evaluate", {"expression": setup_left, "returnByValue": True})
                await asyncio.sleep(1)

                snap = await send_cmd("Page.captureScreenshot")
                if "result" in snap:
                    img_data = base64.b64decode(snap["result"]["data"])
                    p_left = os.path.join(app_dir, "scratch", "dummy_cat_left.png")
                    with open(p_left, "wb") as f:
                        f.write(img_data)
                    print("Saved:", p_left)

                # NOW TEST PLAY SIMULATION!
                print("Starting Play Simulation...")
                await send_cmd("Runtime.evaluate", {
                    "expression": "window.conbloxStudio.startSimulation('Test')",
                    "returnByValue": True
                })
                await asyncio.sleep(2.5)

                # Orbit camera in front of spawned player
                player_cam = """
                (() => {
                    const app = window.conbloxStudio;
                    const ctrl = app.characterController;
                    ctrl.cameraYaw = Math.PI;
                    ctrl.cameraPitch = 0.05;
                    ctrl.targetCameraDistance = 5.0;
                    ctrl.cameraDistance = 5.0;
                    return 'Player front camera set';
                })()
                """
                await send_cmd("Runtime.evaluate", {"expression": player_cam, "returnByValue": True})
                await asyncio.sleep(1)

                snap = await send_cmd("Page.captureScreenshot")
                if "result" in snap:
                    img_data = base64.b64decode(snap["result"]["data"])
                    p_sim = os.path.join(app_dir, "scratch", "player_simulation_front.png")
                    with open(p_sim, "wb") as f:
                        f.write(img_data)
                    print("Saved:", p_sim)

                # Also Player Closeup on head in simulation
                player_head = """
                (() => {
                    const app = window.conbloxStudio;
                    const ctrl = app.characterController;
                    ctrl.cameraYaw = Math.PI;
                    ctrl.cameraPitch = 0;
                    ctrl.targetCameraDistance = 2.4;
                    ctrl.cameraDistance = 2.4;
                    return 'Player head camera set';
                })()
                """
                await send_cmd("Runtime.evaluate", {"expression": player_head, "returnByValue": True})
                await asyncio.sleep(1)

                snap = await send_cmd("Page.captureScreenshot")
                if "result" in snap:
                    img_data = base64.b64decode(snap["result"]["data"])
                    p_sim_head = os.path.join(app_dir, "scratch", "player_simulation_head.png")
                    with open(p_sim_head, "wb") as f:
                        f.write(img_data)
                    print("Saved:", p_sim_head)

                reader_task.cancel()
    finally:
        if proc:
            proc.terminate()

if __name__ == "__main__":
    asyncio.run(main())
