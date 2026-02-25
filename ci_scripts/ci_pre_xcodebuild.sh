#!/bin/bash

# Xcode Cloud pre-build script for React Native with CocoaPods
# This script runs before Xcode builds the project

set -e

echo "🚀 Starting Xcode Cloud pre-build script..."
echo "CI_WORKSPACE: ${CI_WORKSPACE}"
echo "Current directory: $(pwd)"

# In Xcode Cloud, CI_WORKSPACE points to the directory containing the .xcodeproj/.xcworkspace
# For React Native projects, this is typically the ios/ directory
# We need to go up one level to reach the project root
if [ -d "${CI_WORKSPACE}/ios" ]; then
    # CI_WORKSPACE is already at project root
    PROJECT_ROOT="${CI_WORKSPACE}"
    IOS_DIR="${CI_WORKSPACE}/ios"
    echo "Detected: CI_WORKSPACE is at project root"
else
    # CI_WORKSPACE is at ios/ directory, go up one level
    PROJECT_ROOT="$(dirname "${CI_WORKSPACE}")"
    IOS_DIR="${CI_WORKSPACE}"
    echo "Detected: CI_WORKSPACE is at ios/ directory"
fi

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
        echo "❌ Error: yarn command not found"
        exit 1
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