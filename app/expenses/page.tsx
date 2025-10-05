"use client"

import { useState, useEffect } from "react"
import { storage, type Expense, formatCurrency, downloadCSV } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { Search, Plus, Filter, Calendar, Trash2, CalendarDays, Download } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const categories = storage.getCategories()

  useEffect(() => {
    loadExpenses()
  }, [])

  useEffect(() => {
    filterExpenses()
  }, [expenses, searchQuery, categoryFilter, dateFilter])

  const loadExpenses = () => {
    setExpenses(storage.getExpenses())
  }

  const filterExpenses = () => {
    let filtered = [...expenses]

    if (searchQuery) {
      filtered = filtered.filter(
        (expense) =>
          expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          expense.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          expense.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((expense) => expense.category === categoryFilter)
    }

    if (dateFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(expense.date)
        const expenseDateOnly = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate())

        if (dateFilter === "today") {
          return expenseDateOnly.getTime() === today.getTime()
        } else if (dateFilter === "week") {
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          return expenseDateOnly >= weekAgo
        } else if (dateFilter === "month") {
          const monthAgo = new Date(today)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return expenseDateOnly >= monthAgo
        }
        return true
      })
    }

    setFilteredExpenses(filtered)
  }

  const handleDelete = (id: string) => {
    storage.deleteExpense(id)
    loadExpenses()
  }

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filteredExpenses.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredExpenses.map((e) => e.id)))
    }
  }

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.size} selected expenses?`)) {
      selectedIds.forEach((id) => storage.deleteExpense(id))
      setSelectedIds(new Set())
      setBulkMode(false)
      loadExpenses()
    }
  }

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Expenses</h1>
            <p className="text-muted-foreground">Manage and track all your expenses</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
            >
              <CalendarDays className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="outline" onClick={downloadCSV} title="Export as CSV">
              <Download className="w-5 h-5" />
            </Button>
            <Button size="icon" className="rounded-full h-12 w-12" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {dateFilter === "all"
                  ? "Total Expenses"
                  : dateFilter === "today"
                    ? "Today's Expenses"
                    : dateFilter === "week"
                      ? "This Week"
                      : "This Month"}
              </p>
              <p className="text-3xl font-bold">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-semibold">{filteredExpenses.length}</p>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <SelectValue placeholder="Date" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredExpenses.length > 0 && (
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setBulkMode(!bulkMode)}>
                {bulkMode ? "Cancel" : "Select Multiple"}
              </Button>
              {bulkMode && selectedIds.size > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedIds.size === filteredExpenses.length ? "Deselect All" : "Select All"}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete ({selectedIds.size})
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {filteredExpenses.length > 0 ? (
          viewMode === "list" ? (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => (
                <Card key={expense.id} className="p-4">
                  <div className="flex items-start gap-3">
                    {bulkMode && (
                      <Checkbox
                        checked={selectedIds.has(expense.id)}
                        onCheckedChange={() => handleToggleSelect(expense.id)}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{expense.category}</p>
                          {expense.note && <p className="text-sm text-muted-foreground">{expense.note}</p>}
                          {expense.tags && expense.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {expense.tags.map((tag) => (
                                <span key={tag} className="text-xs bg-secondary px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="font-bold">{formatCurrency(expense.amount)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <CalendarView expenses={filteredExpenses} />
          )
        ) : (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || categoryFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your filters"
                : "Start tracking by adding your first expense"}
            </p>
            {!searchQuery && categoryFilter === "all" && dateFilter === "all" && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            )}
          </Card>
        )}
      </div>

      <AddExpenseDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={loadExpenses} />
    </div>
  )
}

function CalendarView({ expenses }: { expenses: Expense[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const expensesByDate = expenses.reduce(
    (acc, expense) => {
      const date = new Date(expense.date).getDate()
      if (!acc[date]) acc[date] = []
      acc[date].push(expense)
      return acc
    },
    {} as Record<number, Expense[]>,
  )

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayExpenses = expensesByDate[day] || []
    const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0)
    days.push(
      <div key={day} className="aspect-square border rounded-lg p-2 text-center">
        <div className="text-sm font-semibold">{day}</div>
        {total > 0 && <div className="text-xs text-primary font-semibold mt-1">{formatCurrency(total)}</div>}
      </div>,
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(year, month - 1))}>
          Previous
        </Button>
        <h3 className="font-semibold">{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
        <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(year, month + 1))}>
          Next
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
        {days}
      </div>
    </Card>
  )
}
