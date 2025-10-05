import { isPlatformNative } from "../platform"

export interface CameraPhoto {
  base64String?: string
  dataUrl?: string
  path?: string
  webPath?: string
  format: string
}

class CameraManager {
  private Camera: any = null
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
        const { Camera } = await import("@capacitor/camera")
        this.Camera = Camera
      } catch (error) {
        console.error("[v0] Failed to initialize camera:", error)
        this.isNative = false
      }
    }
  }

  async takePicture(): Promise<CameraPhoto | null> {
    if (!this.isNative || !this.Camera) {
      // Fallback to web file input
      return this.webCameraFallback()
    }

    try {
      const { CameraResultType, CameraSource } = await import("@capacitor/camera")

      const image = await this.Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      })

      return {
        dataUrl: image.dataUrl,
        base64String: image.base64String,
        path: image.path,
        webPath: image.webPath,
        format: image.format,
      }
    } catch (error) {
      console.error("[v0] Failed to take picture:", error)
      return null
    }
  }

  async pickFromGallery(): Promise<CameraPhoto | null> {
    if (!this.isNative || !this.Camera) {
      return this.webCameraFallback()
    }

    try {
      const { CameraResultType, CameraSource } = await import("@capacitor/camera")

      const image = await this.Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      })

      return {
        dataUrl: image.dataUrl,
        base64String: image.base64String,
        path: image.path,
        webPath: image.webPath,
        format: image.format,
      }
    } catch (error) {
      console.error("[v0] Failed to pick from gallery:", error)
      return null
    }
  }

  private webCameraFallback(): Promise<CameraPhoto | null> {
    return new Promise((resolve) => {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "image/*"

      input.onchange = (e: any) => {
        const file = e.target?.files?.[0]
        if (!file) {
          resolve(null)
          return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
          resolve({
            dataUrl: event.target?.result as string,
            format: file.type.split("/")[1] || "jpeg",
          })
        }
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(file)
      }

      input.click()
    })
  }

  async checkPermissions(): Promise<boolean> {
    if (!this.isNative || !this.Camera) {
      return true // Web doesn't need explicit permission
    }

    try {
      const permissions = await this.Camera.checkPermissions()
      return permissions.camera === "granted" && permissions.photos === "granted"
    } catch (error) {
      console.error("[v0] Failed to check camera permissions:", error)
      return false
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.isNative || !this.Camera) {
      return true
    }

    try {
      const permissions = await this.Camera.requestPermissions()
      return permissions.camera === "granted" && permissions.photos === "granted"
    } catch (error) {
      console.error("[v0] Failed to request camera permissions:", error)
      return false
    }
  }
}

export const cameraManager = new CameraManager()
