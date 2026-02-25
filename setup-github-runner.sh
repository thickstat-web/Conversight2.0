#!/bin/bash

# GitHub Actions Self-Hosted Runner Setup Script for macOS
# This script sets up a self-hosted runner for GitHub Actions

set -e

echo "🚀 Setting up GitHub Actions Self-Hosted Runner for macOS"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
RUNNER_NAME="${HOSTNAME}-runner"
RUNNER_DIR="${HOME}/actions-runner"
GITHUB_REPO=""

# Function to print colored messages
print_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS only"
    exit 1
fi

# Get repository information
echo "Please provide the following information:"
echo ""
read -p "GitHub repository (format: owner/repo-name, e.g., thickstat-web/Conversight2.0): " GITHUB_REPO

if [ -z "$GITHUB_REPO" ]; then
    print_error "Repository name is required"
    exit 1
fi

# Validate repository format
if [[ ! "$GITHUB_REPO" =~ ^[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+$ ]]; then
    print_error "Invalid repository format. Use: owner/repo-name"
    exit 1
fi

read -p "Runner name (default: ${RUNNER_NAME}): " INPUT_NAME
if [ -n "$INPUT_NAME" ]; then
    RUNNER_NAME="$INPUT_NAME"
fi

echo ""
print_info "Repository: ${GITHUB_REPO}"
print_info "Runner name: ${RUNNER_NAME}"
print_info "Installation directory: ${RUNNER_DIR}"
echo ""

# Check if runner is already installed
if [ -d "$RUNNER_DIR" ]; then
    print_warning "Runner directory already exists at ${RUNNER_DIR}"
    read -p "Do you want to remove it and reinstall? (y/N): " REMOVE_EXISTING
    if [[ "$REMOVE_EXISTING" =~ ^[Yy]$ ]]; then
        print_info "Removing existing runner..."
        if [ -f "${RUNNER_DIR}/svc.sh" ]; then
            print_info "Stopping existing service..."
            cd "$RUNNER_DIR"
            ./svc.sh stop || true
            ./svc.sh uninstall || true
        fi
        rm -rf "$RUNNER_DIR"
        print_info "Existing runner removed"
    else
        print_info "Keeping existing installation. Exiting."
        exit 0
    fi
fi

# Create runner directory
mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

# Download the latest runner
print_info "Downloading GitHub Actions runner..."
RUNNER_VERSION=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
RUNNER_VERSION_NUM=$(echo "$RUNNER_VERSION" | sed 's/v//')

print_info "Latest runner version: ${RUNNER_VERSION}"

# Download runner for macOS
RUNNER_ARCH="x64"
if [[ $(uname -m) == "arm64" ]]; then
    RUNNER_ARCH="arm64"
fi

RUNNER_URL="https://github.com/actions/runner/releases/download/${RUNNER_VERSION}/actions-runner-osx-${RUNNER_ARCH}-${RUNNER_VERSION_NUM}.tar.gz"

print_info "Downloading from: ${RUNNER_URL}"
curl -o runner.tar.gz -L "$RUNNER_URL"

# Extract runner
print_info "Extracting runner..."
tar xzf runner.tar.gz
rm runner.tar.gz

# Get registration token
echo ""
print_info "To get your registration token:"
echo "1. Go to: https://github.com/${GITHUB_REPO}/settings/actions/runners/new"
echo "2. Select 'macOS' as the runner type"
echo "3. Copy the registration token"
echo ""
read -p "Enter your registration token: " REGISTRATION_TOKEN

if [ -z "$REGISTRATION_TOKEN" ]; then
    print_error "Registration token is required"
    exit 1
fi

# Configure runner
print_info "Configuring runner..."
./config.sh --url "https://github.com/${GITHUB_REPO}" --token "$REGISTRATION_TOKEN" --name "$RUNNER_NAME" --work "_work" --replace

# Install as a service
echo ""
read -p "Do you want to install the runner as a service (runs automatically in background)? (Y/n): " INSTALL_SERVICE
if [[ ! "$INSTALL_SERVICE" =~ ^[Nn]$ ]]; then
    print_info "Installing runner as a service..."
    sudo ./svc.sh install
    sudo ./svc.sh start
    print_info "Runner service installed and started"
    echo ""
    print_info "Service status:"
    sudo ./svc.sh status
else
    print_info "Runner configured but not installed as service"
    print_info "To run manually, use: cd ${RUNNER_DIR} && ./run.sh"
fi

echo ""
print_info "✅ GitHub Actions runner setup complete!"
echo ""
print_info "Runner details:"
echo "  - Name: ${RUNNER_NAME}"
echo "  - Repository: ${GITHUB_REPO}"
echo "  - Directory: ${RUNNER_DIR}"
echo ""
print_info "Useful commands:"
echo "  - Check status: cd ${RUNNER_DIR} && ./svc.sh status"
echo "  - Stop service: cd ${RUNNER_DIR} && sudo ./svc.sh stop"
echo "  - Start service: cd ${RUNNER_DIR} && sudo ./svc.sh start"
echo "  - Uninstall service: cd ${RUNNER_DIR} && sudo ./svc.sh uninstall"
echo "  - Remove runner: cd ${RUNNER_DIR} && ./config.sh remove --token <TOKEN>"
echo ""
print_info "To use this runner in your workflows, add:"
echo "  runs-on: self-hosted"
echo "  or"
echo "  runs-on: [self-hosted, macos]"
