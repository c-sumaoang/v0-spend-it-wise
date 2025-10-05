"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage, formatCurrency, type Income } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Plus, TrendingUp, Trash2 } from "lucide-react"
import { AddIncomeDialog } from "@/components/add-income-dialog"

export default function IncomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [incomes, setIncomes] = useState<Income[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadData()
  }, [])

  const loadData = () => {
    setIncomes(storage.getIncomes())
  }

  const handleDelete = (id: string) => {
    if (confirm("Delete this income entry?")) {
      storage.deleteIncome(id)
      loadData()
    }
  }

  if (!mounted) return null

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 sm:px-6 py-6 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">Income Tracking</h1>
        </div>

        <div className="bg-primary-foreground/10 rounded-2xl p-4 sm:p-6">
          <p className="text-sm opacity-90 mb-1">Total Income</p>
          <p className="text-3xl sm:text-4xl font-bold">{formatCurrency(totalIncome)}</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Income History</h2>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Income
          </Button>
        </div>

        {incomes.length === 0 ? (
          <Card className="p-8 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No income entries yet</p>
            <p className="text-sm text-muted-foreground mb-4">Track additional income beyond your allowance</p>
            <Button onClick={() => setShowAddDialog(true)}>Add First Income</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {incomes.map((income) => (
              <Card key={income.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{income.source}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                        {income.type}
                      </span>
                    </div>
                    {income.note && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{income.note}</p>}
                    <p className="text-xs text-muted-foreground">
                      {new Date(income.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-primary whitespace-nowrap">{formatCurrency(income.amount)}</p>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(income.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddIncomeDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={loadData} />
    </div>
  )
}
