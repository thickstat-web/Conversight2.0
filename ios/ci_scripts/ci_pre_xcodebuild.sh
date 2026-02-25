#!/bin/bash

# Xcode Cloud pre-build script for React Native with CocoaPods
# This script runs before Xcode builds the project

set -e

echo "🚀 Starting Xcode Cloud pre-build script..."
echo "CI_WORKSPACE: ${CI_WORKSPACE}"
echo "Current directory: $(pwd)"

# In Xcode Cloud, CI_WORKSPACE points to the directory containing the .xcodeproj/.xcworkspace
# For React Native projects, this is typically the ios/ directory
# Since the script is in ios/ci_scripts/, we need to determine paths correctly
CURRENT_DIR="$(pwd)"
CURRENT_DIR_ABS="$(cd "${CURRENT_DIR}" && pwd)"

# If CI_WORKSPACE is set and not empty, use it
if [ -n "${CI_WORKSPACE}" ] && [ -d "${CI_WORKSPACE}" ]; then
    CI_WORKSPACE_ABS="$(cd "${CI_WORKSPACE}" && pwd)"
    echo "CI_WORKSPACE (absolute): ${CI_WORKSPACE_ABS}"
    
    # Check if CI_WORKSPACE is at project root (has ios/ subdirectory)
    if [ -d "${CI_WORKSPACE_ABS}/ios" ]; then
        PROJECT_ROOT="${CI_WORKSPACE_ABS}"
        IOS_DIR="${CI_WORKSPACE_ABS}/ios"
        echo "Detected: CI_WORKSPACE is at project root"
    else
        # CI_WORKSPACE is at ios/ directory, go up one level
        PROJECT_ROOT="$(dirname "${CI_WORKSPACE_ABS}")"
        IOS_DIR="${CI_WORKSPACE_ABS}"
        echo "Detected: CI_WORKSPACE is at ios/ directory"
    fi
else
    # CI_WORKSPACE is not set or empty, infer from current directory
    # Script is in ios/ci_scripts/, so go up two levels for project root
    if [[ "${CURRENT_DIR_ABS}" == */ios/ci_scripts ]]; then
        PROJECT_ROOT="$(dirname "$(dirname "${CURRENT_DIR_ABS}")")"
        IOS_DIR="$(dirname "${CURRENT_DIR_ABS}")"
        echo "Detected: Script is in ios/ci_scripts/, inferred paths"
    elif [[ "${CURRENT_DIR_ABS}" == */ios ]]; then
        PROJECT_ROOT="$(dirname "${CURRENT_DIR_ABS}")"
        IOS_DIR="${CURRENT_DIR_ABS}"
        echo "Detected: Current directory is ios/, inferred paths"
    else
        # Fallback: assume we're at project root
        PROJECT_ROOT="${CURRENT_DIR_ABS}"
        IOS_DIR="${CURRENT_DIR_ABS}/ios"
        echo "Detected: Current directory is project root (fallback)"
    fi
fi

# Convert to absolute paths
PROJECT_ROOT="$(cd "${PROJECT_ROOT}" && pwd)"
IOS_DIR="$(cd "${IOS_DIR}" && pwd)"

echo "Project root: ${PROJECT_ROOT}"
echo "iOS directory: ${IOS_DIR}"

# Verify paths exist
if [ ! -d "${PROJECT_ROOT}" ]; then
    echo "❌ Error: Project root directory does not exist: ${PROJECT_ROOT}"
    exit 1
fi

if [ ! -d "${IOS_DIR}" ]; then
    echo "❌ Error: iOS directory does not exist: ${IOS_DIR}"
    exit 1
fi

# Find and setup Node.js/npm
echo "🔍 Setting up Node.js environment..."

# Function to find Node.js
find_node() {
    # First, try command -v
    if command -v node &> /dev/null; then
        echo "$(command -v node)"
        return 0
    fi
    
    # Check common locations
    local NODE_PATHS=(
        "/usr/local/bin/node"
        "/opt/homebrew/bin/node"
        "/usr/bin/node"
        "/opt/node/bin/node"
        "/Library/Developer/Toolchains/node"
        "$HOME/.nvm/versions/node/*/bin/node"
    )
    
    for NODE_PATH in "${NODE_PATHS[@]}"; do
        # Handle glob patterns
        if [[ "${NODE_PATH}" == *"*"* ]]; then
            local GLOB_RESULT=$(ls ${NODE_PATH} 2>/dev/null | head -1)
            if [ -n "${GLOB_RESULT}" ] && [ -x "${GLOB_RESULT}" ]; then
                echo "${GLOB_RESULT}"
                return 0
            fi
        elif [ -f "${NODE_PATH}" ] && [ -x "${NODE_PATH}" ]; then
            echo "${NODE_PATH}"
            return 0
        fi
    done
    
    # Check environment variables
    if [ -n "${NODE_BINARY}" ] && [ -x "${NODE_BINARY}" ]; then
        echo "${NODE_BINARY}"
        return 0
    fi
    
    # Try to find via find command in common directories
    for SEARCH_DIR in /usr/local /opt /Library /usr; do
        local FOUND=$(find "${SEARCH_DIR}" -name "node" -type f -executable 2>/dev/null | head -1)
        if [ -n "${FOUND}" ]; then
            echo "${FOUND}"
            return 0
        fi
    done
    
    return 1
}

