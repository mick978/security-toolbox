#!/usr/bin/env bash
# refresh-weekly.sh — orchestrator. Runs the data refresh, commits
# the result if anything changed, rebuilds, and restarts the service.
#
# Designed to be invoked by /etc/cron.d/security-toolbox-weekly on
# the production host. Safe to invoke manually too. Safe to re-run
# mid-week; idempotent.
#
# Required env:
#   GITHUB_PERSONAL_ACCESS_TOKEN   44 repos per run; authed = 4000/h
#   NEXT_PUBLIC_SITE_URL           e.g. http://47.109.63.111:9119
#   REPO_DIR                       path to the git checkout
#                                 (e.g. /opt/security-toolbox/repo)
#   DEPLOY_DIR                     path to the Next standalone dir
#                                 (e.g. /opt/security-toolbox/standalone)
#   LOG_FILE                       (optional) /var/log/security-toolbox-refresh.log
set -euo pipefail

: "${GITHUB_PERSONAL_ACCESS_TOKEN:?GITHUB_PERSONAL_ACCESS_TOKEN must be set}"
: "${NEXT_PUBLIC_SITE_URL:?NEXT_PUBLIC_SITE_URL must be set}"
: "${REPO_DIR:?REPO_DIR must be set, e.g. /opt/security-toolbox/repo}"
: "${DEPLOY_DIR:?DEPLOY_DIR must be set, e.g. /opt/security-toolbox/standalone}"
LOG_FILE="${LOG_FILE:-/var/log/security-toolbox-refresh.log}"

log()  { printf '[%s] %s\n' "$(date -Is)" "$*"; }

cd "$REPO_DIR"

# --- 1) Refresh GitHub project data ----------------------------------
log "Refreshing lib/github-projects.ts"
GITHUB_PERSONAL_ACCESS_TOKEN="$GITHUB_PERSONAL_ACCESS_TOKEN" \
  node scripts/refresh-github-projects.mjs \
  || { log "refresh failed (exit $?) — aborting without deploy"; exit 1; }

# --- 2) Discover new candidates (best-effort) -------------------------
# A 4xx/5xx here MUST NOT block the deploy; the refresh above is the
# safety-critical path. Discovery is informational only.
if GITHUB_PERSONAL_ACCESS_TOKEN="$GITHUB_PERSONAL_ACCESS_TOKEN" \
     node scripts/discover-new-projects.mjs 2>>"$LOG_FILE"; then
  log "discovery wrote scripts/discover-new-projects.md"
else
  log "discovery failed (non-fatal)"
fi

# --- 3) Stage + commit (only if there is a real diff) ----------------
if git diff --quiet -- lib/github-projects.ts; then
  log "no changes in lib/github-projects.ts — skipping build/restart"
  exit 0
fi

git add lib/github-projects.ts scripts/discover-new-projects.md
if ! git -c user.name=refresh-bot -c user.email=refresh-bot@local \
        commit -m "chore(data): weekly GitHub project refresh" \
        >>"$LOG_FILE" 2>&1; then
  log "commit failed — leaving tree dirty for human review"
  exit 1
fi
# We deliberately do NOT push to origin: the secbox host has no
# deploy key.  The local commit exists so `git log -p` on the
# server is auditable.  Pushing is a separate concern (see
# docs/superpowers/specs/2026-07-25-weekly-content-refresh-design.md).
log "committed refresh"

# --- 4) Build ---------------------------------------------------------
log "npm run build (this takes ~3 min on the prod box)"
NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" npm run build \
  >>"$LOG_FILE" 2>&1 \
  || { log "build failed — last 40 log lines:"; tail -40 "$LOG_FILE" || true; exit 1; }

# --- 5) Ship new standalone + static into the running service --------
log "publishing build to $DEPLOY_DIR"
# blue-green: stash current as .bak, drop in new
rm -rf "$DEPLOY_DIR/.bak" 2>/dev/null || true
mv "$DEPLOY_DIR" "$DEPLOY_DIR.bak" 2>/dev/null || true
mkdir -p "$DEPLOY_DIR"
cp -r .next/standalone/. "$DEPLOY_DIR"/
mkdir -p "$DEPLOY_DIR/.next"
cp -r .next/static "$DEPLOY_DIR/.next/static"
rm -rf "$DEPLOY_DIR.bak"

systemctl restart security-toolbox
log "service restarted; sleeping 3s for health"
sleep 3
code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:3000/" || echo 000)
if [[ "$code" == "200" || "$code" == "307" ]]; then
  log "health OK (HTTP $code)"
else
  log "health FAILED (HTTP $code) — check journalctl -u security-toolbox"
  exit 1
fi
log "done"
