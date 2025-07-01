const Transaction = require("../models/Transaction")
const Category = require("../models/Category")
const Budget = require("../models/Budget")
const csv = require("csv-parser")
const fs = require("fs")
const { Parser } = require("json2csv")

class TransactionService {
  // Get transactions with pagination and filters
  async getTransactions(filters, options = {}) {
    const { page = 1, limit = 10, sort = { date: -1 } } = options
    const skip = (page - 1) * limit

    const transactions = await Transaction.find(filters)
      .populate("category", "name type icon color")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Transaction.countDocuments(filters)

    return {
      transactions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    }
  }

  // Create new transaction
  async createTransaction(transactionData) {
    const transaction = new Transaction(transactionData)
    await transaction.save()

    // Update budget if it's an expense
    if (transaction.type === "expense") {
      await this.updateBudgetSpent(transaction.userId, transaction.category)
    }

    return transaction.populate("category", "name type icon color")
  }

  // Update budget spent amount
  async updateBudgetSpent(userId, category) {
    const budgets = await Budget.find({
      userId,
      category,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    })

    for (const budget of budgets) {
      await budget.updateSpent()
    }
  }

  // Get transaction statistics
  async getTransactionStats(userId, period = "month") {
    const now = new Date()
    let startDate, endDate

    switch (period) {
      case "week":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        endDate = now
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }

    const stats = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate, $lte: endDate },
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

    const categoryStats = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate, $lte: endDate },
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
        $lookup: {
          from: "categories",
          localField: "_id.category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $sort: { total: -1 },
      },
    ])

    return {
      period,
      dateRange: { startDate, endDate },
      summary: stats,
      byCategory: categoryStats,
    }
  }

  // Bulk import transactions from CSV
  async bulkImportTransactions(filePath, userId) {
    const transactions = []
    const errors = []

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          try {
            const transaction = {
              userId,
              type: row.type?.toLowerCase(),
              amount: Number.parseFloat(row.amount),
              description: row.description,
              category: row.category,
              date: new Date(row.date),
              merchant: row.merchant || "",
              paymentMethod: row.paymentMethod || "other",
            }

            // Validate required fields
            if (!transaction.type || !transaction.amount || !transaction.description) {
              errors.push(`Invalid row: ${JSON.stringify(row)}`)
              return
            }

            transactions.push(transaction)
          } catch (error) {
            errors.push(`Error parsing row: ${JSON.stringify(row)} - ${error.message}`)
          }
        })
        .on("end", async () => {
          try {
            const savedTransactions = await Transaction.insertMany(transactions, { ordered: false })

            // Update budgets for expense transactions
            const expenseCategories = [
              ...new Set(savedTransactions.filter((t) => t.type === "expense").map((t) => t.category)),
            ]

            for (const category of expenseCategories) {
              await this.updateBudgetSpent(userId, category)
            }

            resolve({
              imported: savedTransactions.length,
              errors: errors.length,
              errorDetails: errors,
            })
          } catch (error) {
            reject(error)
          }
        })
        .on("error", reject)
    })
  }

  // Export transactions
  async exportTransactions(filters, format = "csv") {
    const transactions = await Transaction.find(filters).populate("category", "name").sort({ date: -1 }).lean()

    if (format === "csv") {
      const fields = ["date", "type", "amount", "description", "category.name", "merchant", "paymentMethod"]

      const parser = new Parser({ fields })
      return parser.parse(transactions)
    }

    return JSON.stringify(transactions, null, 2)
  }

  // Get spending trends
  async getSpendingTrends(userId, months = 6) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    return Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: "expense",
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ])
  }

  // Get top spending categories
  async getTopSpendingCategories(userId, limit = 10, period = "month") {
    const now = new Date()
    let startDate

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    return Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: "expense",
          date: { $gte: startDate },
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
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $sort: { total: -1 },
      },
      {
        $limit: limit,
      },
    ])
  }

  // Get recent transactions
  async getRecentTransactions(userId, limit = 10) {
    return Transaction.find({ userId })
      .populate("category", "name type icon color")
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .lean()
  }

  // Search transactions
  async searchTransactions(userId, query, options = {}) {
    const { page = 1, limit = 10 } = options
    const skip = (page - 1) * limit

    const searchRegex = new RegExp(query, "i")

    const filters = {
      userId,
      $or: [{ description: searchRegex }, { merchant: searchRegex }, { notes: searchRegex }],
    }

    const transactions = await Transaction.find(filters)
      .populate("category", "name type icon color")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Transaction.countDocuments(filters)

    return {
      transactions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    }
  }
}

module.exports = new TransactionService()