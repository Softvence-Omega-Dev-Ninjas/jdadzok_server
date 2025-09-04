#!/bin/bash

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_TIMEOUT=300  # 5 minutes
HEALTH_CHECK_TIMEOUT=120  # 2 minutes
ROLLBACK_ON_FAILURE=true
DOCKER_REGISTRY=${DOCKER_REGISTRY:-""}

# Parse command line arguments
NEW_VERSION=""
FORCE_DEPLOY=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --version)
      NEW_VERSION="$2"
      shift 2
      ;;
    --force)
      FORCE_DEPLOY=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--version VERSION] [--force] [--dry-run]"
      exit 1
      ;;
  esac
done

# Function to log with timestamp
log() {
  echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to get package info
get_package_info() {
  if [ ! -f "package.json" ]; then
    error "package.json not found!"
    exit 1
  fi
  
  PACKAGE_NAME=$(jq -r '.name' package.json)
  if [ -z "$NEW_VERSION" ]; then
    PACKAGE_VERSION=$(jq -r '.version' package.json)
  else
    PACKAGE_VERSION="$NEW_VERSION"
  fi
  
  log "Package: $PACKAGE_NAME"
  log "Version: $PACKAGE_VERSION"
}

# Function to check if Docker image exists locally or remotely
check_image_exists() {
  local image_tag="$1"
  
  # Check locally first
  if docker image inspect "$image_tag" >/dev/null 2>&1; then
    log "Image $image_tag found locally"
    return 0
  fi
  
  # Check remotely if registry is configured
  if [ -n "$DOCKER_REGISTRY" ]; then
    if docker manifest inspect "$image_tag" >/dev/null 2>&1; then
      log "Image $image_tag found in registry"
      return 0
    fi
  fi
  
  return 1
}

# Function to get current running container
get_current_container() {
  docker ps --filter "name=${PACKAGE_NAME}-api" --format "{{.Names}}" | head -n1
}

# Function to get current running image
get_current_image() {
  local container_name=$(get_current_container)
  if [ -n "$container_name" ]; then
    docker inspect "$container_name" --format='{{.Config.Image}}' 2>/dev/null || echo ""
  else
    echo ""
  fi
}

# Function to run health check
run_health_check() {
  local endpoint="$1"
  log "Running health check against: $endpoint"
  
  if [ "$DRY_RUN" = true ]; then
    log "DRY RUN: Would run health check"
    return 0
  fi
  
  # Set health endpoint for the script
  HEALTH_ENDPOINT="$endpoint" timeout $HEALTH_CHECK_TIMEOUT node scripts/health-check.js
}

# Function to perform rollback
rollback() {
  local previous_image="$1"
  
  if [ -z "$previous_image" ]; then
    error "No previous image to rollback to!"
    return 1
  fi
  
  warning "Rolling back to previous version: $previous_image"
  
  if [ "$DRY_RUN" = true ]; then
    log "DRY RUN: Would rollback to $previous_image"
    return 0
  fi
  
  # Update docker-compose to use previous image
  export DOCKER_USERNAME="${DOCKER_REGISTRY%/*}"
  export PACKAGE_NAME="$PACKAGE_NAME"
  export PACKAGE_VERSION="${previous_image##*:}"
  
  # Deploy previous version
  docker-compose up -d --no-deps server
  
  # Wait a bit for container to start
  sleep 10
  
  # Check health of rolled-back version
  if run_health_check "http://localhost:5055/api/health"; then
    success "Rollback completed successfully!"
    return 0
  else
    error "Rollback also failed! Manual intervention required."
    return 1
  fi
}

# Main deployment function
deploy() {
  log "Starting deployment process..."
  
  # Get package information
  get_package_info
  
  # Determine image names
  if [ -n "$DOCKER_REGISTRY" ]; then
    NEW_IMAGE="${DOCKER_REGISTRY}/${PACKAGE_NAME}:${PACKAGE_VERSION}"
    STABLE_IMAGE="${DOCKER_REGISTRY}/${PACKAGE_NAME}:stable"
  else
    NEW_IMAGE="${PACKAGE_NAME}:${PACKAGE_VERSION}"
    STABLE_IMAGE="${PACKAGE_NAME}:stable"
  fi
  
  # Get current running image for potential rollback
  CURRENT_IMAGE=$(get_current_image)
  log "Current running image: ${CURRENT_IMAGE:-"none"}"
  
  # Check if new image exists
  if ! check_image_exists "$NEW_IMAGE"; then
    error "Image $NEW_IMAGE not found! Please build and push the image first."
    exit 1
  fi
  
  log "Deploying new version: $NEW_IMAGE"
  
  if [ "$DRY_RUN" = true ]; then
    log "DRY RUN: Would deploy $NEW_IMAGE"
    log "DRY RUN: Current image that would be used for rollback: ${CURRENT_IMAGE:-"none"}"
    exit 0
  fi
  
  # Update environment variables for docker-compose
  export DOCKER_USERNAME="${DOCKER_REGISTRY%/*}"
  export PACKAGE_NAME="$PACKAGE_NAME"
  export PACKAGE_VERSION="$PACKAGE_VERSION"
  
  # Deploy new version (this will create a new container alongside the old one temporarily)
  log "Deploying new container..."
  docker-compose up -d --no-deps server
  
  # Wait for container to start
  log "Waiting for new container to start..."
  sleep 15
  
  # Run health check
  log "Performing health check on new deployment..."
  if run_health_check "http://localhost:5055/api/health"; then
    success "New deployment is healthy!"
    
    # Tag as stable if health check passes
    if [ -n "$DOCKER_REGISTRY" ]; then
      log "Tagging new version as stable..."
      docker tag "$NEW_IMAGE" "$STABLE_IMAGE"
      if command -v docker &> /dev/null && [ -n "$DOCKER_REGISTRY" ]; then
        docker push "$STABLE_IMAGE" || warning "Failed to push stable tag to registry"
      fi
    fi
    
    success "Deployment completed successfully! 🚀"
    log "New version $PACKAGE_VERSION is now live"
  else
    error "Health check failed for new deployment!"
    
    if [ "$ROLLBACK_ON_FAILURE" = true ] && [ -n "$CURRENT_IMAGE" ]; then
      rollback "$CURRENT_IMAGE"
    else
      error "Rollback disabled or no previous image available"
      exit 1
    fi
  fi
}

# Function to show current status
show_status() {
  log "Current deployment status:"
  echo
  
  # Show running containers
  echo "Running containers:"
  docker ps --filter "name=${PACKAGE_NAME}" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
  echo
  
  # Show current health
  echo "Health status:"
  if run_health_check "http://localhost:5055/api/health"; then
    success "Server is healthy"
  else
    warning "Server health check failed"
  fi
}

# Main execution
case "${1:-deploy}" in
  "deploy")
    deploy
    ;;
  "status")
    show_status
    ;;
  "health")
    run_health_check "http://localhost:5055/api/health"
    ;;
  "rollback")
    if [ -z "$2" ]; then
      error "Rollback requires an image version: $0 rollback [IMAGE:TAG]"
      exit 1
    fi
    rollback "$2"
    ;;
  *)
    echo "Usage: $0 [deploy|status|health|rollback] [options]"
    echo "  deploy [--version VERSION] [--force] [--dry-run]  - Deploy new version"
    echo "  status                                            - Show current status"
    echo "  health                                           - Run health check only"
    echo "  rollback IMAGE:TAG                               - Rollback to specific image"
    exit 1
    ;;
esac