NODE_BINARY=""
if command -v node &> /dev/null; then
    NODE_BINARY="$(command -v node)"
    echo "✅ Node.js found in PATH: ${NODE_BINARY}"
else
    echo "⚠️  Node.js not in PATH, searching..."
    NODE_BINARY="$(find_node)"
    if [ -n "${NODE_BINARY}" ]; then
        echo "✅ Found Node.js at: ${NODE_BINARY}"
        NODE_DIR="$(dirname "${NODE_BINARY}")"
        export PATH="${NODE_DIR}:${PATH}"
        echo "✅ Added ${NODE_DIR} to PATH"
    else
        echo "⚠️  Node.js not found in standard locations, attempting to install..."
        
        # Try to install Node.js via Homebrew if available
        if command -v brew &> /dev/null; then
            echo "Installing Node.js via Homebrew..."
            brew install node
            if command -v node &> /dev/null; then
                NODE_BINARY="$(command -v node)"
                echo "✅ Node.js installed and found at: ${NODE_BINARY}"
            else
                echo "❌ Error: Failed to install Node.js via Homebrew"
                exit 1
            fi
        # Try to use nvm if available
        elif [ -s "$HOME/.nvm/nvm.sh" ]; then
            echo "Loading nvm..."
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
            nvm install node
            nvm use node
            if command -v node &> /dev/null; then
                NODE_BINARY="$(command -v node)"
                echo "✅ Node.js loaded via nvm at: ${NODE_BINARY}"
            else
                echo "❌ Error: Failed to load Node.js via nvm"
                exit 1
            fi
        else
            echo "❌ Error: Node.js not found and no installation method available"
            echo "Xcode Cloud should have Node.js available for React Native projects"
            echo "Please check your Xcode Cloud workflow configuration"
            echo "PATH: ${PATH}"
            exit 1
        fi
    fi
fi

# Verify node is accessible
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js still not accessible after PATH update"
    exit 1
fi

# Find npm
if ! command -v npm &> /dev/null; then
    echo "⚠️  npm not in PATH, searching..."
    NODE_DIR="$(dirname "$(command -v node)")"
    if [ -f "${NODE_DIR}/npm" ]; then
        export PATH="${NODE_DIR}:${PATH}"
        echo "✅ Found npm at: ${NODE_DIR}/npm"
    else
        # Try to find npm separately
        NPM_PATHS=(
            "/usr/local/bin/npm"
            "/opt/homebrew/bin/npm"
            "/usr/bin/npm"
        )
        for NPM_PATH in "${NPM_PATHS[@]}"; do
            if [ -f "${NPM_PATH}" ] && [ -x "${NPM_PATH}" ]; then
                NPM_DIR="$(dirname "${NPM_PATH}")"
                export PATH="${NPM_DIR}:${PATH}"
                echo "✅ Found npm at: ${NPM_PATH}"
                break
            fi
        done
    fi
fi

# Final verification
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "❌ Error: Node.js or npm not available"
    echo "Node.js: $(command -v node || echo 'NOT FOUND')"
    echo "npm: $(command -v npm || echo 'NOT FOUND')"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd "${PROJECT_ROOT}"

if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in ${PROJECT_ROOT}"
    exit 1
fi

if [ -f "yarn.lock" ]; then
    echo "Using Yarn to install dependencies..."
    if ! command -v yarn &> /dev/null; then
        echo "⚠️  Yarn not found, installing via npm..."
        if ! command -v npm &> /dev/null; then
            echo "❌ Error: npm command not found"
            exit 1
        fi
        npm install -g yarn
        if ! command -v yarn &> /dev/null; then
            echo "❌ Error: Failed to install yarn"
            exit 1
        fi
        echo "✅ Yarn installed successfully"
    fi
    yarn install --frozen-lockfile
else
    echo "Using npm to install dependencies..."
    if ! command -v npm &> /dev/null; then
        echo "❌ Error: npm command not found"
        exit 1
    fi
    npm ci
fi

# Install CocoaPods dependencies
echo "📦 Installing CocoaPods dependencies..."
cd "${IOS_DIR}"

if [ ! -f "Podfile" ]; then
    echo "❌ Error: Podfile not found in ${IOS_DIR}"
    exit 1
fi

# Install Bundler gems if Gemfile exists
if [ -f "${PROJECT_ROOT}/Gemfile" ]; then
    echo "Installing Bundler gems..."
    cd "${PROJECT_ROOT}"
    if ! command -v bundle &> /dev/null; then
        echo "⚠️  Warning: bundle command not found, installing bundler..."
        gem install bundler
    fi
    bundle install
    cd "${IOS_DIR}"
fi

# Run pod install
echo "Running pod install..."
if command -v bundle &> /dev/null && [ -f "${PROJECT_ROOT}/Gemfile" ]; then
    echo "Using bundle exec pod install..."
    bundle exec pod install
else
    echo "Using pod install directly..."
    if ! command -v pod &> /dev/null; then
        echo "❌ Error: pod command not found"
        exit 1
    fi
    pod install
fi

# Verify pod install succeeded
if [ ! -d "${IOS_DIR}/Pods" ]; then
    echo "❌ Error: Pods directory was not created. pod install may have failed."
    exit 1
fi

echo "✅ Pre-build script completed successfully!"
echo "Pods directory exists at: ${IOS_DIR}/Pods"