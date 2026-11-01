import subprocess
import time
import json
import urllib.request

chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
proc = subprocess.Popen([
    chrome_path,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    'http://127.0.0.1:28888/'
])

try:
    time.sleep(3)
    # Get devtools targets
    req = urllib.request.urlopen('http://127.0.0.1:9222/json')
    targets = json.loads(req.read().decode('utf-8'))
    print('Targets:', len(targets))
    for t in targets:
        print('Target:', t.get('title'), t.get('url'))
finally:
    proc.terminate()
