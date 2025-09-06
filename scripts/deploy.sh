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
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

# Load environment variables
if [ -f .env ]; then
    # Validate .env file format
    while IFS= read -r line; do
        # Skip empty lines and comments
        if [[ -n "$line" && ! "$line" =~ ^# ]]; then
            if [[ ! "$line" =~ ^[A-Z_]+=\".*\"$ ]]; then
                log_error "Invalid .env line: $line"
                exit 1
            fi
        fi
    done < .env
    log_info "Sourcing .env file..."
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

# Function to wait for container to be ready
wait_for_container() {
    local container_name=$1
    local timeout=${2:-60}
    local count=0
    
    log_info "Waiting for container '$container_name' to be ready..."
    
    while [ $count -lt $timeout ]; do
        if docker ps --filter "name=$container_name" --format "{{.Status}}" | grep -q "Up"; then
            # Wait a bit more to ensure the container is really ready
            sleep 5
            log_success "Container '$container_name' is ready"
            return 0
        fi
        
        sleep 2
        count=$((count + 2))
        echo -n "."
    done
    
    echo ""
    log_error "Container '$container_name' failed to be ready within $timeout seconds"
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
        if [ $((count % 10)) -eq 0 ]; then
            echo -n " [$count/${timeout}s]"
        else
            echo -n "."
        fi
    done
    
    echo ""
    log_warning "Application health check failed or timed out"
    return 1
}

# Function to get running containers for the project
get_running_containers() {
    docker ps --filter "name=${COMPOSE_PROJECT_NAME}" --format "{{.Names}}" | sort
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
    log_info "Pulling new images for version $version..."
    if ! docker compose --profile prod pull; then
        log_error "Failed to pull new images"
        exit 1
    fi
    log_success "Images pulled successfully"
    
    # Get currently running containers
    RUNNING_CONTAINERS=$(get_running_containers)
    
    if [ -z "$RUNNING_CONTAINERS" ]; then
        log_info "No existing containers found. Performing initial deployment..."
        
        # Initial deployment
        if ! docker compose --profile prod up -d; then
            log_error "Failed to start containers"
            exit 1
        fi
        
        # Wait for containers to start
        log_info "Waiting for containers to initialize..."
        sleep 15
        
        # Check if containers are running
        if ! wait_for_container "${COMPOSE_PROJECT_NAME}_app_1" 60; then
            log_error "Initial deployment failed - container not ready"
            docker compose --profile prod logs --tail=50
            exit 1
        fi
        
        # Check application health
        log_info "Performing health check..."
        if check_app_health "$HEALTH_CHECK_URL" 60; then
            log_success "Initial deployment successful!"
        else
            log_warning "Deployment completed but health check failed"
            log_info "Container logs:"
            docker compose --profile prod logs --tail=20
            exit 1
        fi
        
        return 0
    fi
    
    # Zero-downtime update for existing deployment
    log_info "Performing zero-downtime update..."
    log_info "Currently running containers: $(echo $RUNNING_CONTAINERS | tr '\n' ' ')"
    
    # Create new container with updated version
    log_info "Creating new container with version $version..."
    
    # Start new containers alongside existing ones
    if ! docker compose --profile prod up -d --no-deps --scale app=2; then
        log_error "Failed to scale up containers"
        exit 1
    fi
    
    # Wait a bit for new container to start
    sleep 10
    
    # Find the new container (should be the one with highest number)
    NEW_CONTAINERS=$(get_running_containers)
    NEW_CONTAINER=$(echo "$NEW_CONTAINERS" | grep "${COMPOSE_PROJECT_NAME}_app" | tail -1)
    
    if [ -z "$NEW_CONTAINER" ]; then
        log_error "Failed to identify new container"
        log_info "Running containers: $NEW_CONTAINERS"
        exit 1
    fi
    
    log_info "New container created: $NEW_CONTAINER"
    
    # Wait for new container to be ready
    if ! wait_for_container "$NEW_CONTAINER" 60; then
        log_error "New container failed to start, cleaning up..."
        docker stop "$NEW_CONTAINER" 2>/dev/null || true
        docker rm "$NEW_CONTAINER" 2>/dev/null || true
        exit 1
    fi
    
    # Test new container health
    log_info "Testing health of new container..."
    if check_app_health "$HEALTH_CHECK_URL" 45; then
        log_success "New container is healthy!"
        
        # Get old containers to remove
        OLD_CONTAINERS=$(echo "$RUNNING_CONTAINERS" | grep "${COMPOSE_PROJECT_NAME}_app")
        
        if [ -n "$OLD_CONTAINERS" ]; then
            log_info "Stopping old containers..."
            echo "$OLD_CONTAINERS" | while read -r container; do
                if [ "$container" != "$NEW_CONTAINER" ]; then
                    log_info "Stopping container: $container"
                    docker stop "$container" || true
                    docker rm "$container" || true
                fi
            done
        fi
        
        # Scale back to desired number of containers
        log_info "Scaling back to single container..."
        docker compose --profile prod up -d --scale app=1 --remove-orphans
        
        log_success "Zero-downtime deployment completed successfully!"
        
        # Final health check
        if check_app_health "$HEALTH_CHECK_URL" 30; then
            log_success "Final health check passed!"
        else
            log_warning "Final health check failed, but deployment appears successful"
        fi
        
    else
        log_error "New container failed health check, rolling back..."
        docker stop "$NEW_CONTAINER" 2>/dev/null || true
        docker rm "$NEW_CONTAINER" 2>/dev/null || true
        log_error "Rollback completed"
        exit 1
    fi
}

# Function to show deployment status
show_status() {
    log_info "=== Deployment Status ==="
    
    echo ""
    echo "📦 Project: $COMPOSE_PROJECT_NAME"
    echo "🏷️  Current Version: ${PACKAGE_VERSION:-Unknown}"
    echo "🌐 Health Check URL: $HEALTH_CHECK_URL"
    echo ""
    
    echo "🐳 Running Containers:"
    RUNNING_CONTAINERS=$(get_running_containers)
    if [ -n "$RUNNING_CONTAINERS" ]; then
        docker ps --filter "name=${COMPOSE_PROJECT_NAME}" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
    else
        echo "❌ No containers running"
    fi
    
    echo ""
    echo "🏥 Health Check:"
    if check_app_health "$HEALTH_CHECK_URL" 5; then
        log_success "✅ Application is healthy"
    else
        log_warning "⚠️ Application health check failed"
        if [ -n "$RUNNING_CONTAINERS" ]; then
            echo ""
            echo "📋 Recent logs:"
            docker logs --tail 10 "$(echo "$RUNNING_CONTAINERS" | head -1)" 2>/dev/null || echo "No logs available"
        fi
    fi
    
    echo ""
    echo "💾 Available Docker Images:"
    docker images --filter "reference=${DOCKER_USERNAME}/${PACKAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" 2>/dev/null || echo "No images found"
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
    
    log_info "Initiating rollback to version: $ROLLBACK_VERSION"
    
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