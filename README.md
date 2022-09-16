# ConverSight2.0

##### Run app

```
git clone https://devops.conversight.ai/frontend/mobile/conversight2.0.git
cd conversight2.0
yarn install

# To run in Android eimulator or device
yarn android

# Pod install for the first time
cd ios
pod install --repo-update
cd ..

# To run in iOS simulator
yarn ios
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

```
# Testing Push notification on Simulator
xcrun simctl push 'iPhone 13' conversight-push-notification.apns
xcrun simctl push 51B697C9-06AF-4244-8E29-564778920365 com.thickstat.conversight conversight-push-notification.apns

# Fix for node path due to nvm
sudo ln -s $(which node) /usr/local/bin/node
```
