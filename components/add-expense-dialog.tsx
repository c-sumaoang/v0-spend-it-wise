"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { storage, type Expense, calculateRemainingAllowance, getCategoryLimitStatus } from "@/lib/storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload } from "lucide-react"

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editingExpense?: Expense
}

export function AddExpenseDialog({ open, onOpenChange, onSuccess, editingExpense }: AddExpenseDialogProps) {
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [note, setNote] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState<"daily" | "weekly" | "monthly">("weekly")
  const [receiptPhoto, setReceiptPhoto] = useState<string | undefined>(undefined) // Added receipt photo state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const categories = storage.getCategories()

  useEffect(() => {
    if (open) {
      if (editingExpense) {
        setAmount(editingExpense.amount.toString())
        setCategory(editingExpense.category)
        setNote(editingExpense.note || "")
        setIsRecurring(editingExpense.isRecurring || false)
        setRecurringFrequency(editingExpense.recurringFrequency || "weekly")
        setReceiptPhoto(editingExpense.receiptPhoto) // Load existing receipt photo
      } else {
        setAmount("")
        setCategory("")
        setNote("")
        setIsRecurring(false)
        setRecurringFrequency("weekly")
        setReceiptPhoto(undefined) // Reset receipt photo
      }
    }
  }, [open, editingExpense])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setReceiptPhoto(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    if (!category) {
      alert("Please select a category")
      return
    }

    const expenseAmount = Number.parseFloat(amount)

    if (!editingExpense) {
      const currentAllowance = storage.getAllowance()
      const currentExpenses = storage.getExpenses()
      const remaining = calculateRemainingAllowance(currentAllowance, currentExpenses)

      if (expenseAmount > remaining) {
        alert(
          `This expense (₱${expenseAmount.toFixed(2)}) exceeds your remaining allowance (₱${remaining.toFixed(2)}). Please edit your allowance in Settings first or reduce the expense amount.`,
        )
        return
      }
    }

    const categoryLimit = getCategoryLimitStatus(category, storage.getExpenses())
    if (categoryLimit.limit) {
      const newTotal = categoryLimit.spent + expenseAmount
      if (newTotal > categoryLimit.limit.limitAmount) {
        const overage = newTotal - categoryLimit.limit.limitAmount
        alert(
          `This expense will exceed your ${category} limit by ₱${overage.toFixed(2)}. Your ${category} limit is ₱${categoryLimit.limit.limitAmount.toFixed(2)} per ${categoryLimit.limit.period}. Please reduce the amount or adjust your category limit in Settings.`,
        )
        return
      } else if (categoryLimit.percentage >= 80) {
        const willUse = ((newTotal / categoryLimit.limit.limitAmount) * 100).toFixed(0)
        if (
          !confirm(
            `Warning: This expense will bring your ${category} spending to ${willUse}% of your limit. Do you want to continue?`,
          )
        ) {
          return
        }
      }
    }

    if (editingExpense) {
      storage.updateExpense(editingExpense.id, {
        amount: Number.parseFloat(amount),
        category,
        note: note.trim() || undefined,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
        receiptPhoto,
      })
    } else {
      const expense: Expense = {
        id: Date.now().toString(),
        amount: Number.parseFloat(amount),
        category,
        note: note.trim() || undefined,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
        receiptPhoto,
      }
      storage.addExpense(expense)
      storage.incrementExpenseCount() // Track for gamification
    }

    onSuccess()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₱)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-xl h-12"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.name)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                    category === cat.name ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="What did you buy?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Receipt Photo (optional)</Label>
            {receiptPhoto ? (
              <div className="relative">
                <img
                  src={receiptPhoto || "/placeholder.svg"}
                  alt="Receipt"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={handleRemovePhoto}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
            )}
          </div>

          <div className="space-y-3 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="recurring">Recurring Expense</Label>
                <p className="text-xs text-muted-foreground">Automatically track regular expenses</p>
              </div>
              <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
            </div>

            {isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={recurringFrequency} onValueChange={(v: any) => setRecurringFrequency(v)}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button size="lg" className="w-full" onClick={handleSubmit}>
            {editingExpense ? "Update Expense" : "Add Expense"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
