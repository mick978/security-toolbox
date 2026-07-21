# Deploying SecToolbox to `47.109.63.111:9119`

This directory contains everything needed to ship the project to a single
Aliyun-like Linux box that listens on port 9119 directly (no reverse proxy
in front; if you want HTTPS later, put Caddy or nginx in front of this
port).

## One-time setup on the server

```bash
# 1. Create an unprivileged user that runs the service.
sudo useradd --system --shell /usr/sbin/nologin --home /opt/sectoolbox sectoolbox

# 2. Install Node 20+ (use the NodeSource repo on Ubuntu for example).
#    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
#    sudo apt install -y nodejs

# 3. Ship the standalone build (from your dev machine):
#    rsync -avz --delete \
#      tools/security-toolbox/.next/standalone/ \
#      sectoolbox@47.109.63.111:/opt/sectoolbox/
#    rsync -avz tools/security-toolbox/public/ \
#      sectoolbox@47.109.63.111:/opt/sectoolbox/public/
#    rsync -avz tools/security-toolbox/.next/static/ \
#      sectoolbox@47.109.63.111:/opt/sectoolbox/.next/static/

# 4. Ship the env file and edit secrets in place.
#    scp deploy/.env.production sectoolbox@47.109.63.111:/opt/sectoolbox/.env
#    ssh sectoolbox@47.109.63.111 'nano /opt/sectoolbox/.env'   # set AUTH_SECRET etc.

# 5. Install & start the systemd unit.
#    scp deploy/sectoolbox.service sectoolbox@47.109.63.111:/tmp/
#    ssh sectoolbox@47.109.63.111 'sudo mv /tmp/sectoolbox.service /etc/systemd/system/'
#    ssh sectoolbox@47.109.63.111 'sudo systemctl daemon-reload'
#    ssh sectoolbox@47.109.63.111 'sudo systemctl enable --now sectoolbox'

# 6. Confirm it's live.
#    curl -sI http://127.0.0.1:9119/zh | head -3
```

## Verifying the auth posture

```bash
# Public health probe: home page 200s without a login.
curl -sI http://47.109.63.111:9119/zh

# Locked down: /api/exec must reject unauthenticated POSTs.
curl -s -X POST http://47.109.63.111:9119/api/exec/nmap \
  -H 'content-type: application/json' \
  -d '{"args":{}}'
# -> 401 {"ok":false,"error":"unauthenticated"}

# Logging in (replace credentials).
curl -sc cookies.txt -X POST http://47.109.63.111:9119/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"username":"admin","password":"REAL_PASSWORD"}'

# Using the cookie to run a tool.
curl -sb cookies.txt -X POST http://47.109.63.111:9119/api/exec/dig \
  -H 'content-type: application/json' \
  -d '{"args":{"name":"example.com","type":"A","server":"1.1.1.1"}}'
```

## What's running on the host

- **Process**: `node server.js` (Next.js 16 standalone).
- **Listener**: `0.0.0.0:9119`.
- **Working dir**: `/opt/sectoolbox`.
- **Logs**: `journalctl -u sectoolbox -f`.
- **Restart policy**: `Restart=on-failure` with 5s back-off.

## Hardening notes

- `/api/exec/*` requires a valid HMAC-signed session cookie — both at the
  edge (middleware) and inside the route handler (defence in depth).
- The systemd unit uses `ProtectSystem=strict`, `PrivateTmp=true`,
  `NoNewPrivileges=true`. Adjust if you need e.g. networked write paths.
- **Do not** put this server directly on the public internet without
  considering HTTPS termination. Caddy in front of `:9119` is a quick
  way to get auto-issued Let's Encrypt certs.

## Caveats

- The deploy script is deliberately manual; if you grow beyond one host,
  swap for an Ansible role or a Docker image. The source layout (standalone
  build + Node 20) is friendly to either.
- The first build with `npm run build` is heavy (~3–4 min on a small box).
  Run it on the build machine, not on the production server.
