#!/usr/bin/env python3
"""
Conblox Studio Local Engine Server
Serves the Roblox Studio clone web app and handles place file saving/loading.
"""

import http.server
import socketserver
import socket
import gzip
import io
import os
import sys
import json
import urllib.error
import urllib.parse
import urllib.request
import subprocess
import shutil
import time
import re
import threading
import ctypes
from ctypes import wintypes
import atexit
import hashlib
import struct
import base64

# Safe stdout / stderr for GUI / pythonw execution without console
if sys.stdout is None:
    class _DummyWriter:
        def write(self, s): pass
        def flush(self): pass
    sys.stdout = _DummyWriter()
if sys.stderr is None:
    class _DummyWriter:
        def write(self, s): pass
        def flush(self): pass
    sys.stderr = _DummyWriter()

PORT = 28888
MAX_ROBLOX_IMAGE_BYTES = 16 * 1024 * 1024
BASE_DIR = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
APP_DIR = os.path.join(BASE_DIR, "app")
PLACES_DIR = os.path.join(BASE_DIR, "places")

sys.path.insert(0, BASE_DIR)
try:
    from mesh_converter import parse_roblox_mesh, mesh_to_obj_string
except ImportError:
    pass

os.makedirs(PLACES_DIR, exist_ok=True)

ROBLOX_SESSION_PATH = os.path.join(APP_DIR, "content", "roblox_session.json")

def load_roblox_session():
    if os.path.isfile(ROBLOX_SESSION_PATH):
        try:
            with open(ROBLOX_SESSION_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[Server] Error reading roblox_session.json: {e}")
    return None

def save_roblox_session(session_data):
    try:
        os.makedirs(os.path.dirname(ROBLOX_SESSION_PATH), exist_ok=True)
        with open(ROBLOX_SESSION_PATH, "w", encoding="utf-8") as f:
            json.dump(session_data, f, indent=2)
    except Exception as e:
        print(f"[Server] Error saving roblox_session.json: {e}")

def clear_roblox_session():
    if os.path.isfile(ROBLOX_SESSION_PATH):
        try:
            os.remove(ROBLOX_SESSION_PATH)
        except Exception:
            pass

class _DATA_BLOB(ctypes.Structure):
    _fields_ = [('cbData', wintypes.DWORD), ('pbData', ctypes.POINTER(ctypes.c_char))]

def _decrypt_dpapi(encrypted_bytes):
    try:
        blob_in = _DATA_BLOB(len(encrypted_bytes), ctypes.cast(ctypes.create_string_buffer(encrypted_bytes), ctypes.POINTER(ctypes.c_char)))
        blob_out = _DATA_BLOB()
        if ctypes.windll.crypt32.CryptUnprotectData(ctypes.byref(blob_in), None, None, None, None, 0, ctypes.byref(blob_out)):
            data = ctypes.string_at(blob_out.pbData, blob_out.cbData)
            ctypes.windll.kernel32.LocalFree(blob_out.pbData)
            return data
    except Exception as e:
        print(f"[Server] DPAPI decrypt error: {e}")
    return None

def extract_local_roblox_cookie():
    if sys.platform != "win32":
        return None
    try:
        cookie_file = os.path.expandvars(r'%LOCALAPPDATA%\Roblox\LocalStorage\RobloxCookies.dat')
        if os.path.isfile(cookie_file):
            with open(cookie_file, 'r', encoding='utf-8', errors='ignore') as f:
                doc = json.load(f)
            raw = base64.b64decode(doc.get('CookiesData', ''))
            dec = _decrypt_dpapi(raw)
            if dec:
                text = dec.decode('utf-8', errors='ignore')
                for part in text.split(';'):
                    if '.ROBLOSECURITY' in part:
                        val = part.strip().split('\t')[-1].strip()
                        if val.startswith('_|WARNING:-DO-NOT-SHARE-THIS.'):
                            return val
    except Exception as e:
        print(f"[Server] Auto-detect cookie error: {e}")
    return None

def validate_roblox_cookie(cookie_str):
    if not cookie_str:
        return False, None, "No cookie provided"
    clean_cookie = cookie_str.strip()
    if clean_cookie.startswith(".ROBLOSECURITY="):
        clean_cookie = clean_cookie[len(".ROBLOSECURITY="):].strip()

    try:
        proc = subprocess.run([
            "curl.exe", "-4", "-s", "-m", "10",
            "-H", f"Cookie: .ROBLOSECURITY={clean_cookie}",
            "-H", "User-Agent: Roblox/WinInet",
            "-H", "Accept: application/json",
            "https://users.roblox.com/v1/users/authenticated"
        ], capture_output=True, text=True, timeout=12)
        if proc.returncode != 0 or not proc.stdout:
            return False, None, "Failed to connect to Roblox authentication service"
        
        user_data = json.loads(proc.stdout)
        user_id = user_data.get("id")
        if not user_id:
            msg = user_data.get("errors", [{}])[0].get("message", "Invalid or expired Roblox cookie")
            return False, None, msg
        
        avatar_url = ""
        try:
            proc_thumb = subprocess.run([
                "curl.exe", "-4", "-s", "-m", "10",
                f"https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds={user_id}&size=150x150&format=Png&isCircular=true"
            ], capture_output=True, text=True, timeout=12)
            if proc_thumb.returncode == 0 and proc_thumb.stdout:
                thumb_json = json.loads(proc_thumb.stdout)
                avatar_url = thumb_json.get("data", [{}])[0].get("imageUrl", "")
        except Exception:
            pass

        return True, {
            "userId": user_id,
            "username": user_data.get("name", ""),
            "displayName": user_data.get("displayName", ""),
            "avatarUrl": avatar_url,
            "cookie": clean_cookie
        }, None
    except Exception as err:
        return False, None, str(err)

def get_active_roblox_cookie():
    session = load_roblox_session()
    if session and session.get("cookie"):
        return session["cookie"]
    local_cookie = extract_local_roblox_cookie()
    if local_cookie:
        valid, user_dict, _ = validate_roblox_cookie(local_cookie)
        if valid and user_dict:
            save_roblox_session(user_dict)
            return local_cookie
    return None

def fetch_roblox_image_bytes(asset_id, depth=0):
    if depth > 3 or not asset_id:
        return None, None, None
    textures_dir = os.path.join(APP_DIR, "content", "textures", "roblox")
    os.makedirs(textures_dir, exist_ok=True)

    for ext, mime in [(".png", "image/png"), (".jpg", "image/jpeg"), (".jpeg", "image/jpeg"), (".webp", "image/webp")]:
        fpath = os.path.join(textures_dir, f"{asset_id}{ext}")
        if os.path.isfile(fpath) and os.path.getsize(fpath) > 0:
            with open(fpath, "rb") as fp:
                return fp.read(), mime, f"{asset_id}{ext}"

    active_cookie = get_active_roblox_cookie()
    payload = None

    # 1. Try AssetDelivery v2 with authentication
    v2_url = f"https://assetdelivery.roblox.com/v2/assetId/{asset_id}"
    cmd = ["curl.exe", "-4", "-s", "-m", "15", "-L", "-H", "User-Agent: Roblox/WinInet", "-H", "Accept: application/json"]
    if active_cookie:
        cmd.extend(["-H", f"Cookie: .ROBLOSECURITY={active_cookie}"])
    cmd.append(v2_url)

    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=20)
        if res.returncode == 0 and res.stdout:
            v2_data = json.loads(res.stdout.decode("utf-8", errors="ignore"))
            locations = v2_data.get("locations") or []
            if locations and "location" in locations[0]:
                loc_url = locations[0]["location"]
                dl_cmd = ["curl.exe", "-4", "-s", "-m", "30", "-L", loc_url]
                dl_res = subprocess.run(dl_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=35)
                if dl_res.returncode == 0 and dl_res.stdout:
                    payload = dl_res.stdout
    except Exception as e:
        print(f"[Server] v2 asset delivery error for {asset_id}: {e}")

    # 2. Fallback to v1 if v2 did not get payload
    if not payload:
        v1_url = f"https://assetdelivery.roblox.com/v1/asset/?id={asset_id}"
        v1_cmd = ["curl.exe", "-4", "-s", "-m", "20", "-L", "-H", "User-Agent: Roblox/WinInet"]
        if active_cookie:
            v1_cmd.extend(["-H", f"Cookie: .ROBLOSECURITY={active_cookie}"])
        v1_cmd.append(v1_url)
        try:
            v1_res = subprocess.run(v1_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=25)
            if v1_res.returncode == 0 and v1_res.stdout:
                payload = v1_res.stdout
        except Exception as e:
            print(f"[Server] v1 asset delivery error for {asset_id}: {e}")

    if not payload:
        return None, None, None

    # Decompress if gzip
    if payload.startswith(b"\x1f\x8b"):
        try:
            payload = gzip.decompress(payload)
        except Exception:
            pass

    # Check for Decal XML wrapper
    if payload.startswith(b"<roblox") or payload.startswith(b"<?xml") or b"Decal" in payload[:300]:
        text = payload.decode("utf-8", errors="ignore")
        match = re.search(r"(?:id=|rbxassetid://)(\d+)", text)
        if match and match.group(1) != asset_id:
            nested_id = match.group(1)
            return fetch_roblox_image_bytes(nested_id, depth + 1)

    if len(payload) > MAX_ROBLOX_IMAGE_BYTES:
        return None, None, None

    mime = "image/png"
    ext = ".png"
    if payload.startswith(b"\x89PNG\r\n\x1a\n"):
        mime = "image/png"
        ext = ".png"
    elif payload.startswith(b"\xff\xd8\xff"):
        mime = "image/jpeg"
        ext = ".jpg"
    elif payload.startswith(b"RIFF") and payload[8:12] == b"WEBP":
        mime = "image/webp"
        ext = ".webp"
    elif payload.startswith(b"BM"):
        mime = "image/bmp"
        ext = ".bmp"
    else:
        return None, None, None

    save_path = os.path.join(textures_dir, f"{asset_id}{ext}")
    try:
        with open(save_path, "wb") as fp:
            fp.write(payload)
    except Exception as e:
        print(f"[Server] Save texture cache error for {asset_id}: {e}")

    return payload, mime, f"{asset_id}{ext}"

