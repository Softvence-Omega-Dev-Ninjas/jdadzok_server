#!/bin/bash

# File to read/write environment variables
ENV_FILE=".env.production"
ACTION_YAML=".github/actions/setup-and-load-env/action.yaml"
WORKFLOW_INPUTS_YAML="workflow-inputs.yaml"

# Static values
DOCKER_USERNAME="devlopersabbir"
EMAIL="devlopersabbir@gmail.com"

# Get values from package.json
PACKAGE_NAME=$(node -p "require('./package.json').name || 'empty_name'")
PACKAGE_VERSION=$(node -p "require('./package.json').version || '0.0.1'")

# Generate IMAGE_TAG
IMAGE_TAG="${DOCKER_USERNAME}/${PACKAGE_NAME}:${PACKAGE_VERSION}"

# Colors for output
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
RESET="\033[0m"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Error: $ENV_FILE file not found${RESET}"
    exit 1
fi

echo -e "${BLUE}🔄 Updating dynamic values in $ENV_FILE...${RESET}"

# Temporary env file
TMP_ENV=$(mktemp)

# Update lines with only required values and preserve structure
while IFS= read -r line || [ -n "$line" ]; do
    # Preserve comments and empty lines
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
        echo "$line" >> "$TMP_ENV"
        continue
    fi

    # Update specific values
    case "$line" in
        DOCKER_USERNAME=*)
            echo "DOCKER_USERNAME=$DOCKER_USERNAME" >> "$TMP_ENV"
            ;;
        PACKAGE_NAME=*)
            echo "PACKAGE_NAME=$PACKAGE_NAME" >> "$TMP_ENV"
            ;;
        PACKAGE_VERSION=*)
            echo "PACKAGE_VERSION=$PACKAGE_VERSION" >> "$TMP_ENV"
            ;;
        EMAIL=*)
            echo "EMAIL=$EMAIL" >> "$TMP_ENV"
            ;;
        IMAGE_TAG=*)
            echo "IMAGE_TAG=$IMAGE_TAG" >> "$TMP_ENV"
            ;;
        MAIL_PASS=*)
            # Always wrap MAIL_PASS value in double quotes
            value="${line#MAIL_PASS=}"
            value="${value%\"}"
            value="${value#\"}"
            echo "MAIL_PASS=\"$value\"" >> "$TMP_ENV"
            ;;
        *)
            # Everything else as-is
            echo "$line" >> "$TMP_ENV"
            ;;
    esac
done < "$ENV_FILE"

# Replace original .env with updated one
mv "$TMP_ENV" "$ENV_FILE"

echo -e "${GREEN}✅ Updated values:${RESET}"
echo -e "   DOCKER_USERNAME: $DOCKER_USERNAME"
echo -e "   PACKAGE_NAME: $PACKAGE_NAME"
echo -e "   PACKAGE_VERSION: $PACKAGE_VERSION"
echo -e "   EMAIL: $EMAIL"
echo -e "   IMAGE_TAG: $IMAGE_TAG"

# Generate action.yaml
echo -e "${BLUE}🔄 Generating $ACTION_YAML...${RESET}"
mkdir -p .github/actions/setup-and-load-env
cat > "$ACTION_YAML" <<'EOF'
name: "Setup and Load Environment"
description: "Generates .env from inputs and exports to GITHUB_ENV"
inputs:
EOF

# Generate inputs section
while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi

    # Parse KEY=VALUE
    if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        echo "  $key:" >> "$ACTION_YAML"
        echo "    description: \"$key from .env.production\"" >> "$ACTION_YAML"
        echo "    required: true" >> "$ACTION_YAML"
    fi
done < "$ENV_FILE"

