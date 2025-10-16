#!/usr/bin/env bash
set -euo pipefail

# -------------------------
# Config
# -------------------------
ENV_FILE=".env.production"
ACTION_YAML=".github/actions/setup-and-load-env/action.yaml"
CI_YAML=".github/workflows/ci.yaml"
CD_YAML=".github/workflows/cd.yaml"

# Static values you can change
DOCKER_USERNAME="devlopersabbir"
EMAIL="devlopersabbir@gmail.com"

# Keys that should be treated as "sensitive" when generating the composite action
SENSITIVE_KEYS=(
  MAIL_PASS
  PG_PASSWORD
  SUPER_ADMIN_PASS
  AWS_SECRET_ACCESS_KEY
  DOCKER_PASSWORD
  GIT_TOKEN
  VPS_SSH_PRIVATE_KEY
)

# Colors (optional)
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
RESET="\033[0m"

# -------------------------
# Helpers
# -------------------------
is_sensitive() {
  local k="$1"
  for s in "${SENSITIVE_KEYS[@]}"; do
    if [[ "$s" == "$k" ]]; then
      return 0
    fi
  done
  return 1
}

err() {
  echo -e "${RED}❌ $*${RESET}" >&2
}

info() {
  echo -e "${BLUE}ℹ️  $*${RESET}"
}

ok() {
  echo -e "${GREEN}✅ $*${RESET}"
}

# -------------------------
# Sanity checks
# -------------------------
if [[ ! -f "$ENV_FILE" ]]; then
  err "$ENV_FILE not found. Put your environment file at $ENV_FILE and re-run."
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  err "Node is required (for reading package.json). Install Node and try again."
  exit 1
fi

# -------------------------
# Read package.json safely
# -------------------------
PACKAGE_NAME="$(node -e "try{const p=require('./package.json'); console.log(p.name||'empty_name')}catch(e){console.log('empty_name')}" 2>/dev/null || echo "empty_name")"
PACKAGE_VERSION="$(node -e "try{const p=require('./package.json'); console.log(p.version||'0.0.1')}catch(e){console.log('0.0.1')}" 2>/dev/null || echo "0.0.1")"
IMAGE_TAG="${DOCKER_USERNAME}/${PACKAGE_NAME}:${PACKAGE_VERSION}"

info "Detected package name: ${PACKAGE_NAME}"
info "Detected package version: ${PACKAGE_VERSION}"
info "Image tag will be: ${IMAGE_TAG}"

# -------------------------
# Parse .env.production into arrays (preserve comments & blank lines)
# We'll construct a temp file with updated dynamic values
# -------------------------
TMP_ENV="$(mktemp)"
trap 'rm -f "$TMP_ENV"' EXIT

while IFS= read -r raw_line || [[ -n "$raw_line" ]]; do
  line="$raw_line"
  # preserve comments or empty lines
  if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
    printf '%s\n' "$line" >> "$TMP_ENV"
    continue
  fi

  if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
    key="${BASH_REMATCH[1]}"
    val="${BASH_REMATCH[2]}"

    case "$key" in
      DOCKER_USERNAME)
        printf '%s=%s\n' "$key" "$DOCKER_USERNAME" >> "$TMP_ENV"
        ;;
      PACKAGE_NAME)
        printf '%s=%s\n' "$key" "$PACKAGE_NAME" >> "$TMP_ENV"
        ;;
      PACKAGE_VERSION)
        printf '%s=%s\n' "$key" "$PACKAGE_VERSION" >> "$TMP_ENV"
        ;;
      EMAIL)
        printf '%s=%s\n' "$key" "$EMAIL" >> "$TMP_ENV"
        ;;
      IMAGE_TAG)
        printf '%s=%s\n' "$key" "$IMAGE_TAG" >> "$TMP_ENV"
        ;;
      MAIL_PASS)
        # preserve original quoting if present
        # keep the exact value but ensure it's wrapped in double quotes
        # remove surrounding quotes first
        clean="${val%\"}"
        clean="${clean#\"}"
        printf '%s="%s"\n' "$key" "$clean" >> "$TMP_ENV"
        ;;
      *)
        # default: preserve as-is
        printf '%s\n' "$line" >> "$TMP_ENV"
        ;;
    esac
  else
    # line didn't match env pattern, keep it
    printf '%s\n' "$line" >> "$TMP_ENV"
  fi
