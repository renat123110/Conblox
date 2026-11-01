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
        "--remote-debugging-port=9335",
        "http://127.0.0.1:28888/?import_rbxm=R6Girl.rbxm"
    ])
    await asyncio.sleep(2.5)

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://127.0.0.1:9335/json") as resp:
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

                await asyncio.sleep(2.0)

                # Move R6Girl (Shop) model into StarterPlayer!
                move_res = await send_cmd("Runtime.evaluate", {
                    "expression": """
                    (() => {
                        const app = window.conbloxStudio;
                        const shop = app.dataModel.Workspace.FindFirstChild('Shop');
                        if (!shop) return { error: 'Shop not found' };

                        // Parent to StarterPlayer
                        shop.Parent = app.dataModel.StarterPlayer;
                        return {
                            success: true,
                            parent: shop.Parent.Name,
                            childrenInStarterPlayer: app.dataModel.StarterPlayer.GetChildren().map(c => c.Name)
                        };
                    })()
                    """,
                    "returnByValue": True
                })
                print("Move result:", json.dumps(move_res.get("result", {}).get("result", {}).get("value"), indent=2))

                # Now start simulation (Test)
                sim_res = await send_cmd("Runtime.evaluate", {
                    "expression": """
                    (async () => {
                        const app = window.conbloxStudio;
                        await app.startSimulation('Test');
                        return {
                            state: app.simulationState,
                            spawnedName: app.characterController.character?.Name,
                            charChildren: app.characterController.character?.GetChildren().map(c => c.Name)
                        };
                    })()
                    """,
                    "awaitPromise": True,
                    "returnByValue": True
                })
                print("Sim result:", json.dumps(sim_res.get("result", {}).get("result", {}).get("value"), indent=2))

                await asyncio.sleep(2.0)

                # Hide docks for clean screenshot
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
                await asyncio.sleep(1.0)

                shot = await send_cmd("Page.captureScreenshot", {"format": "png"})
                img_data = base64.b64decode(shot["result"]["data"])
                out_path = os.path.join(out_dir, "starterplayer_custom_play.png")
                with open(out_path, "wb") as f:
                    f.write(img_data)
                print(f"Screenshot written to {out_path}")
    finally:
        proc.kill()
        import shutil
        shutil.rmtree(temp_profile, ignore_errors=True)

if __name__ == "__main__":
    asyncio.run(main())
