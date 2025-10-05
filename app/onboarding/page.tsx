"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { storage, type Allowance } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, ArrowRight } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState("")
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly")

  const handleComplete = () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      alert("Please enter a valid allowance amount")
      return
    }

    const allowance: Allowance = {
      id: Date.now().toString(),
      amount: Number.parseFloat(amount),
      frequency,
      startDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    storage.setAllowance(allowance)
    storage.setOnboardingComplete()

    // Initialize default categories
    storage.setCategories(storage.getCategories())

    router.push("/")
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-2xl font-bold mb-3">Welcome to SpendWise</h1>
          <p className="text-muted-foreground mb-8">
            Track your expenses and stay within your allowance. Let's get started by setting up your budget.
          </p>

          <Button size="lg" className="w-full" onClick={() => setStep(2)}>
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8">
        <h2 className="text-2xl font-bold mb-2">Set Your Allowance</h2>
        <p className="text-muted-foreground mb-6">How much allowance do you receive?</p>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₱)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl h-14"
            />
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={frequency === "daily" ? "default" : "outline"}
                onClick={() => setFrequency("daily")}
                className="h-auto py-4"
              >
                <div>
                  <div className="font-semibold">Daily</div>
                  <div className="text-xs opacity-80">Every day</div>
                </div>
              </Button>

              <Button
                variant={frequency === "weekly" ? "default" : "outline"}
                onClick={() => setFrequency("weekly")}
                className="h-auto py-4"
              >
                <div>
                  <div className="font-semibold">Weekly</div>
                  <div className="text-xs opacity-80">Every week</div>
                </div>
              </Button>

              <Button
                variant={frequency === "monthly" ? "default" : "outline"}
                onClick={() => setFrequency("monthly")}
                className="h-auto py-4"
              >
                <div>
                  <div className="font-semibold">Monthly</div>
                  <div className="text-xs opacity-80">Every month</div>
                </div>
              </Button>
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={handleComplete}>
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
