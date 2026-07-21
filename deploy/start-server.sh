#!/usr/bin/env bash
# start-server.sh — boot the Sectoolbox Next.js standalone server.
#
# Designed for systemd / nohup setups. Reads secrets exclusively from the
# .env file in the same directory; never accepts them via CLI args
# because those end up in process listings.
#
# Usage:
#   sudo mkdir -p /opt/sectoolbox
#   sudo rsync -a build/standalone/ /opt/sectoolbox/
#   sudo rsync -a build/public/   /opt/sectoolbox/public/
#   sudo rsync -a build/static/   /opt/sectoolbox/.next/static/
#   sudo cp deploy/.env.production /opt/sectoolbox/.env  # set AUTH_SECRET etc.
#   sudo tee /etc/systemd/system/sectoolbox.service < deploy/sectoolbox.service
#   sudo systemctl daemon-reload
#   sudo systemctl enable --now sectoolbox
#
# After boot, check:
#   curl -sI http://127.0.0.1:9119/en | head -3
#   curl -sI http://127.0.0.1:9119/zh | head -3
set -euo pipefail

cd "$(dirname "$0")/.."

# Load .env *safely*: only export vars that aren't already set, never echo
# values back to the terminal.
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

# Pick a free port if 9119 is already in use.
PORT="${PORT:-9119}"
HOST="${HOST:-0.0.0.0}"

if ! command -v node >/dev/null 2>&1; then
  echo "node not found in PATH; install Node.js 20+ before running." >&2
  exit 1
fi

if [[ ! -f server.js ]]; then
  echo "server.js not found — make sure you're running this from the standalone build root." >&2
  exit 1
fi

echo "[sectoolbox] starting on http://${HOST}:${PORT} …"
exec node server.js
