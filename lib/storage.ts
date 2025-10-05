export interface Allowance {
  id: string
  amount: number
  frequency: "daily" | "weekly" | "monthly"
  startDate: string
  createdAt: string
}

export interface Expense {
  id: string
  amount: number
  category: string
  note?: string
  date: string
  createdAt: string
  isRecurring?: boolean
  recurringFrequency?: "daily" | "weekly" | "monthly"
  receiptPhoto?: string // Added receipt photo support
  tags?: string[] // Added tags support
  splitWith?: string[] // Added expense splitting
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  createdAt: string
}

export interface UserStats {
  currentStreak: number
  longestStreak: number
  totalExpensesLogged: number
  lastLoggedDate: string
  achievements: string[]
}

export interface AllowanceSource {
  id: string
  name: string
  amount: number
  frequency: "daily" | "weekly" | "monthly"
  startDate: string
  createdAt: string
}

export interface ExpenseTag {
  id: string
  name: string
  color: string
}

export interface ExpenseTemplate {
  id: string
  name: string
  amount: number
  category: string
  note?: string
}

export interface Debt {
  id: string
  personName: string
  amount: number
  type: "owed_to_me" | "i_owe"
  description?: string
  date: string
  settled: boolean
}

export interface Income {
  id: string
  amount: number
  source: string
  date: string
  note?: string
}

export interface SpendingChallenge {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  targetDays: number
  currentProgress?: number
  completed: boolean
}

export interface CategoryLimit {
  id: string
  categoryId: string
  categoryName: string
  limitAmount: number
  period: "daily" | "weekly" | "monthly"
  createdAt: string
}

const STORAGE_KEYS = {
  ALLOWANCE: "allowance",
  EXPENSES: "expenses",
  CATEGORIES: "categories",
  ONBOARDING_COMPLETE: "onboarding_complete",
  NOTIFICATION_THRESHOLDS_TRIGGERED: "notification_thresholds_triggered",
  SAVINGS_GOALS: "savings_goals",
  USER_STATS: "user_stats", // Added user stats for gamification
  APP_VERSION: "app_version", // Added version tracking
  ALLOWANCE_SOURCES: "allowance_sources",
  EXPENSE_TAGS: "expense_tags",
  EXPENSE_TEMPLATES: "expense_templates",
  DEBTS: "debts",
  INCOMES: "incomes",
  SPENDING_CHALLENGES: "spending_challenges",
  PASSWORD_HASH: "password_hash",
  PASSWORD_ENABLED: "password_enabled",
  CATEGORY_LIMITS: "category_limits", // Added category limits storage key
}

// Default categories for Filipino students
export const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Food", icon: "🍔", color: "oklch(0.65 0.15 45)" },
  { id: "2", name: "Transportation", icon: "🚌", color: "oklch(0.6 0.15 220)" },
  { id: "3", name: "School Supplies", icon: "📚", color: "oklch(0.7 0.12 280)" },
  { id: "4", name: "Load", icon: "📱", color: "oklch(0.65 0.18 340)" },
  { id: "5", name: "Snacks", icon: "🍿", color: "oklch(0.75 0.15 70)" },
  { id: "6", name: "Entertainment", icon: "🎮", color: "oklch(0.55 0.18 150)" },
  { id: "7", name: "Projects", icon: "✂️", color: "oklch(0.6 0.15 180)" },
  { id: "8", name: "Others", icon: "💰", color: "oklch(0.5 0.01 120)" },
]

