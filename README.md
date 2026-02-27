# ConverSight 2.0

**React Native 0.68.2 · iOS & Android**

---

## Table of Contents

- [Running the App](#running-the-app)
- [iOS Build Steps (Local)](#ios-build-steps-local)
- [iOS CI/CD — GitHub Actions](#ios-cicd--github-actions)
- [Production Build Status](#production-build-status)
- [iOS Troubleshooting](#ios-troubleshooting)
- [Android Wireless Debugging](#android-wireless-debugging)
- [Push Notifications](#push-notifications)
- [Release Checklist](#release-checklist)
- [Useful Links](#useful-links)

---

## Running the App

```bash
git clone https://devops.conversight.ai/frontend/mobile/conversight2.0.git
cd conversight2.0
yarn install

# Start the Metro development server
yarn start --reset-cache

# Run on Android emulator or device
yarn android

# Pod install (first time only)
cd ios
pod install --repo-update
cd ..

# Run on iOS simulator
yarn ios
```

---

## iOS Build Steps (Local)

> ⚠️ **Local builds are not recommended** if you are on macOS Sequoia (26.x) or Xcode 26.x.
> React Native 0.68.2 was designed for Xcode 13–15. Use the GitHub Actions pipeline instead.

Required workarounds for RN 0.68.2 / 0.70.x local builds:

```bash
# Fix for node path due to nvm
sudo ln -s $(which node) /usr/local/bin/node
```

Manual fixes required in `node_modules` (before pod install):
- Set `"CLANG_CXX_LANGUAGE_STANDARD" => "c++17"` in `node_modules/react-native-reanimated/RNReanimated.podspec`
- Set `:USE_HEADERMAP => "Yes"` in `node_modules/react-native-quick-base64/react-native-quick-base64.podspec`

---

## iOS CI/CD — GitHub Actions

We use **GitHub Actions with a macOS-14 runner (Xcode 15.4)** to build iOS IPAs fully in the cloud.
This removes all dependency on local Mac environment, Xcode version, or Ruby version.

### Why GitHub Actions instead of local builds?

| Problem | Reason |
|---|---|
| Local Mac runs macOS 26.2 / Xcode 26.2 | Too new — breaks React Native 0.68.2 native modules |
| System Ruby deprecation | `File.exists?` and other methods removed in newer Ruby |
| CocoaPods Boost URL broken | `boostorg.jfrog.io` CDN shut down; needs patched URL |
| Developer machine inconsistency | "Works on my machine" failures across team |

### Why not Xcode Cloud?

Xcode Cloud is designed for pure Swift/SwiftUI apps. It has poor support for React Native, Node.js, Yarn, and CocoaPods-heavy projects. GitHub Actions gives full control over the environment, scripts, and secrets.

### Workflows

| File | Branch | Runner | Xcode | Output |
|---|---|---|---|---|
| `.github/workflows/ios-build.yml` | `main` | `macos-14` | 15.4 | Ad Hoc IPA (device testing) |
| `.github/workflows/ios-prod.yml` | `prod` | `macos-15` | 16.2 | App Store IPA (production) |

### Triggering a Build

- **Ad Hoc (testing):** Push to `main` branch, or go to **Actions → iOS Build → Run workflow**
- **Production:** Push to `prod` branch, or go to **Actions → iOS Production Build → Run workflow**

### GitHub Secrets Required

| Secret | Description |
|---|---|
| `BUILD_CERTIFICATE_BASE64` | `.p12` distribution certificate (base64 encoded) |
| `P12_PASSWORD` | Password for the `.p12` file |
| `KEYCHAIN_PASSWORD` | Any random string (used for CI keychain) |
| `APPLE_TEAM_ID` | Your Apple Developer Team ID |
| `PROVISIONING_PROFILE_BASE64` | Ad Hoc provisioning profile (for `ios-build.yml`) |
| `APPSTORE_PROVISIONING_PROFILE_BASE64` | App Store provisioning profile (for `ios-prod.yml`) |

### Downloading the IPA

After a successful build, go to **Actions → select the run → Artifacts** and download the IPA file.
Install Ad Hoc IPAs on a device using [Diawi](https://www.diawi.com/) or Apple Configurator 2.

---

## Production Build Status

> ⚠️ **Production (App Store) builds are currently blocked.**

### Why?

Apple now **requires all iOS and iPadOS apps submitted to the App Store to be built with the iOS 18 SDK (Xcode 16 or later)**.

Our project uses **React Native 0.68.2**, which was released in 2022 and is **not fully compatible with Xcode 16 / iOS 18 SDK**. Several third-party libraries (`QBImagePicker`, `TOCropViewController`, `react-native-quick-base64`) use deprecated or removed APIs that fail to compile under Xcode 16.

### What we can do now

- ✅ **Ad Hoc builds work** — using Xcode 15.4 on `macos-14` runner. IPAs can be installed directly on registered test devices.
- ✅ **Manual upload workaround** — build locally on a Mac with Xcode 16 after resolving library patches, then upload via Transporter app.

### Permanent fix (pending)

Upgrade React Native to **0.73 or later**. The newer versions are built for modern Xcode and iOS SDK. This is the only long-term solution that unblocks App Store submission via CI/CD.

| Task | Status |
|---|---|
| Ad Hoc IPA via GitHub Actions (Xcode 15.4) | ✅ **100% Complete — testing build shared** |
| App Store IPA via GitHub Actions (Xcode 16.2) | ⏳ Blocked — library compatibility |
| React Native upgrade to 0.73+ | 📋 Planned |
| App Store Connect upload via CI | 📋 Pending after RN upgrade |

---

## iOS Troubleshooting

If pods fail locally, run a full clean:

```bash
cd ios
pod cache clean --all
rm -rf Pods Podfile.lock
pod deintegrate
pod setup
cd ..

rm -rf ~/Library/Caches/CocoaPods
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf node_modules yarn.lock
yarn cache clean

yarn install
cd ios && pod install --repo-update
```

### Testing Push Notifications on Simulator

```bash
xcrun simctl push 'iPhone 13' conversight-push-notification.apns
xcrun simctl push 51B697C9-06AF-4244-8E29-564778920365 com.thickstat.conversight conversight-push-notification.apns
```

---

## Android Wireless Debugging

1. Enable Developer Options on the device
2. Enable USB Debugging

```bash
adb tcpip 5555
adb connect <device-ip>:5555
adb devices

# Install debug APK
adb install app-debug.apk
adb install -r app-debug.apk

# When multiple devices are connected
adb -s 62bb86d4 install app-debug.apk

# Launch the app
adb shell am start -n com.conversight/.MainActivity
adb -s 62bb86d4 shell am start -n com.conversight/.MainActivity
```

---

## Push Notifications

- APNs environment is set to `production` in `ios/ConverSight/ConverSight.entitlements`
- Firebase project: [Firebase Console](https://console.firebase.google.com/project/athena-174317/settings/general/android:com.conversight)

---

## Release Checklist

- [ ] Set correct environment (`STAGING` / `PRODUCTION`) in `src/Config/index.ts`
- [ ] **Android:** Update `versionCode` and `versionName` in `android/app/build.gradle`
- [ ] **iOS:** Update `MARKETING_VERSION` in `ios/ConverSight.xcodeproj/project.pbxproj`
- [ ] `CURRENT_PROJECT_VERSION` is auto-incremented by CI using `GITHUB_RUN_NUMBER`
- [ ] Ensure the provisioning profile in Apple Developer Portal is not expired
- [ ] Verify the `.p12` certificate is valid and `BUILD_CERTIFICATE_BASE64` secret is up to date

---

## Useful Links

| Resource | URL |
|---|---|
| Apple Developer (Certificates & Profiles) | https://developer.apple.com/account/ |
| App Store Connect — ConverSight | https://appstoreconnect.apple.com/apps/1439733726/appstore/ios/version/deliverable |
| Google Play Console — ConverSight | https://play.google.com/console/developers/7293141804927298640/app/4975504996913031249/tracks/production |
| Distribute iOS build via Diawi | https://www.diawi.com/ |
| Firebase Console | https://console.firebase.google.com/project/athena-174317 |
