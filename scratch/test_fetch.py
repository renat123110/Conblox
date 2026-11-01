import asyncio
import aiohttp
import json
import tempfile
import subprocess

async def test():
    temp_profile = tempfile.mkdtemp()
    proc = subprocess.Popen([
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        f"--user-data-dir={temp_profile}",
        "--remote-debugging-port=9342",
        "http://127.0.0.1:28888/"
    ])
    await asyncio.sleep(2)
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get("http://127.0.0.1:9342/json") as r:
                targets = await r.json()
            target = None
            for t in targets:
                if "Conblox" in t.get("title", "") or "127.0.0.1:28888" in t.get("url", ""):
                    target = t
                    break
            if not target:
                target = targets[0]
            ws_url = target["webSocketDebuggerUrl"]
            async with s.ws_connect(ws_url) as ws:
                cid = 1
                async def cmd(m, p=None):
                    nonlocal cid
                    c = cid
                    cid += 1
                    msg = {"id": c, "method": m}
                    if p:
                        msg["params"] = p
                    await ws.send_json(msg)
                    return c

                await cmd("Network.enable")
                await cmd("Runtime.enable")

                fetch_cmd_id = await cmd("Runtime.evaluate", {
                    "expression": """
                        (async () => {
                            try {
                                const dummy = window.conbloxInstance.new('Humanoid');
                                const track = dummy.LoadAnimation('http://www.roblox.com/asset/?id=180426354');
                                await new Promise(r => setTimeout(r, 800));
                                return {
                                    trackLength: track.length,
                                    samplesCount: track._samples.length,
                                    looped: track.looped,
                                    sample0PoseCount: track._samples[0]?.poses?.size
                                };
                            } catch (e) {
                                return { ok: false, error: e.toString(), stack: e.stack };
                            }
                        })()
                    """,
                    "returnByValue": True,
                    "awaitPromise": True
                })

                for _ in range(50):
                    m = await ws.receive_json()
                    method = m.get("method", "")
                    if "Network" in method:
                        p = m.get("params", {})
                        print(method, p.get("errorText"), p.get("response", {}).get("status"), p.get("request", {}).get("url"))
                    if m.get("id") == fetch_cmd_id:
                        print("Eval finished:", m)
                        break
    finally:
        proc.terminate()

if __name__ == "__main__":
    asyncio.run(test())
