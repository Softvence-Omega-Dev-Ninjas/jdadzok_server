#!/bin/bash

# Files
CI_YAML=".github/workflows/ci.yaml"
CD_YAML=".github/workflows/cd.yaml"
WORKFLOW_INPUTS_YAML="workflow-inputs.yaml"

# Colors
GREEN="\033[0;32m"
RED="\033[0;31m"
BLUE="\033[0;34m"
RESET="\033[0m"

# Check if inputs file exists
if [ ! -f "$WORKFLOW_INPUTS_YAML" ]; then
    echo -e "${RED}❌ Error: $WORKFLOW_INPUTS_YAML file not found${RESET}"
    exit 1
fi

# Function to update a workflow file
update_workflow() {
    local workflow_file=$1
    local temp_file=$(mktemp)
    
    echo -e "${BLUE}🔄 Updating $workflow_file...${RESET}"
    
    # Read the workflow file and replace the setup-and-load-env step
    awk '
    BEGIN { in_step = 0; printed = 0 }
    /^ *- name: 🔧 Setup and load environment/ { in_step = 1; print; next }
    in_step && /^ *uses: \.\/\.github\/actions\/setup-and-load-env/ { print; next }
    in_step && /^ *with:/ { 
        in_step = 0; 
        print; 
        system("cat '"$WORKFLOW_INPUTS_YAML"' | grep -v '^#' | sed 's/^/    /'"); 
        printed = 1; 
        next 
    }
    in_step { next }
    { print }
    ' "$workflow_file" > "$temp_file"
    
    # Move the temp file to the original
    mv "$temp_file" "$workflow_file"
    echo -e "${GREEN}✅ Updated $workflow_file with inputs from $WORKFLOW_INPUTS_YAML${RESET}"
}

# Update both workflows
update_workflow "$CI_YAML"
update_workflow "$CD_YAML"