// Storage helpers
export const storage = {
  // Allowance
  getAllowance: (): Allowance | null => {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem(STORAGE_KEYS.ALLOWANCE)
    return data ? JSON.parse(data) : null
  },

  setAllowance: (allowance: Allowance): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.ALLOWANCE, JSON.stringify(allowance))
  },

  // Expenses
  getExpenses: (): Expense[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES)
    return data ? JSON.parse(data) : []
  },

  addExpense: (expense: Expense): void => {
    if (typeof window === "undefined") return
    const expenses = storage.getExpenses()
    expenses.unshift(expense)
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses))
    storage.incrementExpenseCount() // Increment expense count after adding an expense
  },

  deleteExpense: (id: string): void => {
    if (typeof window === "undefined") return
    const expenses = storage.getExpenses().filter((e) => e.id !== id)
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses))
  },

  updateExpense: (id: string, updates: Partial<Expense>): void => {
    if (typeof window === "undefined") return
    const expenses = storage.getExpenses().map((e) => (e.id === id ? { ...e, ...updates } : e))
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses))
  },

  // Categories
  getCategories: (): Category[] => {
    if (typeof window === "undefined") return DEFAULT_CATEGORIES
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES
  },

  setCategories: (categories: Category[]): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
  },

  addCategory: (category: Category): void => {
    if (typeof window === "undefined") return
    const categories = storage.getCategories()
    categories.push(category)
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
  },

  updateCategory: (id: string, updates: Partial<Category>): void => {
    if (typeof window === "undefined") return
    const categories = storage.getCategories().map((c) => (c.id === id ? { ...c, ...updates } : c))
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
  },

  deleteCategory: (id: string): void => {
    if (typeof window === "undefined") return
    const categories = storage.getCategories().filter((c) => c.id !== id)
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
  },

  // Onboarding
  isOnboardingComplete: (): boolean => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === "true"
  },

  setOnboardingComplete: (): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, "true")
  },

  // Notification Thresholds
  getTriggeredThresholds: (): { warning: boolean; critical: boolean } => {
    if (typeof window === "undefined") return { warning: false, critical: false }
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_THRESHOLDS_TRIGGERED)
    return data ? JSON.parse(data) : { warning: false, critical: false }
  },

  setTriggeredThresholds: (thresholds: { warning: boolean; critical: boolean }): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_THRESHOLDS_TRIGGERED, JSON.stringify(thresholds))
  },

  resetTriggeredThresholds: (): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(
      STORAGE_KEYS.NOTIFICATION_THRESHOLDS_TRIGGERED,
      JSON.stringify({ warning: false, critical: false }),
    )
  },

  // Savings Goals
  getSavingsGoals: (): SavingsGoal[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS)
    return data ? JSON.parse(data) : []
  },

  addSavingsGoal: (goal: SavingsGoal): void => {
    if (typeof window === "undefined") return
    const goals = storage.getSavingsGoals()
    goals.push(goal)
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals))
  },

  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>): void => {
    if (typeof window === "undefined") return
    const goals = storage.getSavingsGoals().map((g) => (g.id === id ? { ...g, ...updates } : g))
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals))
  },

  deleteSavingsGoal: (id: string): void => {
    if (typeof window === "undefined") return
    const goals = storage.getSavingsGoals().filter((g) => g.id !== id)
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals))
  },

  allocateToGoal: (goalId: string, amount: number): void => {
    if (typeof window === "undefined") return
    const goals = storage.getSavingsGoals()
    const goal = goals.find((g) => g.id === goalId)
    if (goal) {
      goal.currentAmount += amount
      storage.updateSavingsGoal(goalId, { currentAmount: goal.currentAmount })
    }
  },

  // User Stats & Gamification
  getUserStats: (): UserStats => {
    if (typeof window === "undefined")
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalExpensesLogged: 0,
        lastLoggedDate: "",
        achievements: [],
      }
    const data = localStorage.getItem(STORAGE_KEYS.USER_STATS)
    return data
      ? JSON.parse(data)
      : {
          currentStreak: 0,
          longestStreak: 0,
          totalExpensesLogged: 0,
          lastLoggedDate: "",
          achievements: [],
        }
  },

  updateUserStats: (stats: Partial<UserStats>): void => {
    if (typeof window === "undefined") return
    const current = storage.getUserStats()
    const updated = { ...current, ...stats }
    localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(updated))
  },

  incrementExpenseCount: (): void => {
    if (typeof window === "undefined") return
    const stats = storage.getUserStats()
    const today = new Date().toISOString().split("T")[0]
    const lastLogged = stats.lastLoggedDate.split("T")[0]

    let newStreak = stats.currentStreak

    if (lastLogged === today) {
      // Same day, don't increment streak
    } else if (lastLogged === getPreviousDay(today)) {
      // Consecutive day, increment streak
      newStreak = stats.currentStreak + 1
    } else {
      // Streak broken, reset to 1
      newStreak = 1
    }

    const newLongestStreak = Math.max(newStreak, stats.longestStreak)

    storage.updateUserStats({
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      totalExpensesLogged: stats.totalExpensesLogged + 1,
      lastLoggedDate: new Date().toISOString(),
    })

    // Check for achievements
    checkAchievements(stats.totalExpensesLogged + 1, newStreak)
  },

  addAchievement: (achievement: string): void => {
    if (typeof window === "undefined") return
    const stats = storage.getUserStats()
    if (!stats.achievements.includes(achievement)) {
      stats.achievements.push(achievement)
      storage.updateUserStats({ achievements: stats.achievements })
    }
  },

  // Data Import/Export
  importData: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData)

      if (data.allowance) storage.setAllowance(data.allowance)
      if (data.expenses) localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data.expenses))
      if (data.categories) storage.setCategories(data.categories)
      if (data.savingsGoals) localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(data.savingsGoals))

      return true
    } catch (error) {
      console.error("Failed to import data:", error)
      return false
    }
  },

  // App Version
  getAppVersion: (): string => {
    if (typeof window === "undefined") return "1.0.0"
    return localStorage.getItem(STORAGE_KEYS.APP_VERSION) || "1.0.0"
  },

  setAppVersion: (version: string): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.APP_VERSION, version)
  },

  getAllowanceSources: (): AllowanceSource[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.ALLOWANCE_SOURCES)
    return data ? JSON.parse(data) : []
  },

  addAllowanceSource: (source: AllowanceSource): void => {
    if (typeof window === "undefined") return
    const sources = storage.getAllowanceSources()
    sources.push(source)
    localStorage.setItem(STORAGE_KEYS.ALLOWANCE_SOURCES, JSON.stringify(sources))
  },

  updateAllowanceSource: (id: string, updates: Partial<AllowanceSource>): void => {
    if (typeof window === "undefined") return
    const sources = storage.getAllowanceSources().map((s) => (s.id === id ? { ...s, ...updates } : s))
    localStorage.setItem(STORAGE_KEYS.ALLOWANCE_SOURCES, JSON.stringify(sources))
  },

  deleteAllowanceSource: (id: string): void => {
    if (typeof window === "undefined") return
    const sources = storage.getAllowanceSources().filter((s) => s.id !== id)
    localStorage.setItem(STORAGE_KEYS.ALLOWANCE_SOURCES, JSON.stringify(sources))
  },

  getExpenseTags: (): ExpenseTag[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSE_TAGS)
    return data ? JSON.parse(data) : []
  },

  addExpenseTag: (tag: ExpenseTag): void => {
    if (typeof window === "undefined") return
    const tags = storage.getExpenseTags()
    tags.push(tag)
    localStorage.setItem(STORAGE_KEYS.EXPENSE_TAGS, JSON.stringify(tags))
  },

  deleteExpenseTag: (id: string): void => {
    if (typeof window === "undefined") return
    const tags = storage.getExpenseTags().filter((t) => t.id !== id)
    localStorage.setItem(STORAGE_KEYS.EXPENSE_TAGS, JSON.stringify(tags))
  },

  getExpenseTemplates: (): ExpenseTemplate[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSE_TEMPLATES)
    return data ? JSON.parse(data) : []
  },

  addExpenseTemplate: (template: ExpenseTemplate): void => {
    if (typeof window === "undefined") return
    const templates = storage.getExpenseTemplates()
    templates.push(template)
    localStorage.setItem(STORAGE_KEYS.EXPENSE_TEMPLATES, JSON.stringify(templates))
  },

  deleteExpenseTemplate: (id: string): void => {
    if (typeof window === "undefined") return
    const templates = storage.getExpenseTemplates().filter((t) => t.id !== id)
    localStorage.setItem(STORAGE_KEYS.EXPENSE_TEMPLATES, JSON.stringify(templates))
  },

  getDebts: (): Debt[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.DEBTS)
    return data ? JSON.parse(data) : []
  },

  addDebt: (debt: Debt): void => {
    if (typeof window === "undefined") return
    const debts = storage.getDebts()
    debts.push(debt)
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts))
  },

  updateDebt: (id: string, updates: Partial<Debt>): void => {
    if (typeof window === "undefined") return
    const debts = storage.getDebts().map((d) => (d.id === id ? { ...d, ...updates } : d))
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts))
  },

  deleteDebt: (id: string): void => {
    if (typeof window === "undefined") return
    const debts = storage.getDebts().filter((d) => d.id !== id)
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts))
  },

  getIncomes: (): Income[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.INCOMES)
    return data ? JSON.parse(data) : []
  },

  addIncome: (income: Income): void => {
    if (typeof window === "undefined") return
    const incomes = storage.getIncomes()
    incomes.push(income)
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes))
  },

  deleteIncome: (id: string): void => {
    if (typeof window === "undefined") return
    const incomes = storage.getIncomes().filter((i) => i.id !== id)
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes))
  },

  getSpendingChallenges: (): SpendingChallenge[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.SPENDING_CHALLENGES)
    return data ? JSON.parse(data) : []
  },

  getChallenges: (): SpendingChallenge[] => {
    return storage.getSpendingChallenges()
  },

  addSpendingChallenge: (challenge: SpendingChallenge): void => {
    if (typeof window === "undefined") return
    const challenges = storage.getSpendingChallenges()
    challenges.push(challenge)
    localStorage.setItem(STORAGE_KEYS.SPENDING_CHALLENGES, JSON.stringify(challenges))
  },

  updateSpendingChallenge: (id: string, updates: Partial<SpendingChallenge>): void => {
    if (typeof window === "undefined") return
    const challenges = storage.getSpendingChallenges().map((c) => (c.id === id ? { ...c, ...updates } : c))
    localStorage.setItem(STORAGE_KEYS.SPENDING_CHALLENGES, JSON.stringify(challenges))
  },

  completeChallenge: (id: string): void => {
    storage.updateSpendingChallenge(id, { completed: true })
  },

  deleteSpendingChallenge: (id: string): void => {
    if (typeof window === "undefined") return
    const challenges = storage.getSpendingChallenges().filter((c) => c.id !== id)
    localStorage.setItem(STORAGE_KEYS.SPENDING_CHALLENGES, JSON.stringify(challenges))
  },

  getCategoryLimits: (): CategoryLimit[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORY_LIMITS)
    return data ? JSON.parse(data) : []
  },

  getCategoryLimit: (categoryName: string): CategoryLimit | null => {
    const limits = storage.getCategoryLimits()
    return limits.find((l) => l.categoryName === categoryName) || null
  },

  setCategoryLimit: (categoryName: string, limitAmount: number, period: "daily" | "weekly" | "monthly"): void => {
    if (typeof window === "undefined") return
    const limits = storage.getCategoryLimits()
    const existingIndex = limits.findIndex((l) => l.categoryName === categoryName)

    if (existingIndex >= 0) {
      limits[existingIndex] = {
        ...limits[existingIndex],
        limitAmount,
        period,
      }
    } else {
      const category = storage.getCategories().find((c) => c.name === categoryName)
      limits.push({
        id: Date.now().toString(),
        categoryId: category?.id || "",
        categoryName,
        limitAmount,
        period,
        createdAt: new Date().toISOString(),
      })
    }

    localStorage.setItem(STORAGE_KEYS.CATEGORY_LIMITS, JSON.stringify(limits))
  },

  updateCategoryLimit: (id: string, updates: Partial<CategoryLimit>): void => {
    if (typeof window === "undefined") return
    const limits = storage.getCategoryLimits().map((l) => (l.id === id ? { ...l, ...updates } : l))
    localStorage.setItem(STORAGE_KEYS.CATEGORY_LIMITS, JSON.stringify(limits))
  },

  deleteCategoryLimit: (id: string): void => {
    if (typeof window === "undefined") return
    const limits = storage.getCategoryLimits().filter((l) => l.id !== id)
    localStorage.setItem(STORAGE_KEYS.CATEGORY_LIMITS, JSON.stringify(limits))
  },

  // App Version
  getAppVersion: (): string => {
    if (typeof window === "undefined") return "1.0.0"
    return localStorage.getItem(STORAGE_KEYS.APP_VERSION) || "1.0.0"
  },

  setAppVersion: (version: string): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.APP_VERSION, version)
  },

  // Password
  isPasswordEnabled: (): boolean => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(STORAGE_KEYS.PASSWORD_ENABLED) === "true"
  },

  setPasswordEnabled: (enabled: boolean): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.PASSWORD_ENABLED, enabled.toString())
  },

  getPasswordHash: (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH)
  },

  setPasswordHash: (hash: string): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.PASSWORD_HASH, hash)
  },

  verifyPassword: async (password: string): Promise<boolean> => {
    const hash = storage.getPasswordHash()
    if (!hash) return true
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    return hashHex === hash
  },

  setPassword: async (password: string): Promise<void> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    storage.setPasswordHash(hashHex)
    storage.setPasswordEnabled(true)
  },
}

