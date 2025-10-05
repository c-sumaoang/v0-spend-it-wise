import { isPlatformNative } from "../platform"

export type BiometricType = "fingerprint" | "face" | "iris" | "none"

class BiometricManager {
  private NativeBiometric: any = null
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
        const { NativeBiometric } = await import("@capacitor/native-biometric")
        this.NativeBiometric = NativeBiometric
      } catch (error) {
        console.error("[v0] Failed to initialize biometric:", error)
        this.isNative = false
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isNative || !this.NativeBiometric) {
      return false
    }

    try {
      const result = await this.NativeBiometric.isAvailable()
      return result.isAvailable
    } catch (error) {
      console.error("[v0] Failed to check biometric availability:", error)
      return false
    }
  }

  async getBiometricType(): Promise<BiometricType> {
    if (!this.isNative || !this.NativeBiometric) {
      return "none"
    }

    try {
      const result = await this.NativeBiometric.isAvailable()
      if (!result.isAvailable) return "none"

      // Map biometric type
      if (result.biometryType === 1) return "fingerprint"
      if (result.biometryType === 2) return "face"
      if (result.biometryType === 3) return "iris"

      return "none"
    } catch (error) {
      console.error("[v0] Failed to get biometric type:", error)
      return "none"
    }
  }

  async authenticate(reason = "Authenticate to access your data"): Promise<boolean> {
    if (!this.isNative || !this.NativeBiometric) {
      // Fallback to password for web
      return this.webPasswordFallback()
    }

    try {
      await this.NativeBiometric.verifyIdentity({
        reason,
        title: "Authentication Required",
        subtitle: "SpendWise",
        description: reason,
      })
      return true
    } catch (error) {
      console.error("[v0] Biometric authentication failed:", error)
      return false
    }
  }

  private webPasswordFallback(): boolean {
    const password = localStorage.getItem("appPassword")
    if (!password) return true // No password set

    const input = prompt("Enter your password:")
    return input === password
  }

  async setCredentials(username: string, password: string): Promise<boolean> {
    if (!this.isNative || !this.NativeBiometric) {
      // Store in localStorage for web
      localStorage.setItem("appPassword", password)
      return true
    }

    try {
      await this.NativeBiometric.setCredentials({
        username,
        password,
        server: "spendwise.app",
      })
      return true
    } catch (error) {
      console.error("[v0] Failed to set credentials:", error)
      return false
    }
  }

  async getCredentials(): Promise<{ username: string; password: string } | null> {
    if (!this.isNative || !this.NativeBiometric) {
      const password = localStorage.getItem("appPassword")
      return password ? { username: "user", password } : null
    }

    try {
      const credentials = await this.NativeBiometric.getCredentials({
        server: "spendwise.app",
      })
      return credentials
    } catch (error) {
      console.error("[v0] Failed to get credentials:", error)
      return null
    }
  }

  async deleteCredentials(): Promise<boolean> {
    if (!this.isNative || !this.NativeBiometric) {
      localStorage.removeItem("appPassword")
      return true
    }

    try {
      await this.NativeBiometric.deleteCredentials({
        server: "spendwise.app",
      })
      return true
    } catch (error) {
      console.error("[v0] Failed to delete credentials:", error)
      return false
    }
  }
}

export const biometricManager = new BiometricManager()
