#!/bin/bash

# Zero-downtime deployment script
# Usage: ./deploy.sh --version 1.2.3
# Usage: ./deploy.sh status
# Usage: ./deploy.sh rollback

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Load environment variables
if [ -f .env ]; then
    source .env
else
    log_error ".env file not found!"
    exit 1
fi

# Default values
COMPOSE_PROJECT_NAME="${PACKAGE_NAME}"
NEW_VERSION=""
HEALTH_CHECK_URL="http://localhost:5055/health"
HEALTH_CHECK_TIMEOUT=60
ROLLBACK_TAG=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --version)
            NEW_VERSION="$2"
            shift 2
            ;;
        status)
            ACTION="status"
            shift
            ;;
        rollback)
            ACTION="rollback"
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS] [ACTION]"
            echo "Options:"
            echo "  --version VERSION    Deploy specific version"
            echo "Actions:"
            echo "  status              Show deployment status"
            echo "  rollback            Rollback to previous version"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Function to check if container is healthy
check_container_health() {
    local container_name=$1
    local timeout=${2:-30}
    local count=0
    
    log_info "Checking health of container: $container_name"
    
    while [ $count -lt $timeout ]; do
        if docker ps --format "table {{.Names}}\t{{.Status}}" | grep "$container_name" | grep -q "Up"; then
            log_success "Container $container_name is running"
            return 0
        fi
        
        sleep 2
        count=$((count + 2))
        echo -n "."
    done
    
    echo ""
    log_error "Container $container_name failed to start within $timeout seconds"
    return 1
}

# Function to check application health endpoint
check_app_health() {
    local url=$1
    local timeout=${2:-60}
    local count=0
    
    log_info "Checking application health at: $url"
    
    while [ $count -lt $timeout ]; do
        if curl -f -s "$url" >/dev/null 2>&1; then
            log_success "Application health check passed"
            return 0
        fi
        
        sleep 2
        count=$((count + 2))
        echo -n "."
    done
    
    echo ""
    log_warning "Application health check failed or timed out"
    return 1
}

# Function to perform zero-downtime deployment
deploy() {
    local version=$1
    
    if [ -z "$version" ]; then
        log_error "Version is required for deployment"
        exit 1
    fi
    
    log_info "Starting zero-downtime deployment for version: $version"
    
    # Check if docker-compose.yaml exists
    if [ ! -f docker-compose.yaml ]; then
        log_error "docker-compose.yaml not found!"
        exit 1
    fi
    
    # Save current version for potential rollback
    CURRENT_CONTAINERS=$(docker ps --filter "name=${COMPOSE_PROJECT_NAME}" --format "{{.Image}}" | head -1)
    if [ -n "$CURRENT_CONTAINERS" ]; then
        log_info "Current version: $CURRENT_CONTAINERS"
        echo "$CURRENT_CONTAINERS" > .last_version
    fi
    
    # Set new version in environment
    export PACKAGE_VERSION="$version"
    
    # Pull new images
    log_info "Pulling new images..."
    if ! docker compose --profile prod pull; then
        log_error "Failed to pull new images"
        exit 1
    fi
    
    # Check if this is the first deployment
    if ! docker ps --filter "name=${COMPOSE_PROJECT_NAME}" --format "{{.Names}}" | grep -q "${COMPOSE_PROJECT_NAME}"; then
        log_info "First deployment detected, starting services..."
        docker compose --profile prod up -d
        
        # Wait for containers to start
        sleep 10
        
        # Check container health
        if ! check_container_health "${COMPOSE_PROJECT_NAME}_app"; then
            log_error "Initial deployment failed"
            docker compose --profile prod logs
            exit 1
        fi
        
        # Check application health
        if check_app_health "$HEALTH_CHECK_URL"; then
            log_success "Initial deployment successful!"
        else
            log_warning "Deployment completed but health check failed"
        fi
        
        return 0
    fi
    
    # Zero-downtime update for existing deployment
    log_info "Performing zero-downtime update..."
    
    # Scale up with new version
    log_info "Scaling up new version..."
    docker compose --profile prod up -d --scale app=2 --no-recreate
    
    # Wait for new containers to be ready
    sleep 15
    
    # Get new container
    NEW_CONTAINER=$(docker ps --filter "name=${COMPOSE_PROJECT_NAME}_app" --format "{{.Names}}" | grep -v "_1$" | head -1)
    
    if [ -z "$NEW_CONTAINER" ]; then
        log_error "Failed to create new container"
        exit 1
    fi
    
    # Check if new container is healthy
    if ! check_container_health "$NEW_CONTAINER" 30; then
        log_error "New container failed health check, rolling back..."
        docker stop "$NEW_CONTAINER" || true
        docker rm "$NEW_CONTAINER" || true
        exit 1
    fi
    
    # Test application health on new container
    log_info "Testing new version..."
    if check_app_health "$HEALTH_CHECK_URL" 30; then
        log_success "New version is healthy, proceeding with switch..."
        
        # Stop old container
        OLD_CONTAINER="${COMPOSE_PROJECT_NAME}_app_1"
        if docker ps --format "{{.Names}}" | grep -q "$OLD_CONTAINER"; then
            log_info "Stopping old container: $OLD_CONTAINER"
            docker stop "$OLD_CONTAINER"
            docker rm "$OLD_CONTAINER"
        fi
        
        # Scale back to 1
        docker compose --profile prod up -d --scale app=1
        
        log_success "Zero-downtime deployment completed successfully!"
        
    else
        log_error "New version failed health check, rolling back..."
        docker stop "$NEW_CONTAINER" || true
        docker rm "$NEW_CONTAINER" || true
        exit 1
    fi
}

# Function to show deployment status
show_status() {
    log_info "=== Deployment Status ==="
    
    echo ""
    echo "📦 Project: $COMPOSE_PROJECT_NAME"
    echo "🏷️  Current Version: $PACKAGE_VERSION"
    echo ""
    
    echo "🐳 Containers:"
    if docker ps --filter "name=${COMPOSE_PROJECT_NAME}" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" | grep -q "$COMPOSE_PROJECT_NAME"; then
        docker ps --filter "name=${COMPOSE_PROJECT_NAME}" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
    else
        echo "No containers running"
    fi
    
    echo ""
    echo "🏥 Health Check:"
    if check_app_health "$HEALTH_CHECK_URL" 5; then
        log_success "Application is healthy"
    else
        log_warning "Application health check failed"
    fi
    
    echo ""
    echo "💾 Docker Images:"
    docker images --filter "reference=${DOCKER_USERNAME}/${PACKAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
}

# Function to rollback to previous version
rollback() {
    if [ ! -f .last_version ]; then
        log_error "No previous version found for rollback"
        exit 1
    fi
    
    ROLLBACK_IMAGE=$(cat .last_version)
    log_info "Rolling back to: $ROLLBACK_IMAGE"
    
    # Extract version from image tag
    ROLLBACK_VERSION=$(echo "$ROLLBACK_IMAGE" | cut -d':' -f2)
    
    if [ -z "$ROLLBACK_VERSION" ]; then
        log_error "Could not extract version from rollback image"
        exit 1
    fi
    
    # Perform rollback deployment
    deploy "$ROLLBACK_VERSION"
}

# Main execution
case "${ACTION:-deploy}" in
    "status")
        show_status
        ;;
    "rollback")
        rollback
        ;;
    "deploy"|*)
        if [ -z "$NEW_VERSION" ]; then
            log_error "Version is required. Use --version flag"
            exit 1
        fi
        deploy "$NEW_VERSION"
        ;;
esac