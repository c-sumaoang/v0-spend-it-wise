"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  storage,
  formatCurrency,
  calculateRemainingAllowance,
  getDaysUntilNextAllowance,
  getCategoriesOverLimit,
  type Expense,
} from "@/lib/storage"
import { notificationManager } from "@/lib/notifications"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, TrendingDown, Calendar, Wallet, Settings, Target, AlertCircle } from "lucide-react"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { ExpenseList } from "@/components/expense-list"
import { Progress } from "@/components/ui/progress"
import { InstallPrompt } from "@/components/install-prompt"

export default function DashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [allowance, setAllowance] = useState(storage.getAllowance())
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [remaining, setRemaining] = useState(0)
  const [daysUntilNext, setDaysUntilNext] = useState(0)
  const [categoriesOverLimit, setCategoriesOverLimit] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)

    // Check if onboarding is complete
    if (!storage.isOnboardingComplete() || !storage.getAllowance()) {
      router.push("/onboarding")
      return
    }

    // Load data
    const loadedAllowance = storage.getAllowance()
    const loadedExpenses = storage.getExpenses()

    setAllowance(loadedAllowance)
    setExpenses(loadedExpenses)
    setRemaining(calculateRemainingAllowance(loadedAllowance, loadedExpenses))
    setDaysUntilNext(getDaysUntilNextAllowance(loadedAllowance))

    const overLimit = getCategoriesOverLimit(loadedExpenses)
    setCategoriesOverLimit(overLimit)

    const setupNotifications = async () => {
      const permission = notificationManager.getPermissionStatus()
      if (permission === "default") {
        setTimeout(async () => {
          await notificationManager.requestPermission()
        }, 2000)
      }
    }

    setupNotifications()
  }, [router])

  const refreshData = async () => {
    const loadedAllowance = storage.getAllowance()
    const loadedExpenses = storage.getExpenses()

    setAllowance(loadedAllowance)
    setExpenses(loadedExpenses)

    const newRemaining = calculateRemainingAllowance(loadedAllowance, loadedExpenses)
    setRemaining(newRemaining)
    setDaysUntilNext(getDaysUntilNextAllowance(loadedAllowance))

    if (loadedAllowance) {
      const percentageUsed = (1 - newRemaining / loadedAllowance.amount) * 100

      if (percentageUsed >= 90) {
        notificationManager.notifyBudgetExceeded("Budget", percentageUsed)
      }
    }

    const overLimit = getCategoriesOverLimit(loadedExpenses)
    setCategoriesOverLimit(overLimit)
  }

  if (!mounted || !allowance) {
    return null
  }

  const todayExpenses = expenses.filter((e) => {
    const expenseDate = new Date(e.date)
    const today = new Date()
    return expenseDate.toDateString() === today.toDateString()
  })

  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0)
  const percentageUsed = (1 - remaining / allowance.amount) * 100

  const savingsGoals = storage.getSavingsGoals()
  const activeSavingsGoals = savingsGoals.filter((g) => g.currentAmount < g.targetAmount)

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 pt-8 pb-12 rounded-b-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm opacity-90">Your Balance</p>
            <h1 className="text-4xl font-bold mt-1">{formatCurrency(remaining)}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/settings")}
              className="text-primary-foreground"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm opacity-90">
            <span>Budget used</span>
            <span>{percentageUsed.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-foreground transition-all duration-500"
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 -mt-6 grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="text-lg font-semibold">{formatCurrency(todayTotal)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Days Left</p>
              <p className="text-lg font-semibold">{daysUntilNext}</p>
            </div>
          </div>
        </Card>
      </div>

      {categoriesOverLimit.length > 0 && (
        <div className="px-6 mb-6">
          <Card className="p-4 shadow-lg border-yellow-500/50 bg-yellow-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Category Limits Alert</p>
                <p className="text-xs text-muted-foreground">
                  {categoriesOverLimit.length} {categoriesOverLimit.length === 1 ? "category is" : "categories are"}{" "}
                  approaching limit
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => router.push("/categories")}>
                View
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoriesOverLimit.map((cat) => (
                <span
                  key={cat}
                  className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-500"
                >
                  {cat}
                </span>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Savings Goals */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Savings Goals</h2>
          <Button variant="ghost" size="sm" onClick={() => router.push("/savings")}>
            View All
          </Button>
        </div>

        <Card className="p-4 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Active Goals</p>
              <p className="text-lg font-semibold">{activeSavingsGoals.length}</p>
            </div>
            <Button size="sm" onClick={() => router.push("/savings")}>
              Manage
            </Button>
          </div>

          {activeSavingsGoals.length > 0 && (
            <div className="space-y-2">
              {activeSavingsGoals.slice(0, 2).map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100
                return (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{goal.name}</span>
                      <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-1.5" />
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Expenses */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Expenses</h2>
          {expenses.length > 5 && (
            <Button variant="ghost" size="sm" onClick={() => router.push("/expenses")}>
              View All
            </Button>
          )}
        </div>

        <ExpenseList
          expenses={expenses.slice(0, 5)}
          onDelete={(id) => {
            storage.deleteExpense(id)
            refreshData()
          }}
          onUpdate={refreshData}
        />

        {expenses.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No expenses yet</p>
            <p className="text-sm text-muted-foreground">Start tracking by adding your first expense</p>
          </Card>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-20 right-6">
        <Button size="lg" className="w-14 h-14 rounded-full shadow-lg" onClick={() => setShowAddExpense(true)}>
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Add Expense Dialog */}
      <AddExpenseDialog open={showAddExpense} onOpenChange={setShowAddExpense} onSuccess={refreshData} />

      {/* Install Prompt for PWA */}
      <InstallPrompt />
    </div>
  )
}
