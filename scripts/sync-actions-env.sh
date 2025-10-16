#!/bin/bash
# ===============================================================
# 🔄 Generic GitHub Actions Environment Sync Script
# Description:
#   Reads .env.production and automatically updates all YAML files
#   in .github/ (workflows + actions) to use ${{ secrets.KEY_NAME }}
# Author: Sabbir (ST Sabbir)
# ===============================================================

set -euo pipefail

ENV_FILE=".env.production"
TARGET_DIR=".github"
TMP_FILE=$(mktemp)

GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[1;33m"
RESET="\033[0m"

if [ ! -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}⚠️  Missing ${ENV_FILE}. Please create it first.${RESET}"
  exit 1
fi

echo -e "${BLUE}🚀 Syncing environment keys from ${ENV_FILE}...${RESET}"

# Extract all key names (ignore comments & blanks)
mapfile -t KEYS < <(grep -E '^[A-Z_][A-Z0-9_]*=' "$ENV_FILE" | cut -d '=' -f1)

if [ ${#KEYS[@]} -eq 0 ]; then
  echo -e "${YELLOW}⚠️  No valid keys found in ${ENV_FILE}${RESET}"
  exit 1
fi

# Iterate all .yml and .yaml files in .github
while IFS= read -r file; do
  echo -e "${BLUE}🧩 Processing $file...${RESET}"

  cp "$file" "$TMP_FILE"

  # Ensure env: block exists; if not, create one at top of jobs
  if ! grep -q "env:" "$TMP_FILE"; then
    sed -i '0,/jobs:/s//jobs:\n  env:\n/' "$TMP_FILE"
  fi

  # Remove old AUTO-GENERATED block if any
  sed -i '/# >>> AUTO-GENERATED SECRETS START >>>/,/# <<< AUTO-GENERATED SECRETS END <<</d' "$TMP_FILE"

  {
    echo "  # >>> AUTO-GENERATED SECRETS START >>>"
    echo "  env:"
    for key in "${KEYS[@]}"; do
      echo "    $key: \${{ secrets.$key }}"
    done
    echo "  # <<< AUTO-GENERATED SECRETS END <<<"
  } >> "$TMP_FILE"

  mv "$TMP_FILE" "$file"
  echo -e "${GREEN}✅ Updated secrets block in $file${RESET}"
done < <(find "$TARGET_DIR" -type f \( -name "*.yml" -o -name "*.yaml" \))

# Update action.yml separately (for bash echo injection)
ACTION_FILE="${TARGET_DIR}/actions/setup-and-load-env/action.yml"
if [ -f "$ACTION_FILE" ]; then
  echo -e "${BLUE}🧩 Updating $ACTION_FILE...${RESET}"
  sed -i '/cat <<EOF > .env/,/EOF/d' "$ACTION_FILE"

  {
    echo "        cat <<EOF > .env"
    for key in "${KEYS[@]}"; do
      echo "        $key=\${{ secrets.$key }}"
    done
    echo "        EOF"
  } >> "$ACTION_FILE"

  echo -e "${GREEN}✅ Updated action.yml secret injection block${RESET}"
fi

echo -e "${GREEN}🎉 Sync complete!${RESET}"
echo -e "${BLUE}Keys injected:${RESET}"
for key in "${KEYS[@]}"; do
  echo "  - $key"
done