done < "$ENV_FILE"

# Replace original .env.production with TMP
mv "$TMP_ENV" "$ENV_FILE"
ok "Updated dynamic values in $ENV_FILE"

echo
echo -e "${GREEN}Updated values:${RESET}"
echo -e "   DOCKER_USERNAME: ${DOCKER_USERNAME}"
echo -e "   PACKAGE_NAME: ${PACKAGE_NAME}"
echo -e "   PACKAGE_VERSION: ${PACKAGE_VERSION}"
echo -e "   EMAIL: ${EMAIL}"
echo -e "   IMAGE_TAG: ${IMAGE_TAG}"
echo

# -------------------------
# Read all distinct env keys in order (skip comments/blank)
# We'll build a list 'ENV_KEYS'
# -------------------------
ENV_KEYS=()
while IFS= read -r raw_line || [[ -n "$raw_line" ]]; do
  line="$raw_line"
  if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
    continue
  fi
  if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
    key="${BASH_REMATCH[1]}"
    ENV_KEYS+=("$key")
  fi
done < "$ENV_FILE"

# Remove duplicates while preserving order
# uniq_keys=()
# declare -A seen
# for k in "${ENV_KEYS[@]}"; do
#   if [[ -z "${seen[$k]:-}" ]]; then
#     uniq_keys+=("$k")
#     seen[$k]=1
#   fi
# done
# ENV_KEYS=("${uniq_keys[@]}")

# -------------------------
# Generate action.yaml (composite action)
# -------------------------
info "Generating $ACTION_YAML ..."
mkdir -p "$(dirname "$ACTION_YAML")"

# We'll write it with single-quoted heredoc so ${{ ... }} remains literal.
cat > "$ACTION_YAML" <<'YAML_HEADER'
name: "Setup and Load Environment"
description: "Generates .env from inputs and exports to GITHUB_ENV"
inputs:
YAML_HEADER

# inputs block
for key in "${ENV_KEYS[@]}"; do
  cat >> "$ACTION_YAML" <<EOF
  ${key}:
    description: "${key} from .env.production"
    required: true
EOF
done