# Append the rest of action.yaml
cat >> "$ACTION_YAML" <<'EOF'
runs:
  using: "composite"
  steps:
    - name: 🔧 Generate .env file
      shell: bash
      run: |
        ENV_FILE="$GITHUB_WORKSPACE/.env"
        echo "🔧 Creating .env file at $ENV_FILE..."
        {
EOF

# Generate .env file content
while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi

    # Parse KEY=VALUE
    if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        # Quote MAIL_PASS and other sensitive values
        if [[ "$key" == "MAIL_PASS" || "$key" == "PG_PASSWORD" || "$key" == "SUPER_ADMIN_PASS" || "$key" == "AWS_SECRET_ACCESS_KEY" || "$key" == "DOCKER_PASSWORD" || "$key" == "GIT_TOKEN" || "$key" == "VPS_SSH_PRIVATE_KEY" ]]; then
            echo "          echo \"$key=\\\"\${{ inputs.$key }}\\\\"\"" >> "$ACTION_YAML"
        else
            echo "          echo \"$key=\${{ inputs.$key }}\"" >> "$ACTION_YAML"
        fi
    fi
done < "$ENV_FILE"

# Complete action.yaml
cat >> "$ACTION_YAML" <<'EOF'
          echo "NODE_ENV=development"
        } > "$ENV_FILE"
        # Handle SSH private key
        if [[ -n "${{ inputs.VPS_SSH_PRIVATE_KEY }}" ]]; then
          echo '${{ inputs.VPS_SSH_PRIVATE_KEY }}' > "$GITHUB_WORKSPACE/deploy_key.pem"
          chmod 600 "$GITHUB_WORKSPACE/deploy_key.pem"
          echo "VPS_SSH_PRIVATE_KEY_FILE=$GITHUB_WORKSPACE/deploy_key.pem" >> "$ENV_FILE"
        fi
        # Verify file creation
        if [ -f "$ENV_FILE" ] && [ -s "$ENV_FILE" ]; then
          FILE_SIZE=$(wc -c < "$ENV_FILE")
          echo "✅ .env file created successfully (size: ${FILE_SIZE} bytes)"
        else
          echo "❌ Error: .env file creation failed"
          exit 1
        fi
    - name: 📤 Export variables to GITHUB_ENV
      shell: bash
      run: |
        echo "📤 Exporting environment variables to GITHUB_ENV..."
        while IFS='=' read -r key value; do
          if [[ -n "$key" && -n "$value" && ! "$key" =~ ^# ]]; then
            echo "$key=$value" >> $GITHUB_ENV
          fi
        done < "$GITHUB_WORKSPACE/.env"
        echo "✅ All environment variables exported successfully"
    - name: 🔍 Verify setup
      shell: bash
      run: |
        ENV_FILE="$GITHUB_WORKSPACE/.env"
        if [ -f "$ENV_FILE" ]; then
          VAR_COUNT=$(grep -c '^[A-Z]' "$ENV_FILE" 2>/dev/null || echo "0")
          FILE_SIZE=$(wc -c < "$ENV_FILE")
          echo "🎉 Environment setup complete!"
          echo "📁 .env file: $ENV_FILE"
          echo "🔢 Variables count: $VAR_COUNT"
          echo "📊 File size: ${FILE_SIZE} bytes"
          echo "🧪 Testing variable availability:"
          echo " PACKAGE_NAME: ${PACKAGE_NAME:-'NOT_SET'}"
          echo " PACKAGE_VERSION: ${PACKAGE_VERSION:-'NOT_SET'}"
          echo " DOCKER_USERNAME: ${DOCKER_USERNAME:-'NOT_SET'}"
          echo " SSH Key file: ${VPS_SSH_PRIVATE_KEY_FILE:-'NOT_SET'}"
        else
          echo "❌ Error: .env file missing after generation"
          exit 1
        fi
EOF

echo -e "${GREEN}✅ Generated $ACTION_YAML${RESET}"

# Generate workflow-inputs.yaml
echo -e "${BLUE}🔄 Generating $WORKFLOW_INPUTS_YAML...${RESET}"
cat > "$WORKFLOW_INPUTS_YAML" <<EOF
# Auto-generated workflow inputs from $ENV_FILE
- name: 🔧 Setup and load environment
  uses: ./.github/actions/setup-and-load-env
  with:
EOF

while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi

    # Parse KEY=VALUE
    if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        echo "    $key: \${{ secrets.$key }}" >> "$WORKFLOW_INPUTS_YAML"
    fi
done < "$ENV_FILE"

echo -e "${GREEN}✅ Generated $WORKFLOW_INPUTS_YAML${RESET}"

echo -e "${BLUE}🚀 Uploading GitHub secrets from ${ENV_FILE}...${RESET}"

# Uploading secrets
while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi

    # Parse KEY=VALUE
    if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"

        # Strip surrounding quotes (unless MAIL_PASS or other sensitive keys)
        if [[ "$key" != "MAIL_PASS" && "$key" != "PG_PASSWORD" && "$key" != "SUPER_ADMIN_PASS" && "$key" != "AWS_SECRET_ACCESS_KEY" && "$key" != "DOCKER_PASSWORD" && "$key" != "GIT_TOKEN" && "$key" != "VPS_SSH_PRIVATE_KEY" ]]; then
            value="${value%\"}"
            value="${value#\"}"
        fi

        echo -e "${GREEN}✨ Setting secret:${RESET} ${BLUE}${key}${RESET} 🔑"

        if gh secret set "$key" --body "$value" 2>/dev/null; then
            echo -e "${GREEN}✅ Secret $key set successfully!${RESET}"
        else
            echo -e "${RED}❌ Failed to set secret $key${RESET}"
            if ! command -v gh &> /dev/null; then
                echo -e "${RED}❌ GitHub CLI (gh) is not installed.${RESET}"
                exit 1
            fi
            if ! gh auth status &> /dev/null; then
                echo -e "${RED}❌ GitHub CLI is not authenticated. Run 'gh auth login'.${RESET}"
                exit 1
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  Skipping invalid line: $line${RESET}"
    fi
done < "$ENV_FILE"

echo -e "${BLUE}🎉 All done! Secrets uploaded, $ACTION_YAML and $WORKFLOW_INPUTS_YAML generated.${RESET}"