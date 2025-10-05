"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { notificationManager, type NotificationSettings } from "@/lib/notifications"
import { storage, downloadData, getCategoryLimitStatus, formatCurrency } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Bell,
  BellOff,
  Moon,
  Sun,
  Palette,
  Download,
  Upload,
  Trophy,
  Target,
  Trash2,
  Plus,
  AlertCircle,
} from "lucide-react"
import { ManageCategoriesDialog } from "@/components/manage-categories-dialog"
import { CategoryLimitDialog } from "@/components/category-limit-dialog"

export default function SettingsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>(notificationManager.getSettings())
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false)
  const [showLimitDialog, setShowLimitDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedLimit, setSelectedLimit] = useState<any>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reminderIntervalOptions = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" },
    { value: 120, label: "2 hours" },
    { value: 180, label: "3 hours" },
    { value: 240, label: "4 hours" },
    { value: 300, label: "5 hours" },
    { value: 360, label: "6 hours" },
  ]

  useEffect(() => {
    setMounted(true)
    setPermission(notificationManager.getPermission())
    const darkMode = localStorage.getItem("darkMode") === "true"
    setIsDarkMode(darkMode)
    if (darkMode) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const handleRequestPermission = async () => {
    const granted = await notificationManager.requestPermission()
    setPermission(notificationManager.getPermission())

    if (granted) {
      const newSettings = { ...settings, enabled: true }
      setSettings(newSettings)
      notificationManager.updateSettings(newSettings)
      notificationManager.scheduleDailyReminder()
    }
  }

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    notificationManager.updateSettings({ [key]: value })
  }

  const handleThresholdChange = (key: "warning" | "critical", value: string) => {
    const numValue = Number.parseInt(value) || 0
    const newThresholds = { ...settings.thresholds, [key]: numValue }
    const newSettings = { ...settings, thresholds: newThresholds }
    setSettings(newSettings)
    notificationManager.updateSettings({ thresholds: newThresholds })
  }

  const handleTestNotification = () => {
    notificationManager.send("Test Notification 🔔", {
      body: "Your notifications are working perfectly!",
    })
  }

  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      localStorage.clear()
      router.push("/onboarding")
    }
  }

  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked)
    localStorage.setItem("darkMode", checked.toString())
    if (checked) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const jsonData = event.target?.result as string
        const success = storage.importData(jsonData)
        if (success) {
          alert("Data imported successfully!")
          window.location.reload()
        } else {
          alert("Failed to import data. Please check the file format.")
        }
      }
      reader.readAsText(file)
    }
  }

  const handleSetLimit = (categoryName: string, existingLimit?: any) => {
    setSelectedCategory(categoryName)
    setSelectedLimit(existingLimit)
    setShowLimitDialog(true)
  }

  const handleDeleteLimit = (limitId: string) => {
    if (confirm("Are you sure you want to delete this category limit?")) {
      storage.deleteCategoryLimit(limitId)
      setMounted(false)
      setTimeout(() => setMounted(true), 0)
    }
  }

  const handleClearAllLimits = () => {
    if (confirm("Are you sure you want to clear all category limits? This cannot be undone.")) {
      const limits = storage.getCategoryLimits()
      limits.forEach((limit) => storage.deleteCategoryLimit(limit.id))
      setMounted(false)
      setTimeout(() => setMounted(true), 0)
    }
  }

  const handleLimitDialogClose = () => {
    setShowLimitDialog(false)
    setSelectedCategory(undefined)
    setSelectedLimit(undefined)
    setMounted(false)
    setTimeout(() => setMounted(true), 0)
  }

  if (!mounted) return null

  const categories = storage.getCategories()
  const categoryLimits = storage.getCategoryLimits()
  const expenses = storage.getExpenses()

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 sm:px-6 py-6 rounded-b-3xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="px-4 sm:px-6 mt-6 space-y-6">
        {/* Category Spending Limits */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold">Category Spending Limits</h2>
            </div>
            {categoryLimits.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearAllLimits} className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {categories.map((category) => {
              const limit = categoryLimits.find((l) => l.categoryName === category.name)
              const limitStatus = limit ? getCategoryLimitStatus(category.name, expenses) : null

              return (
                <div key={category.id} className="p-3 sm:p-4 rounded-lg border">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <span className="text-2xl sm:text-3xl flex-shrink-0">{category.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base break-words">{category.name}</h3>
                        {limit && limitStatus && (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {formatCurrency(limitStatus.spent)} / {formatCurrency(limit.limitAmount)} ({limit.period})
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {limit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteLimit(limit.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={limit ? "outline" : "default"}
                        onClick={() => handleSetLimit(category.name, limit)}
                        className="text-xs sm:text-sm"
                      >
                        {limit ? (
                          "Edit"
                        ) : (
                          <>
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Set
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {limit && limitStatus && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="flex items-center gap-2">
                          {limitStatus.status === "danger" && (
                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                          )}
                          {limitStatus.status === "warning" && (
                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                          )}
                          <span
                            className={
                              limitStatus.status === "danger"
                                ? "text-red-600 font-medium"
                                : limitStatus.status === "warning"
                                  ? "text-yellow-600 font-medium"
                                  : "text-green-600 font-medium"
                            }
                          >
                            {limitStatus.percentage.toFixed(0)}% used
                          </span>
                        </span>
                        <span className="text-muted-foreground">
                          {formatCurrency(Math.max(0, limitStatus.remaining))} left
                        </span>
                      </div>
                      <Progress
                        value={Math.min(limitStatus.percentage, 100)}
                        className={
                          limitStatus.status === "danger"
                            ? "[&>div]:bg-red-500"
                            : limitStatus.status === "warning"
                              ? "[&>div]:bg-yellow-500"
                              : "[&>div]:bg-green-500"
                        }
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Appearance Settings */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <div>
                  <Label htmlFor="darkMode" className="text-sm sm:text-base">
                    Dark Mode
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Switch between light and dark theme</p>
                </div>
              </div>
              <Switch id="darkMode" checked={isDarkMode} onCheckedChange={handleDarkModeToggle} />
            </div>

            <div className="h-px bg-border" />

            <Button
              variant="outline"
              className="w-full bg-transparent text-sm sm:text-base"
              onClick={() => setShowCategoriesDialog(true)}
            >
              Manage Categories
            </Button>
          </div>
        </Card>

        {/* Notification Permission */}
        {permission !== "granted" && (
          <Card className="p-6 border-accent/50 bg-accent/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <BellOff className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Enable Notifications</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get alerts for budget thresholds, daily reminders, and savings goals.
                </p>
                <Button onClick={handleRequestPermission} size="sm">
                  Enable Notifications
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Notification Settings */}
        {permission === "granted" && (
          <>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Notification Preferences</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enabled">All Notifications</Label>
                    <p className="text-sm text-muted-foreground">Master switch for all notifications</p>
                  </div>
                  <Switch
                    id="enabled"
                    checked={settings.enabled}
                    onCheckedChange={(checked) => handleSettingChange("enabled", checked)}
                  />
                </div>

                <div className="h-px bg-border" />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="budgetAlerts">Budget Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify when reaching spending thresholds</p>
                  </div>
                  <Switch
                    id="budgetAlerts"
                    checked={settings.budgetAlerts}
                    onCheckedChange={(checked) => handleSettingChange("budgetAlerts", checked)}
                    disabled={!settings.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dailyReminders">Expense Reminders</Label>
                    <p className="text-sm text-muted-foreground">Periodic reminders to log expenses</p>
                  </div>
                  <Switch
                    id="dailyReminders"
                    checked={settings.dailyReminders}
                    onCheckedChange={(checked) => handleSettingChange("dailyReminders", checked)}
                    disabled={!settings.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="savingsGoals">Savings Goals</Label>
                    <p className="text-sm text-muted-foreground">Updates on savings progress</p>
                  </div>
                  <Switch
                    id="savingsGoals"
                    checked={settings.savingsGoals}
                    onCheckedChange={(checked) => handleSettingChange("savingsGoals", checked)}
                    disabled={!settings.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="categoryLimitAlerts">Category Limit Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alert when category limits are reached</p>
                  </div>
                  <Switch
                    id="categoryLimitAlerts"
                    checked={settings.categoryLimitAlerts}
                    onCheckedChange={(checked) => handleSettingChange("categoryLimitAlerts", checked)}
                    disabled={!settings.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weeklyReport">Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Weekly spending summary</p>
                  </div>
                  <Switch
                    id="weeklyReport"
                    checked={settings.weeklyReport}
                    onCheckedChange={(checked) => handleSettingChange("weeklyReport", checked)}
                    disabled={!settings.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="monthlyReport">Monthly Reports</Label>
                    <p className="text-sm text-muted-foreground">Monthly spending analysis</p>
                  </div>
                  <Switch
                    id="monthlyReport"
                    checked={settings.monthlyReport}
                    onCheckedChange={(checked) => handleSettingChange("monthlyReport", checked)}
                    disabled={!settings.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="recurringExpenseReminders">Recurring Expense Reminders</Label>
                    <p className="text-sm text-muted-foreground">Remind about upcoming recurring expenses</p>
                  </div>
                  <Switch
                    id="recurringExpenseReminders"
                    checked={settings.recurringExpenseReminders}
                    onCheckedChange={(checked) => handleSettingChange("recurringExpenseReminders", checked)}
                    disabled={!settings.enabled}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Reminder Settings</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="reminderInterval">Reminder Interval</Label>
                  <select
                    id="reminderInterval"
                    value={settings.reminderInterval}
                    onChange={(e) => handleSettingChange("reminderInterval", Number(e.target.value))}
                    disabled={!settings.enabled || !settings.dailyReminders}
                    className="w-full mt-2 px-3 py-2 border rounded-md bg-background"
                  >
                    {reminderIntervalOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">How often to remind you to log expenses</p>
                </div>

                <div>
                  <Label htmlFor="reminderTime">Daily Summary Time</Label>
                  <Input
                    id="reminderTime"
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => handleSettingChange("reminderTime", e.target.value)}
                    disabled={!settings.enabled}
                  />
                  <p className="text-xs text-muted-foreground mt-1">When to send daily summary</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Budget Alert Thresholds</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="warning">Warning Threshold (%)</Label>
                  <Input
                    id="warning"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.thresholds.warning}
                    onChange={(e) => handleThresholdChange("warning", e.target.value)}
                    disabled={!settings.enabled || !settings.budgetAlerts}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Alert when spending reaches this percentage</p>
                </div>

                <div>
                  <Label htmlFor="critical">Critical Threshold (%)</Label>
                  <Input
                    id="critical"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.thresholds.critical}
                    onChange={(e) => handleThresholdChange("critical", e.target.value)}
                    disabled={!settings.enabled || !settings.budgetAlerts}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Urgent alert at this percentage</p>
                </div>
              </div>
            </Card>

            <Button
              variant="outline"
              className="w-full bg-transparent text-sm sm:text-base"
              onClick={handleTestNotification}
            >
              Send Test Notification
            </Button>
          </>
        )}

        {/* Data Management */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Data Management</h2>

          <div className="space-y-3">
            <Button variant="outline" className="w-full bg-transparent text-sm sm:text-base" onClick={downloadData}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>

            <Button
              variant="outline"
              className="w-full bg-transparent text-sm sm:text-base"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportData}
            />

            <Button
              variant="outline"
              className="w-full bg-transparent text-sm sm:text-base"
              onClick={() => router.push("/income")}
            >
              Income Tracking
            </Button>

            <Button
              variant="outline"
              className="w-full bg-transparent text-sm sm:text-base"
              onClick={() => router.push("/debts")}
            >
              Debt Tracking
            </Button>

            <Button
              variant="outline"
              className="w-full bg-transparent text-sm sm:text-base"
              onClick={() => router.push("/challenges")}
            >
              Spending Challenges
            </Button>

            <Button
              variant="outline"
              className="w-full bg-transparent text-sm sm:text-base"
              onClick={() => router.push("/onboarding")}
            >
              Edit Allowance
            </Button>

            <Button
              variant="outline"
              className="w-full bg-transparent text-sm sm:text-base"
              onClick={() => router.push("/achievements")}
            >
              <Trophy className="w-4 h-4 mr-2" />
              View Achievements
            </Button>

            <Button variant="destructive" className="w-full text-sm sm:text-base" onClick={handleResetData}>
              Reset All Data
            </Button>
          </div>
        </Card>
      </div>

      {/* Category Management Dialog */}
      <ManageCategoriesDialog open={showCategoriesDialog} onOpenChange={setShowCategoriesDialog} />

      {/* Category Limit Dialog */}
      <CategoryLimitDialog
        open={showLimitDialog}
        onOpenChange={setShowLimitDialog}
        onSuccess={handleLimitDialogClose}
        categoryName={selectedCategory}
        existingLimit={selectedLimit}
      />
    </div>
  )
}
