"use client"

import { useState, useEffect } from "react"
import { storage, formatCurrency, type Debt } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, UserPlus, UserMinus, Check } from "lucide-react"
import { AddDebtDialog } from "@/components/add-debt-dialog"

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    loadDebts()
  }, [])

  const loadDebts = () => {
    setDebts(storage.getDebts())
  }

  const handleMarkPaid = (id: string) => {
    storage.markDebtPaid(id)
    loadDebts()
  }

  const handleDelete = (id: string) => {
    if (confirm("Delete this debt record?")) {
      storage.deleteDebt(id)
      loadDebts()
    }
  }

  const owedToMe = debts.filter((d) => d.type === "owed_to_me" && !d.isPaid)
  const owedByMe = debts.filter((d) => d.type === "owed_by_me" && !d.isPaid)
  const totalOwedToMe = owedToMe.reduce((sum, d) => sum + d.amount, 0)
  const totalOwedByMe = owedByMe.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Debts</h1>
            <p className="text-muted-foreground">Track money owed to and from friends</p>
          </div>
          <Button size="icon" className="rounded-full h-12 w-12" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-green-50 dark:bg-green-950">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-600">Owed to Me</p>
            </div>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(totalOwedToMe)}</p>
          </Card>
          <Card className="p-4 bg-red-50 dark:bg-red-950">
            <div className="flex items-center gap-2 mb-2">
              <UserMinus className="w-5 h-5 text-red-600" />
              <p className="text-sm font-medium text-red-600">I Owe</p>
            </div>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(totalOwedByMe)}</p>
          </Card>
        </div>

        {owedToMe.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">People Owe Me</h2>
            <div className="space-y-3">
              {owedToMe.map((debt) => (
                <Card key={debt.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{debt.person}</p>
                      {debt.description && <p className="text-sm text-muted-foreground">{debt.description}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(debt.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-green-600">{formatCurrency(debt.amount)}</p>
                      <Button size="sm" onClick={() => handleMarkPaid(debt.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {owedByMe.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">I Owe</h2>
            <div className="space-y-3">
              {owedByMe.map((debt) => (
                <Card key={debt.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{debt.person}</p>
                      {debt.description && <p className="text-sm text-muted-foreground">{debt.description}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(debt.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-red-600">{formatCurrency(debt.amount)}</p>
                      <Button size="sm" onClick={() => handleMarkPaid(debt.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {debts.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-lg font-semibold mb-2">No debts tracked</h3>
            <p className="text-muted-foreground mb-4">Start tracking money owed to or from friends</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Debt
            </Button>
          </Card>
        )}
      </div>

      <AddDebtDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={loadDebts} />
    </div>
  )
}
