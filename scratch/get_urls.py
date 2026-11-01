import urllib.request, re
req = urllib.request.Request('https://create.roblox.com/docs/avatar/characters/classic-clothing', headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    for m in re.findall(r'https?://[^\s\"\'<>]+\.png', html):
        print(m)
    for m in re.findall(r'/assets/[^\s\"\'<>]+\.png', html):
        print(m)
except Exception as e:
    print('Error:', e)
