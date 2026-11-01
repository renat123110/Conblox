import asyncio
import aiohttp
import subprocess
import base64
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
        "--window-size=1080,600",
        "--remote-debugging-port=9336",
        "http://127.0.0.1:28888/test_woman_clothing.html"
    ])
    await asyncio.sleep(2.5)

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://127.0.0.1:9336/json") as resp:
                targets = await resp.json()

            targets = [t for t in targets if t.get("type") == "page"]
            if not targets:
                print("No page target found!")
                return
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
                    if params:
                        payload["params"] = params
                    await ws.send_json(payload)
                    while cid not in responses:
                        msg = await ws.receive_json()
                        if "id" in msg:
                            responses[msg["id"]] = msg
                    return responses.pop(cid)

                for _ in range(30):
                    res = await send_cmd("Runtime.evaluate", {
                        "expression": "Boolean(window.__RENDER_DONE)",
                        "returnByValue": True
                    })
                    if res.get("result", {}).get("result", {}).get("value"):
                        break
                    await asyncio.sleep(0.3)

                shot = await send_cmd("Page.captureScreenshot", {"format": "png"})
                img_data = base64.b64decode(shot["result"]["data"])
                out_path = os.path.join(out_dir, "compare_woman_uvs.png")
                with open(out_path, "wb") as f:
                    f.write(img_data)
                print(f"Screenshot written to {out_path}")
    finally:
        proc.kill()
        import shutil
        shutil.rmtree(temp_profile, ignore_errors=True)

if __name__ == "__main__":
    asyncio.run(main())
