"use client"

import { useEffect, useState } from "react"
import { platform } from "@/lib/platform"
import { Badge } from "@/components/ui/badge"

export function PlatformBadge() {
  const [currentPlatform, setCurrentPlatform] = useState<string>("")

  useEffect(() => {
    setCurrentPlatform(platform.getPlatform())
  }, [])

  if (!currentPlatform) return null

  const platformEmoji =
    {
      ios: "📱",
      android: "🤖",
      web: "🌐",
    }[currentPlatform] || "💻"

  return (
    <Badge variant="outline" className="text-xs">
      {platformEmoji} {currentPlatform.toUpperCase()}
    </Badge>
  )
}