function getPreviousDay(dateString: string): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() - 1)
  return date.toISOString().split("T")[0]
}

function checkAchievements(totalExpenses: number, currentStreak: number): void {
  const achievements = [
    { id: "first_expense", name: "First Step", condition: totalExpenses >= 1 },
    { id: "10_expenses", name: "Getting Started", condition: totalExpenses >= 10 },
    { id: "50_expenses", name: "Expense Tracker", condition: totalExpenses >= 50 },
    { id: "100_expenses", name: "Budget Master", condition: totalExpenses >= 100 },
    { id: "7_day_streak", name: "Week Warrior", condition: currentStreak >= 7 },
    { id: "30_day_streak", name: "Monthly Master", condition: currentStreak >= 30 },
    { id: "100_day_streak", name: "Century Club", condition: currentStreak >= 100 },
  ]

  achievements.forEach((achievement) => {
    if (achievement.condition) {
      storage.addAchievement(achievement.id)
    }
  })
}

// Utility functions
export const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const calculateRemainingAllowance = (allowance: Allowance | null, expenses: Expense[]): number => {
  if (!allowance) return 0

  const startDate = new Date(allowance.startDate)
  const now = new Date()

  // Calculate current period start date
  let periodStart = new Date(startDate)

  if (allowance.frequency === "daily") {
    periodStart.setHours(0, 0, 0, 0)
  } else if (allowance.frequency === "weekly") {
    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const weeksSinceStart = Math.floor(daysSinceStart / 7)
    periodStart = new Date(startDate.getTime() + weeksSinceStart * 7 * 24 * 60 * 60 * 1000)
  } else if (allowance.frequency === "monthly") {
    periodStart = new Date(now.getFullYear(), now.getMonth(), startDate.getDate())
    if (periodStart > now) {
      periodStart.setMonth(periodStart.getMonth() - 1)
    }
  }

  // Sum expenses in current period
  const periodExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate >= periodStart && expenseDate <= now
  })

  const totalSpent = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  return allowance.amount - totalSpent
}

