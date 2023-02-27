# ConverSight2.0

##### Running app

```
git clone https://devops.conversight.ai/frontend/mobile/conversight2.0.git
cd conversight2.0
yarn install

# Start the Metro development server
yarn start --reset-cache

# To run in Android eimulator or device
yarn android

# Pod install for the first time
cd ios
pod install --repo-update
cd ..

# To run in iOS simulator
yarn ios
```

##### iOS build Steps

Below are the workaround due to RN v0.70.1 upgrade

```
# Fix for node path due to nvm
sudo ln -s $(which node) /usr/local/bin/node

# Set following configurations before iOS build
Set "CLANG_CXX_LANGUAGE_STANDARD" => "c++17" in node_modules/react-native-reanimated/RNReanimated.podspec
Set :USE_HEADERMAP => "Yes" in node_modules/react-native-quick-base64/react-native-quick-base64.podspec
```

##### Possible solutions for iOS build issues

```
cd ios
pod cache clean --all
rm -rf Pods Podfile.lock
pod deintegrate
pod setup

# From Project root
rm -rf ~/Library/Caches/CocoaPods
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf node_modules yarn.lock
yarn cache clean

yarn install
pod install --repo-update
yarn ios
```

##### Testing Push notification on Simulator

```
xcrun simctl push 'iPhone 13' conversight-push-notification.apns
xcrun simctl push 51B697C9-06AF-4244-8E29-564778920365 com.thickstat.conversight conversight-push-notification.apns
```

##### Android Wireless Debugging

- Enable Developer Options
- Enable USB Debugging

```
adb tcpip 5555

adb connect device-ip:port
adb connect 198.168.2.43:5555

adb devices
adb devices -l

# Install debug APK
adb install app-debug.apk
adb install -r app-debug.apk

# When more than one device/emulator
adb -s 62bb86d4 install app-debug.apk

# Start/Open an installed app
adb shell am start -n com.conversight/.MainActivity

# When more than one device/emulator
adb -s 62bb86d4 shell am start -n com.conversight/.MainActivity
```

##### Release check lists

- Make sure appropriate environments (i.e STAGING / PRODUCTION) is set in src/Config/index.ts
- Android: Update next release version (both versionCode & versionName) in android/app/build.gradle
- iOS: Update the version details (CURRENT_PROJECT_VERSION & MARKETING_VERSION) in ios/ConverSight.xcodeproj/project.pbxproj

##### Push Notification

[Firebase Console](https://console.firebase.google.com/project/athena-174317/settings/general/android:com.conversight)

##### Apple Developer

[Apple Developer Console - For Certificates, Identifiers & Profiles](https://developer.apple.com/account/)

##### Sharing builds for Testing

[Distribute iOS build via Diawi](https://www.diawi.com/)

##### Publishing Builds

[Apple Developer - For Adding Device, Certificate and Profiles](https://developer.apple.com/account/)  
[Apple Store Connect - ConverSight App](https://appstoreconnect.apple.com/apps/1439733726/appstore/ios/version/deliverable)  
[Google Play Console - ConverSight App](https://play.google.com/console/developers/7293141804927298640/app/4975504996913031249/tracks/production)
