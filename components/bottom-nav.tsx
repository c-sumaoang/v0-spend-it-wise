"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, BarChart3, Target, Receipt, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Receipt, label: "Expenses", path: "/expenses" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Target, label: "Savings", path: "/savings" },
    { icon: Users, label: "Debts", path: "/debts" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-primary")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
