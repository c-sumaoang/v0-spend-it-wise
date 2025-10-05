"use client"

import { useState, useEffect } from "react"
import { storage, type CategoryLimit } from "@/lib/storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SetCategoryLimitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryName: string
  editingLimit?: CategoryLimit
  onSuccess: () => void
}

export function SetCategoryLimitDialog({
  open,
  onOpenChange,
  categoryName,
  editingLimit,
  onSuccess,
}: SetCategoryLimitDialogProps) {
  const [amount, setAmount] = useState("")
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly")

  useEffect(() => {
    if (open) {
      if (editingLimit) {
        setAmount(editingLimit.limitAmount.toString())
        setPeriod(editingLimit.period)
      } else {
        setAmount("")
        setPeriod("weekly")
      }
    }
  }, [open, editingLimit])

  const handleSubmit = () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    const limitAmount = Number.parseFloat(amount)

    if (editingLimit) {
      storage.updateCategoryLimit(editingLimit.id, {
        limitAmount,
        period,
      })
    } else {
      storage.setCategoryLimit(categoryName, limitAmount, period)
    }

    onSuccess()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingLimit ? "Edit" : "Set"} Limit for {categoryName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Limit Amount (₱)</Label>
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
            <Label htmlFor="period">Period</Label>
            <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
              <SelectTrigger id="period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The limit will reset every {period === "daily" ? "day" : period === "weekly" ? "week" : "month"}
            </p>
          </div>

          <Button size="lg" className="w-full" onClick={handleSubmit}>
            {editingLimit ? "Update Limit" : "Set Limit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
