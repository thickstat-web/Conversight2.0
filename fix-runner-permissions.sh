#!/bin/bash

# Fix permissions for GitHub Actions runner
# This script fixes the permission issue with /Users/runner directory

set -e

echo "🔧 Fixing GitHub Actions runner permissions..."

# Get the current user
CURRENT_USER=$(whoami)
RUNNER_USER="${RUNNER_USER:-$CURRENT_USER}"

echo "Current user: ${CURRENT_USER}"
echo "Runner user: ${RUNNER_USER}"

# Create /Users/runner directory if it doesn't exist
if [ ! -d "/Users/runner" ]; then
    echo "Creating /Users/runner directory..."
    sudo mkdir -p /Users/runner
    sudo chown -R "${RUNNER_USER}:staff" /Users/runner
    sudo chmod 755 /Users/runner
    echo "✅ Created /Users/runner directory"
else
    echo "✅ /Users/runner directory already exists"
fi

# Fix ownership
echo "Fixing ownership of /Users/runner..."
sudo chown -R "${RUNNER_USER}:staff" /Users/runner
sudo chmod -R 755 /Users/runner

# Also ensure the runner's home directory has proper permissions
RUNNER_HOME=$(eval echo ~${RUNNER_USER})
if [ -d "$RUNNER_HOME" ]; then
    echo "Fixing permissions for runner home directory: ${RUNNER_HOME}"
    sudo chown -R "${RUNNER_USER}:staff" "${RUNNER_HOME}"
    sudo chmod -R 755 "${RUNNER_HOME}"
fi

# Check runner directory
if [ -d "${HOME}/actions-runner" ]; then
    echo "Fixing permissions for actions-runner directory..."
    chmod -R 755 "${HOME}/actions-runner"
fi

echo ""
echo "✅ Permissions fixed!"
echo ""
echo "If you're running the runner as a service, you may need to:"
echo "1. Stop the service: cd ~/actions-runner && sudo ./svc.sh stop"
echo "2. Update the service user if needed"
echo "3. Restart the service: sudo ./svc.sh start"