export const getDaysUntilNextAllowance = (allowance: Allowance | null): number => {
  if (!allowance) return 0

  const startDate = new Date(allowance.startDate)
  const now = new Date()

  if (allowance.frequency === "daily") {
    return 1
  } else if (allowance.frequency === "weekly") {
    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysIntoWeek = daysSinceStart % 7
    return 7 - daysIntoWeek
  } else if (allowance.frequency === "monthly") {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, startDate.getDate())
    const daysUntil = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil
  }

  return 0
}

export const getSpendingByDayOfWeek = (expenses: Expense[]): { day: string; amount: number }[] => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const dayTotals = new Map<number, number>()

  expenses.forEach((expense) => {
    const date = new Date(expense.date)
    const dayIndex = date.getDay()
    const current = dayTotals.get(dayIndex) || 0
    dayTotals.set(dayIndex, current + expense.amount)
  })

  return days.map((day, index) => ({
    day,
    amount: dayTotals.get(index) || 0,
  }))
}

export const getSpendingByTimeOfDay = (expenses: Expense[]): { time: string; amount: number }[] => {
  const times = ["Morning", "Afternoon", "Evening", "Night"]
  const timeTotals = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 }

  expenses.forEach((expense) => {
    const date = new Date(expense.date)
    const hour = date.getHours()

    if (hour >= 6 && hour < 12) timeTotals.Morning += expense.amount
    else if (hour >= 12 && hour < 18) timeTotals.Afternoon += expense.amount
    else if (hour >= 18 && hour < 22) timeTotals.Evening += expense.amount
    else timeTotals.Night += expense.amount
  })

  return times.map((time) => ({
    time,
    amount: timeTotals[time as keyof typeof timeTotals],
  }))
}

