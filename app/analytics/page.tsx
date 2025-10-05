"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  storage,
  formatCurrency,
  getSpendingByCategory,
  getSpendingTrend,
  getAverageDailySpending,
  downloadData,
  downloadCSV,
  predictSpending,
  getBudgetRecommendations,
  getSpendingByDayOfWeek,
  getSpendingByTimeOfDay,
  comparePeriods,
  getSpendingVelocity,
  type Expense,
  type Allowance,
} from "@/lib/storage"
import {
  getAdvancedTrendAnalysis,
  getCategoryInsights,
  detectAnomalies,
  getBudgetForecast,
  getIncomeVsExpenses,
  getDebtImpactAnalysis,
  getCategoryPerformance,
} from "@/lib/analytics"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Download,
  TrendingUp,
  PieChartIcon,
  Lightbulb,
  TrendingDown,
  FileText,
  Clock,
  CalendarIcon,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  DollarSign,
  CreditCard,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart,
  ComposedChart,
  Legend,
} from "recharts"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AnalyticsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [allowance, setAllowance] = useState<Allowance | null>(null)
  const [categoryData, setCategoryData] = useState<{ category: string; amount: number; percentage: number }[]>([])
  const [trendData, setTrendData] = useState<{ date: string; amount: number }[]>([])
  const [averageDaily, setAverageDaily] = useState(0)
  const [predictions, setPredictions] = useState({ week: 0, month: 0 })
  const [recommendations, setRecommendations] = useState<{ type: "success" | "warning" | "danger"; message: string }[]>(
    [],
  )
  const [dayOfWeekData, setDayOfWeekData] = useState<{ day: string; amount: number }[]>([])
  const [timeOfDayData, setTimeOfDayData] = useState<{ time: string; amount: number }[]>([])
  const [periodComparison, setPeriodComparison] = useState({ current: 0, previous: 0, change: 0 })
  const [spendingVelocity, setSpendingVelocity] = useState(0)

  const [advancedTrends, setAdvancedTrends] = useState<any[]>([])
  const [categoryInsights, setCategoryInsights] = useState<any[]>([])
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [budgetForecast, setBudgetForecast] = useState<any[]>([])
  const [incomeVsExpenses, setIncomeVsExpenses] = useState<any[]>([])
  const [debtImpact, setDebtImpact] = useState<any>(null)
  const [categoryPerformance, setCategoryPerformance] = useState<{ data: any[]; categories: string[] }>({
    data: [],
    categories: [],
  })

  useEffect(() => {
    setMounted(true)

    const loadedExpenses = storage.getExpenses()
    const loadedAllowance = storage.getAllowance()

    setExpenses(loadedExpenses)
    setAllowance(loadedAllowance)
    setCategoryData(getSpendingByCategory(loadedExpenses))
    setTrendData(getSpendingTrend(loadedExpenses, 7))
    setAverageDaily(getAverageDailySpending(loadedExpenses, loadedAllowance))

    setPredictions({
      week: predictSpending(loadedExpenses, loadedAllowance, 7),
      month: predictSpending(loadedExpenses, loadedAllowance, 30),
    })
    setRecommendations(getBudgetRecommendations(loadedExpenses, loadedAllowance))

    setDayOfWeekData(getSpendingByDayOfWeek(loadedExpenses))
    setTimeOfDayData(getSpendingByTimeOfDay(loadedExpenses))
    setPeriodComparison(comparePeriods(loadedExpenses, loadedAllowance))
    setSpendingVelocity(getSpendingVelocity(loadedExpenses, loadedAllowance))

    setAdvancedTrends(getAdvancedTrendAnalysis(loadedExpenses, loadedAllowance, 6))

    const periodLength = loadedAllowance?.frequency === "weekly" ? 7 : 30
    const previousPeriodStart = new Date()
    previousPeriodStart.setDate(previousPeriodStart.getDate() - periodLength * 2)
    const previousPeriodEnd = new Date()
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - periodLength)
    const previousExpenses = loadedExpenses.filter((e) => {
      const date = new Date(e.date)
      return date >= previousPeriodStart && date < previousPeriodEnd
    })

    setCategoryInsights(getCategoryInsights(loadedExpenses, previousExpenses))
    setAnomalies(detectAnomalies(loadedExpenses, loadedAllowance))
    setBudgetForecast(getBudgetForecast(loadedExpenses, loadedAllowance, 14))

    const incomes = storage.getIncomes()
    setIncomeVsExpenses(getIncomeVsExpenses(loadedExpenses, incomes, 3))

    const debts = storage.getDebts()
    setDebtImpact(getDebtImpactAnalysis(loadedExpenses, debts, loadedAllowance))

    setCategoryPerformance(getCategoryPerformance(loadedExpenses, 6))
  }, [])

  if (!mounted) return null

  const categories = storage.getCategories()
  const COLORS = categories.map((cat) => cat.color)

  const pieChartData = categoryData.map((item) => ({
    name: item.category,
    value: item.amount,
  }))

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const budgetComparisonData = [
    {
      name: "Budget",
      amount: allowance?.amount || 0,
    },
    {
      name: "Spent",
      amount: totalSpent,
    },
    {
      name: "Remaining",
      amount: Math.max(0, (allowance?.amount || 0) - totalSpent),
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 py-6 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Advanced Analytics</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground">
                <Download className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={downloadData}>
                <FileText className="w-4 h-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadCSV}>
                <FileText className="w-4 h-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="px-6 mt-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </div>
                <p className="text-xl font-bold">{formatCurrency(totalSpent)}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <PieChartIcon className="w-4 h-4 text-accent" />
                  <p className="text-xs text-muted-foreground">Daily Average</p>
                </div>
                <p className="text-xl font-bold">{formatCurrency(averageDaily)}</p>
              </Card>
            </div>

            {allowance && expenses.length > 0 && periodComparison.previous > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Period Comparison</h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Period</p>
                    <p className="text-xl font-bold">{formatCurrency(periodComparison.current)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Previous Period</p>
                    <p className="text-xl font-bold">{formatCurrency(periodComparison.previous)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Change</p>
                    <p
                      className={`text-xl font-bold ${periodComparison.change > 0 ? "text-red-500" : "text-green-500"}`}
                    >
                      {periodComparison.change > 0 ? "+" : ""}
                      {periodComparison.change.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {recommendations.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Budget Insights</h2>
                </div>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <Alert
                      key={index}
                      variant={rec.type === "danger" ? "destructive" : "default"}
                      className={
                        rec.type === "success"
                          ? "border-green-500/50 bg-green-500/5"
                          : rec.type === "warning"
                            ? "border-yellow-500/50 bg-yellow-500/5"
                            : ""
                      }
                    >
                      <AlertDescription className="text-sm">{rec.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </Card>
            )}

            {expenses.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Spending Predictions</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Next 7 Days</p>
                    <p className="text-2xl font-bold">{formatCurrency(predictions.week)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Based on recent spending</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Next 30 Days</p>
                    <p className="text-2xl font-bold">{formatCurrency(predictions.month)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Projected spending</p>
                  </div>
                </div>
              </Card>
            )}

            {categoryData.length > 0 ? (
              <>
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>

                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="mt-6 space-y-3">
                    {categoryData.map((item, index) => (
                      <div key={item.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrency(item.amount)}</p>
                          <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">7-Day Spending Trend</h2>

                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="oklch(0.5 0 0)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.5 0 0)" />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "oklch(1 0 0)",
                          border: "1px solid oklch(0.9 0 0)",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="oklch(0.55 0.18 150)"
                        strokeWidth={2}
                        dot={{ fill: "oklch(0.55 0.18 150)", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </>
            ) : (
              <Card className="p-8 text-center">
                <PieChartIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No expense data yet</p>
                <p className="text-sm text-muted-foreground">Start adding expenses to see your analytics</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {advancedTrends.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Multi-Period Trend Analysis</h2>
                </div>
                <div className="space-y-4">
                  {advancedTrends.map((trend, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Period {index + 1}</span>
                        <div className="flex items-center gap-2">
                          {trend.trend === "up" && <ArrowUp className="w-4 h-4 text-red-500" />}
                          {trend.trend === "down" && <ArrowDown className="w-4 h-4 text-green-500" />}
                          {trend.trend === "stable" && <Minus className="w-4 h-4 text-gray-500" />}
                          <span
                            className={`text-sm font-semibold ${
                              trend.trend === "up"
                                ? "text-red-500"
                                : trend.trend === "down"
                                  ? "text-green-500"
                                  : "text-gray-500"
                            }`}
                          >
                            {trend.change > 0 ? "+" : ""}
                            {trend.change.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Current</p>
                          <p className="font-semibold">{formatCurrency(trend.current)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Previous</p>
                          <p className="font-semibold">{formatCurrency(trend.previous)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Moving Avg</p>
                          <p className="font-semibold">{formatCurrency(trend.movingAverage)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {categoryPerformance.data.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Category Performance (6 Months)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={categoryPerformance.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="oklch(0.5 0 0)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.5 0 0)" />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    {categoryPerformance.categories.map((category, index) => (
                      <Area
                        key={category}
                        type="monotone"
                        dataKey={category}
                        stackId="1"
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.6}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            )}

            {incomeVsExpenses.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Income vs Expenses</h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={incomeVsExpenses}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="oklch(0.5 0 0)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.5 0 0)" />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="income" fill="oklch(0.6 0.15 145)" name="Income" />
                    <Bar dataKey="expenses" fill="oklch(0.55 0.18 25)" name="Expenses" />
                    <Line type="monotone" dataKey="net" stroke="oklch(0.5 0.2 265)" strokeWidth={2} name="Net" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            )}

            {expenses.length > 0 && (
              <>
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Spending by Day of Week</h2>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dayOfWeekData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="oklch(0.5 0 0)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.5 0 0)" />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "oklch(1 0 0)",
                          border: "1px solid oklch(0.9 0 0)",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="amount" fill="oklch(0.55 0.18 150)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Spending by Time of Day</h2>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={timeOfDayData}>
                      <PolarGrid stroke="oklch(0.9 0 0)" />
                      <PolarAngleAxis dataKey="time" tick={{ fontSize: 12 }} stroke="oklch(0.5 0 0)" />
                      <PolarRadiusAxis tick={{ fontSize: 10 }} stroke="oklch(0.5 0 0)" />
                      <Radar
                        name="Amount"
                        dataKey="amount"
                        stroke="oklch(0.55 0.18 150)"
                        fill="oklch(0.55 0.18 150)"
                        fillOpacity={0.6}
                      />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {categoryInsights.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Category Insights</h2>
                <div className="space-y-4">
                  {categoryInsights.map((insight) => (
                    <div key={insight.category} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{insight.category}</span>
                          {insight.trend === "up" && <ArrowUp className="w-4 h-4 text-red-500" />}
                          {insight.trend === "down" && <ArrowDown className="w-4 h-4 text-green-500" />}
                          {insight.trend === "stable" && <Minus className="w-4 h-4 text-gray-500" />}
                        </div>
                        <span className="font-bold">{formatCurrency(insight.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{insight.percentage.toFixed(1)}% of total</span>
                        {insight.rankChange !== 0 && (
                          <span className={insight.rankChange > 0 ? "text-green-600" : "text-red-600"}>
                            Rank {insight.rankChange > 0 ? "↑" : "↓"} {Math.abs(insight.rankChange)}
                          </span>
                        )}
                      </div>
                      {insight.correlation.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Often spent with: {insight.correlation.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {anomalies.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-lg font-semibold">Unusual Spending Detected</h2>
                </div>
                <div className="space-y-3">
                  {anomalies.slice(0, 5).map((anomaly, index) => (
                    <Alert
                      key={index}
                      variant={anomaly.severity === "high" ? "destructive" : "default"}
                      className={
                        anomaly.severity === "medium"
                          ? "border-yellow-500/50 bg-yellow-500/5"
                          : anomaly.severity === "low"
                            ? "border-blue-500/50 bg-blue-500/5"
                            : ""
                      }
                    >
                      <AlertDescription className="text-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{anomaly.category}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(anomaly.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(anomaly.amount)}</p>
                            <p className="text-xs text-muted-foreground">
                              {anomaly.deviation.toFixed(0)}% above average
                            </p>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </Card>
            )}

            {debtImpact && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Debt Impact Analysis</h2>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Total Debt Payments</p>
                      <p className="text-xl font-bold">{formatCurrency(debtImpact.totalDebtPayments)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Debt-to-Income Ratio</p>
                      <p className="text-xl font-bold">{debtImpact.debtToIncomeRatio.toFixed(1)}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Available After Debt</p>
                      <p className="text-xl font-bold">{formatCurrency(debtImpact.availableAfterDebt)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Discretionary Spending</p>
                      <p className="text-xl font-bold">{formatCurrency(debtImpact.discretionarySpending)}</p>
                    </div>
                  </div>
                  <Alert
                    variant={debtImpact.debtToIncomeRatio > 40 ? "destructive" : "default"}
                    className={
                      debtImpact.debtToIncomeRatio <= 20
                        ? "border-green-500/50 bg-green-500/5"
                        : debtImpact.debtToIncomeRatio <= 40
                          ? "border-yellow-500/50 bg-yellow-500/5"
                          : ""
                    }
                  >
                    <AlertDescription className="text-sm">{debtImpact.recommendation}</AlertDescription>
                  </Alert>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            {budgetForecast.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">14-Day Budget Forecast</h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={budgetForecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      stroke="oklch(0.5 0 0)"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.5 0 0)" />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="projected"
                      fill="oklch(0.55 0.18 150)"
                      stroke="oklch(0.55 0.18 150)"
                      fillOpacity={0.3}
                      name="Projected Spending"
                    />
                    {allowance && (
                      <Line
                        type="monotone"
                        dataKey={() => allowance.amount}
                        stroke="oklch(0.5 0.2 25)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Budget Limit"
                        dot={false}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Forecast Confidence</span>
                    <span className="font-semibold">{budgetForecast[0]?.confidence.toFixed(0)}%</span>
                  </div>
                  {budgetForecast[budgetForecast.length - 1]?.shortfall > 0 && (
                    <Alert variant="destructive" className="mt-3">
                      <AlertDescription className="text-sm">
                        Warning: Projected to exceed budget by{" "}
                        {formatCurrency(budgetForecast[budgetForecast.length - 1].shortfall)} in 14 days
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </Card>
            )}

            {expenses.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Spending Predictions</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Next 7 Days</p>
                    <p className="text-2xl font-bold">{formatCurrency(predictions.week)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Based on recent spending</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Next 30 Days</p>
                    <p className="text-2xl font-bold">{formatCurrency(predictions.month)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Projected spending</p>
                  </div>
                </div>
              </Card>
            )}

            {allowance && expenses.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Budget vs Actual</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={budgetComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="oklch(0.5 0 0)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.5 0 0)" />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "oklch(1 0 0)",
                        border: "1px solid oklch(0.9 0 0)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="amount" fill="oklch(0.55 0.18 150)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
