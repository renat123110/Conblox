import asyncio
import aiohttp
import json
import base64
import subprocess
import time
import os

app_dir = r"C:\Users\Renat\Desktop\Conblox"
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

test_script = """
(() => {
    const studio = window.conbloxStudio;
    if (!studio) return { success: false, error: "conbloxStudio not found" };
    const exp = studio.explorerUI;
    const ws = studio.dataModel.Workspace;

    const results = [];

    // Test creating Part
    try {
        const p = exp.createPartIn(ws, 'Block');
        results.push({ test: 'createPartIn', ok: true });
        
        // Test SpecialMesh
        const sm = exp.createSpecialMeshIn(p);
        results.push({ test: 'createSpecialMeshIn', ok: !!sm, class: sm?.ClassName });
        
        // Test Model / Character
        const model = exp.createModelIn(ws);
        results.push({ test: 'createModelIn', ok: !!model });

        // Test CharacterMesh
        const cm = exp.createCharacterMeshIn(model);
        results.push({ test: 'createCharacterMeshIn', ok: !!cm, class: cm?.ClassName });

        // Test Shirt
        const sh = exp.createShirtIn(model);
        results.push({ test: 'createShirtIn', ok: !!sh, class: sh?.ClassName });

        // Test Pants
        const pa = exp.createPantsIn(model);
        results.push({ test: 'createPantsIn', ok: !!pa, class: pa?.ClassName });

    } catch (e) {
        return { success: false, error: e.stack || e.message, results };
    }

    return { success: true, results };
})()
"""

async def main():
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

            target = next((t for t in targets if "127.0.0.1:28888" in t.get("url", "")), None)
            ws_url = target["webSocketDebuggerUrl"]

            async with session.ws_connect(ws_url) as ws:
                errors = []
                responses = {}

                async def reader():
                    async for msg in ws:
                        if msg.type == aiohttp.WSMsgType.TEXT:
                            data = json.loads(msg.data)
                            if "id" in data:
                                responses[data["id"]] = data
                            if data.get("method") == "Runtime.exceptionThrown":
                                errors.append(data)

                reader_task = asyncio.create_task(reader())

                await ws.send_json({"id": 1, "method": "Runtime.enable"})
                await asyncio.sleep(2)

                # Evaluate test script
                eval_cmd = {
                    "id": 200,
                    "method": "Runtime.evaluate",
                    "params": {
                        "expression": test_script,
                        "returnByValue": True
                    }
                }
                await ws.send_json(eval_cmd)

                for _ in range(50):
                    if 200 in responses:
                        break
                    await asyncio.sleep(0.1)

                print("EVAL RESULT:")
                print(json.dumps(responses.get(200, {}).get("result", {}), indent=2))

                reader_task.cancel()
    finally:
        proc.terminate()

if __name__ == "__main__":
    asyncio.run(main())