export const comparePeriods = (
  expenses: Expense[],
  allowance: Allowance | null,
): { current: number; previous: number; change: number } => {
  if (!allowance) return { current: 0, previous: 0, change: 0 }

  const now = new Date()
  const startDate = new Date(allowance.startDate)

  let currentPeriodStart = new Date(startDate)
  let previousPeriodStart = new Date(startDate)

  if (allowance.frequency === "weekly") {
    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const weeksSinceStart = Math.floor(daysSinceStart / 7)
    currentPeriodStart = new Date(startDate.getTime() + weeksSinceStart * 7 * 24 * 60 * 60 * 1000)
    previousPeriodStart = new Date(currentPeriodStart.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else if (allowance.frequency === "monthly") {
    currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), startDate.getDate())
    if (currentPeriodStart > now) {
      currentPeriodStart.setMonth(currentPeriodStart.getMonth() - 1)
    }
    previousPeriodStart = new Date(currentPeriodStart)
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
  }

  const currentExpenses = expenses.filter((e) => {
    const date = new Date(e.date)
    return date >= currentPeriodStart && date <= now
  })

  const previousExpenses = expenses.filter((e) => {
    const date = new Date(e.date)
    return date >= previousPeriodStart && date < currentPeriodStart
  })

  const current = currentExpenses.reduce((sum, e) => sum + e.amount, 0)
  const previous = previousExpenses.reduce((sum, e) => sum + e.amount, 0)
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0

  return { current, previous, change }
}

