# Ubuntu Multiplayer Server

These steps install the server on Ubuntu 22.04 or newer and expose it securely over HTTPS. Replace `SERVER_IP`, `ubuntu`, and `games.example.com` with your server's SSH user, IP, and domain.

## 1. Point a domain to the server

Create an `A` record for `games.example.com` pointing to `SERVER_IP`. In your cloud firewall/security group, allow inbound TCP ports 22, 80, and 443. Port 28888 must remain private.

## 2. Copy the server files from Windows

In PowerShell, from the Conblox project folder:

```powershell
cd C:\Users\Renat\Desktop\Conblox
ssh ubuntu@SERVER_IP "mkdir -p /tmp/conblox"
scp -r .\app .\places .\server.py .\deploy ubuntu@SERVER_IP:/tmp/conblox/
```

## 3. Install and verify the Conblox service

SSH into Ubuntu and run:

```bash
ssh ubuntu@SERVER_IP
sudo bash /tmp/conblox/deploy/install_ubuntu.sh
sudo systemctl status conblox --no-pager
curl http://127.0.0.1:28888/api/native/status
```

The service should show `active (running)`, and `curl` should return JSON. It listens only on `127.0.0.1:28888`, so it is not yet reachable from the public internet.

## 4. Configure HTTPS with Nginx

Install Nginx and Certbot. Stop Nginx briefly so Certbot can issue a certificate using port 80 without modifying Nginx's default site:

```bash
sudo apt-get update
sudo apt-get install -y nginx certbot
sudo systemctl stop nginx
sudo certbot certonly --standalone -d games.example.com
sudo systemctl start nginx
```

Install the provided Nginx site, replacing the example domain with the exact domain used for the certificate:

```bash
sudo cp /tmp/conblox/deploy/nginx.conblox.conf /etc/nginx/sites-available/conblox
DOMAIN=games.example.com
sudo sed -i "s/games\\.example\\.com/${DOMAIN}/g" /etc/nginx/sites-available/conblox
sudo ln -sfn /etc/nginx/sites-available/conblox /etc/nginx/sites-enabled/conblox
sudo nginx -t
sudo systemctl reload nginx
```

Set `DOMAIN` to your real domain before running these commands. If UFW is enabled, allow web traffic with `sudo ufw allow 'Nginx Full'`. Do not open port 28888 publicly.

Verify externally from your PC:

```powershell
curl.exe https://games.example.com/api/native/status
```

You should receive JSON over HTTPS.

## 5. Connect game clients

Start a place in Play mode. In the Multiplayer panel, enter `https://games.example.com` in Server and the same Room code on each client, then click **Connect**. Room codes are not passwords; anyone who knows a code can join.

The server relays player presence and positions. Physics, scripts, world edits, and hit validation still run locally on each client; this version is not authoritative and is unsuitable for competitive or untrusted gameplay. It uses HTTP polling, so no WebSocket proxy configuration is needed.

## Maintenance

```bash
sudo systemctl restart conblox
sudo journalctl -u conblox -f
```

Places are stored in `/opt/conblox/places`. Back up this directory before updating the server files.

Useful service commands:

```bash
sudo systemctl restart conblox
sudo journalctl -u conblox -f
```

The service stores places in `/opt/conblox/places`. Back up this directory before updating the checkout and rerunning the installer.

## Join a room

Launch a place in Play mode. In the Multiplayer panel, enter the public HTTPS URL and the same room code on each client, then choose Connect. Clients exchange player positions and render remote avatars. Room codes are not passwords; anyone who knows a code can join.

This first multiplayer implementation synchronizes player presence and movement only. Physics, scripts, world changes, and hit validation still run locally on each client; do not use it for competitive or untrusted gameplay.

## Build a Windows game

On Windows, install Python 3 and run:

```powershell
python -m pip install -r requirements-build.txt
python build_game.py places\baseplate.cblx
```

The standalone executable is written to `builds/`. In Studio, use **File > Export Game (.exe)** to export the currently edited place. The exported game starts directly in Play mode and includes its place and runtime. The executable requires a browser installed on the Windows machine. To use multiplayer, enter this server's HTTPS URL and a shared room code in the in-game panel.