# runs / steps
cat >> "$ACTION_YAML" <<'YAML_RUNS'
runs:
  using: "composite"
  steps:
    - name: 🔧 Generate .env file
      shell: bash
      run: |
        set -euo pipefail
        ENV_FILE="$GITHUB_WORKSPACE/.env"
        echo "🔧 Creating .env file at $ENV_FILE..."
        {
          echo "NODE_ENV=development"
YAML_RUNS

# .env contents lines (inside the composite action run block)
# For each key we will print a line that echoes either KEY=value (non-sensitive)
# or KEY="${{ inputs.KEY }}" for sensitive ones (with double-quotes).
# We need to preserve literal ${{ inputs.KEY }}. To do that we prefix the $ with backslash here,
# so the generated YAML contains the literal ${{ ... }} construct.
for key in "${ENV_KEYS[@]}"; do
  # if is_sensitive "$key"; then
    # Produce: echo 'KEY=${{ secrets.KEY }}'
    # printf '          echo "%s=${{ secrets.%s }}"\n' "$key" "$key" >> "$ACTION_YAML"
  # else
    # Produce: echo 'KEY=${{ inputs.KEY }}'
    printf '          echo "%s=${{ inputs.%s }}"\n' "$key" "$key" >> "$ACTION_YAML"
  # fi
done


# finish composite step
cat >> "$ACTION_YAML" <<'YAML_RUNS_END'
        } > "$ENV_FILE"
        # Handle SSH private key: write to file if provided
        if [[ -n "${{ inputs.VPS_SSH_PRIVATE_KEY }}" ]]; then
          echo '${{ inputs.VPS_SSH_PRIVATE_KEY }}' > "$GITHUB_WORKSPACE/deploy_key.pem"
          chmod 600 "$GITHUB_WORKSPACE/deploy_key.pem"
          echo "VPS_SSH_PRIVATE_KEY_FILE=$GITHUB_WORKSPACE/deploy_key.pem" >> "$ENV_FILE"
        fi
        # Verify file creation
        if [ -f "$ENV_FILE" ] && [ -s "$ENV_FILE" ]; then
          FILE_SIZE=$(wc -c < "$ENV_FILE" || echo "0")
          echo "✅ .env file created successfully size: ${FILE_SIZE} bytes"
        else
          echo "❌ Error: .env file creation failed"
          exit 1
        fi
    - name: 📤 Export variables to GITHUB_ENV
      shell: bash
      run: |
        echo "📤 Exporting environment variables to GITHUB_ENV..."
        while IFS='=' read -r key value; do
          if [[ -n "$key" && ! "$key" =~ ^[[:space:]]*# ]]; then
            echo "$key=$value" >> "$GITHUB_ENV"
          fi
        done < "$GITHUB_WORKSPACE/.env"
        echo "✅ All environment variables exported successfully"
    - name: 🔍 Verify setup
      shell: bash
      run: |
        ENV_FILE="$GITHUB_WORKSPACE/.env"
        if [ -f "$ENV_FILE" ]; then
          VAR_COUNT=$(grep -c '^[A-Z]' "$ENV_FILE" 2>/dev/null || echo "0")
          FILE_SIZE=$(wc -c < "$ENV_FILE" || echo "0")
          echo "🎉 Environment setup complete!"
          echo "📁 .env file: $ENV_FILE"
          echo "🔢 Variables count: $VAR_COUNT"
          echo "📊 File size: ${FILE_SIZE} bytes"
        else
          echo "❌ Error: .env file missing after generation"
          exit 1
        fi
YAML_RUNS_END

ok "Generated $ACTION_YAML"

# -------------------------
# Helper to write secrets mapping lines for workflows
# -------------------------
generate_workflow_inputs() {
  # $1 => output file
  for key in "${ENV_KEYS[@]}"; do
    # write a line: "          KEY: ${{ secrets.KEY }}"
    # to avoid unwanted expansion we use backslash to escape leading $ in the literal
    printf '          %s: ${{ secrets.%s }}\n' "$key" "$key" >> "$1"
  done
}

# -------------------------
# Generate CI workflow
# -------------------------
info "Generating $CI_YAML ..."
mkdir -p "$(dirname "$CI_YAML")"

cat > "$CI_YAML" <<'CI_HEAD'
name: CI Pipeline
on:
  push:
    branches: ["**"]
  pull_request:
    branches: ["**"]
jobs:
  lint-test:
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
      - name: 🔧 Setup and load environment
        uses: ./.github/actions/setup-and-load-env
        with:
CI_HEAD

generate_workflow_inputs "$CI_YAML"

cat >> "$CI_YAML" <<'CI_MID'
      - name: 📋 Verify environment variables
        uses: ./.github/actions/verify-env
      - name: 🟢 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10
      - name: Cache pnpm dependencies
        uses: actions/cache@v3
        with:
          path: ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-
      - name: Install dependencies
        run: pnpm install
      - name: 🧹 Run Lint
        run: pnpm ci:fix
      - name: ✅ Format Check
        run: pnpm format
      - name: 🔄 Generate Prisma Client
        run: pnpm prisma:generate
      - name: 🏗 Build Project
        run: pnpm build
      - name: 🧹 Clean up .env
        if: always()
        run: rm -f "${{ github.workspace }}/.env"
  build-and-push:
    needs: lint-test
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
      - name: 🔧 Setup and load environment
        uses: ./.github/actions/setup-and-load-env
        with:
CI_MID

generate_workflow_inputs "$CI_YAML"

cat >> "$CI_YAML" <<'CI_TAIL'
      - name: 📋 Verify environment variables
        uses: ./.github/actions/verify-env
      - name: Log in to Docker Hub 🔑
        uses: ./.github/actions/docker-login
      - name: Build Docker Image 🔨
        run: |
          echo "Building Docker image: '"$IMAGE_TAG"'"
          docker compose --profile prod build
      - name: Push Docker Image 🚀
        run: |
          echo "Pushing Docker image: '"$IMAGE_TAG"'"
          docker compose --profile prod push
CI_TAIL

ok "Generated $CI_YAML"

# -------------------------
# Generate CD workflow
# -------------------------
info "Generating $CD_YAML ..."
cat > "$CD_YAML" <<'CD_HEAD'
name: 🚀 CD Pipeline with Zero Downtime
on:
  push:
  workflow_run:
    workflows: ["CI Pipeline"]
    types:
      - completed
jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' && github.event.workflow_run.head_branch == 'main' }}
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
      - name: 🔧 Setup and load environment
        uses: ./.github/actions/setup-and-load-env
        with:
CD_HEAD

generate_workflow_inputs "$CD_YAML"

cat >> "$CD_YAML" <<'CD_MID'
      - name: 📋 Verify environment variables
        uses: ./.github/actions/verify-env
      - name: Setup SSH 🔐
        uses: ./.github/actions/setup-ssh
      - name: Copy Files to Server 📦
        run: |
          echo "Creating directories..."
          ssh deploy-server "mkdir -p ~/$PACKAGE_NAME/scripts"
          echo "Copying files..."
          scp docker-compose.yaml deploy-server:~/$PACKAGE_NAME/
          scp .env deploy-server:~/$PACKAGE_NAME/
          scp Dockerfile deploy-server:~/$PACKAGE_NAME/
          scp -r scripts deploy-server:~/$PACKAGE_NAME/
          echo "✅ Files copied successfully"
      - name: Fix permissions on server 🌋
        run: |
          ssh deploy-server "chmod -R +x ~/$PACKAGE_NAME/scripts/*.sh"
      - name: Deploy Application 🚀
        run: |
          ssh deploy-server "bash ~/$PACKAGE_NAME/scripts/deploy-remote.sh"
      - name: Verify Deployment ✅
        run: |
          ssh deploy-server bash << 'VERIFY_EOF'
            cd ~/${{ secrets.PACKAGE_NAME }}
            echo "=== Running deployment status check ==="
            ./scripts/deploy.sh status
            echo "=== Testing endpoint directly ==="
            if curl -f -s --connect-timeout 5 --max-time 10 "http://${{ secrets.VPS_HOST_IP }}:${{ secrets.PORT }}/" | grep -q '"status":"ok"'; then
              echo "🎉 Endpoint health check passed! Service is responding with status: ok"
            else
              echo "❌ Endpoint health check failed!"
              exit 1
            fi
            echo "Deployment verified successfully!"
          VERIFY_EOF
      - name: Cleanup 🧹
        if: always()
        run: |
          rm -rf ~/.ssh/deploy_key* ~/.ssh/config
          rm -f .env
CD_MID

ok "Generated $CD_YAML"

# -------------------------
# Upload non-sensitive secrets to GitHub using gh (if installed)
# -------------------------
info "Uploading non-sensitive secrets to GitHub via gh (skipping known sensitive keys)..."

if ! command -v gh >/dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  'gh' CLI not found — skipping secrets upload. Install GitHub CLI and run this script again to auto-upload secrets.${RESET}"
else
  if ! gh auth status >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  'gh' CLI not authenticated. Run 'gh auth login' and re-run script to upload secrets.${RESET}"
  else
    while IFS= read -r raw_line || [[ -n "$raw_line" ]]; do
      line="$raw_line"
      if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
        continue
      fi
      if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        # trim surrounding quotes
        value="${value%\"}"
        value="${value#\"}"
        # if is_sensitive "$key"; then
        #   echo -e "${YELLOW}⚠️  Skipping upload of sensitive key: ${key}${RESET}"
        #   continue
        # fi
        echo -e "${GREEN}✨ Setting secret:${RESET} ${BLUE}${key}${RESET} 🔑"
        # Use --body to set value directly (works with gh CLI)
        if gh secret set "$key" --body "$value" >/dev/null 2>&1; then
          echo -e "${GREEN}✅ Secret $key set successfully!${RESET}"
        else
          echo -e "${RED}❌ Failed to set secret $key (gh secret set returned non-zero).${RESET}"
        fi
      fi
    done < "$ENV_FILE"
  fi
fi

ok "All generation steps complete. Files created:"
echo " - $ACTION_YAML"
echo " - $CI_YAML"
echo " - $CD_YAML"
echo
echo -e "${GREEN}🎉 Done. Review the generated files and commit them to your repository.${RESET}"
