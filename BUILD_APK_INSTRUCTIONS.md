# Building SpendWise as an Android APK

This guide explains how to convert your SpendWise PWA (Progressive Web App) into an installable Android APK file.

## Option 1: PWABuilder (Recommended - Easiest)

PWABuilder is a free tool from Microsoft that converts PWAs into native apps.

### Steps:

1. **Deploy your app** to a public URL (e.g., Vercel, Netlify)
   - Click "Publish" in v0 to deploy to Vercel
   - Your app will be available at: `https://your-app.vercel.app`

2. **Visit PWABuilder**
   - Go to: https://www.pwabuilder.com
   - Enter your deployed app URL
   - Click "Start"

3. **Generate Android Package**
   - PWABuilder will analyze your PWA
   - Click on "Android" package option
   - Configure your app settings:
     - App name: SpendWise
     - Package ID: com.spendwise.app
     - Version: 1.0.0
   - Click "Generate"

4. **Download and Sign**
   - Download the generated APK or Android App Bundle
   - Sign the APK using Android Studio or jarsigner
   - Install on your Android device

### Pros:
- No coding required
- Free and easy to use
- Generates production-ready packages
- Supports Google Play Store submission

## Option 2: Bubblewrap (Google's Official Tool)

Bubblewrap is Google's official CLI tool for generating Android apps from PWAs.

### Prerequisites:
- Node.js installed
- Android Studio installed
- Java Development Kit (JDK) installed

### Steps:

1. **Install Bubblewrap**
   \`\`\`bash
   npm install -g @bubblewrap/cli
   \`\`\`

2. **Initialize your project**
   \`\`\`bash
   bubblewrap init --manifest https://your-app.vercel.app/manifest.json
   \`\`\`

3. **Build the APK**
   \`\`\`bash
   bubblewrap build
   \`\`\`

4. **Install on device**
   \`\`\`bash
   bubblewrap install
   \`\`\`

### Pros:
- Official Google tool
- Full control over build process
- Command-line automation
- Direct Play Store publishing support

## Option 3: Capacitor (For More Native Features)

If you need more native device features, use Capacitor to wrap your web app.

### Steps:

1. **Install Capacitor**
   \`\`\`bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   \`\`\`

2. **Add Android platform**
   \`\`\`bash
   npm install @capacitor/android
   npx cap add android
   \`\`\`

3. **Build your web app**
   \`\`\`bash
   npm run build
   \`\`\`

4. **Sync to Android**
   \`\`\`bash
   npx cap sync
   \`\`\`

5. **Open in Android Studio**
   \`\`\`bash
   npx cap open android
   \`\`\`

6. **Build APK in Android Studio**
   - Build > Build Bundle(s) / APK(s) > Build APK(s)

### Pros:
- Access to native device APIs
- Full customization
- Can add native plugins
- Better performance for complex apps

## Option 4: Direct PWA Installation (No APK Needed)

Your app is already a PWA and can be installed directly on Android devices without an APK!

### Steps:

1. **Deploy your app** to a public URL
2. **Open in Chrome on Android**
3. **Tap the menu** (three dots)
4. **Select "Install app"** or "Add to Home Screen"
5. **App installs** like a native app

### Pros:
- No build process needed
- Instant updates
- Smaller file size
- Works on all platforms (Android, iOS, Desktop)

## Recommended Approach

For most users, we recommend **Option 4 (Direct PWA Installation)** because:
- No technical setup required
- Works immediately
- Automatic updates
- Cross-platform support

If you need to distribute via Google Play Store, use **Option 1 (PWABuilder)**.

## Publishing to Google Play Store

Once you have your APK/AAB file:

1. **Create a Google Play Developer account** ($25 one-time fee)
2. **Create a new app** in Play Console
3. **Upload your APK/AAB**
4. **Fill in store listing details**
5. **Submit for review**

## Testing Your APK

Before publishing:

1. **Install on test devices**
2. **Test all features offline**
3. **Verify notifications work**
4. **Check data persistence**
5. **Test on different Android versions**

## Important Notes

- Your app already works offline (uses localStorage)
- Notifications are implemented using Web Notifications API
- All data is stored locally on the device
- No backend server required
- PWA features work in the APK

## Support

For issues with:
- PWABuilder: https://github.com/pwa-builder/PWABuilder
- Bubblewrap: https://github.com/GoogleChromeLabs/bubblewrap
- Capacitor: https://capacitorjs.com/docs

Your SpendWise app is production-ready and can be deployed immediately!