export const getSpendingVelocity = (expenses: Expense[], allowance: Allowance | null): number => {
  if (!allowance) return 0

  const avgDaily = getAverageDailySpending(expenses, allowance)
  const daysLeft = getDaysUntilNextAllowance(allowance)
  const remaining = calculateRemainingAllowance(allowance, expenses)

  if (daysLeft === 0) return 0

  const sustainableDaily = remaining / daysLeft
  return avgDaily / sustainableDaily
}

export const getAverageDailySpending = (expenses: Expense[], allowance: Allowance | null): number => {
  if (!allowance) return 0

  const startDate = new Date(allowance.startDate)
  const now = new Date()

  let periodStart = new Date(startDate)

  if (allowance.frequency === "daily") {
    periodStart.setHours(0, 0, 0, 0)
  } else if (allowance.frequency === "weekly") {
    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const weeksSinceStart = Math.floor(daysSinceStart / 7)
    periodStart = new Date(startDate.getTime() + weeksSinceStart * 7 * 24 * 60 * 60 * 1000)
  } else if (allowance.frequency === "monthly") {
    periodStart = new Date(now.getFullYear(), now.getMonth(), startDate.getDate())
    if (periodStart > now) {
      periodStart.setMonth(periodStart.getMonth() - 1)
    }
  }

  const periodExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate >= periodStart && expenseDate <= now
  })

  const totalSpent = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const daysPassed = Math.max(1, Math.ceil((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)))

  return totalSpent / daysPassed
}

