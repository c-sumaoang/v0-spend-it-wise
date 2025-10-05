"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage, type Challenge } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Plus, Trophy, Target, Calendar } from "lucide-react"
import { AddChallengeDialog } from "@/components/add-challenge-dialog"

export default function ChallengesPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadData()
  }, [])

  const loadData = () => {
    setChallenges(storage.getChallenges())
  }

  const handleComplete = (id: string) => {
    storage.completeChallenge(id)
    loadData()
  }

  if (!mounted) return null

  const activeChallenges = challenges.filter((c) => !c.completed)
  const completedChallenges = challenges.filter((c) => c.completed)

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 sm:px-6 py-6 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">Spending Challenges</h1>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary-foreground/10 rounded-xl p-4">
            <p className="text-sm opacity-90 mb-1">Active</p>
            <p className="text-2xl font-bold">{activeChallenges.length}</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-xl p-4">
            <p className="text-sm opacity-90 mb-1">Completed</p>
            <p className="text-2xl font-bold">{completedChallenges.length}</p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active Challenges</h2>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Challenge
          </Button>
        </div>

        {activeChallenges.length === 0 ? (
          <Card className="p-8 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No active challenges</p>
            <p className="text-sm text-muted-foreground mb-4">Create a challenge to improve your spending habits</p>
            <Button onClick={() => setShowAddDialog(true)}>Create Challenge</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeChallenges.map((challenge) => {
              const daysLeft = Math.ceil(
                (new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
              )
              const progress = ((challenge.currentProgress || 0) / challenge.targetDays) * 100

              return (
                <Card key={challenge.id} className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 break-words">{challenge.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2 break-words">{challenge.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {daysLeft} days left
                        </span>
                        <span>•</span>
                        <span>{challenge.targetDays} day goal</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleComplete(challenge.id)}>
                      Complete
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">
                        {challenge.currentProgress || 0} / {challenge.targetDays} days
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} />
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {completedChallenges.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mt-8">Completed Challenges</h2>
            <div className="space-y-3">
              {completedChallenges.map((challenge) => (
                <Card key={challenge.id} className="p-4 sm:p-6 opacity-75">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 break-words">{challenge.name}</h3>
                      <p className="text-sm text-muted-foreground break-words">{challenge.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <AddChallengeDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={loadData} />
    </div>
  )
}
