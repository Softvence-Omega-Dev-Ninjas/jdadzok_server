#!/bin/bash
set -euo pipefail

cd ~/"$PACKAGE_NAME"

# Install Docker Compose if needed
if [ ! -f ~/.docker/cli-plugins/docker-compose ]; then
  echo "Installing Docker Compose..."
  mkdir -p ~/.docker/cli-plugins/
  curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
  chmod +x ~/.docker/cli-plugins/docker-compose
fi  

# Login to Docker Hub
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

# Run deployment script
echo "Starting zero-downtime deployment..."
./scripts/deploy.sh --version "$PACKAGE_VERSION"

# Clean up
docker logout
docker image prune -f