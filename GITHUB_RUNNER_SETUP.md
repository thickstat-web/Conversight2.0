# GitHub Actions Self-Hosted Runner Setup Guide

This guide will help you set up a self-hosted GitHub Actions runner on macOS for building iOS applications.

## Prerequisites

- macOS machine (physical or VM)
- Administrator access (for installing as a service)
- Internet connection
- GitHub repository access

## Quick Setup

1. **Run the setup script:**
   ```bash
   ./setup-github-runner.sh
   ```

2. **Follow the prompts:**
   - Enter your GitHub repository (format: `owner/repo-name`)
   - Enter a runner name (or use default)
   - Get your registration token from GitHub
   - Choose whether to install as a service

## Manual Setup

If you prefer to set up manually:

### 1. Get Registration Token

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Actions** → **Runners**
3. Click **New self-hosted runner**
4. Select **macOS** as the runner type
5. Copy the registration token

### 2. Download and Configure Runner

```bash
# Create directory
mkdir -p ~/actions-runner
cd ~/actions-runner

# Download latest runner (replace with latest version)
curl -o runner.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-osx-x64-2.311.0.tar.gz

# Extract
tar xzf runner.tar.gz

# Configure
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_REGISTRATION_TOKEN --name my-runner --work _work
```

### 3. Install as Service (Optional)

```bash
# Install as service (runs in background)
sudo ./svc.sh install
sudo ./svc.sh start

# Check status
./svc.sh status
```

### 4. Run Manually (Alternative)

If you don't want to install as a service:

```bash
cd ~/actions-runner
./run.sh
```

## Service Management

### Check Status
```bash
cd ~/actions-runner
./svc.sh status
```

### Stop Service
```bash
cd ~/actions-runner
sudo ./svc.sh stop
```

### Start Service
```bash
cd ~/actions-runner
sudo ./svc.sh start
```

### Uninstall Service
```bash
cd ~/actions-runner
sudo ./svc.sh uninstall
```

## Remove Runner

To remove the runner from GitHub:

1. Go to **Settings** → **Actions** → **Runners**
2. Find your runner and click the three dots
3. Click **Remove**
4. Copy the removal token
5. Run:
   ```bash
   cd ~/actions-runner
   ./config.sh remove --token YOUR_REMOVAL_TOKEN
   ```

## Using the Runner in Workflows

In your GitHub Actions workflow file (`.github/workflows/*.yml`), use:

```yaml
jobs:
  build:
    runs-on: self-hosted
    # or
    runs-on: [self-hosted, macos]
```

## Requirements for iOS Builds

Your macOS runner should have:

- **Xcode** installed (latest version recommended)
- **Command Line Tools**: `xcode-select --install`
- **CocoaPods**: `sudo gem install cocoapods`
- **Node.js 20**: Can be installed via Homebrew or nvm
- **Yarn**: `npm install -g yarn`
- **Ruby 2.7.5**: For CocoaPods (can use rbenv or system Ruby)

## Troubleshooting

### Runner Not Appearing in GitHub

- Check internet connection
- Verify registration token is correct
- Check firewall settings
- Ensure runner service is running

### Build Failures

- Verify Xcode is installed: `xcodebuild -version`
- Check Node.js version: `node --version`
- Verify CocoaPods: `pod --version`
- Check runner logs: `cd ~/actions-runner && cat _diag/Runner_*.log`

### Service Not Starting

- Check permissions: `sudo ./svc.sh status`
- View service logs: `sudo launchctl list | grep actions.runner`
- Reinstall service: `sudo ./svc.sh uninstall && sudo ./svc.sh install`

## Security Considerations

- Keep your runner machine secure and up-to-date
- Use firewall rules to restrict access
- Regularly update the runner software
- Use secrets for sensitive information in workflows
- Consider using runner groups for organization-level runners

## Updating the Runner

```bash
cd ~/actions-runner
./run.sh --update
```

Or download the latest version and reconfigure.

## Example Workflow

See `.github/workflows/ios-build.yml` for an example workflow that uses the self-hosted runner.