def _resolve_place_path(relative_path):
    places_root = os.path.realpath(PLACES_DIR)
    file_path = os.path.realpath(os.path.join(places_root, relative_path))
    try:
        if os.path.commonpath((places_root, file_path)) != places_root:
            return None
    except ValueError:
        return None
    return file_path

# Active Server Game Sessions & Server Scripts state
ACTIVE_SERVER_SESSIONS = {}
MULTIPLAYER_ROOMS = {}
MULTIPLAYER_LOCK = threading.Lock()
WS_MAGIC = b"258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

def _make_ws_frame(payload, opcode=1):
    if isinstance(payload, str):
        data = payload.encode("utf-8")
    else:
        data = bytes(payload)
    length = len(data)
    hdr = bytearray([0x80 | (opcode & 0x0F)])
    if length <= 125:
        hdr.append(length)
    elif length <= 65535:
        hdr.append(126)
        hdr.extend(struct.pack(">H", length))
    else:
        hdr.append(127)
        hdr.extend(struct.pack(">Q", length))
    return bytes(hdr) + data

def _read_ws_frame(sock):
    try:
        header = sock.recv(2)
        if not header or len(header) < 2:
            return None, None
        b0, b1 = header[0], header[1]
        opcode = b0 & 0x0F
        masked = bool(b1 & 0x80)
        length = b1 & 0x7F
        if length == 126:
            raw_len = sock.recv(2)
            if len(raw_len) < 2:
                return None, None
            length = struct.unpack(">H", raw_len)[0]
        elif length == 127:
            raw_len = sock.recv(8)
            if len(raw_len) < 8:
                return None, None
            length = struct.unpack(">Q", raw_len)[0]
        mask = sock.recv(4) if masked else None
        if masked and (not mask or len(mask) < 4):
            return None, None
        payload = bytearray()
        while len(payload) < length:
            chunk = sock.recv(min(4096, length - len(payload)))
            if not chunk:
                return None, None
            payload.extend(chunk)
        if masked:
            for i in range(len(payload)):
                payload[i] ^= mask[i % 4]
        return opcode, bytes(payload)
    except OSError:
        return None, None
APP_CLIENTS = {}
APP_CLIENT_LOCK = threading.Lock()
APP_SHUTDOWN_TIMER = None
APP_CLIENT_TTL = 15.0

