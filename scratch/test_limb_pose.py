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
        "--remote-debugging-port=9347",
        "http://127.0.0.1:28888/"
    ])
    await asyncio.sleep(2.5)
    try:
        async with aiohttp.ClientSession() as s:
            async with s.get("http://127.0.0.1:9347/json") as r:
                targets = await r.json()
            target = targets[0]
            for t in targets:
                if "Conblox" in t.get("title", "") or "127.0.0.1:28888" in t.get("url", ""):
                    target = t
                    break
            ws_url = target["webSocketDebuggerUrl"]
            async with s.ws_connect(ws_url) as ws:
                cid = 1
                async def cmd(m, p=None):
                    nonlocal cid
                    c = cid; cid += 1
                    msg = {"id": c, "method": m}
                    if p: msg["params"] = p
                    await ws.send_json(msg)
                    return c

                await cmd("Runtime.enable")

                async def eval_js(expr):
                    c = await cmd("Runtime.evaluate", {
                        "expression": expr,
                        "returnByValue": True,
                        "awaitPromise": True
                    })
                    while True:
                        msg = await ws.receive_json()
                        if msg.get("id") == c:
                            res = msg.get("result", {})
                            if res.get("exceptionDetails"):
                                print("JS Exception in eval:", res.get("exceptionDetails"))
                            return res.get("result", {}).get("value")

                for _ in range(40):
                    ready = await eval_js("Boolean(window.conbloxStudio && window.conbloxStudio.viewport)")
                    if ready:
                        break
                    await asyncio.sleep(0.2)

                print("Starting Test simulation...")
                await eval_js("window.conbloxStudio.startSimulation('Test')")
                await asyncio.sleep(2.0)

                # Inspect idle animation track samples
                samples_info = await eval_js("""
                    (() => {
                        const studio = window.conbloxStudio;
                        const ctrl = studio.characterController;
                        const hum = ctrl.humanoid;
                        const tracks = Array.from(hum._activeAnimationTracks || []);
                        const track = tracks[0];
                        if (!track) return { noTrack: true };
                        return {
                            trackName: track.name,
                            isPlaying: track.isPlaying,
                            length: track.length,
                            timePos: track.timePosition,
                            samplesCount: track._samples.length,
                            samples: track._samples.map(s => ({
                                time: s.time,
                                poses: Array.from(s.poses.entries()).map(([k, v]) => ({
                                    part: k,
                                    pos: v.position,
                                    ori: v.orientation
                                }))
                            }))
                        };
                    })()
                """)
                print("Idle track samples info:\n", json.dumps(samples_info, indent=2))

    finally:
        proc.terminate()

if __name__ == "__main__":
    asyncio.run(test())
