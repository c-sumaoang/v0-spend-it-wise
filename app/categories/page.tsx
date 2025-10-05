"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage, getCategoryLimitStatus, formatCurrency } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Plus, TrendingUp, AlertCircle } from "lucide-react"
import { CategoryLimitDialog } from "@/components/category-limit-dialog"

export default function CategoriesPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showLimitDialog, setShowLimitDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const categories = storage.getCategories()
  const expenses = storage.getExpenses()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSetLimit = (categoryName: string) => {
    setSelectedCategory(categoryName)
    setShowLimitDialog(true)
  }

  const handleDialogClose = () => {
    setShowLimitDialog(false)
    setSelectedCategory(undefined)
    // Force re-render to show updated limits
    setMounted(false)
    setTimeout(() => setMounted(true), 0)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 sm:px-6 py-6 rounded-b-3xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">Category Limits</h1>
        </div>
        <p className="text-sm opacity-90 mt-2">Set spending limits for each category</p>
      </div>

      <div className="px-4 sm:px-6 mt-6 space-y-4">
        {categories.map((category) => {
          const limitStatus = getCategoryLimitStatus(category.name, expenses)
          const hasLimit = limitStatus.limit !== null

          return (
            <Card key={category.id} className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-3xl flex-shrink-0">{category.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold break-words">{category.name}</h3>
                    {hasLimit && (
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(limitStatus.spent)} / {formatCurrency(limitStatus.limit!.limitAmount)} (
                        {limitStatus.limit!.period})
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={hasLimit ? "outline" : "default"}
                  onClick={() => handleSetLimit(category.name)}
                  className="flex-shrink-0"
                >
                  {hasLimit ? (
                    "Edit"
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" />
                      Set
                    </>
                  )}
                </Button>
              </div>

              {hasLimit && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {limitStatus.status === "danger" && <AlertCircle className="w-4 h-4 text-red-500" />}
                      {limitStatus.status === "warning" && <TrendingUp className="w-4 h-4 text-yellow-500" />}
                      <span
                        className={
                          limitStatus.status === "danger"
                            ? "text-red-600 font-medium"
                            : limitStatus.status === "warning"
                              ? "text-yellow-600 font-medium"
                              : "text-green-600 font-medium"
                        }
                      >
                        {limitStatus.percentage.toFixed(0)}% used
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(Math.max(0, limitStatus.remaining))} left
                    </span>
                  </div>
                  <Progress
                    value={Math.min(limitStatus.percentage, 100)}
                    className={
                      limitStatus.status === "danger"
                        ? "[&>div]:bg-red-500"
                        : limitStatus.status === "warning"
                          ? "[&>div]:bg-yellow-500"
                          : "[&>div]:bg-green-500"
                    }
                  />
                  {limitStatus.percentage >= 90 && (
                    <p className="text-xs text-red-600 font-medium">
                      {limitStatus.remaining < 0
                        ? `Over budget by ${formatCurrency(Math.abs(limitStatus.remaining))}`
                        : "Approaching limit!"}
                    </p>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <CategoryLimitDialog
        open={showLimitDialog}
        onOpenChange={setShowLimitDialog}
        onSuccess={handleDialogClose}
        categoryName={selectedCategory}
        existingLimit={selectedCategory ? storage.getCategoryLimit(selectedCategory) || undefined : undefined}
      />
    </div>
  )
}
