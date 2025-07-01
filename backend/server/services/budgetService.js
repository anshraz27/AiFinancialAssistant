const Budget = require("../models/Budget")
const Transaction = require("../models/Transaction")
const mongoose = require("mongoose")

class BudgetService {
  // Get user budgets with progress
  async getUserBudgets(userId, period = "monthly") {
    const budgets = await Budget.find({
      userId,
      period,
      isActive: true,
    }).sort({ category: 1 })

    // Update spent amounts and add progress info
    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        await budget.updateSpent()
        return this.getBudgetProgress(budget)
      })
    )

    return budgetsWithProgress
  }

  // Create new budget
  async createBudget(budgetData) {
    // Check for existing budget in the same period
    const existingBudget = await Budget.findOne({
      userId: budgetData.userId,
      category: budgetData.category,
      period: budgetData.period,
      startDate: { $lte: budgetData.endDate },
      endDate: { $gte: budgetData.startDate },
      isActive: true,
    })

    if (existingBudget) {
      throw new Error("Budget already exists for this category and period")
    }

    const budget = new Budget(budgetData)
    await budget.save()
    await budget.updateSpent()

    return this.getBudgetProgress(budget)
  }

  // Get budget with progress information
  async getBudgetProgress(budget) {
    const budgetObj = budget.toObject()
    
    return {
      ...budgetObj,
      progressPercentage: budget.progressPercentage,
      remaining: budget.remaining,
      status: budget.status,
      isCurrent: budget.isCurrent(),
    }
  }

  // Get budget overview for dashboard
  async getBudgetOverview(userId, period = "monthly") {
    const now = new Date()
    let startDate, endDate

    switch (period) {
      case "weekly":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
        endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000)
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

    const budgets = await Budget.find({
      userId,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
      isActive: true,
    })

    // Update all budget spent amounts
    await Promise.all(budgets.map(budget => budget.updateSpent()))

    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0)
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
    const totalRemaining = totalBudget - totalSpent

    const categoryBreakdown = budgets.map(budget => ({
      category: budget.category,
      budgeted: budget.amount,
      spent: budget.spent,
      remaining: budget.remaining,
      progressPercentage: budget.progressPercentage,
      status: budget.status,
    }))

    return {
      period,
      dateRange: { startDate, endDate },
      summary: {
        totalBudget,
        totalSpent,
        totalRemaining,
        overallProgress: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
        budgetCount: budgets.length,
      },
      categories: categoryBreakdown,
    }
  }

  // Check for budget alerts
  async checkBudgetAlerts(userId) {
    const currentBudgets = await Budget.find({
      userId,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    })

    const alerts = []

    for (const budget of currentBudgets) {
      await budget.updateSpent()
      
      const progressPercentage = budget.progressPercentage

      if (progressPercentage >= 100) {
        alerts.push({
          type: "exceeded",
          severity: "high",
          budget: budget,
          message: `Budget exceeded for ${budget.category}`,
          amount: budget.spent - budget.amount,
        })
      } else if (progressPercentage >= budget.alertThreshold) {
        alerts.push({
          type: "warning",
          severity: "medium",
          budget: budget,
          message: `Budget alert for ${budget.category} (${progressPercentage}% used)`,
          amount: budget.spent,
        })
      }
    }

    return alerts
  }

  // Get budget recommendations based on spending patterns
  async getBudgetRecommendations(userId) {
    const recommendations = []

    // Get spending data for the last 3 months
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const spendingByCategory = await Transaction.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          type: "expense",
          date: { $gte: threeMonthsAgo },
        },
      },
      {
        $group: {
          _id: "$category",
          totalSpent: { $sum: "$amount" },
          avgMonthly: { $avg: "$amount" },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
    ])

    // Get existing budgets
    const existingBudgets = await Budget.find({
      userId,
      isActive: true,
    })

    const budgetedCategories = new Set(existingBudgets.map(b => b.category))

    for (const categoryData of spendingByCategory) {
      const category = categoryData._id
      const monthlyAverage = categoryData.totalSpent / 3

      if (!budgetedCategories.has(category)) {
        // Recommend budget for unbudgeted categories with significant spending
        if (monthlyAverage > 50) {
          recommendations.push({
            type: "create_budget",
            category,
            suggestedAmount: Math.ceil(monthlyAverage * 1.1), // 10% buffer
            reason: `You spent an average of $${monthlyAverage.toFixed(2)} monthly on ${category}`,
            priority: monthlyAverage > 200 ? "high" : "medium",
          })
        }
      } else {
        // Check if existing budget needs adjustment
        const existingBudget = existingBudgets.find(b => b.category === category)
        if (existingBudget && monthlyAverage > existingBudget.amount * 0.9) {
          recommendations.push({
            type: "increase_budget",
            category,
            currentAmount: existingBudget.amount,
            suggestedAmount: Math.ceil(monthlyAverage * 1.1),
            reason: `Your spending exceeds 90% of your current budget`,
            priority: "medium",
          })
        }
      }
    }

    return recommendations
  }

  // Get budget performance analysis
  async getBudgetPerformance(userId, period = "monthly") {
    const now = new Date()
    const periods = []

    // Generate date ranges for the last 6 periods
    for (let i = 5; i >= 0; i--) {
      let startDate, endDate

      switch (period) {
        case "weekly":
          startDate = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
          startDate.setDate(startDate.getDate() - startDate.getDay())
          endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000)
          break
        case "monthly":
          startDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
          endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
          break
        case "quarterly":
          const quarter = Math.floor(now.getMonth() / 3) - i
          startDate = new Date(now.getFullYear(), quarter * 3, 1)
          endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
          endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      }

      periods.push({ startDate, endDate })
    }

    const performance = await Promise.all(
      periods.map(async ({ startDate, endDate }) => {
        const budgets = await Budget.find({
          userId,
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
          isActive: true,
        })

        const actualSpending = await Transaction.aggregate([
          {
            $match: {
              userId: mongoose.Types.ObjectId(userId),
              type: "expense",
              date: { $gte: startDate, $lte: endDate },
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

        const categoryPerformance = budgets.map(budget => ({
          category: budget.category,
          budgeted: budget.amount,
          spent: spendingMap.get(budget.category) || 0,
          variance: (spendingMap.get(budget.category) || 0) - budget.amount,
          adherence: budget.amount > 0 ? ((budget.amount - (spendingMap.get(budget.category) || 0)) / budget.amount) * 100 : 0,
        }))

        const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0)
        const totalSpent = actualSpending.reduce((sum, item) => sum + item.spent, 0)

        return {
          period: { startDate, endDate },
          totalBudgeted,
          totalSpent,
          totalVariance: totalSpent - totalBudgeted,
          overallAdherence: totalBudgeted > 0 ? ((totalBudgeted - totalSpent) / totalBudgeted) * 100 : 0,
          categories: categoryPerformance,
        }
      })
    )

    return performance
  }
}

module.exports = new BudgetService()