def _schedule_app_shutdown(httpd, delay=3.0):
    global APP_SHUTDOWN_TIMER

    def shutdown_if_unused():
        global APP_SHUTDOWN_TIMER
        with APP_CLIENT_LOCK:
            APP_SHUTDOWN_TIMER = None
            cutoff = time.monotonic() - APP_CLIENT_TTL
            for client_id, last_seen in list(APP_CLIENTS.items()):
                if last_seen < cutoff:
                    APP_CLIENTS.pop(client_id, None)
            has_clients = bool(APP_CLIENTS)
        if has_clients:
            _schedule_app_shutdown(httpd, 5.0)
        else:
            httpd.shutdown()

    with APP_CLIENT_LOCK:
        if APP_SHUTDOWN_TIMER:
            return
        APP_SHUTDOWN_TIMER = threading.Timer(delay, shutdown_if_unused)
        APP_SHUTDOWN_TIMER.daemon = True
        APP_SHUTDOWN_TIMER.start()

def _cancel_app_shutdown():
    global APP_SHUTDOWN_TIMER
    with APP_CLIENT_LOCK:
        if APP_SHUTDOWN_TIMER:
            APP_SHUTDOWN_TIMER.cancel()
            APP_SHUTDOWN_TIMER = None

# Native Win32 Mouse & Raw Input Host
user32 = ctypes.windll.user32 if sys.platform == "win32" else None

class NativeMouseState:
    def __init__(self):
        self.is_locked = False
        self.orig_x = 0
        self.orig_y = 0
        self.center_x = 0
        self.center_y = 0
        self.cursor_hidden = False

NATIVE_MOUSE = NativeMouseState()

def native_mouse_lock(center_x=None, center_y=None, clip_rect=None, hide_cursor=True):
    if not user32:
        return {"success": True, "native": False, "locked": True}
    try:
        if not NATIVE_MOUSE.is_locked:
            pt = wintypes.POINT()
            user32.GetCursorPos(ctypes.byref(pt))
            NATIVE_MOUSE.orig_x = pt.x
            NATIVE_MOUSE.orig_y = pt.y

        if hide_cursor and not NATIVE_MOUSE.cursor_hidden:
            while user32.ShowCursor(False) >= 0:
                pass
            NATIVE_MOUSE.cursor_hidden = True
        elif not hide_cursor and NATIVE_MOUSE.cursor_hidden:
            while user32.ShowCursor(True) < 0:
                pass
            NATIVE_MOUSE.cursor_hidden = False

        # Optional ClipCursor
        if clip_rect and len(clip_rect) == 4:
            r = wintypes.RECT(int(clip_rect[0]), int(clip_rect[1]), int(clip_rect[2]), int(clip_rect[3]))
            user32.ClipCursor(ctypes.byref(r))

        if center_x is not None and center_y is not None:
            NATIVE_MOUSE.center_x = int(center_x)
            NATIVE_MOUSE.center_y = int(center_y)

        NATIVE_MOUSE.is_locked = True
        return {"success": True, "locked": True, "origPos": [NATIVE_MOUSE.orig_x, NATIVE_MOUSE.orig_y]}
    except Exception as e:
        return {"success": False, "error": str(e)}

def native_mouse_unlock(restore_pos=True):
    if not user32:
        return {"success": True, "native": False, "locked": False}
    try:
        user32.ClipCursor(None)
        if NATIVE_MOUSE.cursor_hidden:
            while user32.ShowCursor(True) < 0:
                pass
            NATIVE_MOUSE.cursor_hidden = False

        if restore_pos and NATIVE_MOUSE.is_locked:
            user32.SetCursorPos(NATIVE_MOUSE.orig_x, NATIVE_MOUSE.orig_y)

        NATIVE_MOUSE.is_locked = False
        return {"success": True, "locked": False}
    except Exception as e:
        return {"success": False, "error": str(e)}

def native_mouse_recenter(x=None, y=None):
    if not user32:
        return {"success": True, "native": False}
    try:
        tx = int(x) if x is not None else NATIVE_MOUSE.center_x
        ty = int(y) if y is not None else NATIVE_MOUSE.center_y
        user32.SetCursorPos(tx, ty)
        return {"success": True, "recentered": [tx, ty]}
    except Exception as e:
        return {"success": False, "error": str(e)}

def _cleanup_native_cursor():
    if user32:
        try:
            user32.ClipCursor(None)
            while user32.ShowCursor(True) < 0:
                pass
        except Exception:
            pass

atexit.register(_cleanup_native_cursor)


