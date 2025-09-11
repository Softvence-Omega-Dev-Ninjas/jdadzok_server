#!/bin/bash

ENV_FILE=".env"

# Static values
DOCKER_USERNAME="devlopersabbir"
EMAIL="devlopersabbir@gmail.com"

# Get values from package.json
PACKAGE_NAME=$(node -p  "require('./package.json').name || 'empty_name'")
PACKAGE_VERSION=$(node -p "require('./package.json').version || '0.0.1'")

# Colors
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
RESET="\033[0m"

# Prepare new env variables content
NEW_ENV_VARS="DOCKER_USERNAME=\"$DOCKER_USERNAME\"
PACKAGE_NAME=\"$PACKAGE_NAME\"
PACKAGE_VERSION=\"$PACKAGE_VERSION\"
EMAIL=\"$EMAIL\""

# Remove old instances of these variables if they exist in .env
TMP_ENV=$(mktemp)
grep -vE '^(DOCKER_USERNAME|PACKAGE_NAME|PACKAGE_VERSION|EMAIL)=' "$ENV_FILE" > "$TMP_ENV"

# Write the new variables + cleaned original env back to .env
{
  echo "$NEW_ENV_VARS"
  echo ""
  cat "$TMP_ENV"
} > "$ENV_FILE"

rm "$TMP_ENV"

echo -e "${BLUE}🚀 Starting to upload GitHub secrets from ${ENV_FILE}...${RESET}"

while IFS= read -r line || [ -n "$line" ]; do
  # Trim whitespace
  line=$(echo "$line" | sed 's/^[ \t]*//;s/[ \t]*$//')

  # Skip empty lines or comments
  if [[ -z "$line" || "$line" =~ ^# ]]; then
    echo -e "${YELLOW}⚠️  Skipping comment/empty line${RESET}"
    continue
  fi

  # Check if line contains '='
  if [[ "$line" != *"="* ]]; then
    echo -e "${YELLOW}⚠️  Skipping invalid line (no '='): ${line}${RESET}"
    continue
  fi

  # Remove spaces around '='
  line=$(echo "$line" | sed 's/ *= */=/g')

  key="${line%%=*}"
  value="${line#*=}"

  # Skip if key empty
  if [[ -z "$key" ]]; then
    echo -e "${YELLOW}⚠️  Skipping line with empty key: ${line}${RESET}"
    continue
  fi

  # Remove surrounding quotes from value
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"

  echo -e "${GREEN}✨ Setting secret:${RESET} ${BLUE}$key${RESET} 🔑"
  gh secret set "$key" --body "$value" && echo -e "${GREEN}✅ Secret $key set successfully!${RESET}" || echo -e "${RED}❌ Failed to set secret $key${RESET}"

done < "$ENV_FILE"

echo -e "${BLUE}🎉 All done! Your secrets are now safe and sound in GitHub!${RESET}"
