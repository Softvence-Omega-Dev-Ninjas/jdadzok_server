#!/bin/bash

# Zero Downtime Deployment Script
# Usage: ./deploy.sh --version <version> | --rollback | status

set -euo pipefail

# ================================
# Configurable (from env vars)
# ================================
PACKAGE_NAME="${PACKAGE_NAME:?PACKAGE_NAME not set}"
DOCKER_USERNAME="${DOCKER_USERNAME:?DOCKER_USERNAME not set}"
PACKAGE_VERSION="${PACKAGE_VERSION:-latest}"
PORT="${PORT:-5056}"
BASE_URL="${BASE_URL:-http://localhost}"
HEALTH_ENDPOINT="${HEALTH_ENDPOINT:-$BASE_URL:$PORT/}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-15}"
HEALTH_RETRIES="${HEALTH_RETRIES:-6}"
VERSION_FILE="./deployment_versions.txt"

# ================================
# Colors
# ================================
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

log()  { echo -e "${BLUE}[INFO]${NC} $*"; }
ok()   { echo -e "${GREEN}[OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERR]${NC} $*"; }

# ================================
# Helpers
# ================================
usage() {
  echo "Usage: $0 --version <version> | --rollback | status"
  exit 1
}

current_version() {
  docker ps --filter "name=${PACKAGE_NAME}_api" --format "{{.Image}}" | cut -d':' -f2 | head -n1 || echo "none"
}

previous_version() {
  [ -f "$VERSION_FILE" ] && tail -n 2 "$VERSION_FILE" | head -n1 || echo "none"
}

save_version() {
  echo "$1" >> "$VERSION_FILE"
  tail -n 10 "$VERSION_FILE" > "${VERSION_FILE}.tmp" && mv "${VERSION_FILE}.tmp" "$VERSION_FILE"
}

health_check() {
  local container=$1 attempt=1
  log "Checking health of $container @ $HEALTH_ENDPOINT"
  while [ $attempt -le "$HEALTH_RETRIES" ]; do
    if ! docker ps --format "{{.Names}}" | grep -q "^$container$"; then
      err "Container $container not running"; return 1
    fi
    if curl -fs --connect-timeout 5 --max-time 10 "$HEALTH_ENDPOINT" | grep -q '"status":"ok"'; then
      ok "Container $container is healthy"; return 0
    fi
    warn "Attempt $attempt/$HEALTH_RETRIES failed, retrying in ${HEALTH_TIMEOUT}s..."
    sleep "$HEALTH_TIMEOUT"
    attempt=$((attempt+1))
  done
  err "Health check failed"; return 1
}

cleanup() {
  local c=$1
  if docker ps -a --format "{{.Names}}" | grep -q "^$c$"; then
    log "Stopping/removing $c"
    docker stop "$c" || true
    docker rm "$c" || true
  fi
}

rollback() {
  local cur=$(current_version)
  local prev=$(previous_version)
  [ "$prev" = "none" ] && { err "No previous version"; return 1; }
  warn "Rolling back $cur → $prev"
  cleanup "${PACKAGE_NAME}_api"
  deploy "$prev"
}

deploy() {
  local v="${1:?No version specified}"  # ensures v is never empty
  local image="${DOCKER_USERNAME}/${PACKAGE_NAME}:${v}"
  local new="${PACKAGE_NAME}_api"
  local old="${PACKAGE_NAME}_api_old"

  log "Deploying version $v (image=$image)"

  # Pull from registry or build locally
  if ! docker pull "$image"; then
    warn "Image not found in registry, building with docker compose..."
    [ -f .env ] && sed -i "s/^PACKAGE_VERSION=.*/PACKAGE_VERSION=$v/" .env
    docker compose --profile prod up -d app || { err "Local build failed"; return 1; }
    save_version "$v"
    return 0
  fi

  # Rename running container → old
  if docker ps --format "{{.Names}}" | grep -q "^$new$"; then
    log "Renaming $new → $old"
    docker rename "$new" "$old" || true
  fi

  # Run new container
  docker run -d --name "$new" -p "$PORT:$PORT" --env-file .env "$image"

  sleep 10
  if health_check "$new"; then
    cleanup "$old"
    save_version "$v"
    ok "Deployment $v successful"
  else
    err "New version unhealthy, rolling back..."
    cleanup "$new"
    if docker ps -a --format "{{.Names}}" | grep -q "^$old$"; then
      log "Restoring $old → $new"
      docker rename "$old" "$new"
      docker start "$new"
      sleep 5
    fi
    return 1
  fi
}

status() {
  echo "=== Deployment Status ==="
  echo "Current: $(current_version)"
  echo "Previous: $(previous_version)"
  echo "Containers:"
  docker ps --filter "name=${PACKAGE_NAME}" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
  echo "Health:"
  curl -fs "$HEALTH_ENDPOINT" | grep -q '"status":"ok"' && echo "✅ ok" || echo "❌ fail"
  [ -f "$VERSION_FILE" ] && { echo "History:"; tail -n5 "$VERSION_FILE" | nl -s'. '; }
}

# ================================
# CLI entrypoint
# ================================
case "${1:-}" in
  --version)
    if [ -z "${2:-}" ]; then
      usage
    fi
    deploy "$2"
    ;;
  --rollback)
    rollback
    ;;
  status)
    status
    ;;
  *)
    usage
    ;;
esac
