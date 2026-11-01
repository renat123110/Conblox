import asyncio
import aiohttp
import json
import subprocess

async def main():
    proc = subprocess.Popen([
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless=new", "--no-sandbox", "--disable-gpu",
        "--remote-debugging-port=9222",
        "http://127.0.0.1:28888/?import_rbxm=R6Girl.rbxm"
    ])
    await asyncio.sleep(2)
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get("http://127.0.0.1:9222/json") as r:
                targets = await r.json()
            ws_url = targets[0]["webSocketDebuggerUrl"]
            async with s.ws_connect(ws_url) as ws:
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
                        break
                    await asyncio.sleep(0.5)

                await asyncio.sleep(3)

                expr = """
                (() => {
                    const app = window.conbloxStudio;
                    const shop = app.dataModel.Workspace.FindFirstChild('Shop');
                    const head = shop.FindFirstChild('Head');
                    const hm = app.viewport.partMeshes.get(head);
                    return {
                        isMesh: hm.isMesh,
                        name: hm.name,
                        childrenCount: hm.children.length,
                        children: hm.children.map(c => ({
                            name: c.name,
                            isMesh: c.isMesh,
                            visible: c.visible,
                            userData: c.userData,
                            matColor: c.material?.color,
                            matMap: Boolean(c.material?.map),
                            mapSrc: c.material?.map?.image?.src?.slice(0, 60)
                        })),
                        geomAttrs: Object.keys(hm.geometry.attributes),
                        hasColorAttr: Boolean(hm.geometry.attributes.color),
                        mat: {
                            type: hm.material.type,
                            color: hm.material.color,
                            vertexColors: hm.material.vertexColors,
                            map: Boolean(hm.material.map),
                            mapSrc: hm.material.map?.image?.src?.slice(0, 60),
                            transparent: hm.material.transparent,
                            opacity: hm.material.opacity,
                            alphaTest: hm.material.alphaTest
                        }
                    };
                })()
                """
                res = await send_cmd("Runtime.evaluate", {"expression": expr, "returnByValue": True})
                print(json.dumps(res, indent=2))
    finally:
        proc.kill()

if __name__ == "__main__":
    asyncio.run(main())
