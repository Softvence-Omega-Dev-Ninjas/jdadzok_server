#!/bin/bash

ENV_FILE=".env"

while IFS= read -r line || [ -n "$line" ]; do
  # Skip empty lines and comments
  if [[ -z "$line" || "$line" =~ ^# ]]; then
    continue
  fi

  # Remove spaces around '=' if any
  line=$(echo "$line" | sed 's/ *= */=/g')

  # Extract key and value
  key="${line%%=*}"
  value="${line#*=}"

  # Remove surrounding quotes (single or double) if any
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"

  echo "Setting secret: $key"
  gh secret set "$key" --body "$value"
done < "$ENV_FILE"
