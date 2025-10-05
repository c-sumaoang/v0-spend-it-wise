import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { BottomNav } from "@/components/bottom-nav"
// <CHANGE> Import native app initializer
import { NativeAppInitializer } from "@/components/native-app-initializer"

export const metadata: Metadata = {
  title: "SpendWise - Student Expense Tracker",
  description: "Track your expenses and stay within your allowance",
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: "#10b981",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SpendWise",
  },
  icons: {
    icon: "/icon-192.jpg",
    apple: "/icon-192.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          {/* <CHANGE> Initialize native app features */}
          <NativeAppInitializer />
          {children}
          <BottomNav />
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
