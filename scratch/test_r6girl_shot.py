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
                        "expression": "Boolean(window.__IMPORT_RBXM_DONE && window.conbloxStudio)",
                        "returnByValue": True
                    })
                    done = res.get("result", {}).get("result", {}).get("value")
                    if done:
                        print("Import done!")
                        break
                    await asyncio.sleep(0.5)

                await asyncio.sleep(3)

                # Focus camera on Head and hide accessories
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

                            // Test compositing head texture over head.Color
                            const headMesh = app.viewport.partMeshes.get(head);
                            if (headMesh && headMesh.material && headMesh.material.map && headMesh.material.map.image) {
                                const img = headMesh.material.map.image;
                                const canvas = document.createElement('canvas');
                                canvas.width = img.naturalWidth || img.width || 1024;
                                canvas.height = img.naturalHeight || img.height || 1024;
                                const ctx = canvas.getContext('2d');
                                const c = head.Color || { r: 1, g: 1, b: 1 };
                                const rgb = c.toRGB ? c.toRGB() : { r: Math.round((c.r ?? 1) * 255), g: Math.round((c.g ?? 1) * 255), b: Math.round((c.b ?? 1) * 255) };
                                ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                                ctx.drawImage(img, 0, 0);

                                const newTex = new THREE.CanvasTexture(canvas);
                                if (typeof THREE.SRGBColorSpace !== 'undefined') newTex.colorSpace = THREE.SRGBColorSpace;
                                newTex.needsUpdate = true;
                                headMesh.material.map = newTex;
                                headMesh.material.needsUpdate = true;
                            }
                            return { headPos: { x: p.x, y: p.y, z: p.z } };
                        }
                        return { error: 'head not found' };
                    })()
                    """,
                    "returnByValue": True
                })
                print("Eval result:", json.dumps(eval_res.get("result", {}).get("result", {}).get("value"), indent=2))

                await asyncio.sleep(1)

                shot = await send_cmd("Page.captureScreenshot", {"format": "png"})
                img_data = base64.b64decode(shot["result"]["data"])
                out_path = os.path.join(out_dir, "r6girl_head_no_acc.png")
                with open(out_path, "wb") as f:
                    f.write(img_data)
                print(f"Screenshot written to {out_path}")
    finally:
        proc.kill()

if __name__ == "__main__":
    asyncio.run(main())
