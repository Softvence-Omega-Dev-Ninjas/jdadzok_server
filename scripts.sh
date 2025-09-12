#!/bin/bash

ENV_FILE=".env"

# Static values
DOCKER_USERNAME="devlopersabbir"
EMAIL="devlopersabbir@gmail.com"

# Get values from package.json
PACKAGE_NAME=$(node -p "require('./package.json').name || 'empty_name'")
PACKAGE_VERSION=$(node -p "require('./package.json').version || '0.0.1'")

# Colors
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
RESET="\033[0m"

# Prepare new env variables content (quoted)
NEW_ENV_VARS="DOCKER_USERNAME=\"$DOCKER_USERNAME\"
PACKAGE_NAME=\"$PACKAGE_NAME\"
PACKAGE_VERSION=\"$PACKAGE_VERSION\"
EMAIL=\"$EMAIL\""

# Clean old keys from .env (preserve other lines)
TMP_ENV=$(mktemp)
grep -vE '^(DOCKER_USERNAME|PACKAGE_NAME|PACKAGE_VERSION|EMAIL)=' "$ENV_FILE" > "$TMP_ENV"

# Write new .env
{
  echo "$NEW_ENV_VARS"
  echo ""
  cat "$TMP_ENV"
} > "$ENV_FILE"

rm "$TMP_ENV"

echo -e "${BLUE}🚀 Starting to upload GitHub secrets from ${ENV_FILE}...${RESET}"

# Parser that supports multi-line values
current_key=""
current_value=""
in_multiline=0

while IFS= read -r line || [ -n "$line" ]; do
  # Trim whitespace
  line=$(echo "$line" | sed 's/^[ \t]*//;s/[ \t]*$//')

  # Skip empty or comment lines
  [[ -z "$line" || "$line" =~ ^# ]] && {
    [[ $in_multiline -eq 0 ]] && echo -e "${YELLOW}⚠️  Skipping comment/empty line${RESET}"
    continue
  }

  if [[ $in_multiline -eq 0 && "$line" =~ ^([A-Z_][A-Z0-9_]*)=\"(.*) ]]; then
    current_key="${BASH_REMATCH[1]}"
    rest="${BASH_REMATCH[2]}"

    if [[ "$rest" =~ \"$ ]]; then
      current_value="${rest%\"}"
      in_multiline=0
    else
      current_value="${rest}"
      in_multiline=1
      continue
    fi
  elif [[ $in_multiline -eq 1 ]]; then
    current_value="${current_value}"$'\n'"$line"

    if [[ "$line" == *\" ]]; then
      current_value="${current_value%\"}"
      in_multiline=0
    else
      continue
    fi
  else
    echo -e "${YELLOW}⚠️  Skipping invalid line: $line${RESET}"
    continue
  fi

  # Now we have a complete key/value pair
  echo -e "${GREEN}✨ Setting secret:${RESET} ${BLUE}${current_key}${RESET} 🔑"
  gh secret set "$current_key" --body "$current_value" && \
    echo -e "${GREEN}✅ Secret $current_key set successfully!${RESET}" || \
    echo -e "${RED}❌ Failed to set secret $current_key${RESET}"

done < "$ENV_FILE"

echo -e "${BLUE}🎉 All done! Your secrets are now safe and sound in GitHub!${RESET}"
