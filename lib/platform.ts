let Capacitor: any = null

// Dynamically import Capacitor only if available
if (typeof window !== "undefined") {
  try {
    import("@capacitor/core").then((module) => {
      Capacitor = module.Capacitor
    })
  } catch (error) {
    console.log("[v0] Capacitor not available, running in web-only mode")
  }
}

export const platform = {
  // Check if running as native app
  isNative: (): boolean => {
    if (!Capacitor) return false
    return Capacitor.isNativePlatform()
  },

  // Check if running on iOS
  isIOS: (): boolean => {
    if (!Capacitor) return false
    return Capacitor.getPlatform() === "ios"
  },

  // Check if running on Android
  isAndroid: (): boolean => {
    if (!Capacitor) return false
    return Capacitor.getPlatform() === "android"
  },

  // Check if running on web
  isWeb: (): boolean => {
    if (!Capacitor) return true
    return Capacitor.getPlatform() === "web"
  },

  // Get current platform
  getPlatform: (): string => {
    if (!Capacitor) return "web"
    return Capacitor.getPlatform()
  },

  // Check if feature is available
  isPluginAvailable: (pluginName: string): boolean => {
    if (!Capacitor) return false
    return Capacitor.isPluginAvailable(pluginName)
  },
}

export const isPlatformNative = (): boolean => {
  return platform.isNative()
}