class ConbloxRequestHandler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=APP_DIR, **kwargs)

    def guess_type(self, path):
        # Ensure JavaScript modules have proper MIME type
        if path.endswith(".js"):
            return "application/javascript"
        if path.endswith(".css"):
            return "text/css"
        if path.endswith(".json") or path.endswith(".cblx"):
            return "application/json"
        return super().guess_type(path)

    def end_headers(self):
        # Enable CORS and caching headers for snappy local reloading
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def send_json_response(self, data, status=200):
        if isinstance(data, (bytes, bytearray)):
            payload = data
        elif isinstance(data, str):
            payload = data.encode("utf-8")
        else:
            payload = json.dumps(data).encode("utf-8")

        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/api/roblox-animation":
            raw_id = urllib.parse.parse_qs(parsed.query).get("id", [""])[0].strip()
            match = re.search(r"\d{1,20}", raw_id)
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

                if payload.startswith(b"\x1f\x8b"):
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

        if parsed.path == "/api/roblox-asset":
            raw_id = urllib.parse.parse_qs(parsed.query).get("id", [""])[0].strip()
            match = re.search(r"\d{1,20}", raw_id)
            if not match:
                self.send_json_response({"error": "Invalid Roblox asset ID"}, status=400)
                return
            asset_id = match.group(0)

            try:
                payload, mime, filename = fetch_roblox_image_bytes(asset_id)
                if not payload:
                    self.send_json_response({"error": f"Failed to retrieve Roblox asset {asset_id}"}, status=404)
                    return

                self.send_response(200)
                self.send_header("Content-Type", mime)
                self.send_header("Content-Disposition", f'inline; filename="{filename}"')
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
            except Exception as error:
                self.send_json_response({"error": f"Failed to download Roblox asset: {error}"}, status=502)
            return

        if parsed.path == "/api/roblox-account":
            session = load_roblox_session()
            has_autodetect = extract_local_roblox_cookie() is not None
            if session and session.get("userId"):
                self.send_json_response({
                    "authenticated": True,
                    "user": {
                        "userId": session.get("userId"),
                        "username": session.get("username"),
                        "displayName": session.get("displayName"),
                        "avatarUrl": session.get("avatarUrl")
                    },
                    "hasAutoDetect": has_autodetect
                })
            else:
                # Check if autodetect cookie is present and auto-login
                local_cookie = extract_local_roblox_cookie()
                if local_cookie:
                    valid, user_dict, _ = validate_roblox_cookie(local_cookie)
                    if valid and user_dict:
                        save_roblox_session(user_dict)
                        self.send_json_response({
                            "authenticated": True,
                            "user": {
                                "userId": user_dict.get("userId"),
                                "username": user_dict.get("username"),
                                "displayName": user_dict.get("displayName"),
                                "avatarUrl": user_dict.get("avatarUrl")
                            },
                            "hasAutoDetect": True,
                            "autoDetected": True
                        })
                        return
                self.send_json_response({
                    "authenticated": False,
                    "hasAutoDetect": has_autodetect
                })
            return

        if parsed.path == "/api/roblox-mesh":
            raw_id = urllib.parse.parse_qs(parsed.query).get("id", [""])[0].strip()
            match = re.search(r"\d{1,20}", raw_id)
            if not match:
                self.send_json_response({"error": "Invalid Roblox mesh ID"}, status=400)
                return
            asset_id = match.group(0)

            meshes_dir = os.path.join(APP_DIR, "content", "meshes")
            os.makedirs(meshes_dir, exist_ok=True)
            mesh_path = os.path.join(meshes_dir, f"{asset_id}.mesh")
            obj_path = os.path.join(meshes_dir, f"{asset_id}.obj")

            force = urllib.parse.parse_qs(parsed.query).get("force", ["0"])[0] == "1"
            if not force and os.path.isfile(mesh_path) and os.path.getsize(mesh_path) > 0:
                try:
                    with open(mesh_path, "rb") as mf:
                        raw_mesh = mf.read()
                    parsed_geom = parse_roblox_mesh(raw_mesh)
                    if not os.path.isfile(obj_path) or os.path.getsize(obj_path) == 0:
                        with open(obj_path, "w", encoding="utf-8") as of:
                            of.write(mesh_to_obj_string(parsed_geom))
                    self.send_json_response({
                        "success": True,
                        "id": asset_id,
                        "meshPath": f"/content/meshes/{asset_id}.mesh",
                        "objPath": f"/content/meshes/{asset_id}.obj",
                        "geometry": parsed_geom,
                        "vertexCount": parsed_geom["vertexCount"],
                        "faceCount": parsed_geom["faceCount"]
                    })
                    return
                except Exception as cache_err:
                    print(f"[Server] Cache read error for {asset_id}, re-downloading: {cache_err}")

            active_cookie = get_active_roblox_cookie()
            delivery_url = f"https://assetdelivery.roblox.com/v2/assetId/{asset_id}"
            delivery_data = None

            curl_cmd = [
                "curl.exe", "-4", "-s", "-m", "15", "-L",
                "-H", "User-Agent: Roblox/WinInet",
                "-H", "Accept: application/json"
            ]
            if active_cookie:
                curl_cmd.extend(["-H", f"Cookie: .ROBLOSECURITY={active_cookie}"])
                curl_cmd.extend(["-H", "Roblox-Browser-Asset-Request: 1"])
            curl_cmd.append(delivery_url)

            try:
                proc = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=18)
                if proc.returncode == 0 and proc.stdout:
                    delivery_data = json.loads(proc.stdout)
            except Exception as e:
                print(f"[Server] Delivery request exception: {e}")

            if not delivery_data:
                try:
                    headers = {"User-Agent": "Roblox/WinInet", "Accept": "application/json"}
                    if active_cookie:
                        headers["Cookie"] = f".ROBLOSECURITY={active_cookie}"
                        headers["Roblox-Browser-Asset-Request"] = "1"
                    req = urllib.request.Request(delivery_url, headers=headers)
                    with urllib.request.urlopen(req, timeout=15) as resp:
                        delivery_data = json.loads(resp.read().decode("utf-8", errors="ignore"))
                except urllib.error.HTTPError as http_err:
                    try:
                        delivery_data = json.loads(http_err.read().decode("utf-8", errors="ignore"))
                    except Exception:
                        pass
                except Exception as err:
                    self.send_json_response({"error": f"Failed to contact Roblox asset delivery: {err}"}, status=502)
                    return

            if "errors" in delivery_data and delivery_data["errors"]:
                err_obj = delivery_data["errors"][0]
                err_code = err_obj.get("code")
                custom_err = err_obj.get("customErrorCode")
                err_msg = err_obj.get("message", "Roblox API error")
                is_auth_error = (err_code == 401 or custom_err == 11 or "Authentication required" in err_msg)
                self.send_json_response({
                    "error": f"Roblox API error: {err_msg}",
                    "authRequired": is_auth_error,
                    "assetId": asset_id
                }, status=401 if is_auth_error else 400)
                return

            asset_type_id = delivery_data.get("assetTypeId")
            if asset_type_id != 4:
                self.send_json_response({
                    "error": f"Roblox asset {asset_id} is not a mesh (assetTypeId is {asset_type_id}, expected 4)"
                }, status=400)
                return

            locations = delivery_data.get("locations") or []
            if not locations or not isinstance(locations, list) or not locations[0].get("location"):
                self.send_json_response({"error": f"No download location provided for mesh {asset_id}"}, status=404)
                return

            download_url = locations[0]["location"]

            urls_to_try = []
            if "encoding=zstd" in download_url:
                url_no_zstd = re.sub(r'([?&])encoding=zstd(&|$)', r'\1', download_url).rstrip('?&').replace('?&', '?')
                urls_to_try.append(url_no_zstd)
            urls_to_try.append(download_url)

            mesh_payload = None
            for u in urls_to_try:
                try:
                    dl_cmd = ["curl.exe", "-4", "-s", "-m", "20", "-L", "-H", "User-Agent: Roblox/WinInet"]
                    if active_cookie:
                        dl_cmd.extend(["-H", f"Cookie: .ROBLOSECURITY={active_cookie}"])
                    dl_cmd.append(u)
                    proc = subprocess.run(dl_cmd, capture_output=True, timeout=25)
                    if proc.returncode == 0 and len(proc.stdout) > 0 and not proc.stdout.startswith(b"<?xml") and not proc.stdout.startswith(b"<Error>"):
                        mesh_payload = proc.stdout
                        break
                except Exception:
                    pass
                if not mesh_payload:
                    try:
                        headers = {"User-Agent": "Roblox/WinInet", "Accept-Encoding": "gzip, identity"}
                        if active_cookie:
                            headers["Cookie"] = f".ROBLOSECURITY={active_cookie}"
                        req = urllib.request.Request(u, headers=headers)
                        with urllib.request.urlopen(req, timeout=20) as resp:
                            mesh_payload = resp.read()
                            if resp.headers.get("Content-Encoding") == "gzip":
                                mesh_payload = gzip.decompress(mesh_payload)
                            break
                    except Exception:
                        pass

            if not mesh_payload:
                self.send_json_response({"error": f"Failed to download mesh data from CDN for asset {asset_id}"}, status=502)
                return

            try:
                if mesh_payload.startswith(b"\x1f\x8b"):
                    mesh_payload = gzip.decompress(mesh_payload)
                elif mesh_payload.startswith(b"(\xb5/\xfd"):
                    try:
                        import zstandard
                        mesh_payload = zstandard.ZstdDecompressor().decompress(mesh_payload)
                    except Exception:
                        pass

                with open(mesh_path, "wb") as mf:
                    mf.write(mesh_payload)

                parsed_geom = parse_roblox_mesh(mesh_payload)
                obj_text = mesh_to_obj_string(parsed_geom)
                with open(obj_path, "w", encoding="utf-8") as of:
                    of.write(obj_text)

                self.send_json_response({
                    "success": True,
                    "id": asset_id,
                    "meshPath": f"/content/meshes/{asset_id}.mesh",
                    "objPath": f"/content/meshes/{asset_id}.obj",
                    "geometry": parsed_geom,
                    "vertexCount": parsed_geom["vertexCount"],
                    "faceCount": parsed_geom["faceCount"]
                })
            except Exception as parse_err:
                self.send_json_response({
                    "error": f"Failed to parse or convert mesh {asset_id}: {parse_err}"
                }, status=500)
            return

        if parsed.path == "/api/native/status":
            self.send_json_response({
                "nativeHost": True,
                "platform": sys.platform,
                "canCapture": user32 is not None,
                "isLocked": NATIVE_MOUSE.is_locked
            })
            return

        if parsed.path in ["/content/head.obj", "/api/head-obj"]:
            candidates = [
                os.path.join(APP_DIR, "content", "head.obj"),
                os.path.join(BASE_DIR, "content", "head.obj"),
                os.path.join(BASE_DIR, "head.obj"),
            ]
            head_path = next((c for c in candidates if os.path.isfile(c)), None)
            if head_path:
                try:
                    with open(head_path, "rb") as f:
                        payload = f.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "text/plain; charset=utf-8")
                    self.send_header("Content-Length", str(len(payload)))
                    self.end_headers()
                    self.wfile.write(payload)
                    return
                except OSError:
                    pass
            self.send_json_response({"error": "head.obj is missing"}, status=404)
            return

        if parsed.path == "/api/starter-character":
            candidates = [
                os.path.join(BASE_DIR, "StarterCharacter.rbxm"),
                os.path.join(APP_DIR, "StarterCharacter.rbxm"),
                os.path.join(APP_DIR, "content", "StarterCharacter.rbxm"),
                os.path.join(os.path.dirname(BASE_DIR), "Conblox", "StarterCharacter.rbxm"),
                os.path.join(os.path.dirname(BASE_DIR), "conblox", "StarterCharacter.rbxm"),
                "/opt/Conblox/StarterCharacter.rbxm",
                "/opt/conblox/StarterCharacter.rbxm",
            ]
            character_path = None
            for cand in candidates:
                if os.path.isfile(cand):
                    character_path = cand
                    break

            if character_path:
                try:
                    with open(character_path, "rb") as character_file:
                        payload = character_file.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "application/octet-stream")
                    self.send_header("Content-Length", str(len(payload)))
                    self.end_headers()
                    self.wfile.write(payload)
                    return
                except OSError:
                    pass
            self.send_json_response({"error": "StarterCharacter.rbxm is missing"}, status=404)
            return

        if parsed.path == "/api/places":
            place_exts = (".cblx", ".json", ".rbxl")
            places_files = [f for f in os.listdir(PLACES_DIR) if f.lower().endswith(place_exts)]
            base_files = [f for f in os.listdir(BASE_DIR) if f.lower().endswith(".rbxl")]
            all_files = sorted(list(set(places_files + base_files)))
            self.send_json_response(all_files)
            return

        if parsed.path.startswith("/places/"):
            rel_path = parsed.path[len("/places/"):]
            filename = urllib.parse.unquote(rel_path)
            file_path = _resolve_place_path(filename)
            if not file_path or not os.path.isfile(file_path):
                alt_path = os.path.join(BASE_DIR, os.path.basename(filename))
                if os.path.isfile(alt_path):
                    file_path = alt_path

            if file_path and os.path.isfile(file_path):
                with open(file_path, "rb") as f:
                    content = f.read()
                if file_path.lower().endswith(".rbxl"):
                    self.send_response(200)
                    self.send_header("Content-Type", "application/octet-stream")
                    self.send_header("Content-Length", str(len(content)))
                    self.end_headers()
                    self.wfile.write(content)
                else:
                    self.send_json_response(content)
                return
            else:
                self.send_json_response({"error": "File not found"}, status=404)
                return

        if parsed.path == "/api/load":
            qs = urllib.parse.parse_qs(parsed.query)
            name = qs.get("name", [""])[0]
            if not name:
                self.send_json_response({"error": "Missing name"}, status=400)
                return

            basename = os.path.basename(name)
            file_path = os.path.join(PLACES_DIR, basename)
            if not os.path.exists(file_path):
                file_path = os.path.join(BASE_DIR, basename)

            if os.path.exists(file_path) and os.path.isfile(file_path):
                with open(file_path, "rb") as f:
                    content = f.read()
                if file_path.lower().endswith(".rbxl"):
                    self.send_response(200)
                    self.send_header("Content-Type", "application/octet-stream")
                    self.send_header("Content-Length", str(len(content)))
                    self.end_headers()
                    self.wfile.write(content)
                else:
                    self.send_json_response(content)
            else:
                self.send_json_response({"error": "File not found"}, status=404)
            return

        if parsed.path == "/api/multiplayer/ws":
            self.close_connection = True
            upgrade = self.headers.get("Upgrade", "").lower()
            if upgrade == "websocket":
                self.handle_multiplayer_websocket()
                return
            self.send_error(400, "Expected WebSocket upgrade")
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/api/publish-animation":
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

        if parsed.path == "/api/test-save-screenshot":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            try:
                data = json.loads(body)
                data_url = data.get("data", "")
                filename = data.get("name", "screenshot.png")
                if "," in data_url:
                    data_url = data_url.split(",", 1)[1]
                import base64
                img_bytes = base64.b64decode(data_url)
                scratch_dir = os.path.join(BASE_DIR, "scratch")
                os.makedirs(scratch_dir, exist_ok=True)
                with open(os.path.join(scratch_dir, filename), "wb") as f:
                    f.write(img_bytes)
                art_dir = r"C:\Users\Renat\.gemini\antigravity\brain\49e69d24-e071-4685-b5da-2bf81f94a438"
                if os.path.isdir(art_dir):
                    with open(os.path.join(art_dir, filename), "wb") as f:
                        f.write(img_bytes)
                self.send_json_response({"success": True})
            except Exception as e:
                self.send_json_response({"error": str(e)}, status=500)
            return

        if parsed.path == "/api/roblox-account":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            try:
                data = json.loads(body)
            except Exception:
                data = {}

            cookie_to_use = ""
            if data.get("autoDetect"):
                cookie_to_use = extract_local_roblox_cookie()
                if not cookie_to_use:
                    self.send_json_response({
                        "success": False,
                        "error": "Could not automatically detect Roblox cookie from this PC. Please enter .ROBLOSECURITY manually."
                    }, status=404)
                    return
            else:
                cookie_to_use = data.get("cookie", "").strip()

            valid, user_dict, err_msg = validate_roblox_cookie(cookie_to_use)
            if not valid or not user_dict:
                self.send_json_response({
                    "success": False,
                    "error": err_msg or "Invalid Roblox cookie"
                }, status=400)
                return

            save_roblox_session(user_dict)
            self.send_json_response({
                "success": True,
                "user": {
                    "userId": user_dict.get("userId"),
                    "username": user_dict.get("username"),
                    "displayName": user_dict.get("displayName"),
                    "avatarUrl": user_dict.get("avatarUrl")
                }
            })
            return

        if parsed.path == "/api/roblox-account/logout":
            clear_roblox_session()
            self.send_json_response({"success": True})
            return

        if parsed.path == "/api/build":
            if sys.platform != "win32":
                self.send_json_response({"error": "EXE builds are available from Windows only"}, status=501)
                return
            length = int(self.headers.get("Content-Length", 0))
            if length > 20 * 1024 * 1024:
                self.send_json_response({"error": "Place is too large to export"}, status=413)
                return
            try:
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                from build_game import build_exe
                import tempfile

                with tempfile.TemporaryDirectory(prefix="conblox-build-") as output_dir:
                    exe_path = build_exe(payload.get("data"), output_dir)
                    with open(exe_path, "rb") as exe_file:
                        exe_data = exe_file.read()
                filename = os.path.basename(exe_path)
                self.send_response(200)
                self.send_header("Content-Type", "application/vnd.microsoft.portable-executable")
                self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
                self.send_header("Content-Length", str(len(exe_data)))
                self.end_headers()
                self.wfile.write(exe_data)
            except Exception as error:
                self.send_json_response({"error": str(error)}, status=500)
            return

        if parsed.path == "/api/multiplayer/sync":
            length = int(self.headers.get("Content-Length", 0))
            if length > 16384:
                self.send_json_response({"error": "Request too large"}, status=413)
                return
            try:
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                room_id = payload.get("room", "")
                player_id = payload.get("playerId", "")
                action = payload.get("action", "sync")
                if not re.fullmatch(r"[A-Za-z0-9_-]{1,48}", room_id):
                    raise ValueError("Invalid room code")
                if not re.fullmatch(r"[A-Za-z0-9_-]{1,64}", player_id):
                    raise ValueError("Invalid player ID")

                now = time.monotonic()
                now_ms = time.time() * 1000
                with MULTIPLAYER_LOCK:
                    room_data = MULTIPLAYER_ROOMS.setdefault(room_id, {"players": {}, "sockets": {}})
                    players = room_data["players"]
                    cutoff = now - 15.0
                    for key, player in list(players.items()):
                        if player["updatedAt"] < cutoff and key != player_id:
                            players.pop(key, None)
                    if action == "leave":
                        players.pop(player_id, None)
                    else:
                        position = payload.get("position")
                        if not isinstance(position, dict):
                            raise ValueError("Player position is required")
                        coords = [float(position.get(axis, 0)) for axis in ("x", "y", "z")]
                        raw_velocity = payload.get("velocity", {})
                        if not isinstance(raw_velocity, dict):
                            raise ValueError("Invalid player velocity")
                        velocities = [float(raw_velocity.get(axis, 0)) for axis in ("x", "y", "z")]
                        yaw = float(payload.get("yaw", 0))
                        if not all(map(lambda value: abs(value) < 100000, coords + [yaw])) or not all(map(lambda value: abs(value) < 500, velocities)):
                            raise ValueError("Invalid player transform")
                        if len(players) >= 32 and player_id not in players:
                            raise ValueError("Room is full")
                        players[player_id] = {
                            "id": player_id,
                            "name": str(payload.get("name", "Player"))[:24],
                            "p": coords,
                            "v": velocities,
                            "y": yaw,
                            "position": dict(zip(("x", "y", "z"), coords)),
                            "velocity": dict(zip(("x", "y", "z"), velocities)),
                            "yaw": yaw,
                            "timestamp": now_ms,
                            "updatedAt": now,
                        }
                    if not players and not room_data.get("sockets"):
                        MULTIPLAYER_ROOMS.pop(room_id, None)
                    players_list = list(players.values())

                self.send_json_response({"success": True, "serverTime": now_ms, "players": players_list})
            except (json.JSONDecodeError, UnicodeDecodeError, TypeError, ValueError) as error:
                self.send_json_response({"error": str(error)}, status=400)
            return

        if parsed.path in ("/api/app/open", "/api/app/close"):
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            try:
                client_id = json.loads(body).get("clientId")
            except (json.JSONDecodeError, AttributeError):
                client_id = None

            if not client_id:
                self.send_json_response({"error": "Missing clientId"}, status=400)
                return

            if parsed.path == "/api/app/open":
                _cancel_app_shutdown()
                with APP_CLIENT_LOCK:
                    APP_CLIENTS[client_id] = time.monotonic()
                if getattr(self.server, "auto_shutdown", False):
                    _schedule_app_shutdown(self.server, APP_CLIENT_TTL)
            else:
                if getattr(self.server, "auto_shutdown", False):
                    _cancel_app_shutdown()
                with APP_CLIENT_LOCK:
                    APP_CLIENTS.pop(client_id, None)
                if getattr(self.server, "auto_shutdown", False):
                    _schedule_app_shutdown(self.server)

            self.send_json_response({"success": True})
            return

        if parsed.path == "/api/save":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8")
            try:
                payload = json.loads(body)
                name = payload.get("name", "Untitled.cblx")
                if not name.endswith(".cblx") and not name.endswith(".json"):
                    name += ".cblx"

                file_path = os.path.join(PLACES_DIR, os.path.basename(name))
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(payload.get("data", {}), f, indent=2)

                self.send_json_response({"success": True, "file": name})
            except Exception as e:
                self.send_json_response({"error": str(e)}, status=500)
            return

        if parsed.path == "/api/server/start":
            length = int(self.headers.get("Content-Length", 0))
            if length > 0:
                self.rfile.read(length)
            session_id = f"srv_{int(time.time() * 1000)}"
            ACTIVE_SERVER_SESSIONS[session_id] = {
                "id": session_id,
                "started_at": time.time(),
                "scripts": {},
                "logs": []
            }
            print(f"[Conblox Server Engine] Game Server session started (ID: {session_id})")
            self.send_json_response({
                "success": True,
                "sessionId": session_id,
                "status": "running",
                "message": f"Dedicated Server started on port {PORT}"
            })
            return

        if parsed.path == "/api/server/stop":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            payload = json.loads(body) if body else {}
            session_id = payload.get("sessionId")
            if session_id and session_id in ACTIVE_SERVER_SESSIONS:
                del ACTIVE_SERVER_SESSIONS[session_id]
            else:
                ACTIVE_SERVER_SESSIONS.clear()
            self.send_json_response({"success": True, "status": "stopped"})
            return

        if parsed.path == "/api/server/execute":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            payload = json.loads(body) if body else {}
            name = payload.get("name", "Script")
            source = payload.get("source", "")
            script_id = payload.get("scriptId", "unknown")
            session_id = payload.get("sessionId", "default")

            print(f"[Conblox Server Engine] [Server] Executing server script '{name}' (id={script_id})")

            # Parse server print statements from source to log on server
            server_logs = []
            for line in source.splitlines():
                line_str = line.strip()
                if line_str.startswith("--"):
                    continue
                m = re.search(r'\bprint\s*\((.*?)\)', line_str)
                if m:
                    content = m.group(1).strip()
                    # Clean up quotes and simple concats for clean server output
                    cleaned = re.sub(r'["\']\s*\.\.\s*["\']', '', content)
                    cleaned = cleaned.replace('script.Name', name)
                    cleaned = cleaned.strip('"\'')
                    server_logs.append({
                        "type": "info",
                        "message": f"[Server] [{name}] {cleaned}"
                    })
                    print(f"   -> [Server Console Output]: {cleaned}")

            self.send_json_response({
                "success": True,
                "isServer": True,
                "name": name,
                "scriptId": script_id,
                "logs": server_logs,
                "serverTime": time.time()
            })
            return

        if parsed.path == "/api/native/mouse/lock":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            payload = json.loads(body) if body else {}
            res = native_mouse_lock(
                center_x=payload.get("screenX"),
                center_y=payload.get("screenY"),
                clip_rect=payload.get("clipRect"),
                hide_cursor=payload.get("hideCursor", True)
            )
            self.send_json_response(res)
            return

        if parsed.path == "/api/native/mouse/unlock":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            payload = json.loads(body) if body else {}
            res = native_mouse_unlock(
                restore_pos=payload.get("restorePos", True)
            )
            self.send_json_response(res)
            return

        if parsed.path == "/api/native/mouse/recenter":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            payload = json.loads(body) if body else {}
            res = native_mouse_recenter(
                x=payload.get("x"),
                y=payload.get("y")
            )
            self.send_json_response(res)
            return

        self.send_json_response({"error": "Endpoint not found"}, status=404)

    def handle_multiplayer_websocket(self):
        key = self.headers.get("Sec-WebSocket-Key", "")
        if not key:
            self.send_error(400, "Missing Sec-WebSocket-Key")
            return

        accept = base64.b64encode(hashlib.sha1(key.encode("utf-8") + WS_MAGIC).digest()).decode("utf-8")
        self.send_response(101, "Switching Protocols")
        self.send_header("Upgrade", "websocket")
        self.send_header("Connection", "Upgrade")
        self.send_header("Sec-WebSocket-Accept", accept)
        self.end_headers()
        self.wfile.flush()

        sock = self.connection
        current_room = None
        current_player_id = None
        current_player_name = "Player"
        send_lock = threading.Lock()

        def send_frame(data, opcode=1):
            try:
                frame = _make_ws_frame(data, opcode)
                with send_lock:
                    sock.sendall(frame)
            except Exception:
                pass

        try:
            while True:
                opcode, raw_data = _read_ws_frame(sock)
                if opcode is None or opcode == 8:
                    break
                if opcode == 9:
                    send_frame(raw_data or b"", opcode=10)
                    continue

                if opcode == 1:
                    try:
                        text = raw_data.decode("utf-8", errors="replace")
                        msg = json.loads(text)
                    except Exception:
                        continue

                    msg_type = msg.get("t") or msg.get("type")
                    now = time.monotonic()
                    now_ms = time.time() * 1000

                    if msg_type == "join":
                        room_id = str(msg.get("room") or msg.get("r") or "default")[:48]
                        player_id = str(msg.get("playerId") or msg.get("id") or "")[:64]
                        player_name = str(msg.get("name") or "Player")[:24]
                        if not re.fullmatch(r"[A-Za-z0-9_-]{1,48}", room_id) or not re.fullmatch(r"[A-Za-z0-9_-]{1,64}", player_id):
                            continue

                        current_room = room_id
                        current_player_id = player_id
                        current_player_name = player_name

                        with MULTIPLAYER_LOCK:
                            room = MULTIPLAYER_ROOMS.setdefault(room_id, {"players": {}, "sockets": {}})
                            room["sockets"][player_id] = send_frame
                            players_list = list(room["players"].values())
                        send_frame(json.dumps({"t": "sync", "st": now_ms, "players": players_list}))

                    elif msg_type == "p":
                        if not current_room or not current_player_id:
                            continue
                        pos = msg.get("p") or msg.get("position")
                        vel = msg.get("v") or msg.get("velocity")
                        yaw = float(msg.get("y") or msg.get("yaw") or 0)

                        if isinstance(pos, (list, tuple)) and len(pos) >= 3:
                            coords = [float(pos[0]), float(pos[1]), float(pos[2])]
                        elif isinstance(pos, dict):
                            coords = [float(pos.get("x", 0)), float(pos.get("y", 0)), float(pos.get("z", 0))]
                        else:
                            coords = [0.0, 0.0, 0.0]

                        if isinstance(vel, (list, tuple)) and len(vel) >= 3:
                            velocities = [float(vel[0]), float(vel[1]), float(vel[2])]
                        elif isinstance(vel, dict):
                            velocities = [float(vel.get("x", 0)), float(vel.get("y", 0)), float(vel.get("z", 0))]
                        else:
                            velocities = [0.0, 0.0, 0.0]

                        player_record = {
                            "id": current_player_id,
                            "name": current_player_name,
                            "p": coords,
                            "v": velocities,
                            "y": yaw,
                            "position": dict(zip(("x", "y", "z"), coords)),
                            "velocity": dict(zip(("x", "y", "z"), velocities)),
                            "yaw": yaw,
                            "timestamp": now_ms,
                            "updatedAt": now,
                        }

                        with MULTIPLAYER_LOCK:
                            room = MULTIPLAYER_ROOMS.get(current_room)
                            if not room:
                                continue
                            room["players"][current_player_id] = player_record
                            cutoff = now - 15.0
                            for pid, pdata in list(room["players"].items()):
                                if pdata.get("updatedAt", 0) < cutoff and pid != current_player_id:
                                    room["players"].pop(pid, None)
                                    room["sockets"].pop(pid, None)
                            other_sockets = [s for pid, s in room["sockets"].items() if pid != current_player_id]

                        broadcast_data = json.dumps({
                            "t": "p",
                            "id": current_player_id,
                            "name": current_player_name,
                            "p": coords,
                            "v": velocities,
                            "y": yaw,
                            "ts": now_ms,
                            "timestamp": now_ms
                        })
                        for s_fn in other_sockets:
                            s_fn(broadcast_data)

                    elif msg_type == "leave":
                        break

                elif opcode == 2:
                    if not current_room or not current_player_id:
                        continue
                    if len(raw_data) >= 37:
                        op, px, py, pz, vx, vy, vz, yaw, client_time = struct.unpack("<Bfffffff d", raw_data[:37])
                        now = time.monotonic()
                        now_ms = time.time() * 1000
                        coords = [px, py, pz]
                        velocities = [vx, vy, vz]
                        player_record = {
                            "id": current_player_id,
                            "name": current_player_name,
                            "p": coords,
                            "v": velocities,
                            "y": yaw,
                            "position": dict(zip(("x", "y", "z"), coords)),
                            "velocity": dict(zip(("x", "y", "z"), velocities)),
                            "yaw": yaw,
                            "timestamp": now_ms,
                            "updatedAt": now,
                        }
                        with MULTIPLAYER_LOCK:
                            room = MULTIPLAYER_ROOMS.get(current_room)
                            if not room:
                                continue
                            room["players"][current_player_id] = player_record
                            other_sockets = [s for pid, s in room["sockets"].items() if pid != current_player_id]

                        broadcast_data = json.dumps({
                            "t": "p",
                            "id": current_player_id,
                            "name": current_player_name,
                            "p": coords,
                            "v": velocities,
                            "y": yaw,
                            "ts": now_ms,
                            "timestamp": now_ms
                        })
                        for s_fn in other_sockets:
                            s_fn(broadcast_data)

        finally:
            self.close_connection = True
            if current_room and current_player_id:
                with MULTIPLAYER_LOCK:
                    room = MULTIPLAYER_ROOMS.get(current_room)
                    if room:
                        room["players"].pop(current_player_id, None)
                        room["sockets"].pop(current_player_id, None)
                        other_sockets = list(room["sockets"].values())
                        if not room["players"] and not room["sockets"]:
                            MULTIPLAYER_ROOMS.pop(current_room, None)
                    else:
                        other_sockets = []
                leave_msg = json.dumps({"t": "leave", "id": current_player_id})
                for s_fn in other_sockets:
                    s_fn(leave_msg)
            try:
                sock.close()
            except Exception:
                pass