export const exportDataAsJSON = (): string => {
  const data = {
    allowance: storage.getAllowance(),
    expenses: storage.getExpenses(),
    categories: storage.getCategories(),
    savingsGoals: storage.getSavingsGoals(),
    exportedAt: new Date().toISOString(),
  }
  return JSON.stringify(data, null, 2)
}

export const downloadData = (): void => {
  const data = exportDataAsJSON()
  const blob = new Blob([data], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `expense-tracker-backup-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const exportDataAsCSV = (): string => {
  const expenses = storage.getExpenses()
  const headers = ["Date", "Category", "Amount", "Note", "Recurring", "Tags", "SplitWith"]
  const rows = expenses.map((expense) => [
    new Date(expense.date).toLocaleDateString(),
    expense.category,
    expense.amount.toString(),
    expense.note || "",
    expense.isRecurring ? "Yes" : "No",
    expense.tags ? expense.tags.join(", ") : "",
    expense.splitWith ? expense.splitWith.join(", ") : "",
  ])

  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  return csvContent
}

export const downloadCSV = (): void => {
  const csv = exportDataAsCSV()
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `expense-tracker-${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const predictSpending = (expenses: Expense[], allowance: Allowance | null, days = 7): number => {
  if (!allowance || expenses.length === 0) return 0

  const recentExpenses = expenses.slice(0, Math.min(30, expenses.length))
  const totalSpent = recentExpenses.reduce((sum, e) => sum + e.amount, 0)
  const avgDaily = totalSpent / Math.min(30, expenses.length)

  return avgDaily * days
}

export const getBudgetRecommendations = (
  expenses: Expense[],
  allowance: Allowance | null,
): { type: "success" | "warning" | "danger"; message: string }[] => {
  const recommendations: { type: "success" | "warning" | "danger"; message: string }[] = []

  if (!allowance || expenses.length === 0) {
    return [{ type: "warning", message: "Start tracking expenses to get personalized recommendations" }]
  }

  const categoryData = getSpendingByCategory(expenses)
  const remaining = calculateRemainingAllowance(allowance, expenses)
  const percentageUsed = (1 - remaining / allowance.amount) * 100

  // Check if overspending
  if (remaining < 0) {
    recommendations.push({
      type: "danger",
      message: `You've exceeded your budget by ${formatCurrency(Math.abs(remaining))}. Consider reducing non-essential expenses.`,
    })
  }

  // Check spending pace
  const avgDaily = getAverageDailySpending(expenses, allowance)
  const daysLeft = getDaysUntilNextAllowance(allowance)
  const projectedSpending = avgDaily * daysLeft

  if (projectedSpending > remaining && remaining > 0) {
    recommendations.push({
      type: "warning",
      message: `At your current pace, you'll exceed your budget by ${formatCurrency(projectedSpending - remaining)}. Try to spend less than ${formatCurrency(remaining / daysLeft)} per day.`,
    })
  } else if (remaining > 0 && percentageUsed < 70) {
    recommendations.push({
      type: "success",
      message: `Great job! You're on track with ${formatCurrency(remaining)} remaining. Consider saving the extra.`,
    })
  }

  // Category-specific recommendations
  const topCategory = categoryData[0]
  if (topCategory && topCategory.percentage > 40) {
    recommendations.push({
      type: "warning",
      message: `${topCategory.category} accounts for ${topCategory.percentage.toFixed(0)}% of your spending. Consider reducing expenses in this category.`,
    })
  }

  // Recurring expenses check
  const recurringExpenses = expenses.filter((e) => e.isRecurring)
  if (recurringExpenses.length > 0) {
    const recurringTotal = recurringExpenses.reduce((sum, e) => sum + e.amount, 0)
    const recurringPercentage = (recurringTotal / allowance.amount) * 100
    if (recurringPercentage > 30) {
      recommendations.push({
        type: "warning",
        message: `Recurring expenses take up ${recurringPercentage.toFixed(0)}% of your budget. Review subscriptions and regular payments.`,
      })
    }
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: "success",
      message: "Your spending habits look healthy! Keep up the good work.",
    })
  }

  return recommendations
}

export const getSpendingByCategory = (
  expenses: Expense[],
): { category: string; amount: number; percentage: number }[] => {
  const categoryTotals = new Map<string, number>()
  let total = 0

  expenses.forEach((expense) => {
    const current = categoryTotals.get(expense.category) || 0
    categoryTotals.set(expense.category, current + expense.amount)
    total += expense.amount
  })

  return Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export const getSpendingTrend = (expenses: Expense[], days = 7): { date: string; amount: number }[] => {
  const now = new Date()
  const trend: { date: string; amount: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const dayExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      expenseDate.setHours(0, 0, 0, 0)
      return expenseDate.getTime() === date.getTime()
    })

    const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    trend.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      amount: total,
    })
  }

  return trend
}

