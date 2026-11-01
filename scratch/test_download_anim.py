import subprocess
import json
import gzip

res = subprocess.run(["curl.exe", "-s", "-L", "https://assetdelivery.roblox.com/v2/assetId/180426354"], capture_output=True, text=True)
data = json.loads(res.stdout)
loc = data["locations"][0]["location"]
print("Location URL:", loc[:80])

dl = subprocess.run(["curl.exe", "-s", "-L", loc], capture_output=True)
payload = dl.stdout
print("Downloaded size:", len(payload))
if payload.startswith(b"\x1f\x8b"):
    print("Gzip detected, decompressing...")
    payload = gzip.decompress(payload)
    print("Decompressed size:", len(payload))

print("Header (first 100 bytes):", repr(payload[:100]))
