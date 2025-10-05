"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Trophy, Flame, Target } from "lucide-react"
import { Button } from "@/components/ui/button"

const ACHIEVEMENTS = [
  { id: "first_expense", name: "First Step", description: "Log your first expense", icon: "🎯" },
  { id: "10_expenses", name: "Getting Started", description: "Log 10 expenses", icon: "📝" },
  { id: "50_expenses", name: "Expense Tracker", description: "Log 50 expenses", icon: "📊" },
  { id: "100_expenses", name: "Budget Master", description: "Log 100 expenses", icon: "👑" },
  { id: "7_day_streak", name: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥" },
  { id: "30_day_streak", name: "Monthly Master", description: "Maintain a 30-day streak", icon: "⭐" },
  { id: "100_day_streak", name: "Century Club", description: "Maintain a 100-day streak", icon: "💯" },
]

export default function AchievementsPage() {
  const router = useRouter()
  const [stats, setStats] = useState(storage.getUserStats())

  useEffect(() => {
    setStats(storage.getUserStats())
  }, [])

  const unlockedAchievements = ACHIEVEMENTS.filter((a) => stats.achievements.includes(a.id))
  const lockedAchievements = ACHIEVEMENTS.filter((a) => !stats.achievements.includes(a.id))

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-primary text-primary-foreground px-6 py-6 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Achievements</h1>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center bg-primary-foreground/10 border-primary-foreground/20">
            <Flame className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-xs opacity-80">Current Streak</div>
          </Card>

          <Card className="p-4 text-center bg-primary-foreground/10 border-primary-foreground/20">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
            <div className="text-xs opacity-80">Achievements</div>
          </Card>

          <Card className="p-4 text-center bg-primary-foreground/10 border-primary-foreground/20">
            <Target className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold">{stats.totalExpensesLogged}</div>
            <div className="text-xs opacity-80">Total Logged</div>
          </Card>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {unlockedAchievements.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Unlocked</h2>
            <div className="space-y-3">
              {unlockedAchievements.map((achievement) => (
                <Card key={achievement.id} className="p-4 border-primary/50 bg-primary/5">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {lockedAchievements.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Locked</h2>
            <div className="space-y-3">
              {lockedAchievements.map((achievement) => (
                <Card key={achievement.id} className="p-4 opacity-50">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl grayscale">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
