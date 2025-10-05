"use client"

import type React from "react"

import { useState } from "react"
import { storage } from "@/lib/storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddDebtDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddDebtDialog({ open, onOpenChange, onSuccess }: AddDebtDialogProps) {
  const [person, setPerson] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"owed_to_me" | "owed_by_me">("owed_to_me")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = Number.parseFloat(amount)
    if (!person || !amountNum || amountNum <= 0) return

    storage.addDebt({
      person,
      amount: amountNum,
      type,
      description: description || undefined,
      date: new Date().toISOString(),
      isPaid: false,
    })

    setPerson("")
    setAmount("")
    setDescription("")
    onSuccess()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Debt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owed_to_me">Someone owes me</SelectItem>
                <SelectItem value="owed_by_me">I owe someone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Person</Label>
            <Input value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Name" required />
          </div>
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <Label>Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this for?"
            />
          </div>
          <Button type="submit" className="w-full">
            Add Debt
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
