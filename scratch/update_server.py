import os
import re

server_path = r'C:\Users\Renat\Desktop\Conblox\server.py'
with open(server_path, 'r', encoding='utf-8') as f:
    content = f.read()

get_target = '        if parsed.path == "/api/roblox-asset":'

get_code = '''        if parsed.path == "/api/roblox-animation":
            raw_id = urllib.parse.parse_qs(parsed.query).get("id", [""])[0].strip()
            match = re.search(r"\\d{1,20}", raw_id)
            if not match:
                self.send_json_response({"error": "Invalid Roblox animation ID"}, status=400)
                return
            asset_id = match.group(0)
            anim_dir = os.path.join(APP_DIR, "content", "animations")
            os.makedirs(anim_dir, exist_ok=True)
            anim_path = os.path.join(anim_dir, f"{asset_id}.rbxm")
            anim_json_path = os.path.join(anim_dir, f"{asset_id}.json")

            if os.path.isfile(anim_path):
                with open(anim_path, "rb") as f:
                    data = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/octet-stream")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return

            if os.path.isfile(anim_json_path):
                with open(anim_json_path, "rb") as f:
                    data = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return

            try:
                delivery_url = f"https://assetdelivery.roblox.com/v2/assetId/{asset_id}"
                session = load_roblox_session()
                active_cookie = session.get("cookie") if session else None
                if not active_cookie:
                    active_cookie = extract_local_roblox_cookie()

                headers = {"User-Agent": "Roblox/WinInet"}
                if active_cookie:
                    headers["Cookie"] = f".ROBLOSECURITY={active_cookie}"

                req = urllib.request.Request(delivery_url, headers=headers)
                with urllib.request.urlopen(req, timeout=15) as resp:
                    delivery_data = json.loads(resp.read().decode("utf-8"))

                locations = delivery_data.get("locations") or []
                if not locations or not locations[0].get("location"):
                    self.send_json_response({"error": f"No download location for animation {asset_id}"}, status=404)
                    return

                download_url = locations[0]["location"]
                payload = None
                try:
                    dl_cmd = ["curl.exe", "-4", "-s", "-m", "20", "-L", "-H", "User-Agent: Roblox/WinInet"]
                    if active_cookie:
                        dl_cmd.extend(["-H", f"Cookie: .ROBLOSECURITY={active_cookie}"])
                    dl_cmd.append(download_url)
                    proc = subprocess.run(dl_cmd, capture_output=True, timeout=25)
                    if proc.returncode == 0 and len(proc.stdout) > 0:
                        payload = proc.stdout
                except Exception:
                    pass

                if not payload:
                    req_dl = urllib.request.Request(download_url, headers=headers)
                    with urllib.request.urlopen(req_dl, timeout=20) as resp_dl:
                        payload = resp_dl.read()

                if payload.startswith(b"\\x1f\\x8b"):
                    payload = gzip.decompress(payload)

                with open(anim_path, "wb") as f:
                    f.write(payload)

                self.send_response(200)
                self.send_header("Content-Type", "application/octet-stream")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return
            except Exception as err:
                self.send_json_response({"error": f"Failed to download animation {asset_id}: {err}"}, status=502)
                return

        if parsed.path == "/api/roblox-asset":'''

post_target = '        if parsed.path == "/api/test-save-screenshot":'

post_code = '''        if parsed.path == "/api/publish-animation":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            try:
                data = json.loads(body)
            except Exception:
                data = {}

            name = data.get("name") or "New Animation"
            description = data.get("description") or ""
            rbxm_b64 = data.get("rbxmBase64") or ""
            serialized_data = data.get("serialized")

            anim_dir = os.path.join(APP_DIR, "content", "animations")
            os.makedirs(anim_dir, exist_ok=True)

            manifest_path = os.path.join(anim_dir, "manifest.json")
            manifest = {}
            if os.path.isfile(manifest_path):
                try:
                    with open(manifest_path, "r", encoding="utf-8") as mf:
                        manifest = json.load(mf)
                except Exception:
                    manifest = {}

            import time
            anim_id = int(time.time() * 1000) % 9000000000 + 1000000000

            anim_path = os.path.join(anim_dir, f"{anim_id}.rbxm")
            anim_json_path = os.path.join(anim_dir, f"{anim_id}.json")

            if rbxm_b64:
                import base64
                with open(anim_path, "wb") as f:
                    f.write(base64.b64decode(rbxm_b64))

            if serialized_data:
                with open(anim_json_path, "w", encoding="utf-8") as jf:
                    json.dump(serialized_data, jf, indent=2)

            manifest[str(anim_id)] = {
                "id": anim_id,
                "name": name,
                "description": description,
                "created": time.time()
            }
            with open(manifest_path, "w", encoding="utf-8") as mf:
                json.dump(manifest, mf, indent=2)

            self.send_json_response({
                "success": True,
                "id": anim_id,
                "name": name,
                "description": description,
                "url": f"/content/animations/{anim_id}.rbxm"
            })
            return

        if parsed.path == "/api/test-save-screenshot":'''

c = content.replace('\r\n', '\n')
t1 = get_target.replace('\r\n', '\n')
r1 = get_code.replace('\r\n', '\n')
t2 = post_target.replace('\r\n', '\n')
r2 = post_code.replace('\r\n', '\n')

assert t1 in c, 'get_target not found!'
c = c.replace(t1, r1, 1)

assert t2 in c, 'post_target not found!'
c = c.replace(t2, r2, 1)

if '\r\n' in content:
    c = c.replace('\n', '\r\n')

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated server.py successfully')
