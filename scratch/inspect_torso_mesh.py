import asyncio, aiohttp, json, subprocess

test_script = """
(() => {
    // Check torso mesh
    const cute = window.__robotGroup;
    if (!cute) return "window.__robotGroup not found";
    let torsoMesh = null;
    for (const child of cute.children) {
        if (child.material && child.material.map === window.__torsoTex) {
            torsoMesh = child;
            break;
        }
    }
    if (!torsoMesh) return "Torso mesh not found";

    const pos = torsoMesh.geometry.attributes.position.array;
    const uvs = torsoMesh.geometry.attributes.uv.array;
    const norm = torsoMesh.geometry.attributes.normal?.array;

    const data = [];
    for (let i = 0; i < torsoMesh.geometry.attributes.position.count; i++) {
        data.push({
            p: [pos[i*3].toFixed(2), pos[i*3+1].toFixed(2), pos[i*3+2].toFixed(2)],
            n: [norm[i*3].toFixed(2), norm[i*3+1].toFixed(2), norm[i*3+2].toFixed(2)],
            uv: [uvs[i*2].toFixed(3), uvs[i*2+1].toFixed(3)]
        });
    }
    return {
        count: data.length,
        samples: data.slice(0, 15),
        robotRotation: cute.rotation.y,
        torsoRotation: torsoMesh.rotation.y
    };
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
                        print("EVAL RESULT:")
                        print(json.dumps(msg.get("result", {}), indent=2))
                        break
    finally:
        proc.terminate()

asyncio.run(main())
