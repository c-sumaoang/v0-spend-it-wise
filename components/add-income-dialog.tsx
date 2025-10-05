"use client"

import { useState, useEffect } from "react"
import { storage, type Income } from "@/lib/storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddIncomeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddIncomeDialog({ open, onOpenChange, onSuccess }: AddIncomeDialogProps) {
  const [amount, setAmount] = useState("")
  const [source, setSource] = useState("")
  const [type, setType] = useState<"part-time" | "scholarship" | "gift" | "other">("part-time")
  const [note, setNote] = useState("")

  useEffect(() => {
    if (open) {
      setAmount("")
      setSource("")
      setType("part-time")
      setNote("")
    }
  }, [open])

  const handleSubmit = () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    if (!source.trim()) {
      alert("Please enter an income source")
      return
    }

    const income: Income = {
      id: Date.now().toString(),
      amount: Number.parseFloat(amount),
      source: source.trim(),
      type,
      note: note.trim() || undefined,
      date: new Date().toISOString(),
    }

    storage.addIncome(income)
    onSuccess()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
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
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              placeholder="e.g., Part-time job, Scholarship"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="part-time">Part-time Job</SelectItem>
                <SelectItem value="scholarship">Scholarship</SelectItem>
                <SelectItem value="gift">Gift</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="Additional details"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          <Button size="lg" className="w-full" onClick={handleSubmit}>
            Add Income
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
