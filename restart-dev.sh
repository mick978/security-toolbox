#!/bin/bash
# Dev server restart with new project data.
# This is safer than `kill && npm run dev` because it isolates each step,
# and you can paste the failure of any step back to me.
set -e

cd "$(dirname "$0")"

echo "→ step 1: kill any existing next-server on port 3000"
lsof -ti:3000 | xargs -r kill -9 2>/dev/null || true
sleep 1

echo "→ step 2: confirm port 3000 is free"
if lsof -i :3000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "ERROR: port 3000 still busy"
  exit 1
fi

echo "→ step 3: launch next dev in background on port 3000"
rm -rf .next 2>/dev/null || true
nohup npx next dev -p 3000 > /tmp/sec-toolbox-dev.log 2>&1 &
DEV_PID=$!
echo "dev server started, pid=$DEV_PID"
echo "logs: /tmp/sec-toolbox-dev.log"
echo "URL:  http://localhost:3000"
echo ""
echo "→ step 4: wait for 'Ready in' marker (max 30s)"
for i in $(seq 1 30); do
  if grep -q "Ready in" /tmp/sec-toolbox-dev.log 2>/dev/null; then
    echo "✓ dev server ready"
    grep -E "Ready|Local:|Network:" /tmp/sec-toolbox-dev.log
    echo ""
    echo "verify new data at:"
    echo "  http://localhost:3000/agents     (should show AIOpsLab/goose/robusta/keep/mantis)"
    echo "  http://localhost:3000/mcp        (should show kubernetes/terraform/grafana/aws/cloudflare/gcp/github/last9/awesome-mcp-servers)"
    echo "  http://localhost:3000/network    (skillProjects added pagerduty-ir)"
    exit 0
  fi
  sleep 1
done

echo "✗ dev server did not become ready in 30s. Last log lines:"
tail -30 /tmp/sec-toolbox-dev.log
exit 1
