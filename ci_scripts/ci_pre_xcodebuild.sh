#!/bin/bash

# Xcode Cloud pre-build script for React Native with CocoaPods
# This script runs before Xcode builds the project

set -e

echo "🚀 Starting Xcode Cloud pre-build script..."

# In Xcode Cloud, CI_WORKSPACE points to the directory containing the .xcodeproj/.xcworkspace
# For React Native projects, this is typically the ios/ directory
# We need to go up one level to reach the project root
if [ -d "${CI_WORKSPACE}/ios" ]; then
    # CI_WORKSPACE is already at project root
    PROJECT_ROOT="${CI_WORKSPACE}"
    IOS_DIR="${CI_WORKSPACE}/ios"
else
    # CI_WORKSPACE is at ios/ directory, go up one level
    PROJECT_ROOT="$(dirname "${CI_WORKSPACE}")"
    IOS_DIR="${CI_WORKSPACE}"
fi

echo "Project root: ${PROJECT_ROOT}"
echo "iOS directory: ${IOS_DIR}"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd "${PROJECT_ROOT}"

if [ -f "yarn.lock" ]; then
    echo "Using Yarn to install dependencies..."
    yarn install --frozen-lockfile
else
    echo "Using npm to install dependencies..."
    npm ci
fi

# Install CocoaPods dependencies
echo "📦 Installing CocoaPods dependencies..."
cd "${IOS_DIR}"

# Install Bundler gems if Gemfile exists
if [ -f "${PROJECT_ROOT}/Gemfile" ]; then
    echo "Installing Bundler gems..."
    cd "${PROJECT_ROOT}"
    bundle install
    cd "${IOS_DIR}"
fi

# Run pod install
echo "Running pod install..."
if command -v bundle &> /dev/null && [ -f "${PROJECT_ROOT}/Gemfile" ]; then
    bundle exec pod install
else
    pod install
fi

echo "✅ Pre-build script completed successfully!"
