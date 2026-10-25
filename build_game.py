#!/usr/bin/env python3
"""Build a standalone Windows game launcher containing a Conblox place."""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
APP_DIR = ROOT / "app"


def build_exe(place_data, output_dir):
    if sys.platform != "win32":
        raise RuntimeError("Build the Windows .exe from a Windows machine.")
    if not isinstance(place_data, dict) or not isinstance(place_data.get("dataModel"), dict):
        raise ValueError("The selected file is not a valid Conblox .cblx place.")
    if not APP_DIR.is_dir():
        raise RuntimeError("The app/ runtime folder is missing.")

    place_name = str(place_data.get("name", "ConbloxGame.cblx"))
    game_name = re.sub(r"[^A-Za-z0-9_-]+", "_", Path(place_name).stem).strip("_") or "ConbloxGame"
    output_dir = Path(output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="conblox-pyinstaller-") as temp_dir:
        temp_path = Path(temp_dir)
        places_dir = temp_path / "places"
        places_dir.mkdir()
        bundled_place = places_dir / f"{game_name}.cblx"
        bundled_place.write_text(json.dumps(place_data, ensure_ascii=True), encoding="utf-8")
        entry_point = temp_path / "game_entry.py"
        entry_point.write_text(
            "from server import run\n"
            f"run(host='127.0.0.1', port=0, game_place={game_name + '.cblx'!r})\n",
            encoding="utf-8",
        )
        command = [
            sys.executable, "-m", "PyInstaller", "--noconfirm", "--clean", "--onefile", "--noconsole",
            "--name", game_name, "--paths", str(ROOT), "--distpath", str(output_dir),
            "--workpath", str(temp_path / "work"), "--specpath", str(temp_path),
            "--add-data", f"{APP_DIR};app", "--add-data", f"{bundled_place};places",
            str(entry_point),
        ]
        try:
            result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, timeout=600)
        except FileNotFoundError as error:
            raise RuntimeError("PyInstaller is missing. Install it with: python -m pip install -r requirements-build.txt") from error
        except subprocess.TimeoutExpired as error:
            raise RuntimeError("EXE build exceeded the 10 minute time limit.") from error
        if result.returncode != 0:
            detail = (result.stderr or result.stdout)[-4000:]
            raise RuntimeError(f"PyInstaller failed:\n{detail}")

    exe_path = output_dir / f"{game_name}.exe"
    if not exe_path.is_file():
        raise RuntimeError("PyInstaller completed without producing the expected .exe.")
    return exe_path


def main():
    parser = argparse.ArgumentParser(description="Package a Conblox .cblx place as a Windows .exe")
    parser.add_argument("place", help="Path to a saved .cblx place")
    parser.add_argument("--output", default=str(ROOT / "builds"), help="Output folder (default: builds/)")
    args = parser.parse_args()
    place_path = Path(args.place).resolve()
    place_data = json.loads(place_path.read_text(encoding="utf-8"))
    place_data.setdefault("name", place_path.name)
    result = build_exe(place_data, args.output)
    print(f"Built game: {result}")


if __name__ == "__main__":
    main()
