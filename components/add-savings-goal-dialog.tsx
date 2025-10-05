"use client"

import type React from "react"

import { useState } from "react"
import { storage, type SavingsGoal } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddSavingsGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddSavingsGoalDialog({ open, onOpenChange, onSuccess }: AddSavingsGoalDialogProps) {
  const [name, setName] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [deadline, setDeadline] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !targetAmount || Number.parseFloat(targetAmount) <= 0) {
      alert("Please fill in all required fields")
      return
    }

    const goal: SavingsGoal = {
      id: Date.now().toString(),
      name: name.trim(),
      targetAmount: Number.parseFloat(targetAmount),
      currentAmount: 0,
      deadline: deadline || undefined,
      createdAt: new Date().toISOString(),
    }

    storage.addSavingsGoal(goal)

    // Reset form
    setName("")
    setTargetAmount("")
    setDeadline("")

    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Savings Goal</DialogTitle>
          <DialogDescription>Set a goal and start saving towards it!</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-name">Goal Name *</Label>
            <Input
              id="goal-name"
              placeholder="e.g., New Phone, School Trip"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-amount">Target Amount (₱) *</Label>
            <Input
              id="target-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Target Date (Optional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
