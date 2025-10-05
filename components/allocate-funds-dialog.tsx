"use client"

import type React from "react"

import { useState } from "react"
import { formatCurrency, type SavingsGoal, storage, calculateRemainingAllowance } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AllocateFundsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: SavingsGoal | null
  onSuccess: (goalId: string, amount: number) => void
}

export function AllocateFundsDialog({ open, onOpenChange, goal, onSuccess }: AllocateFundsDialogProps) {
  const [amount, setAmount] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!goal || !amount || Number.parseFloat(amount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    const allocatedAmount = Number.parseFloat(amount)

    const currentAllowance = storage.getAllowance()
    const currentExpenses = storage.getExpenses()
    const remainingBalance = calculateRemainingAllowance(currentAllowance, currentExpenses)

    if (remainingBalance <= 0) {
      alert(
        "You don't have any remaining balance to allocate. Please wait for your next allowance or reduce your expenses.",
      )
      return
    }

    if (allocatedAmount > remainingBalance) {
      alert(
        `You can't allocate ₱${allocatedAmount.toFixed(2)} because your remaining balance is only ₱${remainingBalance.toFixed(2)}. Please enter a smaller amount.`,
      )
      return
    }

    onSuccess(goal.id, allocatedAmount)

    // Reset form
    setAmount("")
    onOpenChange(false)
  }

  if (!goal) return null

  const remaining = goal.targetAmount - goal.currentAmount
  const progress = (goal.currentAmount / goal.targetAmount) * 100

  const currentAllowance = storage.getAllowance()
  const currentExpenses = storage.getExpenses()
  const availableBalance = calculateRemainingAllowance(currentAllowance, currentExpenses)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Funds to Goal</DialogTitle>
          <DialogDescription>Allocate money towards "{goal.name}"</DialogDescription>
        </DialogHeader>

        <div className="bg-muted p-4 rounded-lg space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Progress</span>
            <span className="font-semibold">{progress.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Saved</span>
            <span className="font-semibold">{formatCurrency(goal.currentAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-semibold">{formatCurrency(remaining)}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-border">
            <span className="text-muted-foreground">Available Balance</span>
            <span className="font-semibold text-primary">{formatCurrency(availableBalance)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Add (₱)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={availableBalance}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Maximum: {formatCurrency(availableBalance)}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={availableBalance <= 0}>
              Add Funds
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
