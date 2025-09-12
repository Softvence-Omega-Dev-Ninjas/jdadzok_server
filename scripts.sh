#!/bin/bash

# File to read/write environment variables
ENV_FILE=".env"

# Static values
DOCKER_USERNAME="devlopersabbir"
EMAIL="devlopersabbir@gmail.com"

# Get values from package.json
PACKAGE_NAME=$(node -p "require('./package.json').name || 'empty_name'")
PACKAGE_VERSION=$(node -p "require('./package.json').version || '0.0.1'")

# Colors for output
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
RESET="\033[0m"

# Prepare new .env variables
NEW_ENV_VARS="DOCKER_USERNAME=\"$DOCKER_USERNAME\"
PACKAGE_NAME=\"$PACKAGE_NAME\"
PACKAGE_VERSION=\"$PACKAGE_VERSION\"
EMAIL=\"$EMAIL\""

# Remove existing keys from .env and preserve the rest
TMP_ENV=$(mktemp)
grep -vE '^(DOCKER_USERNAME|PACKAGE_NAME|PACKAGE_VERSION|EMAIL)=' "$ENV_FILE" > "$TMP_ENV"

# Write updated .env file
{
  echo "$NEW_ENV_VARS"
  echo ""
  cat "$TMP_ENV"
} > "$ENV_FILE"
rm "$TMP_ENV"

echo -e "${BLUE}🚀 Uploading GitHub secrets from ${ENV_FILE}...${RESET}"

# Begin parsing
current_key=""
current_value=""
inside_value=0

while IFS= read -r line || [ -n "$line" ]; do
  # Trim whitespace
  line=$(echo "$line" | sed 's/^[ \t]*//;s/[ \t]*$//')

  # Skip empty or comment lines
  [[ -z "$line" || "$line" =~ ^# ]] && continue

  if [[ $inside_value -eq 0 ]]; then
    # Match KEY="value (possibly multiline)"
    if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=\"(.*) ]]; then
      current_key="${BASH_REMATCH[1]}"
      rest="${BASH_REMATCH[2]}"

      if [[ "$rest" =~ \"[[:space:]]*$ ]]; then
        # Single-line value (ends with ")
        current_value="${rest%\"}"
        inside_value=0
      else
        # Multiline begins
        current_value="$rest"
        inside_value=1
        continue
      fi
    else
      echo -e "${YELLOW}⚠️  Skipping invalid line: $line${RESET}"
      continue
    fi
  else
    # Continue reading multiline value
    current_value+=$'\n'"$line"

    if [[ "$line" == *\" ]]; then
      current_value="${current_value%\"}"
      inside_value=0
    else
      continue
    fi
  fi

  # Export secret to GitHub
  echo -e "${GREEN}✨ Setting secret:${RESET} ${BLUE}${current_key}${RESET} 🔑"
  gh secret set "$current_key" --body "$current_value" && \
    echo -e "${GREEN}✅ Secret $current_key set successfully!${RESET}" || \
    echo -e "${RED}❌ Failed to set secret $current_key${RESET}"

done < "$ENV_FILE"

echo -e "${BLUE}🎉 All done! Your secrets are now safe and sound in GitHub!${RESET}"
