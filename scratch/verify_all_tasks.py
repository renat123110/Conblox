import asyncio
import aiohttp
import json
import base64
import subprocess
import os
import tempfile

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
out_dir = r"C:\Users\Renat\.gemini\antigravity\brain\49e69d24-e071-4685-b5da-2bf81f94a438"

async def main():
    temp_profile = tempfile.mkdtemp()
    proc = subprocess.Popen([
        chrome_path,
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        f"--user-data-dir={temp_profile}",
        "--window-size=1280,720",
        "--remote-debugging-port=9339",
        "http://127.0.0.1:28888/"
    ])
    await asyncio.sleep(2.5)

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://127.0.0.1:9339/json") as resp:
                targets = await resp.json()

            target = None
            for t in targets:
                if "Conblox" in t.get("title", "") or "127.0.0.1:28888" in t.get("url", ""):
                    target = t
                    break
            if not target and targets:
                target = targets[0]

            ws_url = target["webSocketDebuggerUrl"]
            print("Connected to:", ws_url)

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

                async def eval_js(expr):
                    res = await send_cmd("Runtime.evaluate", {
                        "expression": expr,
                        "returnByValue": True,
                        "awaitPromise": True
                    })
                    val = res.get("result", {}).get("result", {}).get("value")
                    exc = res.get("result", {}).get("exceptionDetails")
                    if exc:
                        print("JS EXCEPTION:", exc)
                    return val

                async def screenshot(filename):
                    res = await send_cmd("Page.captureScreenshot", {"format": "png"})
                    data = base64.b64decode(res["result"]["data"])
                    filepath = os.path.join(out_dir, filename)
                    with open(filepath, "wb") as f:
                        f.write(data)
                    print(f"Captured screenshot: {filename} ({len(data)} bytes)")
                    return filepath

                # Wait for studio app to load
                for _ in range(40):
                    ready = await eval_js("Boolean(window.conbloxStudio && window.conbloxStudio.viewport && window.conbloxInstance)")
                    if ready:
                        print("Studio app ready!")
                        break
                    await asyncio.sleep(0.5)

                await asyncio.sleep(1.0)

                # ───────────────────────────────────────────────────────────
                # Task 4: Verify "Save to Server" Modal on KeyframeSequence
                # ───────────────────────────────────────────────────────────
                print("\n--- Verifying Task 4: Save to Server ---")
                kfs_setup = await eval_js("""
                    (() => {
                        const studio = window.conbloxStudio;
                        const kfsInst = window.conbloxInstance.new('KeyframeSequence');
                        kfsInst.Name = 'PlayerJumpAnim';
                        kfsInst.Parent = studio.dataModel.Workspace;

                        studio.explorerUI.select(kfsInst);
                        studio.explorerUI.showSaveAnimationModal(kfsInst);
                        return { name: kfsInst.Name, className: kfsInst.ClassName };
                    })()
                """)
                print("KFS setup:", kfs_setup)
                await asyncio.sleep(0.6)
                await screenshot("save_to_server_modal.png")

                # Fill description and click Save
                publish_result = await eval_js("""
                    (async () => {
                        const nameInput = document.getElementById('save-anim-name');
                        const descInput = document.getElementById('save-anim-desc');
                        const saveBtn = document.getElementById('save-anim-save-btn');
                        if (nameInput) nameInput.value = 'PlayerJumpAnim';
                        if (descInput) descInput.value = 'Authentic Roblox jump keyframe sequence';
                        if (saveBtn) saveBtn.click();

                        for (let i = 0; i < 20; i++) {
                            await new Promise(r => setTimeout(r, 200));
                            const statusBox = document.getElementById('save-anim-status');
                            if (statusBox && statusBox.style.display !== 'none' && statusBox.innerText.includes('Successfully')) {
                                return {
                                    visible: true,
                                    text: statusBox.innerText
                                };
                            }
                        }
                        const statusBox = document.getElementById('save-anim-status');
                        return {
                            visible: statusBox && statusBox.style.display !== 'none',
                            text: statusBox ? statusBox.innerText : 'timeout'
                        };
                    })()
                """)
                print("Publish result:", publish_result)
                await screenshot("animation_published_success.png")

                # Close modal
                await eval_js("""
                    (() => {
                        const backdrop = document.getElementById('save-animation-modal-backdrop');
                        if (backdrop) backdrop.remove();
                    })()
                """)
                await asyncio.sleep(0.5)

                # ───────────────────────────────────────────────────────────
                # Task 2 & 3: Play Mode, Standing on Feet, HipHeight, Animate
                # ───────────────────────────────────────────────────────────
                print("\n--- Verifying Task 2 & 3: Character standing on feet & Animations ---")
                # Start Play mode via studio.startSimulation('Test')
                await eval_js("window.conbloxStudio.startSimulation('Test')")
                # Wait for spawn and physics to settle
                await asyncio.sleep(3.0)

                status = await eval_js("""
                    (() => {
                        const ctrl = window.conbloxStudio.characterController;
                        const char = ctrl ? ctrl.character : null;
                        const hum = ctrl ? ctrl.humanoid : null;
                        const root = ctrl ? ctrl.rootPart : null;
                        const body = (ctrl && ctrl.physicsEngine && root) ? ctrl.physicsEngine.bodyMap.get(root) : null;
                        const animScript = char ? char.FindFirstChild('Animate') : null;
                        const tracks = hum ? Array.from(hum._activeAnimationTracks || []).map(t => ({
                            name: t.name,
                            isPlaying: t.isPlaying,
                            length: t.length,
                            timePos: t.timePosition
                        })) : [];

                        // Limbs Y coordinates relative to ground
                        const leftLeg = char ? char.FindFirstChild('Left Leg') : null;
                        const rightLeg = char ? char.FindFirstChild('Right Leg') : null;

                        return {
                            hasCharacter: Boolean(char),
                            charName: char ? char.Name : null,
                            hasAnimateScript: Boolean(animScript),
                            humanoidHipHeight: hum ? hum.HipHeight : null,
                            humanoidAutoScaling: hum ? hum.AutomaticScalingEnabled : null,
                            rootPosY: root ? root.Position.y : null,
                            bodyPosY: body ? body.position.y : null,
                            leftLegPosY: leftLeg ? leftLeg.Position.y : null,
                            rightLegPosY: rightLeg ? rightLeg.Position.y : null,
                            leftLegBottomY: leftLeg ? (leftLeg.Position.y - leftLeg.Size.y/2) : null,
                            rightLegBottomY: rightLeg ? (rightLeg.Position.y - rightLeg.Size.y/2) : null,
                            activeTracks: tracks,
                            effectiveHipHeight: ctrl ? ctrl.getEffectiveHipHeight() : null
                        };
                    })()
                """)
                print("Character status at spawn:\n", json.dumps(status, indent=2))

                # Position camera angled close to character feet for clear verification of standing on ground
                await eval_js("""
                    (() => {
                        const mp = document.querySelector('.multiplayer-panel');
                        if (mp) mp.remove();

                        const studio = window.conbloxStudio;
                        const ctrl = studio.characterController;
                        const hum = ctrl.humanoid;

                        const bottomDock = document.getElementById('bottom-dock');
                        if (bottomDock) bottomDock.style.display = 'none';

                        if (hum && studio.explorerUI) {
                            studio.explorerUI.select(hum);
                            const pb = document.getElementById('properties-body');
                            if (pb) pb.scrollTop = 180;
                        }

                        ctrl.cameraYaw = 0.35;
                        ctrl.cameraPitch = 0.05;
                        ctrl.targetCameraDistance = 5.5;
                        ctrl.cameraDistance = 5.5;
                        ctrl.cameraFocusOffsetY = 0.0; // look directly at feet and ground contact
                    })()
                """)
                await asyncio.sleep(0.5)
                await screenshot("character_standing_feet.png")

                # Verify adjust HipHeight
                print("\n--- Adjusting HipHeight ---")
                await eval_js("""
                    (() => {
                        const studio = window.conbloxStudio;
                        const ctrl = studio.characterController;
                        const hum = ctrl.humanoid;
                        if (hum) {
                            hum.AutomaticScalingEnabled = false;
                            hum.HipHeight = 4.0; // Raise character 2 studs higher (floating)
                            if (studio.explorerUI) {
                                studio.explorerUI.select(hum);
                                const pb = document.getElementById('properties-body');
                                if (pb) pb.scrollTop = 180;
                            }
                        }
                    })()
                """)
                await asyncio.sleep(1.2)

                hip_status = await eval_js("""
                    (() => {
                        const ctrl = window.conbloxStudio.characterController;
                        const root = ctrl.rootPart;
                        const body = ctrl.physicsEngine.bodyMap.get(root);
                        const hum = ctrl.humanoid;
                        const leftLeg = ctrl.character ? ctrl.character.FindFirstChild('Left Leg') : null;
                        return {
                            hipHeight: hum.HipHeight,
                            autoScaling: hum.AutomaticScalingEnabled,
                            rootPosY: root.Position.y,
                            bodyPosY: body ? body.position.y : null,
                            leftLegBottomY: leftLeg ? (leftLeg.Position.y - leftLeg.Size.y/2) : null,
                            effectiveHipHeight: ctrl.getEffectiveHipHeight()
                        };
                    })()
                """)
                print("Status after HipHeight adjustment:\n", json.dumps(hip_status, indent=2))
                await screenshot("hipheight_adjusted.png")

                # Restore HipHeight and test walking animation
                print("\n--- Testing Movement & Animation ---")
                await eval_js("""
                    (() => {
                        const studio = window.conbloxStudio;
                        const ctrl = studio.characterController;
                        const hum = ctrl.humanoid;
                        if (hum) {
                            hum.AutomaticScalingEnabled = true;
                            hum.HipHeight = 0;
                            if (studio.explorerUI) {
                                studio.explorerUI.select(hum);
                                const pb = document.getElementById('properties-body');
                                if (pb) pb.scrollTop = 180;
                            }
                        }
                        ctrl.cameraFocusOffsetY = 0.8;
                        ctrl.cameraPitch = 0.12;
                        ctrl.cameraYaw = 0.6;
                        ctrl.cameraDistance = 6.0;
                        ctrl.targetCameraDistance = 6.0;
                        // Press forward key to walk
                        ctrl.keys.forward = true;
                    })()
                """)
                await asyncio.sleep(1.2)

                walk_status = await eval_js("""
                    (() => {
                        const ctrl = window.conbloxStudio.characterController;
                        const hum = ctrl.humanoid;
                        const tracks = hum ? Array.from(hum._activeAnimationTracks || []).map(t => ({
                            name: t.name,
                            isPlaying: t.isPlaying,
                            length: t.length,
                            timePos: t.timePosition
                        })) : [];
                        const motors = ctrl.character ? ctrl.character.GetDescendants().filter(i => i.ClassName === 'Motor6D').map(m => ({
                            name: m.Name,
                            part1: m.Part1 ? m.Part1.Name : null,
                            transformPos: m.Transform ? m.Transform.position : null,
                            transformRot: m.Transform ? m.Transform.orientation : null
                        })) : [];
                        return {
                            tracks,
                            motors
                        };
                    })()
                """)
                print("Walk status:\n", json.dumps(walk_status, indent=2))
                await screenshot("character_walking_animation.png")

                # Release forward key
                await eval_js("""
                    (() => {
                        const ctrl = window.conbloxStudio.characterController;
                        ctrl.keys.forward = false;
                    })()
                """)
                await asyncio.sleep(0.5)

    finally:
        try:
            proc.terminate()
            proc.wait(timeout=3)
        except Exception:
            pass

if __name__ == "__main__":
    asyncio.run(main())
