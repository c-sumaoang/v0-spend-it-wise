"use client"

import { useState, useEffect } from "react"
import { storage, type Challenge } from "@/lib/storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AddChallengeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddChallengeDialog({ open, onOpenChange, onSuccess }: AddChallengeDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [targetDays, setTargetDays] = useState("7")

  useEffect(() => {
    if (open) {
      setName("")
      setDescription("")
      setTargetDays("7")
    }
  }, [open])

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("Please enter a challenge name")
      return
    }

    const days = Number.parseInt(targetDays)
    if (!days || days <= 0) {
      alert("Please enter a valid number of days")
      return
    }

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)

    const challenge: Challenge = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      targetDays: days,
      currentProgress: 0,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      completed: false,
    }

    storage.addChallenge(challenge)
    onSuccess()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Challenge</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Challenge Name</Label>
            <Input
              id="name"
              placeholder="e.g., No eating out this week"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What are you trying to achieve?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDays">Duration (days)</Label>
            <Input
              id="targetDays"
              type="number"
              min="1"
              value={targetDays}
              onChange={(e) => setTargetDays(e.target.value)}
            />
          </div>

          <Button size="lg" className="w-full" onClick={handleSubmit}>
            Create Challenge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