def launch_app_window(url):
    """Launch Chrome or Edge in dedicated application mode for a desktop feel, fallback to default browser"""
    browser_candidates = [
        # Google Chrome (user's primary default browser)
        os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
        shutil.which("chrome.exe") or "",
        # Microsoft Edge
        os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
        shutil.which("msedge.exe") or ""
    ]

    app_args = [
        f"--app={url}",
        "--window-size=1440,900"
    ]

    for p in browser_candidates:
        if p and os.path.exists(p):
            try:
                # Never pass CREATE_NO_WINDOW to a GUI desktop application window
                subprocess.Popen([p] + app_args)
                print(f"[Conblox] Launched desktop app window via: {p}")
                return
            except Exception as e:
                print(f"[Conblox] Could not launch {p}: {e}")

    # Fallback to default browser
    try:
        if sys.platform == "win32":
            os.startfile(url)
            print(f"[Conblox] Opened via os.startfile: {url}")
            return
    except Exception:
        pass

    try:
        import webbrowser
        webbrowser.open(url)
        print(f"[Conblox] Opened in default web browser: {url}")
    except Exception as e:
        if sys.platform == "win32":
            os.system(f'start "" "{url}"')

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True
    request_queue_size = 128

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def run(host=None, port=None, open_browser=True, game_place=None):
    host = host or os.environ.get("CONBLOX_HOST", "127.0.0.1")
    port = int(port if port is not None else os.environ.get("CONBLOX_PORT", PORT))
    display_host = "127.0.0.1" if host == "0.0.0.0" else host
    url = f"http://{display_host}:{port}"
    if game_place:
        url += f"/?play=1&place={urllib.parse.quote(game_place)}"
    
    # If already running, just launch app window
    if host == "127.0.0.1" and is_port_in_use(port):
        print("=" * 60)
        print("          CONBLOX STUDIO ENGINE SERVER")
        print("=" * 60)
        print(f"Conblox Server is already active on port {PORT}.")
        print("Launching Studio window...")
        print("-" * 60)
        launch_app_window(url)
        return

    with ThreadedHTTPServer((host, port), ConbloxRequestHandler) as httpd:
        httpd.auto_shutdown = open_browser and sys.platform == "win32"
        port = httpd.server_port
        url = f"http://{display_host}:{port}"
        if game_place:
            url += f"/?play=1&place={urllib.parse.quote(game_place)}"
        print("=" * 60)
        print("          CONBLOX STUDIO ENGINE SERVER")
        print("=" * 60)
        print(f"Server running at: {url}")
        print("Press Ctrl+C to terminate.")
        print("-" * 60)

        # Launch window after server starts
        if open_browser and sys.platform == "win32":
            threading.Timer(0.8, lambda: launch_app_window(url)).start()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down Conblox server...")
            httpd.server_close()

if __name__ == "__main__":
    run()
