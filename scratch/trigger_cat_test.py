import asyncio
import aiohttp
import json
import subprocess
import os

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

async def main():
    print("Launching Chrome...")
    proc = subprocess.Popen([
        chrome_path,
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--remote-debugging-port=9222",
        "http://127.0.0.1:28888/test_r6_cat_render.html"
    ])

    await asyncio.sleep(2)

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://127.0.0.1:9222/json") as resp:
                targets = await resp.json()

            target = None
            for t in targets:
                if "test_r6_cat_render" in t.get("url", ""):
                    target = t
                    break

            if not target:
                print("Target not found:", targets)
                return

            print("Found target, listening to console...")
            async with session.ws_connect(target["webSocketDebuggerUrl"]) as ws:
                await ws.send_json({"id": 1, "method": "Runtime.enable"})
                await ws.send_json({"id": 2, "method": "Console.enable"})

                start_time = asyncio.get_event_loop().time()
                while asyncio.get_event_loop().time() - start_time < 12:
                    msg = await ws.receive_json()
                    method = msg.get("method")
                    if method == "Runtime.consoleAPICalled":
                        args = [str(a.get("value", a.get("description", ""))) for a in msg["params"].get("args", [])]
                        print("[BROWSER]", " ".join(args))
                        if "R6_CAT_ALL_SIDES_COMPLETE" in " ".join(args):
                            print("Verification complete signal received!")
                            break
                    elif method == "Runtime.exceptionThrown":
                        print("[EXCEPTION]", msg["params"]["exceptionDetails"])
    finally:
        proc.kill()

if __name__ == "__main__":
    asyncio.run(main())
