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
    # Use || true to prevent script exit if find_node returns 1
    NODE_BINARY="$(find_node || echo "")"
    if [ -n "${NODE_BINARY}" ]; then
        echo "✅ Found Node.js at: ${NODE_BINARY}"
        NODE_DIR="$(dirname "${NODE_BINARY}")"
        export PATH="${NODE_DIR}:${PATH}"
        echo "✅ Added ${NODE_DIR} to PATH"
    else
        echo "⚠️  Node.js not found in standard locations, attempting to install..."
        echo "📋 Diagnostic information:"
        echo "   - PATH: ${PATH}"
        echo "   - HOME: ${HOME}"
        echo "   - USER: ${USER}"
        echo "   - Available commands:"
        echo "     * brew: $(command -v brew || echo 'NOT FOUND')"
        echo "     * curl: $(command -v curl || echo 'NOT FOUND')"
        echo "     * wget: $(command -v wget || echo 'NOT FOUND')"
        
        # Try to install Node.js via Homebrew if available
        if command -v brew &> /dev/null; then
            echo "🍺 Installing Node.js via Homebrew..."
            brew install node || {
                echo "⚠️  Homebrew install failed, trying to locate existing installation..."
                # Check if Homebrew has node installed but not in PATH
                BREW_PREFIX=$(brew --prefix)
                if [ -f "${BREW_PREFIX}/bin/node" ]; then
                    export PATH="${BREW_PREFIX}/bin:${PATH}"
                    NODE_BINARY="${BREW_PREFIX}/bin/node"
                    echo "✅ Found Node.js in Homebrew at: ${NODE_BINARY}"
                else
                    echo "❌ Error: Failed to install Node.js via Homebrew"
                    exit 1
                fi
            }
            if command -v node &> /dev/null; then
                NODE_BINARY="$(command -v node)"
                echo "✅ Node.js installed and found at: ${NODE_BINARY}"
            fi
        # Try to use nvm if available
        elif [ -s "$HOME/.nvm/nvm.sh" ]; then
            echo "📦 Loading nvm..."
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
            nvm install node || nvm install --lts
            nvm use node || nvm use --lts
            if command -v node &> /dev/null; then
                NODE_BINARY="$(command -v node)"
                echo "✅ Node.js loaded via nvm at: ${NODE_BINARY}"
            else
                echo "❌ Error: Failed to load Node.js via nvm"
                exit 1
            fi
        # Try downloading Node.js directly
        elif command -v curl &> /dev/null || command -v wget &> /dev/null; then
            echo "📥 Attempting to download and install Node.js..."
            NODE_VERSION="20.11.0"
            NODE_DIR="/tmp/nodejs"
            mkdir -p "${NODE_DIR}"
            
            if command -v curl &> /dev/null; then
                curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-darwin-x64.tar.gz" -o "${NODE_DIR}/node.tar.gz" || {
                    echo "⚠️  Failed to download Node.js, trying alternative method..."
                }
            fi
            
            if [ -f "${NODE_DIR}/node.tar.gz" ]; then
                cd "${NODE_DIR}"
                tar -xzf node.tar.gz
                export PATH="${NODE_DIR}/node-v${NODE_VERSION}-darwin-x64/bin:${PATH}"
                if command -v node &> /dev/null; then
                    NODE_BINARY="$(command -v node)"
                    echo "✅ Node.js installed from download at: ${NODE_BINARY}"
                fi
            fi
        fi
        
        # Final check
        if [ -z "${NODE_BINARY}" ] || ! command -v node &> /dev/null; then
            echo "❌ Error: Node.js not found and installation attempts failed"
            echo "Xcode Cloud should have Node.js available for React Native projects"
            echo "Please check your Xcode Cloud workflow configuration"
            echo ""
            echo "Available directories:"
            ls -la /usr/local/bin/ 2>/dev/null | head -10 || echo "Cannot list /usr/local/bin"
            echo ""
            echo "Searching for any node executable..."
            find /usr /opt /Library -name "node" -type f 2>/dev/null | head -5 || echo "No node found"
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

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Ensure Node.js 20 is used
if [ "${NODE_VERSION}" != "20" ]; then
    echo "⚠️  Node.js version is ${NODE_VERSION}, but Node.js 20 is required"
    echo "Attempting to install/switch to Node.js 20..."
    
    # Try nvm if available
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm install 20
        nvm use 20
        export PATH="$NVM_DIR/versions/node/v20.*/bin:${PATH}"
    # Try installing via Homebrew
    elif command -v brew &> /dev/null; then
        echo "Installing Node.js 20 via Homebrew..."
        brew install node@20 || brew upgrade node@20
        BREW_PREFIX=$(brew --prefix)
        export PATH="${BREW_PREFIX}/opt/node@20/bin:${PATH}"
    # Try downloading Node.js 20 directly
    elif command -v curl &> /dev/null; then
        echo "Downloading Node.js 20..."
        NODE_VERSION="20.11.0"
        NODE_DIR="/tmp/nodejs20"
        mkdir -p "${NODE_DIR}"
        curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-darwin-x64.tar.gz" -o "${NODE_DIR}/node.tar.gz"
        if [ -f "${NODE_DIR}/node.tar.gz" ]; then
            cd "${NODE_DIR}"
            tar -xzf node.tar.gz
            export PATH="${NODE_DIR}/node-v${NODE_VERSION}-darwin-x64/bin:${PATH}"
        fi
    fi
    
    # Verify Node.js 20 is now active
    NEW_NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "${NEW_NODE_VERSION}" = "20" ]; then
        echo "✅ Switched to Node.js 20: $(node --version)"
    else
        echo "⚠️  Warning: Could not switch to Node.js 20, using current version: $(node --version)"
    fi
fi

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
    
    # Check if bundler is installed and if it's the correct version
    if command -v bundle &> /dev/null; then
        BUNDLER_VERSION=$(bundle --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
        echo "Current bundler version: ${BUNDLER_VERSION}"
        
        # Check if we need version 2.1.4
        if [ -f "Gemfile.lock" ] && grep -q "BUNDLED WITH" Gemfile.lock; then
            REQUIRED_BUNDLER=$(grep "BUNDLED WITH" Gemfile.lock | awk '{print $NF}')
            echo "Required bundler version: ${REQUIRED_BUNDLER}"
            
            if [ "${BUNDLER_VERSION}" != "${REQUIRED_BUNDLER}" ]; then
                echo "⚠️  Bundler version mismatch, installing bundler ${REQUIRED_BUNDLER}..."
                gem install bundler -v "${REQUIRED_BUNDLER}"
            fi
        fi
    else
        echo "⚠️  Warning: bundle command not found, installing bundler..."
        # Check Gemfile.lock for required version
        if [ -f "Gemfile.lock" ] && grep -q "BUNDLED WITH" Gemfile.lock; then
            REQUIRED_BUNDLER=$(grep "BUNDLED WITH" Gemfile.lock | awk '{print $NF}')
            echo "Installing bundler version ${REQUIRED_BUNDLER} as specified in Gemfile.lock..."
            gem install bundler -v "${REQUIRED_BUNDLER}"
        else
            echo "Installing latest bundler..."
            gem install bundler
        fi
    fi
    
    # Verify bundler is available
    if ! command -v bundle &> /dev/null; then
        echo "❌ Error: Failed to install bundler"
        exit 1
    fi
    
    echo "✅ Using bundler version: $(bundle --version)"
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