"use client"

import { useState } from "react"
import { storage, formatCurrency, type Expense } from "@/lib/storage"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Edit2, Repeat } from "lucide-react"
import { AddExpenseDialog } from "./add-expense-dialog"

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: string) => void
  onUpdate: () => void
}

export function ExpenseList({ expenses, onDelete, onUpdate }: ExpenseListProps) {
  const categories = storage.getCategories()
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName)
    return category?.icon || "💰"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-PH", { month: "short", day: "numeric" })
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setShowEditDialog(true)
  }

  const handleEditSuccess = () => {
    setEditingExpense(undefined)
    onUpdate()
  }

  if (expenses.length === 0) {
    return null
  }

  return (
    <>
      <div className="space-y-2">
        {expenses.map((expense) => (
          <Card key={expense.id} className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl flex-shrink-0 relative">
                {getCategoryIcon(expense.category)}
                {expense.isRecurring && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Repeat className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{expense.category}</p>
                  {expense.isRecurring && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {expense.recurringFrequency}
                    </span>
                  )}
                </div>
                {expense.note && <p className="text-sm text-muted-foreground truncate">{expense.note}</p>}
                <p className="text-xs text-muted-foreground">{formatDate(expense.date)}</p>
              </div>

              <div className="flex items-center gap-2">
                <p className="font-semibold text-lg">{formatCurrency(expense.amount)}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => handleEdit(expense)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm("Delete this expense?")) {
                      onDelete(expense.id)
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AddExpenseDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleEditSuccess}
        editingExpense={editingExpense}
      />
    </>
  )
}
