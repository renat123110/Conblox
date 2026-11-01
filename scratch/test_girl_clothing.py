import asyncio
import aiohttp
import json
import base64
import subprocess
import os

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
out_dir = r"C:\Users\Renat\.gemini\antigravity\brain\49e69d24-e071-4685-b5da-2bf81f94a438"

async def main():
    proc = subprocess.Popen([
        chrome_path,
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--window-size=1280,720",
        "--remote-debugging-port=9222",
        "http://127.0.0.1:28888/?import_rbxm=R6Girl.rbxm"
    ])
    await asyncio.sleep(2)

    try:
        async with aiohttp.ClientSession() as session:
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
            async with session.ws_connect(ws_url) as ws:
                msg_id = 1
                responses = {}

                async def send_cmd(method, params=None):
                    nonlocal msg_id
                    cid = msg_id
                    msg_id += 1
                    payload = {"id": cid, "method": method}
                    if params: payload["params"] = params
                    await ws.send_json(payload)
                    while cid not in responses:
                        msg = await ws.receive_json()
                        if "id" in msg:
                            responses[msg["id"]] = msg
                    return responses.pop(cid)

                for _ in range(40):
                    res = await send_cmd("Runtime.evaluate", {
                        "expression": "Boolean(window.__IMPORT_RBXM_DONE && window.conbloxStudio)",
                        "returnByValue": True
                    })
                    if res.get("result", {}).get("result", {}).get("value"):
                        print("Import done!")
                        break
                    await asyncio.sleep(0.5)

                await asyncio.sleep(3)

                # Check clothing status
                diag_res = await send_cmd("Runtime.evaluate", {
                    "expression": """
                    (() => {
                        const app = window.conbloxStudio;
                        const shop = app.dataModel.Workspace.FindFirstChild('Shop');
                        const torso = shop?.FindFirstChild('Torso');
                        const torsoMesh = app.viewport.partMeshes.get(torso);
                        const shirt = shop?.FindFirstChildOfClass('Shirt');
                        const pants = shop?.FindFirstChildOfClass('Pants');
                        const charMeshes = (shop?.GetChildren() || []).filter(c => c.ClassName === 'CharacterMesh').map(cm => ({
                            bodyPart: cm.BodyPart,
                            meshId: cm.MeshId,
                            hasMeshData: Boolean(cm.MeshData)
                        }));
                        const parts = ['Torso', 'Left Arm', 'Right Arm', 'Left Leg', 'Right Leg'].map(name => {
                            const p = shop?.FindFirstChild(name);
                            const m = app.viewport.partMeshes.get(p);
                            return {
                                name,
                                hasClothing: app.viewport.partHasClothing(p),
                                hasMaterialMap: Boolean(m?.material?.map),
                                hasClothingTex: Boolean(app.viewport.getClothingTextureForPart(p))
                            };
                        });
                        return {
                            shirt: shirt?.ShirtTemplate,
                            pants: pants?.PantsTemplate,
                            parts,
                            charMeshes,
                            cacheKeys: app.viewport.clothingTextureCache ? [...app.viewport.clothingTextureCache.keys()] : []
                        };
                    })()
                    """,
                    "returnByValue": True
                })
                print("Clothing status:", json.dumps(diag_res.get("result", {}).get("result", {}).get("value"), indent=2))

                # Take full body front screenshot
                await send_cmd("Runtime.evaluate", {
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
                        const torso = shop.FindFirstChild('Torso');
                        const p = torso.Position;
                        app.viewport.cameraPos.set(p.x, p.y + 0.5, p.z + 5.5);
                        app.viewport.cameraYaw = 0.0;
                        app.viewport.cameraPitch = 0.0;
                        app.viewport.updateCameraTransform();
                    })()
                    """
                })

                await asyncio.sleep(1)

                shot = await send_cmd("Page.captureScreenshot", {"format": "png"})
                img_data = base64.b64decode(shot["result"]["data"])
                out_path = os.path.join(out_dir, "r6girl_body.png")
                with open(out_path, "wb") as f:
                    f.write(img_data)
                print(f"Screenshot written to {out_path}")
    finally:
        proc.kill()

if __name__ == "__main__":
    asyncio.run(main())
