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
        "--remote-debugging-port=9337",
        "http://127.0.0.1:28888/?import_rbxm=R6TemplateCat.rbxm"
    ])
    await asyncio.sleep(2.5)

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://127.0.0.1:9337/json") as resp:
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

                # Wait for R6TemplateCat import
                for _ in range(40):
                    res = await send_cmd("Runtime.evaluate", {
                        "expression": "Boolean(window.__IMPORT_RBXM_DONE && window.conbloxStudio && window.conbloxStudio.viewport)",
                        "returnByValue": True
                    })
                    if res.get("result", {}).get("result", {}).get("value"):
                        print("R6TemplateCat import done!")
                        break
                    await asyncio.sleep(0.5)

                await asyncio.sleep(2.0)

                # Now fetch WomanBody.rbxm and add the CharacterMesh to the character model!
                add_woman = await send_cmd("Runtime.evaluate", {
                    "expression": """
                    (async () => {
                        const app = window.conbloxStudio;
                        app.selectInstance(null);

                        // Find the imported character
                        const char = app.dataModel.Workspace.GetChildren().find(c => c.IsA && c.IsA('Model') && c.FindFirstChild('Torso'));
                        if (!char) return { error: 'Character model not found in Workspace' };

                        // Fetch and parse WomanBody.rbxm
                        const resp = await fetch('/WomanBody.rbxm');
                        const buf = await resp.arrayBuffer();
                        const { parseRbxm } = await import('/js/studio/RbxmImporter.js');
                        const { roots } = parseRbxm(buf);
                        const womanMesh = roots[0];

                        // Parent WomanBody CharacterMesh to the character model!
                        womanMesh.Parent = char;

                        // Force viewport to update and rebuild parts
                        app.viewport.handleCharacterChildChange(char);

                        return {
                            success: true,
                            charName: char.Name,
                            charChildren: char.GetChildren().map(c => ({ name: c.Name, class: c.ClassName })),
                            womanMeshBodyPart: womanMesh.BodyPart,
                            womanMeshId: womanMesh.MeshId
                        };
                    })()
                    """,
                    "awaitPromise": True,
                    "returnByValue": True
                })
                print("Add WomanBody result:", json.dumps(add_woman.get("result", {}).get("result", {}).get("value"), indent=2))

                # Wait for mesh data and clothing texture to compile and rebuild
                await asyncio.sleep(3.0)

                # Focus camera on the Character Torso from the Front
                cam_res = await send_cmd("Runtime.evaluate", {
                    "expression": """
                    (() => {
                        const bottomDock = document.getElementById('bottom-dock');
                        if (bottomDock) bottomDock.style.display = 'none';
                        const split = document.getElementById('output-panel-split');
                        if (split) split.style.display = 'none';
                        window.dispatchEvent(new Event('resize'));

                        const app = window.conbloxStudio;
                        const char = app.dataModel.Workspace.GetChildren().find(c => c.IsA && c.IsA('Model') && c.FindFirstChild('Torso'));
                        const torso = char ? char.FindFirstChild('Torso') : null;
                        if (torso && app.viewport) {
                            const p = torso.Position;
                            // Camera in front of torso looking towards -Z
                            app.viewport.cameraPos.set(p.x, p.y + 0.2, p.z - 4.5);
                            app.viewport.cameraYaw = Math.PI; // Face the front (-Z)
                            app.viewport.cameraPitch = 0.0;
                            app.viewport.updateCameraTransform();

                            const torsoMesh = app.viewport.partMeshes.get(torso);
                            return {
                                torsoPos: { x: p.x, y: p.y, z: p.z },
                                geoVertices: torsoMesh?.geometry?.attributes?.position?.count,
                                hasMaterial: Boolean(torsoMesh?.material),
                                hasMap: Boolean(torsoMesh?.material?.map)
                            };
                        }
                        return { error: 'torso not found' };
                    })()
                    """,
                    "returnByValue": True
                })
                print("Cam res:", json.dumps(cam_res.get("result", {}).get("result", {}).get("value"), indent=2))

                await asyncio.sleep(1.0)

                # Capture front view screenshot
                shot = await send_cmd("Page.captureScreenshot", {"format": "png"})
                img_data = base64.b64decode(shot["result"]["data"])
                out_path = os.path.join(out_dir, "womanbody_clothing_front.png")
                with open(out_path, "wb") as f:
                    f.write(img_data)
                print(f"Front screenshot written to {out_path}")

                # Now capture 3/4 view
                await send_cmd("Runtime.evaluate", {
                    "expression": """
                    (() => {
                        const app = window.conbloxStudio;
                        const char = app.dataModel.Workspace.GetChildren().find(c => c.IsA && c.IsA('Model') && c.FindFirstChild('Torso'));
                        const torso = char ? char.FindFirstChild('Torso') : null;
                        if (torso && app.viewport) {
                            const p = torso.Position;
                            app.viewport.cameraPos.set(p.x + 3.2, p.y + 0.5, p.z - 3.2);
                            app.viewport.cameraYaw = Math.PI * 0.75;
                            app.viewport.cameraPitch = -0.1;
                            app.viewport.updateCameraTransform();
                        }
                    })()
                    """
                })
                await asyncio.sleep(1.0)

                shot2 = await send_cmd("Page.captureScreenshot", {"format": "png"})
                img_data2 = base64.b64decode(shot2["result"]["data"])
                out_path2 = os.path.join(out_dir, "womanbody_clothing_angle.png")
                with open(out_path2, "wb") as f:
                    f.write(img_data2)
                print(f"Angle screenshot written to {out_path2}")
    finally:
        proc.kill()
        import shutil
        shutil.rmtree(temp_profile, ignore_errors=True)

if __name__ == "__main__":
    asyncio.run(main())
