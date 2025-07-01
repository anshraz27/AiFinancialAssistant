const Transaction = require("../models/Transaction")
const Budget = require("../models/Budget")
const Investment = require("../models/Investment")
const mongoose = require("mongoose")

class ReportService {
  // Get comprehensive financial summary
  async getFinancialSummary(userId, options = {}) {
    const { period = "monthly", startDate, endDate } = options

    let dateRange
    if (startDate && endDate) {
      dateRange = { startDate: new Date(startDate), endDate: new Date(endDate) }
    } else {
      dateRange = this.getDateRange(period)
    }

    // Get transaction summary
    const transactionSummary = await Transaction.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          average: { $avg: "$amount" },
        },
      },
    ])

    const income = transactionSummary.find(item => item._id === "income")?.total || 0
    const expenses = transactionSummary.find(item => item._id === "expense")?.total || 0
    const netIncome = income - expenses
    const savingsRate = income > 0 ? (netIncome / income) * 100 : 0

    // Get category breakdown
    const categoryBreakdown = await this.getCategoryBreakdown(userId, dateRange)

    // Get budget performance
    const budgetPerformance = await this.getBudgetSummary(userId, dateRange)

    return {
      period,
      dateRange,
      summary: {
        totalIncome: income,
        totalExpenses: expenses,
        netIncome,
        savingsRate,
        transactionCount: transactionSummary.reduce((sum, item) => sum + item.count, 0),
      },
      categoryBreakdown,
      budgetPerformance,
    }
  }

  // Get spending analysis
  async getSpendingAnalysis(userId, options = {}) {
    const { period = "monthly", groupBy = "category" } = options
    const dateRange = this.getDateRange(period)

    let groupField
    switch (groupBy) {
      case "category":
        groupField = "$category"
        break
      case "merchant":
        groupField = "$merchant"
        break
      case "paymentMethod":
        groupField = "$paymentMethod"
        break
      default:
        groupField = "$category"
    }

    const analysis = await Transaction.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          type: "expense",
          date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
        },
      },
      {
        $group: {
          _id: groupField,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          average: { $avg: "$amount" },
          transactions: { $push: "$$ROOT" },
        },
      },
      {
        $sort: { total: -1 },
      },
    ])

    const totalSpending = analysis.reduce((sum, item) => sum + item.total, 0)

    return {
      period,
      dateRange,
      groupBy,
      totalSpending,
      breakdown: analysis.map(item => ({
        ...item,
        percentage: totalSpending > 0 ? (item.total / totalSpending) * 100 : 0,
      })),
    }
  }

  // Get income analysis
  async getIncomeAnalysis(userId, period = "monthly") {
    const dateRange = this.getDateRange(period)

    const analysis = await Transaction.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          type: "income",
          date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          average: { $avg: "$amount" },
        },
      },
      {
        $sort: { total: -1 },
      },
    ])

    const totalIncome = analysis.reduce((sum, item) => sum + item.total, 0)

    return {
      period,
      dateRange,
      totalIncome,
      sources: analysis.map(item => ({
        ...item,
        percentage: totalIncome > 0 ? (item.total / totalIncome) * 100 : 0,
      })),
    }
  }

  // Get trends analysis
  async getTrendsAnalysis(userId, options = {}) {
    const { period = "monthly", months = 12 } = options
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const trends = await Transaction.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ])

    // Organize data by month
    const monthlyData = {}
    trends.forEach(item => {
      const key = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`
      if (!monthlyData[key]) {
        monthlyData[key] = { income: 0, expense: 0, net: 0 }
      }
      monthlyData[key][item._id.type] = item.total
      monthlyData[key].net = monthlyData[key].income - monthlyData[key].expense
    })

    return {
      period: `${months} months`,
      dateRange: { startDate, endDate },
      trends: Object.entries(monthlyData).map(([month, data]) => ({
        month,
        ...data,
        savingsRate: data.income > 0 ? (data.net / data.income) * 100 : 0,
      })),
    }
  }

  // Get cash flow report
  async getCashFlowReport(userId, options = {}) {
    const { period = "monthly", months = 6 } = options
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const cashFlow = await Transaction.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            week: { $week: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 },
      },
    ])

    // Process data based on period
    const groupedData = {}
    cashFlow.forEach(item => {
      let key
      if (period === "weekly") {
        key = `${item._id.year}-W${item._id.week}`
      } else {
        key = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`
      }

      if (!groupedData[key]) {
        groupedData[key] = { income: 0, expense: 0, net: 0 }
      }
      groupedData[key][item._id.type] = item.total
      groupedData[key].net = groupedData[key].income - groupedData[key].expense
    })

    return {
      period,
      dateRange: { startDate, endDate },
      cashFlow: Object.entries(groupedData).map(([period, data]) => ({
        period,
        ...data,
      })),
    }
  }

  // Get budget performance report
  async getBudgetPerformance(userId, period = "monthly") {
    const dateRange = this.getDateRange(period)

    const budgets = await Budget.find({
      userId,
      startDate: { $lte: dateRange.endDate },
      endDate: { $gte: dateRange.startDate },
      isActive: true,
    })

    const actualSpending = await Transaction.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          type: "expense",
          date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
        },
      },
      {
        $group: {
          _id: "$category",
          spent: { $sum: "$amount" },
        },
      },
    ])

    const spendingMap = new Map(actualSpending.map(item => [item._id, item.spent]))

    const performance = budgets.map(budget => {
      const spent = spendingMap.get(budget.category) || 0
      const variance = spent - budget.amount
      const adherence = budget.amount > 0 ? ((budget.amount - spent) / budget.amount) * 100 : 0

      return {
        category: budget.category,
        budgeted: budget.amount,
        spent,
        variance,
        adherence,
        status: variance > 0 ? "over" : adherence < 10 ? "warning" : "good",
      }
    })

    const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0)
    const totalSpent = actualSpending.reduce((sum, item) => sum + item.spent, 0)

    return {
      period,
      dateRange,
      summary: {
        totalBudgeted,
        totalSpent,
        totalVariance: totalSpent - totalBudgeted,
        overallAdherence: totalBudgeted > 0 ? ((totalBudgeted - totalSpent) / totalBudgeted) * 100 : 0,
      },
      categories: performance,
    }
  }

  // Generate custom report
  async generateCustomReport(userId, options = {}) {
    const { reportType, filters = {}, format = "json" } = options

    let reportData

    switch (reportType) {
      case "spending_by_category":
        reportData = await this.getSpendingAnalysis(userId, filters)
        break
      case "income_analysis":
        reportData = await this.getIncomeAnalysis(userId, filters.period)
        break
      case "budget_performance":
        reportData = await this.getBudgetPerformance(userId, filters.period)
        break
      case "cash_flow":
        reportData = await this.getCashFlowReport(userId, filters)
        break
      default:
        reportData = await this.getFinancialSummary(userId, filters)
    }

    if (format === "csv") {
      return this.convertToCSV(reportData)
    }

    return reportData
  }

  // Get financial goals progress
  async getGoalsProgress(userId) {
    // This would integrate with a goals/targets system
    // For now, return basic savings goals based on budget performance
    const currentMonth = this.getDateRange("monthly")
    const summary = await this.getFinancialSummary(userId, { period: "monthly" })

    const savingsGoal = 1000 // This would come from user settings
    const currentSavings = summary.summary.netIncome

    return {
      savingsGoal: {
        target: savingsGoal,
        current: currentSavings,
        progress: savingsGoal > 0 ? (currentSavings / savingsGoal) * 100 : 0,
        status: currentSavings >= savingsGoal ? "achieved" : "in_progress",
      },
    }
  }

  // Get net worth analysis
  async getNetWorthAnalysis(userId, period = "monthly") {
    // This would integrate with assets and liabilities tracking
    // For now, return basic analysis based on cash flow
    const trends = await this.getTrendsAnalysis(userId, { months: 12 })

    const netWorthTrend = trends.trends.map(item => ({
      month: item.month,
      netIncome: item.net,
      cumulativeNet: 0, // Would calculate running total
    }))

    // Calculate cumulative net income as a proxy for net worth change
    let cumulative = 0
    netWorthTrend.forEach(item => {
      cumulative += item.netIncome
      item.cumulativeNet = cumulative
    })

    return {
      period,
      netWorthTrend,
      summary: {
        totalNetIncome: cumulative,
        averageMonthlyNet: cumulative / netWorthTrend.length,
        trend: cumulative > 0 ? "positive" : "negative",
      },
    }
  }

  // Helper methods
  getDateRange(period) {
    const now = new Date()
    let startDate, endDate

    switch (period) {
      case "weekly":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        endDate = now
        break
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case "quarterly":
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
        break
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }

    return { startDate, endDate }
  }

  async getCategoryBreakdown(userId, dateRange) {
    return Transaction.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
        },
      },
      {
        $group: {
          _id: { type: "$type", category: "$category" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { total: -1 },
      },
    ])
  }

  async getBudgetSummary(userId, dateRange) {
    const budgets = await Budget.find({
      userId,
      startDate: { $lte: dateRange.endDate },
      endDate: { $gte: dateRange.startDate },
      isActive: true,
    })

    return {
      totalBudgets: budgets.length,
      totalBudgeted: budgets.reduce((sum, budget) => sum + budget.amount, 0),
      totalSpent: budgets.reduce((sum, budget) => sum + budget.spent, 0),
    }
  }

  convertToCSV(data) {
    // Simple CSV conversion - would be enhanced based on data structure
    const { Parser } = require("json2csv")
    const parser = new Parser()
    return parser.parse(data)
  }
}

module.exports = new ReportService()