import asyncio
import aiohttp
import json
import base64
import subprocess
import os

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
out_dir = r"C:\Users\Renat\.gemini\antigravity\brain\49e69d24-e071-4685-b5da-2bf81f94a438"

async def main():
    # Use a unique remote-debugging-port and separate temp user data dir to avoid any clash
    import tempfile
    temp_profile = tempfile.mkdtemp()
    proc = subprocess.Popen([
        chrome_path,
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        f"--user-data-dir={temp_profile}",
        "--window-size=1280,720",
        "--remote-debugging-port=9333",
        "http://127.0.0.1:28888/"
    ])
    await asyncio.sleep(2.5)

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://127.0.0.1:9333/json") as resp:
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

                # Wait for StudioApp
                for _ in range(40):
                    res = await send_cmd("Runtime.evaluate", {
                        "expression": "Boolean(window.conbloxStudio && window.conbloxStudio.viewport)",
                        "returnByValue": True
                    })
                    if res.get("result", {}).get("result", {}).get("value"):
                        print("Conblox Studio ready!")
                        break
                    await asyncio.sleep(0.5)

                # Check Item 4: Bottom toolbar dot when no tools exist
                # Let's inspect the DOM element for .backpack-bar
                bp_info = await send_cmd("Runtime.evaluate", {
                    "expression": """
                    (() => {
                        const bar = document.querySelector('.backpack-bar');
                        if (!bar) return { found: false };
                        const style = window.getComputedStyle(bar);
                        const rect = bar.getBoundingClientRect();
                        return {
                            found: true,
                            hidden: bar.hidden,
                            display: style.display,
                            width: rect.width,
                            height: rect.height,
                            left: rect.left,
                            bottom: rect.bottom,
                            childCount: bar.children.length
                        };
                    })()
                    """,
                    "returnByValue": True
                })
                print("Backpack bar info:", json.dumps(bp_info.get("result", {}).get("result", {}).get("value"), indent=2))

                # Let's test simulation mode without tools to see what the backpack looks like
                await send_cmd("Runtime.evaluate", {
                    "expression": """
                    (async () => {
                        const app = window.conbloxStudio;
                        await app.startSimulation('Test');
                    })()
                    """,
                    "awaitPromise": True
                })
                await asyncio.sleep(2.0)

                bp_play_info = await send_cmd("Runtime.evaluate", {
                    "expression": """
                    (() => {
                        const bar = document.querySelector('.backpack-bar');
                        if (!bar) return { found: false };
                        const style = window.getComputedStyle(bar);
                        const rect = bar.getBoundingClientRect();
                        return {
                            found: true,
                            hidden: bar.hidden,
                            display: style.display,
                            width: rect.width,
                            height: rect.height,
                            left: rect.left,
                            bottom: rect.bottom,
                            childCount: bar.children.length
                        };
                    })()
                    """,
                    "returnByValue": True
                })
                print("Backpack bar during Play mode:", json.dumps(bp_play_info.get("result", {}).get("result", {}).get("value"), indent=2))

                # Take screenshot of Play mode
                shot = await send_cmd("Page.captureScreenshot", {"format": "png"})
                img_data = base64.b64decode(shot["result"]["data"])
                with open(os.path.join(out_dir, "test_play_initial.png"), "wb") as f:
                    f.write(img_data)
                print("Saved test_play_initial.png")

                # Stop simulation
                await send_cmd("Runtime.evaluate", {
                    "expression": "window.conbloxStudio.stopSimulation()"
                })
                await asyncio.sleep(0.5)

    finally:
        proc.kill()
        import shutil
        shutil.rmtree(temp_profile, ignore_errors=True)

if __name__ == "__main__":
    asyncio.run(main())
