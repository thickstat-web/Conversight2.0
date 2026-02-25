#!/bin/bash

# Xcode Cloud post-clone script
# This script runs after the repository is cloned but before the build starts
# We'll use this to locate and setup Node.js in the PATH

set -e

echo "🔧 Post-clone script: Setting up Node.js environment..."
echo "Current PATH: ${PATH}"

# Check if Node.js is already available
if command -v node &> /dev/null; then
    echo "✅ Node.js is already available: $(node --version)"
    echo "✅ Node.js location: $(command -v node)"
    exit 0
fi

# Search for Node.js in common locations
echo "🔍 Searching for Node.js..."

# Function to search for Node.js
find_node() {
    # Check common binary locations
    local SEARCH_PATHS=(
        "/usr/local/bin"
        "/opt/homebrew/bin"
        "/usr/bin"
        "/opt/node/bin"
        "/Library/Developer/Toolchains"
    )
    
    for SEARCH_DIR in "${SEARCH_PATHS[@]}"; do
        if [ -d "${SEARCH_DIR}" ]; then
            local NODE_PATH="${SEARCH_DIR}/node"
            if [ -f "${NODE_PATH}" ] && [ -x "${NODE_PATH}" ]; then
                echo "${NODE_PATH}"
                return 0
            fi
        fi
    done
    
    # Try find command
    local FOUND=$(find /usr /opt /Library -name "node" -type f -executable 2>/dev/null | head -1)
    if [ -n "${FOUND}" ]; then
        echo "${FOUND}"
        return 0
    fi
    
    return 1
}

# Call find_node but don't fail if it returns 1
NODE_BINARY=""
NODE_BINARY=$(find_node || echo "")

if [ -n "${NODE_BINARY}" ]; then
    NODE_DIR="$(dirname "${NODE_BINARY}")"
    export PATH="${NODE_DIR}:${PATH}"
    echo "✅ Found Node.js at: ${NODE_BINARY}"
    echo "✅ Added ${NODE_DIR} to PATH"
    
    # Verify it works
    if command -v node &> /dev/null; then
        echo "✅ Node.js version: $(node --version)"
        if command -v npm &> /dev/null; then
            echo "✅ npm version: $(npm --version)"
        fi
    fi
else
    echo "⚠️  Node.js not found in standard locations"
    echo "The pre-build script will attempt to find or install Node.js"
fi

echo "✅ Post-clone script completed"
