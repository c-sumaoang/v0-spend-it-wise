# Fixing Android SDK Version Warning

If you see this warning:
\`\`\`
Warning: SDK processing. This version only understands SDK XML versions up to 3 but an SDK XML file of version 4 was encountered.
\`\`\`

This is a compatibility warning between Android Studio and command-line tools. Here's how to fix it:

## Quick Fix (Recommended)

1. **Update Android Command Line Tools**
   \`\`\`bash
   # Open Android Studio
   # Go to: Tools > SDK Manager > SDK Tools tab
   # Check "Android SDK Command-line Tools (latest)"
   # Click "Apply" to install
   \`\`\`

2. **Set ANDROID_SDK_ROOT environment variable**
   \`\`\`bash
   # Windows (PowerShell)
   $env:ANDROID_SDK_ROOT = "C:\Users\YourUsername\AppData\Local\Android\Sdk"
   
   # macOS/Linux
   export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
   \`\`\`

3. **Re-run Capacitor sync**
   \`\`\`bash
   npx cap sync android
   \`\`\`

## Alternative: Use Compatible SDK Version

If the warning persists, configure Capacitor to use SDK version 3 compatible settings:

1. **After running `npx cap add android`**, edit these files:

### android/build.gradle
\`\`\`gradle
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        // Use Android Gradle Plugin 7.4.2 (compatible with SDK XML v3)
        classpath 'com.android.tools.build:gradle:7.4.2'
        classpath 'com.google.gms:google-services:4.3.15'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
\`\`\`

### android/app/build.gradle
\`\`\`gradle
android {
    compileSdkVersion 33
    defaultConfig {
        applicationId "com.spendwise.app"
        minSdkVersion 22
        targetSdkVersion 33
        versionCode 1
        versionName "1.0"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
\`\`\`

### android/gradle/wrapper/gradle-wrapper.properties
```properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-7.6-all.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
