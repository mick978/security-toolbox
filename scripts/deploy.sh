#!/usr/bin/env bash
# security-toolbox one-shot deployer
#   local: npm run build -> tar standalone+static
#   remote: unpack -> systemd -> nginx reverse proxy -> health check
#
# Usage:
#   SSH_HOST=secbox ./scripts/deploy.sh                 # uses ~/.ssh/config Host secbox
#   SSH_HOST=root@1.2.3.4 PORT=9119 ./scripts/deploy.sh # ad-hoc

set -euo pipefail

# ---------- config ----------
SSH_HOST="${SSH_HOST:-secbox}"          # ~/.ssh/config Host, or user@ip
REMOTE_DIR="${REMOTE_DIR:-/opt/security-toolbox}"
SERVICE_NAME="${SERVICE_NAME:-security-toolbox}"
INTERNAL_PORT="${INTERNAL_PORT:-3000}"  # Next.js standalone listens here
PUBLIC_PORT="${PUBLIC_PORT:-9119}"      # nginx exposes this
NODE_BIN="${NODE_BIN:-/usr/bin/node}"   # remote node path

# B1 auth env (required)
: "${AUTH_USERS:?AUTH_USERS must be set, e.g. admin:pw1,guest:pw2}"
: "${AUTH_SECRET:?AUTH_SECRET must be set (64 hex chars)}"
AUTH_TTL_HOURS="${AUTH_TTL_HOURS:-168}"

HERE="$(cd "$(dirname "$0")/.." && pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
TARBALL="/tmp/security-toolbox-${STAMP}.tar.gz"

log()  { printf '\033[1;36m[deploy]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[fail ]\033[0m %s\n' "$*" >&2; exit 1; }

# ---------- 1) local build (skipped if SKIP_LOCAL_BUILD=1) ----------
if [[ "${SKIP_LOCAL_BUILD:-0}" == "1" ]]; then
  log "SKIP_LOCAL_BUILD=1 — assume .next/standalone + .next/static already built"
else
  log "building (standalone) in $HERE"
  cd "$HERE"
  npm run build >/dev/null
fi

[[ -d .next/standalone ]] || fail ".next/standalone missing — check next.config.mjs output:'standalone'"
[[ -d .next/static     ]] || fail ".next/static missing"

# ---------- 2) pack ----------
log "packing -> $TARBALL"
tar -czf "$TARBALL" \
  -C .next standalone static \
  -C "$HERE" public 2>/dev/null || \
tar -czf "$TARBALL" -C .next standalone static
BYTES=$(wc -c <"$TARBALL")
log "tarball ${BYTES} bytes"

# ---------- 3) ship ----------
log "scp -> ${SSH_HOST}:/tmp/"
scp -q "$TARBALL" "${SSH_HOST}:/tmp/"

# ---------- 4) remote install ----------
log "remote install on ${SSH_HOST}"
ssh "$SSH_HOST" bash -s -- \
  "$REMOTE_DIR" "$SERVICE_NAME" "$INTERNAL_PORT" "$PUBLIC_PORT" "$NODE_BIN" "$STAMP" \
  "$AUTH_USERS" "$AUTH_SECRET" "$AUTH_TTL_HOURS" <<'REMOTE'
set -euo pipefail
REMOTE_DIR="$1"; SERVICE_NAME="$2"; INTERNAL_PORT="$3"; PUBLIC_PORT="$4"; NODE_BIN="$5"; STAMP="$6"
AUTH_USERS="$7"; AUTH_SECRET="$8"; AUTH_TTL_HOURS="$9"
TARBALL="/tmp/security-toolbox-${STAMP}.tar.gz"

# unpack (blue-green light: keep prev as .bak)
mkdir -p "$REMOTE_DIR"
if [[ -d "$REMOTE_DIR/standalone" ]]; then
  rm -rf "$REMOTE_DIR/.bak"
  mv "$REMOTE_DIR/standalone" "$REMOTE_DIR/.bak" 2>/dev/null || true
fi
tar -xzf "$TARBALL" -C "$REMOTE_DIR"
# next standalone expects .next/static next to server.js
mkdir -p "$REMOTE_DIR/standalone/.next"
cp -r "$REMOTE_DIR/static" "$REMOTE_DIR/standalone/.next/static"

# systemd unit (idempotent write)
cat >/etc/systemd/system/${SERVICE_NAME}.service <<UNIT
[Unit]
Description=security-toolbox (Next.js standalone)
After=network.target

[Service]
Type=simple
WorkingDirectory=${REMOTE_DIR}/standalone
Environment=NODE_ENV=production
Environment=PORT=${INTERNAL_PORT}
Environment=HOSTNAME=127.0.0.1
Environment=RATE_LIMIT_DISABLED=1
Environment="AUTH_USERS=${AUTH_USERS}"
Environment="AUTH_SECRET=${AUTH_SECRET}"
Environment=AUTH_TTL_HOURS=${AUTH_TTL_HOURS}
Environment=AUTH_COOKIE_INSECURE=1
ExecStart=${NODE_BIN} server.js
Restart=always
RestartSec=3
User=root

[Install]
WantedBy=multi-user.target
UNIT

# nginx reverse proxy (idempotent)
NG=/etc/nginx/conf.d/${SERVICE_NAME}.conf
cat >"$NG" <<NGINX
server {
  listen ${PUBLIC_PORT};
  server_name _;

  location / {
    proxy_pass http://127.0.0.1:${INTERNAL_PORT};
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
NGINX

nginx -t
systemctl daemon-reload
systemctl enable --now "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"
systemctl reload nginx || systemctl restart nginx

# health probe (B1: unauth "/" now 307→/login; that's healthy)
sleep 1
for i in 1 2 3 4 5; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${INTERNAL_PORT}/") || code=000
  [[ "$code" == "307" || "$code" == "200" ]] && { echo "[remote] health OK ($code)"; break; }
  sleep 1
done
[[ "$code" == "307" || "$code" == "200" ]] || { echo "[remote] health FAIL — last=$code"; journalctl -u "$SERVICE_NAME" -n 40 --no-pager; exit 1; }

# extra: /login must return 200
login_code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${INTERNAL_PORT}/login") || login_code=000
[[ "$login_code" == "200" ]] || { echo "[remote] /login FAIL — code=$login_code"; journalctl -u "$SERVICE_NAME" -n 40 --no-pager; exit 1; }
echo "[remote] /login OK ($login_code)"

rm -f "$TARBALL"
REMOTE

rm -f "$TARBALL"
log "deployed. public: http://<your-host>:${PUBLIC_PORT}/"
