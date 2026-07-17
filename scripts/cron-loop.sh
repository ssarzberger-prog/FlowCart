#!/usr/bin/env bash
# Background cron loop: polls /api/cron/abandoned-carts every 15 minutes
# and writes pending emails to /tmp/pending-abandoned-emails.json for the agent.
#
# Usage: bash scripts/cron-loop.sh &
# The loop runs forever, sleeping 900s between checks.

set -euo pipefail

BASE_URL="${CRON_BASE_URL:-http://localhost:3000}"
CRON_ENDPOINT="$BASE_URL/api/cron/abandoned-carts"
PENDING_FILE="/tmp/pending-abandoned-emails.json"

echo "[cron-loop] Starting abandoned cart scheduler (every 15 min)"
echo "[cron-loop] Endpoint: $CRON_ENDPOINT"

while true; do
  echo "[cron-loop] $(date -u +%Y-%m-%dT%H:%M:%SZ) Checking..."

  RESPONSE=$(curl -sf "$CRON_ENDPOINT" 2>&1) || {
    echo "[cron-loop] Endpoint unreachable: $RESPONSE"
    sleep 60
    continue
  }

  # Save response
  echo "$RESPONSE" > "$PENDING_FILE"

  # Parse and report
  PENDING_COUNT=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('pending',[]).__len__())" 2>/dev/null || echo "?")
  CHECKED=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('checked',0))" 2>/dev/null || echo "?")

  if [ "$PENDING_COUNT" != "0" ] && [ "$PENDING_COUNT" != "?" ]; then
    echo "[cron-loop] 📬 $CHECKED carts checked, $PENDING_COUNT emails pending"
  fi

  # Sleep 15 minutes
  sleep 900
done
