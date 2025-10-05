import type { Expense, Allowance, Income, Debt } from "./storage"

export interface TrendAnalysis {
  current: number
  previous: number
  change: number
  trend: "up" | "down" | "stable"
  movingAverage: number
}

export interface CategoryInsight {
  category: string
  amount: number
  percentage: number
  trend: "up" | "down" | "stable"
  rankChange: number
  correlation: string[]
}

export interface AnomalyDetection {
  date: string
  amount: number
  expected: number
  deviation: number
  severity: "low" | "medium" | "high"
  category: string
}

export interface BudgetForecast {
  date: string
  projected: number
  confidence: number
  shortfall: number
}

export function getAdvancedTrendAnalysis(
  expenses: Expense[],
  allowance: Allowance | null,
  periods = 3,
): TrendAnalysis[] {
  if (!allowance || expenses.length === 0) return []

  const periodLength = allowance.frequency === "weekly" ? 7 : 30
  const results: TrendAnalysis[] = []

  for (let i = 0; i < periods; i++) {
    const periodStart = new Date()
    periodStart.setDate(periodStart.getDate() - periodLength * (i + 1))
    const periodEnd = new Date()
    periodEnd.setDate(periodEnd.getDate() - periodLength * i)

    const periodExpenses = expenses.filter((e) => {
      const date = new Date(e.date)
      return date >= periodStart && date < periodEnd
    })

    const current = periodExpenses.reduce((sum, e) => sum + e.amount, 0)

    // Previous period
    const prevStart = new Date(periodStart)
    prevStart.setDate(prevStart.getDate() - periodLength)
    const prevExpenses = expenses.filter((e) => {
      const date = new Date(e.date)
      return date >= prevStart && date < periodStart
    })
    const previous = prevExpenses.reduce((sum, e) => sum + e.amount, 0)

    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0
    const trend = Math.abs(change) < 5 ? "stable" : change > 0 ? "up" : "down"

    // Calculate moving average
    const allPeriods = []
    for (let j = 0; j <= i + 2; j++) {
      const start = new Date()
      start.setDate(start.getDate() - periodLength * (j + 1))
      const end = new Date()
      end.setDate(end.getDate() - periodLength * j)
      const periodExp = expenses.filter((e) => {
        const date = new Date(e.date)
        return date >= start && date < end
      })
      allPeriods.push(periodExp.reduce((sum, e) => sum + e.amount, 0))
    }
    const movingAverage = allPeriods.reduce((sum, val) => sum + val, 0) / allPeriods.length

    results.push({ current, previous, change, trend, movingAverage })
  }

  return results
}

export function getCategoryInsights(expenses: Expense[], previousExpenses: Expense[]): CategoryInsight[] {
  const categoryTotals = new Map<string, number>()
  const prevCategoryTotals = new Map<string, number>()

  expenses.forEach((e) => {
    categoryTotals.set(e.category, (categoryTotals.get(e.category) || 0) + e.amount)
  })

  previousExpenses.forEach((e) => {
    prevCategoryTotals.set(e.category, (prevCategoryTotals.get(e.category) || 0) + e.amount)
  })

  const total = Array.from(categoryTotals.values()).reduce((sum, val) => sum + val, 0)
  const insights: CategoryInsight[] = []

  // Get rankings
  const currentRanking = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0])

  const prevRanking = Array.from(prevCategoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0])

  categoryTotals.forEach((amount, category) => {
    const prevAmount = prevCategoryTotals.get(category) || 0
    const change = prevAmount > 0 ? ((amount - prevAmount) / prevAmount) * 100 : 0
    const trend = Math.abs(change) < 10 ? "stable" : change > 0 ? "up" : "down"

    const currentRank = currentRanking.indexOf(category)
    const prevRank = prevRanking.indexOf(category)
    const rankChange = prevRank >= 0 ? prevRank - currentRank : 0

    // Find correlated categories (categories often spent together)
    const correlation = findCorrelatedCategories(expenses, category)

    insights.push({
      category,
      amount,
      percentage: (amount / total) * 100,
      trend,
      rankChange,
      correlation,
    })
  })

  return insights.sort((a, b) => b.amount - a.amount)
}

