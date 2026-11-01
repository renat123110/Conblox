import asyncio
import aiohttp
import json
import base64
import subprocess
import os

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
out_dir = r"C:\Users\Renat\.gemini\antigravity\brain\49e69d24-e071-4685-b5da-2bf81f94a438"

async def main():
    import tempfile
    temp_profile = tempfile.mkdtemp()
    proc = subprocess.Popen([
        chrome_path,
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        f"--user-data-dir={temp_profile}",
        "--window-size=1280,720",
        "--remote-debugging-port=9334",
        "http://127.0.0.1:28888/?import_rbxm=R6Girl.rbxm"
    ])
    await asyncio.sleep(2.5)

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://127.0.0.1:9334/json") as resp:
                targets = await resp.json()

            target = None
            for t in targets:
                if "Conblox" in t.get("title", "") or "127.0.0.1:28888" in t.get("url", ""):
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

                # Wait for import
                for _ in range(40):
                    res = await send_cmd("Runtime.evaluate", {
                        "expression": "Boolean(window.__IMPORT_RBXM_DONE && window.conbloxStudio && window.conbloxStudio.viewport)",
                        "returnByValue": True
                    })
                    if res.get("result", {}).get("result", {}).get("value"):
                        print("Import done!")
                        break
                    await asyncio.sleep(0.5)

                await asyncio.sleep(3.0)

                # Focus camera on Head and deselect all parts
                eval_res = await send_cmd("Runtime.evaluate", {
                    "expression": """
                    (() => {
                        const bottomDock = document.getElementById('bottom-dock');
                        if (bottomDock) bottomDock.style.display = 'none';
                        const split = document.getElementById('output-panel-split');
                        if (split) split.style.display = 'none';
                        window.dispatchEvent(new Event('resize'));

                        const app = window.conbloxStudio;
                        app.selectInstance(null);

                        const shop = app.dataModel.Workspace.FindFirstChild('Shop');
                        const head = shop ? shop.FindFirstChild('Head') : null;
                        if (head && app.viewport) {
                            const p = head.Position;
                            // Camera in front of face looking towards -Z
                            app.viewport.cameraPos.set(p.x, p.y, p.z + 1.8);
                            app.viewport.cameraYaw = 0.0;
                            app.viewport.cameraPitch = 0.0;
                            app.viewport.updateCameraTransform();

                            const headMesh = app.viewport.partMeshes.get(head);
                            return {
                                headPos: { x: p.x, y: p.y, z: p.z },
                                hasMaterial: Boolean(headMesh && headMesh.material),
                                hasMap: Boolean(headMesh && headMesh.material && headMesh.material.map)
                            };
                        }
                        return { error: 'head not found' };
                    })()
                    """,
                    "returnByValue": True
                })
                print("Head info:", json.dumps(eval_res.get("result", {}).get("result", {}).get("value"), indent=2))

                await asyncio.sleep(1.0)

                shot = await send_cmd("Page.captureScreenshot", {"format": "png"})
                img_data = base64.b64decode(shot["result"]["data"])
                out_path = os.path.join(out_dir, "r6girl_verified.png")
                with open(out_path, "wb") as f:
                    f.write(img_data)
                print(f"Screenshot written to {out_path}")
    finally:
        proc.kill()
        import shutil
        shutil.rmtree(temp_profile, ignore_errors=True)

if __name__ == "__main__":
    asyncio.run(main())
