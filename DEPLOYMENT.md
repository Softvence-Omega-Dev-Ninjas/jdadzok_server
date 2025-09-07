# Zero-Downtime Deployment Guide 🚀

This guide explains how to set up and use the zero-downtime continuous deployment system for the jdadzok server.

## Overview

The deployment system implements a zero-downtime deployment strategy using:
- **Health checks** to verify application health before switching traffic
- **Automatic rollback** if new deployment fails health checks
- **Database and Redis persistence** (containers are kept running)
- **Blue-green deployment** pattern to minimize downtime

## Components

### 1. Health Check Script (`scripts/health-check.js`)
- Verifies the application is responding correctly
- Configurable retry attempts and timeout
- Returns proper exit codes for automation

### 2. Deployment Script (`scripts/deploy.sh`)
- Handles zero-downtime deployment process
- Performs health checks on new deployments
- Automatic rollback on failure
- Supports various deployment operations

### 3. GitHub Actions Workflow (`.github/workflows/cd.yml`)
- Automated CI/CD pipeline
- Builds and pushes Docker images
- Deploys to VPS with zero downtime
- Verifies deployment success

## Prerequisites

### GitHub Secrets Setup
Configure the following secrets in your GitHub repository:

```
DOCKER_USERNAME           # Your Docker Hub username
DOCKER_PASSWORD          # Your Docker Hub password
VPS_USER                 # VPS SSH username
VPS_HOST                 # VPS IP address or hostname
SABBIR_VPS_KEY           # SSH private key for VPS access

# Application Environment Variables
NODE_ENV
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
BASE_URL
MAIL_USER
MAIL_PASS
SUPER_ADMIN_EMAIL
SUPER_ADMIN_PASS
REDIS_URL
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
```

### Server Requirements
- Docker and Docker Compose installed
- Node.js (for health check script)
- `jq` command-line JSON processor
- SSH access configured
- Firewall ports 5055, 5432, 6379 opened

## How It Works

### Automatic Deployment (Push to Main)

1. **CI Phase**: Code is linted, tested, and built
2. **Build Phase**: Docker image is built with version from `package.json`
3. **Push Phase**: Image is pushed to Docker registry
4. **Deploy Phase**: Zero-downtime deployment is executed:
   - Files copied to server
   - New image pulled
   - Current deployment health checked and recorded
   - New container deployed alongside old one
   - Health check performed on new deployment
   - If healthy: traffic switched to new version
   - If unhealthy: automatic rollback to previous version
   - Old containers cleaned up

### Manual Deployment

You can also deploy manually using the deployment script:

```bash
# Deploy latest version from package.json
./scripts/deploy.sh

# Deploy specific version
./scripts/deploy.sh --version 1.2.3

# Dry run (see what would happen without executing)
./scripts/deploy.sh --dry-run

# Check current status
./scripts/deploy.sh status

# Run health check only
./scripts/deploy.sh health

# Manual rollback to specific version
./scripts/deploy.sh rollback username/jdadzok_server:1.1.0
```

## Health Check Configuration

The health check script can be configured via environment variables:

```bash
HEALTH_ENDPOINT="http://localhost:5055/api/health"  # Health check URL
MAX_RETRIES=5                                       # Number of retry attempts
RETRY_DELAY=3000                                    # Delay between retries (ms)
TIMEOUT=10000                                       # Request timeout (ms)
```

## Database and Redis Persistence

The deployment system is designed to maintain database and Redis data:

- **Database**: Uses Docker volume `db-data` for persistent storage
- **Redis**: Uses Docker volume `redis-data` for persistent storage
- **Zero Downtime**: Database and Redis containers continue running during deployment
- **Migration Safe**: Prisma migrations are applied during container startup

## Monitoring and Troubleshooting

### Health Endpoints

The application provides health check endpoints:
- `GET /` - Basic health check
- `GET /api/health` - Detailed health check with version and uptime

### Deployment Logs

Monitor deployment progress:
- GitHub Actions logs show build and deployment progress
- Server logs: `docker-compose logs -f server`
- Container status: `docker ps --filter "name=jdadzok"`

### Common Issues

1. **Health Check Fails**
   ```bash
   # Check if service is running
   docker ps
   
   # Check application logs
   docker-compose logs server
   
   # Manually test health endpoint
   curl http://localhost:5055/api/health
   ```

2. **Deployment Rollback**
   ```bash
   # Check what versions are available
   docker images | grep jdadzok_server
   
   # Manual rollback
   ./scripts/deploy.sh rollback username/jdadzok_server:previous-version
   ```

3. **Database Connection Issues**
   ```bash
   # Check database container
   docker-compose logs db
   
   # Check Redis container
   docker-compose logs redis
   ```

### Server Maintenance

Regular maintenance tasks:

```bash
# Clean up old Docker images (keeps volumes intact)
docker image prune -f

# View disk usage
docker system df

# Check container resource usage
docker stats
```

## Security Considerations

- SSH keys are managed via GitHub Actions secrets
- Docker credentials are automatically managed
- Environment variables are securely injected
- No sensitive data is logged or exposed
- Firewall rules restrict access to necessary ports only

## Version Management

- **Package Version**: Automatically determined from `package.json`
- **Stable Tag**: Successful deployments are tagged as `stable`
- **Version Tags**: Each deployment creates a version-specific tag
- **Rollback**: Can rollback to any previous version

## Best Practices

1. **Always test locally** before pushing to main
2. **Monitor deployment logs** during the process
3. **Keep package.json version updated** for proper versioning
4. **Test health endpoints** locally before deployment
5. **Monitor server resources** to prevent resource exhaustion
6. **Regular backups** of database and Redis data

## Support

If you encounter issues:
1. Check GitHub Actions logs for build/deployment errors
2. Review server logs using Docker commands
3. Verify health endpoints are responding
4. Check server resource availability
5. Ensure all secrets are properly configured

The deployment system is designed to be robust and self-healing, with automatic rollback on failures to ensure maximum uptime for your application.
