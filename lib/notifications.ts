import { isPlatformNative } from "./platform"

export interface NotificationSettings {
  enabled: boolean
  budgetAlerts: boolean
  dailyReminders: boolean
  savingsGoals: boolean
  debtReminders: boolean
  challengeUpdates: boolean
  dailySummary: boolean
  weeklyReport: boolean
  monthlyReport: boolean
  categoryLimitAlerts: boolean
  recurringExpenseReminders: boolean
  reminderInterval: number // in minutes: 15, 30, 60, 120, 180, 240, 300, 360
  thresholds: {
    warning: number
    critical: number
  }
  reminderTime: string
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  budgetAlerts: true,
  dailyReminders: true,
  savingsGoals: true,
  debtReminders: true,
  challengeUpdates: true,
  dailySummary: false,
  weeklyReport: false,
  monthlyReport: false,
  categoryLimitAlerts: true,
  recurringExpenseReminders: true,
  reminderInterval: 60, // Default 1 hour
  thresholds: {
    warning: 75,
    critical: 90,
  },
  reminderTime: "20:00",
}

class NotificationManager {
  private permission: NotificationPermission = "default"
  private isNative = false
  private capacitorPushNotifications: any = null
  private LocalNotifications: any = null
  private scheduledNotifications: Set<number> = new Set()

  constructor() {
    if (typeof window !== "undefined") {
      this.isNative = isPlatformNative()
      this.initializeNotifications()
    }
  }

