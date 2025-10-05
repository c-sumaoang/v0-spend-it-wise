"use client"

import { useState, useEffect } from "react"
import { storage, type CategoryLimit } from "@/lib/storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CategoryLimitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  categoryName?: string
  existingLimit?: CategoryLimit
}

export function CategoryLimitDialog({
  open,
  onOpenChange,
  onSuccess,
  categoryName: initialCategory,
  existingLimit,
}: CategoryLimitDialogProps) {
  const [categoryName, setCategoryName] = useState(initialCategory || "")
  const [limitAmount, setLimitAmount] = useState("")
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly")
  const categories = storage.getCategories()

  useEffect(() => {
    if (open) {
      if (existingLimit) {
        setCategoryName(existingLimit.categoryName)
        setLimitAmount(existingLimit.limitAmount.toString())
        setPeriod(existingLimit.period)
      } else if (initialCategory) {
        setCategoryName(initialCategory)
        setLimitAmount("")
        setPeriod("weekly")
      } else {
        setCategoryName("")
        setLimitAmount("")
        setPeriod("weekly")
      }
    }
  }, [open, existingLimit, initialCategory])

  const handleSubmit = () => {
    if (!categoryName) {
      alert("Please select a category")
      return
    }

    if (!limitAmount || Number.parseFloat(limitAmount) <= 0) {
      alert("Please enter a valid limit amount")
      return
    }

    storage.setCategoryLimit(categoryName, Number.parseFloat(limitAmount), period)
    onSuccess()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{existingLimit ? "Edit Category Limit" : "Set Category Limit"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryName} onValueChange={setCategoryName} disabled={!!initialCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Limit Amount (₱)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              className="text-xl h-12"
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
          </div>

          <Button size="lg" className="w-full" onClick={handleSubmit}>
            {existingLimit ? "Update Limit" : "Set Limit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
