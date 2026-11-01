import asyncio
import aiohttp
import json
import tempfile
import subprocess
import base64

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

                await cmd("Runtime.enable")
                await cmd("Console.enable")

                # Background message collector
                logs = []
                async def listen():
                    while True:
                        try:
                            msg = await ws.receive_json()
                            if msg.get("method") == "Console.messageAdded":
                                m = msg["params"]["message"]
                                logs.append(f"[{m.get('level')}] {m.get('text')}")
                            elif msg.get("method") == "Runtime.consoleAPICalled":
                                p = msg["params"]
                                args = [str(a.get("value", a.get("description", ""))) for a in p.get("args", [])]
                                logs.append(f"[{p.get('type')}] {' '.join(args)}")
                            elif msg.get("method") == "Runtime.exceptionThrown":
                                ex = msg["params"]["exceptionDetails"]
                                logs.append(f"[EXCEPTION] {ex.get('text')} {ex.get('exception', {}).get('description', '')}")
                        except:
                            break

                listen_task = asyncio.create_task(listen())

                async def eval_js(expr):
                    c = await cmd("Runtime.evaluate", {
                        "expression": expr,
                        "returnByValue": True,
                        "awaitPromise": True
                    })
                    # wait until reply with id == c
                    # We need to receive messages but also process them in listen
                    # Since websocket receives in one place, let's just do simple receive
                    return c

                # Let's wait 1 sec
                await asyncio.sleep(1.0)

                # Start test mode
                c = cid
                cid += 1
                await ws.send_json({
                    "id": c,
                    "method": "Runtime.evaluate",
                    "params": {
                        "expression": "window.conbloxStudio.startSimulation('Test')",
                        "awaitPromise": True
                    }
                })
                await asyncio.sleep(2.5)

                # Now let's inspect Animate state and fire Running
                c = cid
                cid += 1
                await ws.send_json({
                    "id": c,
                    "method": "Runtime.evaluate",
                    "params": {
                        "expression": """
                            (() => {
                                const ctrl = window.conbloxStudio.characterController;
                                const hum = ctrl.humanoid;
                                const char = ctrl.character;
                                const animScript = char.FindFirstChild('Animate');
                                return {
                                    tracks: Array.from(hum._activeAnimationTracks || []).map(t => ({
                                        name: t.name,
                                        isPlaying: t.isPlaying,
                                        timePos: t.timePosition
                                    })),
                                    animChildren: animScript ? animScript.GetChildren().map(c => ({
                                        name: c.Name,
                                        className: c.ClassName,
                                        children: c.GetChildren().map(k => ({ name: k.Name, className: k.ClassName, id: k.AnimationId }))
                                    })) : []
                                };
                            })()
                        """,
                        "returnByValue": True
                    }
                })

                await asyncio.sleep(1.0)

                # Let's fire running
                c = cid
                cid += 1
                await ws.send_json({
                    "id": c,
                    "method": "Runtime.evaluate",
                    "params": {
                        "expression": """
                            (() => {
                                const ctrl = window.conbloxStudio.characterController;
                                ctrl.humanoid.Running.Fire(16);
                            })()
                        """,
                        "returnByValue": True
                    }
                })

                await asyncio.sleep(1.5)

                print("=== LOGS CAPTURED ===")
                for l in logs:
                    print(l)
                print("=====================")

                listen_task.cancel()
    finally:
        proc.terminate()

if __name__ == "__main__":
    asyncio.run(test())
