# Native App Setup Guide

This guide will help you build SpendWise as a native iOS and Android app using Capacitor.

## Prerequisites

### For iOS Development
- macOS computer
- Xcode 14 or later
- CocoaPods (`sudo gem install cocoapods`)
- Apple Developer Account (for distribution)

### For Android Development
- Android Studio
- Java Development Kit (JDK) 17 or later
- Android SDK

## Setup Steps

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Build the Web App

\`\`\`bash
npm run build
\`\`\`

This creates an optimized production build in the `out` directory.

### 3. Initialize Capacitor (First Time Only)

If you haven't initialized Capacitor yet:

\`\`\`bash
npx cap init
\`\`\`

Follow the prompts:
- App name: `SpendWise`
- App ID: `com.spendwise.app` (or your custom bundle ID)
- Web directory: `out`

### 4. Add Native Platforms

#### For iOS:
\`\`\`bash
npm run cap:add:ios
\`\`\`

#### For Android:
\`\`\`bash
npm run cap:add:android
\`\`\`

### 5. Sync Web Code to Native Projects

After any changes to your web code:

\`\`\`bash
npm run build:mobile
\`\`\`

This builds the Next.js app and syncs it to both iOS and Android projects.

## Building for iOS

### 1. Open Xcode

\`\`\`bash
npm run cap:open:ios
\`\`\`

### 2. Configure Signing

1. Select the project in Xcode
2. Go to "Signing & Capabilities"
3. Select your development team
4. Xcode will automatically manage provisioning profiles

### 3. Configure Push Notifications

1. In Xcode, go to "Signing & Capabilities"
2. Click "+ Capability"
3. Add "Push Notifications"
4. Add "Background Modes" and enable "Remote notifications"

### 4. Update Info.plist

Add the following permissions to `ios/App/App/Info.plist`:

\`\`\`xml
<key>NSUserNotificationsUsageDescription</key>
<string>We need permission to send you budget alerts and reminders</string>
\`\`\`

### 5. Build and Run

1. Select a simulator or connected device
2. Click the "Play" button or press Cmd+R
3. The app will build and launch

### 6. Create Archive for App Store

1. Select "Any iOS Device" as the target
2. Go to Product > Archive
3. Once archived, click "Distribute App"
4. Follow the prompts to upload to App Store Connect

## Building for Android

### 1. Open Android Studio

\`\`\`bash
npm run cap:open:android
\`\`\`

### 2. Configure App

Edit `android/app/build.gradle` if needed:
- Update `versionCode` and `versionName`
- Ensure `minSdkVersion` is 22 or higher

### 3. Configure Push Notifications

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Add an Android app with package name `com.spendwise.app`
4. Download `google-services.json`
5. Place it in `android/app/` directory

### 4. Update AndroidManifest.xml

The necessary permissions are already configured in `android/app/src/main/AndroidManifest.xml`:

\`\`\`xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.INTERNET" />
\`\`\`

### 5. Build and Run

#### Debug Build:
1. Connect an Android device or start an emulator
2. Click the "Run" button (green play icon)
3. Select your device/emulator

#### Release Build:

1. Generate a signing key (first time only):
\`\`\`bash
keytool -genkey -v -keystore spendwise-release-key.keystore -alias spendwise -keyalg RSA -keysize 2048 -validity 10000
\`\`\`

2. Create `android/key.properties`:
\`\`\`properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=spendwise
storeFile=../spendwise-release-key.keystore
