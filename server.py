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

os.makedirs(PLACES_DIR, exist_ok=True)

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

        if parsed.path == "/api/roblox-asset":
            asset_id = urllib.parse.parse_qs(parsed.query).get("id", [""])[0]
            if not re.fullmatch(r"\d{1,20}", asset_id):
                self.send_json_response({"error": "Invalid Roblox asset ID"}, status=400)
                return

            asset_url = f"https://assetdelivery.roblox.com/v1/asset/?id={asset_id}"
            request = urllib.request.Request(
                asset_url,
                headers={"User-Agent": "ConbloxStudio/1.0", "Accept-Encoding": "identity"}
            )
            try:
                for attempt in range(3):
                    try:
                        with urllib.request.urlopen(request, timeout=60) as response:
                            payload = response.read(MAX_ROBLOX_IMAGE_BYTES + 1)
                            is_gzip = response.headers.get("Content-Encoding", "").lower() == "gzip"
                        break
                    except (urllib.error.URLError, TimeoutError, OSError):
                        if attempt == 2:
                            raise
                        time.sleep(0.5 * (attempt + 1))
                if len(payload) > MAX_ROBLOX_IMAGE_BYTES:
                    self.send_json_response({"error": "Roblox asset is too large"}, status=413)
                    return
                if is_gzip or payload.startswith(b"\x1f\x8b"):
                    with gzip.GzipFile(fileobj=io.BytesIO(payload)) as compressed:
                        payload = compressed.read(MAX_ROBLOX_IMAGE_BYTES + 1)
                if len(payload) > MAX_ROBLOX_IMAGE_BYTES:
                    self.send_json_response({"error": "Roblox image is too large"}, status=413)
                    return
                if not payload.startswith(b"\x89PNG\r\n\x1a\n"):
                    self.send_json_response({"error": "Roblox asset is not a PNG image"}, status=415)
                    return

                self.send_response(200)
                self.send_header("Content-Type", "image/png")
                self.send_header("Content-Disposition", f'inline; filename="{asset_id}.png"')
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
            except Exception as error:
                self.send_json_response({"error": f"Failed to download Roblox asset: {error}"}, status=502)
            return

        if parsed.path == "/api/native/status":
            self.send_json_response({
                "nativeHost": True,
                "platform": sys.platform,
                "canCapture": user32 is not None,
                "isLocked": NATIVE_MOUSE.is_locked
            })
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
            files = [f for f in os.listdir(PLACES_DIR) if f.endswith(".cblx") or f.endswith(".json")]
            self.send_json_response(files)
            return

        if parsed.path.startswith("/places/"):
            rel_path = parsed.path[len("/places/"):]
            file_path = _resolve_place_path(urllib.parse.unquote(rel_path))
            if file_path and os.path.isfile(file_path):
                with open(file_path, "rb") as f:
                    content = f.read()
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

            file_path = os.path.join(PLACES_DIR, os.path.basename(name))
            if os.path.exists(file_path):
                with open(file_path, "rb") as f:
                    content = f.read()
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
