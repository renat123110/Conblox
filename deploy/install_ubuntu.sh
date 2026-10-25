#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
    echo "Run this installer with sudo: sudo bash deploy/install_ubuntu.sh" >&2
    exit 1
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
INSTALL_DIR=/opt/conblox

apt-get update
apt-get install -y python3
if ! getent passwd conblox >/dev/null; then
    useradd --system --home-dir "${INSTALL_DIR}" --no-create-home --shell /usr/sbin/nologin conblox
fi

install -d -o conblox -g conblox "${INSTALL_DIR}" "${INSTALL_DIR}/places"
cp -a "${SCRIPT_DIR}/app" "${SCRIPT_DIR}/server.py" "${SCRIPT_DIR}/places" "${INSTALL_DIR}/"
chown -R conblox:conblox "${INSTALL_DIR}"
install -m 0644 "${SCRIPT_DIR}/deploy/conblox.service" /etc/systemd/system/conblox.service
systemctl daemon-reload
systemctl enable --now conblox.service

echo "Conblox is running on 127.0.0.1:28888. Configure HTTPS reverse proxy before exposing it publicly."