function findCorrelatedCategories(expenses: Expense[], targetCategory: string): string[] {
  const dateGroups = new Map<string, Set<string>>()

  expenses.forEach((e) => {
    const dateKey = e.date.split("T")[0]
    if (!dateGroups.has(dateKey)) {
      dateGroups.set(dateKey, new Set())
    }
    dateGroups.get(dateKey)!.add(e.category)
  })

  const correlations = new Map<string, number>()

  dateGroups.forEach((categories) => {
    if (categories.has(targetCategory)) {
      categories.forEach((cat) => {
        if (cat !== targetCategory) {
          correlations.set(cat, (correlations.get(cat) || 0) + 1)
        }
      })
    }
  })

  return Array.from(correlations.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((entry) => entry[0])
}

export function detectAnomalies(expenses: Expense[], allowance: Allowance | null): AnomalyDetection[] {
  if (!allowance || expenses.length < 7) return []

  const anomalies: AnomalyDetection[] = []
  const categoryAverages = new Map<string, number>()
  const categoryCounts = new Map<string, number>()

  // Calculate averages
  expenses.forEach((e) => {
    categoryAverages.set(e.category, (categoryAverages.get(e.category) || 0) + e.amount)
    categoryCounts.set(e.category, (categoryCounts.get(e.category) || 0) + 1)
  })

  categoryAverages.forEach((total, category) => {
    const count = categoryCounts.get(category) || 1
    categoryAverages.set(category, total / count)
  })

  // Find anomalies (expenses significantly above average)
  expenses.forEach((e) => {
    const average = categoryAverages.get(e.category) || 0
    if (average > 0) {
      const deviation = ((e.amount - average) / average) * 100

      if (deviation > 50) {
        const severity = deviation > 150 ? "high" : deviation > 100 ? "medium" : "low"

        anomalies.push({
          date: e.date,
          amount: e.amount,
          expected: average,
          deviation,
          severity,
          category: e.category,
        })
      }
    }
  })

  return anomalies.sort((a, b) => b.deviation - a.deviation).slice(0, 10)
}

export function getBudgetForecast(expenses: Expense[], allowance: Allowance | null, days = 30): BudgetForecast[] {
  if (!allowance || expenses.length < 3) return []

  const forecasts: BudgetForecast[] = []
  const recentExpenses = expenses.slice(0, Math.min(30, expenses.length))
  const dailyAverage = recentExpenses.reduce((sum, e) => sum + e.amount, 0) / recentExpenses.length

  // Calculate variance for confidence
  const variance =
    recentExpenses.reduce((sum, e) => sum + Math.pow(e.amount - dailyAverage, 2), 0) / recentExpenses.length
  const stdDev = Math.sqrt(variance)
  const confidence = Math.max(0, Math.min(100, 100 - (stdDev / dailyAverage) * 100))

  let cumulativeSpending = 0

  for (let i = 1; i <= days; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)

    cumulativeSpending += dailyAverage
    const shortfall = Math.max(0, cumulativeSpending - allowance.amount)

    forecasts.push({
      date: date.toISOString().split("T")[0],
      projected: cumulativeSpending,
      confidence,
      shortfall,
    })
  }

  return forecasts
}

export function getIncomeVsExpenses(expenses: Expense[], incomes: Income[], months = 3) {
  const data = []
  const now = new Date()

  for (let i = 0; i < months; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

    const monthExpenses = expenses.filter((e) => {
      const date = new Date(e.date)
      return date >= monthStart && date <= monthEnd
    })

    const monthIncomes = incomes.filter((inc) => {
      const date = new Date(inc.date)
      return date >= monthStart && date <= monthEnd
    })

    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
    const totalIncome = monthIncomes.reduce((sum, inc) => sum + inc.amount, 0)

    data.push({
      month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      expenses: totalExpenses,
      income: totalIncome,
      net: totalIncome - totalExpenses,
    })
  }

  return data.reverse()
}

export function getDebtImpactAnalysis(expenses: Expense[], debts: Debt[], allowance: Allowance | null) {
  if (!allowance) return null

  const totalDebtPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)
  const monthlyExpenses = expenses
    .filter((e) => {
      const date = new Date(e.date)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })
    .reduce((sum, e) => sum + e.amount, 0)

  const debtToIncomeRatio = (totalDebtPayments / allowance.amount) * 100
  const availableAfterDebt = allowance.amount - totalDebtPayments
  const discretionarySpending = availableAfterDebt - monthlyExpenses

  return {
    totalDebtPayments,
    debtToIncomeRatio,
    availableAfterDebt,
    discretionarySpending,
    recommendation:
      debtToIncomeRatio > 40
        ? "High debt burden - consider debt consolidation"
        : debtToIncomeRatio > 20
          ? "Moderate debt - focus on paying down high-interest debts"
          : "Healthy debt levels",
  }
}

export function getSpendingHeatmap(expenses: Expense[]) {
  const heatmap: { day: string; hour: number; amount: number }[] = []
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const data = new Map<string, number>()

  expenses.forEach((e) => {
    const date = new Date(e.date)
    const day = days[date.getDay()]
    const hour = date.getHours()
    const key = `${day}-${hour}`
    data.set(key, (data.get(key) || 0) + e.amount)
  })

  days.forEach((day) => {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`
      heatmap.push({
        day,
        hour,
        amount: data.get(key) || 0,
      })
    }
  })

  return heatmap
}

export function getCategoryPerformance(expenses: Expense[], months = 6) {
  const categories = new Set(expenses.map((e) => e.category))
  const data: { month: string; [key: string]: string | number }[] = []

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date()
    monthStart.setMonth(monthStart.getMonth() - i)
    monthStart.setDate(1)

    const monthEnd = new Date(monthStart)
    monthEnd.setMonth(monthEnd.getMonth() + 1)
    monthEnd.setDate(0)

    const monthData: { month: string; [key: string]: string | number } = {
      month: monthStart.toLocaleDateString("en-US", { month: "short" }),
    }

    categories.forEach((category) => {
      const categoryExpenses = expenses.filter((e) => {
        const date = new Date(e.date)
        return e.category === category && date >= monthStart && date <= monthEnd
      })
      monthData[category] = categoryExpenses.reduce((sum, e) => sum + e.amount, 0)
    })

    data.push(monthData)
  }

  return { data, categories: Array.from(categories) }
}
