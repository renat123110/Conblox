import asyncio, aiohttp, json, subprocess, base64

test_script = """
(() => {
    const cute = window.__robotGroup;
    let torsoMesh = null;
    for (const child of cute.children) {
        if (child.material && child.material.map === window.__torsoTex) {
            torsoMesh = child;
            break;
        }
    }
    const tex = torsoMesh.material.map;
    // tex is a CanvasTexture, image is an HTMLCanvasElement
    return tex.image.toDataURL();
})()
"""

async def main():
    proc = subprocess.Popen([
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--remote-debugging-port=9222",
        "http://127.0.0.1:28888/test_character_views.html"
    ])
    await asyncio.sleep(2)
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://127.0.0.1:9222/json") as resp:
                targets = await resp.json()
            target = next((t for t in targets if "test_character_views" in t.get("url", "")), None)
            async with session.ws_connect(target["webSocketDebuggerUrl"]) as ws:
                await ws.send_json({"id": 1, "method": "Runtime.enable"})
                await asyncio.sleep(3)
                await ws.send_json({
                    "id": 2,
                    "method": "Runtime.evaluate",
                    "params": {"expression": test_script, "returnByValue": True}
                })
                while True:
                    msg = await ws.receive_json()
                    if msg.get("id") == 2:
                        data_url = msg["result"]["result"]["value"]
                        b64 = data_url.split(",", 1)[1]
                        with open("scratch/chrome_torsoTex.png", "wb") as f:
                            f.write(base64.b64decode(b64))
                        print("Saved scratch/chrome_torsoTex.png")
                        break
    finally:
        proc.terminate()

asyncio.run(main())
