"use client"

import { useEffect } from "react"
import { notificationManager } from "@/lib/notifications"
import { platform } from "@/lib/platform"

let App: any = null
let StatusBar: any = null
let Style: any = null
let SplashScreen: any = null

if (typeof window !== "undefined") {
  Promise.all([
    import("@capacitor/app").catch(() => null),
    import("@capacitor/status-bar").catch(() => null),
    import("@capacitor/splash-screen").catch(() => null),
  ]).then(([appModule, statusBarModule, splashScreenModule]) => {
    if (appModule) App = appModule.App
    if (statusBarModule) {
      StatusBar = statusBarModule.StatusBar
      Style = statusBarModule.Style
    }
    if (splashScreenModule) SplashScreen = splashScreenModule.SplashScreen
  })
}

export function NativeAppInitializer() {
  useEffect(() => {
    const initializeNativeFeatures = async () => {
      console.log("[v0] Initializing native app features")
      console.log("[v0] Platform:", platform.getPlatform())
      console.log("[v0] Is Native:", platform.isNative())

      if (platform.isNative() && App && StatusBar && SplashScreen) {
        await notificationManager.requestPermission()

        // Configure status bar
        if (platform.isPluginAvailable("StatusBar")) {
          await StatusBar.setStyle({ style: Style.Dark })
          if (platform.isAndroid()) {
            await StatusBar.setBackgroundColor({ color: "#10b981" })
          }
        }

        // Hide splash screen after app is ready
        if (platform.isPluginAvailable("SplashScreen")) {
          setTimeout(async () => {
            await SplashScreen.hide()
          }, 1000)
        }

        // Handle app state changes
        if (platform.isPluginAvailable("App")) {
          App.addListener("appStateChange", ({ isActive }: { isActive: boolean }) => {
            console.log("[v0] App state changed. Is active:", isActive)
            if (isActive) {
              console.log("[v0] App is now active")
            }
          })

          // Handle back button on Android
          if (platform.isAndroid()) {
            App.addListener("backButton", ({ canGoBack }: { canGoBack: boolean }) => {
              if (!canGoBack) {
                App.exitApp()
              } else {
                window.history.back()
              }
            })
          }
        }

        console.log("[v0] Native features initialized successfully")
      } else {
        console.log("[v0] Running on web, native features not initialized")
      }
    }

    initializeNativeFeatures()
  }, [])

  return null
}