  private async initializeNotifications() {
    if (this.isNative) {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications")
        const { LocalNotifications } = await import("@capacitor/local-notifications")
        this.capacitorPushNotifications = PushNotifications
        this.LocalNotifications = LocalNotifications

        // Request permission for native push notifications
        const result = await PushNotifications.requestPermissions()
        this.permission = result.receive === "granted" ? "granted" : "denied"

        if (this.permission === "granted") {
          await PushNotifications.register()
          await LocalNotifications.requestPermissions()
        }

        // Listen for notification actions
        await LocalNotifications.addListener("localNotificationActionPerformed", (notification) => {
          console.log("[v0] Notification action performed:", notification)
        })
      } catch (error) {
        console.error("[v0] Failed to initialize native push notifications:", error)
        this.isNative = false
      }
    } else {
      if ("Notification" in window) {
        this.permission = Notification.permission
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (this.isNative && this.capacitorPushNotifications) {
      try {
        const result = await this.capacitorPushNotifications.requestPermissions()
        this.permission = result.receive === "granted" ? "granted" : "denied"

        if (this.permission === "granted") {
          await this.capacitorPushNotifications.register()
          if (this.LocalNotifications) {
            await this.LocalNotifications.requestPermissions()
          }
        }

        return this.permission === "granted"
      } catch (error) {
        console.error("[v0] Failed to request native notification permission:", error)
        return false
      }
    } else {
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications")
        return false
      }

      if (Notification.permission === "granted") {
        this.permission = "granted"
        return true
      }

      if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission()
        this.permission = permission
        return permission === "granted"
      }

      return false
    }
  }

  getPermission(): NotificationPermission {
    return this.permission
  }

  async send(title: string, options: NotificationOptions) {
    await this.sendNotification(title, options)
  }

  updateSettings(partialSettings: Partial<NotificationSettings>) {
    const currentSettings = this.getSettings()
    const newSettings = { ...currentSettings, ...partialSettings }
    this.saveSettings(newSettings)

    // Reschedule notifications if interval changed
    if (partialSettings.reminderInterval !== undefined) {
      this.schedulePeriodicReminders()
    }
  }

  async schedulePeriodicReminders() {
    const settings = this.getSettings()
    if (!settings.enabled || !settings.dailyReminders) {
      await this.cancelAllScheduledReminders()
      return
    }

    await this.cancelAllScheduledReminders()

    if (!this.isNative || !this.LocalNotifications) {
      // Web fallback - use service worker or setInterval
      this.scheduleWebReminders(settings.reminderInterval)
      return
    }

    try {
      const now = new Date()
      const intervalMs = settings.reminderInterval * 60 * 1000
      const notifications = []

      // Schedule next 24 hours of reminders
      for (let i = 1; i <= Math.floor((24 * 60) / settings.reminderInterval); i++) {
        const scheduleTime = new Date(now.getTime() + intervalMs * i)
        const id = Date.now() + i

        notifications.push({
          id,
          title: "Expense Reminder",
          body: "Don't forget to log your expenses!",
          schedule: { at: scheduleTime },
          sound: undefined,
          attachments: undefined,
          actionTypeId: "",
          extra: null,
        })

        this.scheduledNotifications.add(id)
      }

      await this.LocalNotifications.schedule({ notifications })
      console.log(`[v0] Scheduled ${notifications.length} reminders`)
    } catch (error) {
      console.error("[v0] Failed to schedule periodic reminders:", error)
    }
  }

  private scheduleWebReminders(intervalMinutes: number) {
    // Clear existing interval
    const existingInterval = localStorage.getItem("reminderIntervalId")
    if (existingInterval) {
      clearInterval(Number(existingInterval))
    }

    // Set new interval
    const intervalId = setInterval(
      () => {
        const settings = this.getSettings()
        if (settings.enabled && settings.dailyReminders) {
          this.sendNotification("Expense Reminder", {
            body: "Don't forget to log your expenses!",
            icon: "/icon-192x192.png",
            tag: "expense-reminder",
          })
        }
      },
      intervalMinutes * 60 * 1000,
    )

    localStorage.setItem("reminderIntervalId", intervalId.toString())
  }

  async cancelAllScheduledReminders() {
    if (this.isNative && this.LocalNotifications) {
      try {
        const pending = await this.LocalNotifications.getPending()
        if (pending.notifications && pending.notifications.length > 0) {
          await this.LocalNotifications.cancel({
            notifications: pending.notifications.map((n: any) => ({ id: n.id })),
          })
        }
        this.scheduledNotifications.clear()
      } catch (error) {
        console.error("[v0] Failed to cancel scheduled reminders:", error)
      }
    } else {
      const existingInterval = localStorage.getItem("reminderIntervalId")
      if (existingInterval) {
        clearInterval(Number(existingInterval))
        localStorage.removeItem("reminderIntervalId")
      }
    }
  }

  scheduleDailyReminder() {
    this.schedulePeriodicReminders()
  }

  async notifyBudgetMilestone(percentage: number, spent: number, budget: number) {
    const settings = this.getSettings()
    if (!settings.budgetAlerts) return

    let title = ""
    let body = ""

    if (percentage >= 90) {
      title = "Budget Alert!"
      body = `You've spent ${percentage.toFixed(0)}% of your budget ($${spent.toFixed(2)} / $${budget.toFixed(2)})`
    } else if (percentage >= 75) {
      title = "Budget Warning"
      body = `You're at ${percentage.toFixed(0)}% of your budget ($${spent.toFixed(2)} / $${budget.toFixed(2)})`
    } else if (percentage >= 50) {
      title = "Budget Update"
      body = `Halfway there! ${percentage.toFixed(0)}% of budget used ($${spent.toFixed(2)} / $${budget.toFixed(2)})`
    }

    if (title) {
      await this.sendNotification(title, {
        body,
        icon: "/icon-192x192.png",
        tag: "budget-milestone",
      })
    }
  }

  async notifyWeeklyReport(totalSpent: number, topCategory: string, categoryAmount: number) {
    const settings = this.getSettings()
    if (!settings.weeklyReport) return

    await this.sendNotification("Weekly Spending Report", {
      body: `This week: $${totalSpent.toFixed(2)} spent. Top category: ${topCategory} ($${categoryAmount.toFixed(2)})`,
      icon: "/icon-192x192.png",
      tag: "weekly-report",
    })
  }

  async notifyMonthlyReport(totalSpent: number, avgDaily: number, comparison: number) {
    const settings = this.getSettings()
    if (!settings.monthlyReport) return

    const trend = comparison > 0 ? `up ${comparison.toFixed(0)}%` : `down ${Math.abs(comparison).toFixed(0)}%`

    await this.sendNotification("Monthly Spending Report", {
      body: `This month: $${totalSpent.toFixed(2)} spent ($${avgDaily.toFixed(2)}/day avg). ${trend} from last month.`,
      icon: "/icon-192x192.png",
      tag: "monthly-report",
    })
  }

  async notifyCategoryLimit(category: string, spent: number, limit: number, percentage: number) {
    const settings = this.getSettings()
    if (!settings.categoryLimitAlerts) return

    let title = ""
    if (percentage >= 100) {
      title = "Category Limit Exceeded!"
    } else if (percentage >= 90) {
      title = "Category Limit Alert!"
    } else if (percentage >= 75) {
      title = "Category Limit Warning"
    }

    if (title) {
      await this.sendNotification(title, {
        body: `${category}: $${spent.toFixed(2)} / $${limit.toFixed(2)} (${percentage.toFixed(0)}%)`,
        icon: "/icon-192x192.png",
        tag: `category-limit-${category}`,
      })
    }
  }

  async notifyRecurringExpense(expenseName: string, amount: number, dueDate: Date) {
    const settings = this.getSettings()
    if (!settings.recurringExpenseReminders) return

    const daysUntil = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    await this.sendNotification("Recurring Expense Due", {
      body: `${expenseName} ($${amount.toFixed(2)}) is due in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`,
      icon: "/icon-192x192.png",
      tag: `recurring-${expenseName}`,
    })
  }

  private async sendNotification(title: string, options: NotificationOptions) {
    if (this.permission !== "granted") {
      return
    }

    const settings = this.getSettings()
    if (!settings.enabled) {
      return
    }

    if (this.isNative && this.LocalNotifications) {
      try {
        await this.LocalNotifications.schedule({
          notifications: [
            {
              title,
              body: options.body || "",
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 1000) },
              sound: undefined,
              attachments: undefined,
              actionTypeId: "",
              extra: null,
            },
          ],
        })
      } catch (error) {
        console.error("[v0] Failed to send native notification:", error)
      }
    } else {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, options)
      }
    }
  }

  notifyBudgetExceeded(category: string, percentage: number) {
    const settings = this.getSettings()
    if (!settings.budgetAlerts) return

    this.sendNotification("Budget Alert!", {
      body: `You've spent ${percentage}% of your ${category} budget`,
      icon: "/icon-192x192.png",
      tag: "budget-alert",
    })
  }

  notifySavingsGoal(goalName: string, progress: number) {
    const settings = this.getSettings()
    if (!settings.savingsGoals) return

    if (progress >= 100) {
      this.sendNotification("Goal Achieved!", {
        body: `Congratulations! You've reached your ${goalName} goal!`,
        icon: "/icon-192x192.png",
        tag: "savings-goal",
      })
    } else if (progress >= 75) {
      this.sendNotification("Almost There!", {
        body: `You're ${progress.toFixed(0)}% towards your ${goalName} goal!`,
        icon: "/icon-192x192.png",
        tag: "savings-goal",
      })
    }
  }

  notifyDebtReminder(debtName: string, daysUntilDue: number) {
    const settings = this.getSettings()
    if (!settings.debtReminders) return

    if (daysUntilDue <= 3) {
      this.sendNotification("Payment Due Soon!", {
        body: `${debtName} payment is due in ${daysUntilDue} days`,
        icon: "/icon-192x192.png",
        tag: "debt-reminder",
      })
    }
  }

  notifyChallengeComplete(challengeName: string) {
    const settings = this.getSettings()
    if (!settings.challengeUpdates) return

    this.sendNotification("Challenge Complete!", {
      body: `You've completed the ${challengeName} challenge!`,
      icon: "/icon-192x192.png",
      tag: "challenge-complete",
    })
  }

  notifyDailySummary(spent: number, saved: number) {
    const settings = this.getSettings()
    if (!settings.dailySummary) return

    this.sendNotification("Daily Summary", {
      body: `Today: Spent $${spent.toFixed(2)}, Saved $${saved.toFixed(2)}`,
      icon: "/icon-192x192.png",
      tag: "daily-summary",
    })
  }

  getSettings(): NotificationSettings {
    if (typeof window === "undefined") return DEFAULT_NOTIFICATION_SETTINGS

    const stored = localStorage.getItem("notificationSettings")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        return { ...DEFAULT_NOTIFICATION_SETTINGS, ...parsed }
      } catch {
        return DEFAULT_NOTIFICATION_SETTINGS
      }
    }
    return DEFAULT_NOTIFICATION_SETTINGS
  }

  saveSettings(settings: NotificationSettings) {
    if (typeof window === "undefined") return

    localStorage.setItem("notificationSettings", JSON.stringify(settings))
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission
  }
}

export const notificationManager = new NotificationManager()
