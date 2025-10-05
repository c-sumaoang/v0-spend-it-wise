"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { storage, formatCurrency, type SavingsGoal } from "@/lib/storage"
import { notificationManager } from "@/lib/notifications"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Plus, Target, Trash2, TrendingUp } from "lucide-react"
import { AddSavingsGoalDialog } from "@/components/add-savings-goal-dialog"
import { AllocateFundsDialog } from "@/components/allocate-funds-dialog"

export default function SavingsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null)
  const [showAllocate, setShowAllocate] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadGoals()
  }, [])

  const loadGoals = () => {
    setGoals(storage.getSavingsGoals())
  }

  const handleDeleteGoal = (id: string) => {
    if (confirm("Are you sure you want to delete this savings goal?")) {
      storage.deleteSavingsGoal(id)
      loadGoals()
    }
  }

  const handleAllocate = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId)
    if (goal) {
      setSelectedGoal(goal)
      setShowAllocate(true)
    }
  }

  const handleAllocateSuccess = (goalId: string, amount: number) => {
    storage.allocateToGoal(goalId, amount)
    loadGoals()

    const goal = storage.getSavingsGoals().find((g) => g.id === goalId)
    if (goal) {
      const progress = (goal.currentAmount / goal.targetAmount) * 100
      notificationManager.notifySavingsGoal(goal.name, progress)
    }
  }

  if (!mounted) return null

  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-8 pb-12 rounded-b-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Savings Goals</h1>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm opacity-90">Total Saved</p>
              <p className="text-3xl font-bold">{formatCurrency(totalSaved)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Target</p>
              <p className="text-xl font-semibold">{formatCurrency(totalTarget)}</p>
            </div>
          </div>
          <Progress value={overallProgress} className="h-2 bg-primary-foreground/20" />
          <p className="text-sm opacity-90 text-right">{overallProgress.toFixed(0)}% achieved</p>
        </div>
      </div>

      {/* Goals List */}
      <div className="px-6 -mt-6 space-y-4">
        {goals.length === 0 ? (
          <Card className="p-8 text-center shadow-lg">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">No Savings Goals Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start saving for something special! Set your first goal now.
            </p>
            <Button onClick={() => setShowAddGoal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Goal
            </Button>
          </Card>
        ) : (
          <>
            {goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100
              const remaining = goal.targetAmount - goal.currentAmount
              const isCompleted = progress >= 100

              return (
                <Card key={goal.id} className="p-5 shadow-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{goal.name}</h3>
                      {goal.deadline && (
                        <p className="text-xs text-muted-foreground">
                          Target: {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>

                  {isCompleted ? (
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-center font-semibold">
                      Goal Achieved! 🎉
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{formatCurrency(remaining)} to go</p>
                      <Button size="sm" onClick={() => handleAllocate(goal.id)}>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Add Funds
                      </Button>
                    </div>
                  )}
                </Card>
              )
            })}
          </>
        )}
      </div>

      {/* Floating Add Button */}
      {goals.length > 0 && (
        <div className="fixed bottom-20 right-6">
          <Button size="lg" className="w-14 h-14 rounded-full shadow-lg" onClick={() => setShowAddGoal(true)}>
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <AddSavingsGoalDialog
        open={showAddGoal}
        onOpenChange={setShowAddGoal}
        onSuccess={() => {
          loadGoals()
          setShowAddGoal(false)
        }}
      />

      <AllocateFundsDialog
        open={showAllocate}
        onOpenChange={setShowAllocate}
        goal={selectedGoal}
        onSuccess={handleAllocateSuccess}
      />
    </div>
  )
}
