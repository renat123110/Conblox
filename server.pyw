#!/usr/bin/env pythonw
"""
Conblox Studio Silent / Headless GUI Engine Server (.pyw)
Runs completely in the background without any CMD / terminal console window.
"""
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import server

if __name__ == "__main__":
    server.run()
