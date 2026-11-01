import asyncio
import aiohttp
import json
import base64
import subprocess
import time
import os

app_dir = r"C:\Users\Renat\Desktop\Conblox"
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

async def main():
    # Launch Chrome with remote debugging
    proc = subprocess.Popen([
        chrome_path,
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--remote-debugging-port=9222",
        "http://127.0.0.1:28888/"
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

            if not target:
                print("Conblox target not found among:", targets)
                return

            ws_url = target["webSocketDebuggerUrl"]
            print("Connecting to ws:", ws_url)

            async with session.ws_connect(ws_url) as ws:
                errors = []
                logs = []
                responses = {}

                async def reader():
                    async for msg in ws:
                        if msg.type == aiohttp.WSMsgType.TEXT:
                            data = json.loads(msg.data)
                            if "id" in data:
                                responses[data["id"]] = data
                            method = data.get("method")
                            if method == "Runtime.exceptionThrown":
                                details = data["params"]["exceptionDetails"]
                                text = details.get("text", "")
                                exc = details.get("exception", {}).get("description", "")
                                errors.append(f"EXCEPTION: {text} - {exc}")
                                print("--> [EXCEPTION]", text, exc)
                            elif method == "Console.messageAdded":
                                m = data["params"]["message"]
                                text = m.get("text", "")
                                level = m.get("level", "")
                                logs.append(f"[{level}] {text}")
                                if level == "error":
                                    print("--> [CONSOLE ERROR]", text)
                            elif method == "Runtime.consoleAPICalled":
                                args = data["params"].get("args", [])
                                txt = " ".join([str(a.get("value", a.get("description", ""))) for a in args])
                                logs.append(f"[{data['params']['type']}] {txt}")
                                if data["params"]["type"] == "error":
                                    print("--> [API ERROR]", txt)

                reader_task = asyncio.create_task(reader())

                # Enable domains
                await ws.send_json({"id": 1, "method": "Console.enable"})
                await ws.send_json({"id": 2, "method": "Runtime.enable"})
                await ws.send_json({"id": 3, "method": "Log.enable"})

                await asyncio.sleep(4)

                # Capture screenshot
                await ws.send_json({"id": 100, "method": "Page.captureScreenshot"})
                for _ in range(50):
                    if 100 in responses:
                        break
                    await asyncio.sleep(0.1)

                if 100 in responses and "result" in responses[100]:
                    img_b64 = responses[100]["result"]["data"]
                    out_path = os.path.join(app_dir, "scratch", "live_studio_shot.png")
                    with open(out_path, "wb") as f:
                        f.write(base64.b64decode(img_b64))
                    print(f"Screenshot saved to {out_path}")

                reader_task.cancel()

                print("\n=== SUMMARY OF LOGS ===")
                for l in logs:
                    print(l)
                print("\n=== ERRORS ===")
                for e in errors:
                    print(e)
                if not errors:
                    print("SUCCESS: NO UNCAUGHT ERRORS AT ALL!")

    finally:
        proc.terminate()

if __name__ == "__main__":
    asyncio.run(main())
