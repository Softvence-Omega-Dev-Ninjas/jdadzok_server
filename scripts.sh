#!/bin/bash

# File to read/write environment variables
ENV_FILE=".env"

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

# Update dynamic values in .env file
echo -e "${BLUE}🔄 Updating dynamic values in $ENV_FILE...${RESET}"

# Create a temporary file for the updated .env
TMP_ENV=$(mktemp)

# Process the .env file line by line
while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
        echo "$line" >> "$TMP_ENV"
        continue
    fi
    
    # Update dynamic values
    if [[ "$line" =~ ^DOCKER_USERNAME= ]]; then
        echo "DOCKER_USERNAME=\"$DOCKER_USERNAME\"" >> "$TMP_ENV"
    elif [[ "$line" =~ ^PACKAGE_NAME= ]]; then
        echo "PACKAGE_NAME=\"$PACKAGE_NAME\"" >> "$TMP_ENV"
    elif [[ "$line" =~ ^PACKAGE_VERSION= ]]; then
        echo "PACKAGE_VERSION=\"$PACKAGE_VERSION\"" >> "$TMP_ENV"
    elif [[ "$line" =~ ^EMAIL= ]]; then
        echo "EMAIL=\"$EMAIL\"" >> "$TMP_ENV"
    elif [[ "$line" =~ ^IMAGE_TAG= ]]; then
        echo "IMAGE_TAG=\"$IMAGE_TAG\"" >> "$TMP_ENV"
    else
        echo "$line" >> "$TMP_ENV"
    fi
done < "$ENV_FILE"

# Replace the original .env with updated content
mv "$TMP_ENV" "$ENV_FILE"

echo -e "${GREEN}✅ Updated values:${RESET}"
echo -e "   DOCKER_USERNAME: $DOCKER_USERNAME"
echo -e "   PACKAGE_NAME: $PACKAGE_NAME"
echo -e "   PACKAGE_VERSION: $PACKAGE_VERSION"
echo -e "   EMAIL: $EMAIL"
echo -e "   IMAGE_TAG: $IMAGE_TAG"

echo -e "${BLUE}🚀 Uploading GitHub secrets from ${ENV_FILE}...${RESET}"

# Parse and upload secrets
current_key=""
current_value=""
inside_value=0
line_number=0

while IFS= read -r line || [ -n "$line" ]; do
    line_number=$((line_number + 1))
    
    # Trim leading/trailing whitespace
    line=$(echo "$line" | sed 's/^[ \t]*//;s/[ \t]*$//')

    # Skip empty lines and comments
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi

    if [[ $inside_value -eq 0 ]]; then
        # Match KEY="value or KEY=value patterns
        if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=\"(.*)$ ]]; then
            current_key="${BASH_REMATCH[1]}"
            rest="${BASH_REMATCH[2]}"

            # Check if it's a single-line value ending with "
            if [[ "$rest" =~ ^.*\"[[:space:]]*$ ]]; then
                # Single-line value
                current_value="${rest%\"}"
                inside_value=0
            else
                # Multi-line value starts
                current_value="$rest"
                inside_value=1
                continue
            fi
        elif [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
            # Handle unquoted values
            current_key="${BASH_REMATCH[1]}"
            current_value="${BASH_REMATCH[2]}"
            # Remove surrounding quotes if present
            current_value=$(echo "$current_value" | sed 's/^"//;s/"$//')
            inside_value=0
        else
            echo -e "${YELLOW}⚠️  Skipping invalid line $line_number: $line${RESET}"
            continue
        fi
    else
        # Continue reading multi-line value
        if [[ "$line" == *\" ]]; then
            # End of multi-line value
            current_value+=$'\n'"${line%\"}"
            inside_value=0
        else
            # Continue multi-line value
            current_value+=$'\n'"$line"
            continue
        fi
    fi

    # Upload the secret to GitHub
    if [[ -n "$current_key" && -n "$current_value" ]]; then
        echo -e "${GREEN}✨ Setting secret:${RESET} ${BLUE}${current_key}${RESET} 🔑"
        
        if gh secret set "$current_key" --body "$current_value" 2>/dev/null; then
            echo -e "${GREEN}✅ Secret $current_key set successfully!${RESET}"
        else
            echo -e "${RED}❌ Failed to set secret $current_key${RESET}"
            
            # Check if gh CLI is available and authenticated
            if ! command -v gh &> /dev/null; then
                echo -e "${RED}❌ GitHub CLI (gh) is not installed. Please install it first.${RESET}"
                exit 1
            fi
            
            if ! gh auth status &> /dev/null; then
                echo -e "${RED}❌ GitHub CLI is not authenticated. Run 'gh auth login' first.${RESET}"
                exit 1
            fi
        fi
    fi

    # Reset for next iteration
    current_key=""
    current_value=""
    
done < "$ENV_FILE"

echo -e "${BLUE}🎉 All done! Your secrets are now safe and sound in GitHub!${RESET}"
echo -e "${GREEN}📊 Summary:${RESET}"
echo -e "   📁 Source file: $ENV_FILE"
echo -e "   🔐 Secrets uploaded to GitHub repository"
echo -e "   ✅ Ready to use in GitHub Actions workflows"