export const calculateCategorySpending = (
  categoryName: string,
  period: "daily" | "weekly" | "monthly",
  expenses: Expense[],
): number => {
  const now = new Date()
  let periodStart = new Date()

  if (period === "daily") {
    periodStart.setHours(0, 0, 0, 0)
  } else if (period === "weekly") {
    const dayOfWeek = now.getDay()
    periodStart = new Date(now)
    periodStart.setDate(now.getDate() - dayOfWeek)
    periodStart.setHours(0, 0, 0, 0)
  } else if (period === "monthly") {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const categoryExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expense.category === categoryName && expenseDate >= periodStart && expenseDate <= now
  })

  return categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
}

export const getCategoryLimitStatus = (
  categoryName: string,
  expenses: Expense[],
): {
  limit: CategoryLimit | null
  spent: number
  remaining: number
  percentage: number
  status: "safe" | "warning" | "danger"
} => {
  const limit = storage.getCategoryLimit(categoryName)

  if (!limit) {
    return {
      limit: null,
      spent: 0,
      remaining: 0,
      percentage: 0,
      status: "safe",
    }
  }

  const spent = calculateCategorySpending(categoryName, limit.period, expenses)
  const remaining = limit.limitAmount - spent
  const percentage = (spent / limit.limitAmount) * 100

  let status: "safe" | "warning" | "danger" = "safe"
  if (percentage >= 90) {
    status = "danger"
  } else if (percentage >= 70) {
    status = "warning"
  }

  return {
    limit,
    spent,
    remaining,
    percentage,
    status,
  }
}

export const getCategoriesOverLimit = (expenses: Expense[]): string[] => {
  const limits = storage.getCategoryLimits()
  const overLimit: string[] = []

  limits.forEach((limit) => {
    const status = getCategoryLimitStatus(limit.categoryName, expenses)
    if (status.percentage >= 80) {
      overLimit.push(limit.categoryName)
    }
  })

  return overLimit
}
