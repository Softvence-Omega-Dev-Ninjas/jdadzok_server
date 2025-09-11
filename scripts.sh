#!/bin/bash

ENV_FILE=".env"

# Colors
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
RESET="\033[0m"

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
