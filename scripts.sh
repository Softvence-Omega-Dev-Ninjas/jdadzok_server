# #!/bin/bash

# # path of package.json file and our .env file
# PACKAGE_JSON="./package.json"
# ENV_FILE="./.env"

# # check package.json file exist or nto 
# if [ ! -f "$PACKAGE_JSON" ]; then
#   echo "Error: package.json not found in current directory."
#   exit 1
# fi

# # extract the name and version from package.json
# # Extract name and version from package.json using jq
# PACKAGE_NAME=$(jq -r '.name' "$PACKAGE_JSON")
# PACKAGE_VERSION=$(jq -r '.version' "$PACKAGE_JSON")

# # Check for jq dependency
# if ! command -v jq >/dev/null 2>&1; then
#     echo "Error: jq is not install"
#     apt install jq
# fi

# # prepare lines to insert
# NAME_LINE="PACKAGE_NAME=\"${PACKAGE_NAME}\""
# VERSION_LINE="PACKAGE_VERSION=\"${PACKAGE_VERSION}\""

# # remove if already has
# grep -v '^PACKAGE_NAME=' "$ENV_FILE" | grep -v '^PACKAGE_VERSION=' > "$ENV_FILE.tmp" 2>/dev/null || true

# # Insert the new values at the top
# {
#   echo "$NAME_LINE"
#   echo "$VERSION_LINE"
#   cat "$ENV_FILE.tmp" 2>/dev/null
# } > "$ENV_FILE"

# # Clean up temporary file
# rm -f "$ENV_FILE.tmp"

# echo ".env file updated with package name and version."