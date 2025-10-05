import { isPlatformNative } from "../platform"

export type HapticImpactStyle = "light" | "medium" | "heavy"
export type HapticNotificationType = "success" | "warning" | "error"

class HapticsManager {
  private Haptics: any = null
  private isNative = false

  constructor() {
    if (typeof window !== "undefined") {
      this.isNative = isPlatformNative()
      this.initialize()
    }
  }

  private async initialize() {
    if (this.isNative) {
      try {
        const { Haptics } = await import("@capacitor/haptics")
        this.Haptics = Haptics
      } catch (error) {
        console.error("[v0] Failed to initialize haptics:", error)
        this.isNative = false
      }
    }
  }

  async impact(style: HapticImpactStyle = "medium") {
    if (!this.isNative || !this.Haptics) {
      // Web fallback - vibrate API
      if ("vibrate" in navigator) {
        const duration = style === "light" ? 10 : style === "medium" ? 20 : 30
        navigator.vibrate(duration)
      }
      return
    }

    try {
      const { ImpactStyle } = await import("@capacitor/haptics")
      const styleMap = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      }
      await this.Haptics.impact({ style: styleMap[style] })
    } catch (error) {
      console.error("[v0] Failed to trigger haptic impact:", error)
    }
  }

  async notification(type: HapticNotificationType) {
    if (!this.isNative || !this.Haptics) {
      if ("vibrate" in navigator) {
        const pattern = type === "success" ? [10, 50, 10] : type === "warning" ? [20, 100, 20] : [30, 150, 30]
        navigator.vibrate(pattern)
      }
      return
    }

    try {
      const { NotificationType } = await import("@capacitor/haptics")
      const typeMap = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      }
      await this.Haptics.notification({ type: typeMap[type] })
    } catch (error) {
      console.error("[v0] Failed to trigger haptic notification:", error)
    }
  }

  async selectionStart() {
    if (!this.isNative || !this.Haptics) {
      if ("vibrate" in navigator) {
        navigator.vibrate(5)
      }
      return
    }

    try {
      await this.Haptics.selectionStart()
    } catch (error) {
      console.error("[v0] Failed to trigger selection start:", error)
    }
  }

  async selectionChanged() {
    if (!this.isNative || !this.Haptics) {
      if ("vibrate" in navigator) {
        navigator.vibrate(5)
      }
      return
    }

    try {
      await this.Haptics.selectionChanged()
    } catch (error) {
      console.error("[v0] Failed to trigger selection changed:", error)
    }
  }

  async selectionEnd() {
    if (!this.isNative || !this.Haptics) {
      if ("vibrate" in navigator) {
        navigator.vibrate(5)
      }
      return
    }

    try {
      await this.Haptics.selectionEnd()
    } catch (error) {
      console.error("[v0] Failed to trigger selection end:", error)
    }
  }
}

export const hapticsManager = new HapticsManager()
