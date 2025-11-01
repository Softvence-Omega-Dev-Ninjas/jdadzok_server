#!/usr/bin/env bash

# - Checks containers for health & status
# - Scans logs for runtime errors or DB issues
# - Restarts and alerts via Telegram if issues found
# - Injects cron job automatically if missing

TELEGRAM_BOT_TOKEN="8351549818:AAH_uWxbozXjEIO8xPpQN7AmgH9DDi59n6Y"
TELEGRAM_CHAT_ID="-4935731807"
LOG_FILE="/var/log/docker-monitor.log"
CHECK_INTERVAL_MINUTES=30
SCRIPT_PATH="$(realpath "$0")"
CRON_ENTRY="*/${CHECK_INTERVAL_MINUTES} * * * * bash $SCRIPT_PATH >> /var/log/docker-monitor.log 2>&1"
LOG_SCAN_LIMIT=200



# send telegram alert message
send_alert() {
  local message="$1"
  curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
       -d "chat_id=${TELEGRAM_CHAT_ID}" \
       -d "text=${message}" \
       -d "parse_mode=Markdown"
}

log() {
  local msg="$1"
  echo "$(date '+%Y-%m-%d %H:%M:%S') | ${msg}" | tee -a "$LOG_FILE"
}


ensure_cron_job() {
  if crontab -l 2>/dev/null | grep -Fq "$SCRIPT_PATH"; then
    log "🧩 Crontab already exists."
  else
    log "🧠 Injecting crontab job..."
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    if [[ $? -eq 0 ]]; then
      log "✅ Crontab added."
      send_alert "🧩 *Docker Monitor Installed* on $(hostname)
⏰ Runs every ${CHECK_INTERVAL_MINUTES} mins"
    else
      log "❌ Failed to inject cron job."
      send_alert "❌ Cron job injection failed on $(hostname)"
      exit 1
    fi
  fi
}
# ---------------------------------------------------------------


# ------------------ FUNCTION: Check Container Logs -------------
check_logs_for_errors() {
  local container="$1"
  local logs
  logs=$(docker logs --tail "$LOG_SCAN_LIMIT" "$container" 2>/dev/null)

  # Common error keywords (customize per stack)
  local patterns=("error" "fatal" "exception" "prismaclientknownrequesterror" "relation .* does not exist" "connection refused" "database system is shut down")

  for pattern in "${patterns[@]}"; do
    if echo "$logs" | grep -iE "$pattern" >/dev/null; then
      log "❗ Detected error in logs of '$container': pattern '$pattern'"
      send_alert "🚨 *Error found in container logs:* \`$container\`
Pattern: \`$pattern\`
Host: *$(hostname)*

⚙️ Action: Restarting container..."
      docker restart "$container" >/dev/null 2>&1
      log "🔁 Restarted container '$container' due to log errors."
      return 1
    fi
  done
  return 0
}


monitor_containers() {
  log "🔍 Checking Docker containers..."
  containers=$(docker ps -a --format "{{.Names}}")

  if [[ -z "$containers" ]]; then
    log "⚠️ No containers found."
    send_alert "⚠️ *No Docker containers found* on $(hostname)"
    return
  fi

  for container in $containers; do
    status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null)
    health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "unknown")

    if [[ "$status" != "running" ]]; then
      log "❌ '$container' is $status. Restarting..."
      docker restart "$container" >/dev/null 2>&1
      send_alert "🚨 *Container:* \`$container\`
Status: \`$status\`
🔁 Restarted on *$(hostname)*"
      continue
    fi

    # Check unhealthy status
    if [[ "$health" == "unhealthy" ]]; then
      log "⚠️ '$container' is unhealthy. Restarting..."
      docker restart "$container" >/dev/null 2>&1
      send_alert "⚠️ *Unhealthy container:* \`$container\`
Health: \`$health\`
🔁 Restarted on *$(hostname)*"
      continue
    fi

    # Now check logs for application/db issues
    check_logs_for_errors "$container"
    if [[ $? -eq 0 ]]; then
      log "✅ '$container' is healthy and logs are clean."
    fi
  done

  log "✅ Container check cycle completed."
}

setup_and_run() {
  if ! command -v docker &>/dev/null; then
    log "❌ Docker not found."
    send_alert "❌ Docker not installed on $(hostname)"
    exit 1
  fi

  ensure_cron_job
  monitor_containers
}


setup_and_run
send_alert "🚀 *Docker Monitor Installed* on $(hostname)"