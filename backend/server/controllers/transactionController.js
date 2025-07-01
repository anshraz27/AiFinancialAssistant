const Transaction = require("../models/Transaction")
const transactionService = require("../services/transactionService")
const aiService = require("../services/aiService")
const { validationResult } = require("express-validator")
const { AppError } = require("../middleware/errorHandler")

// Get all transactions for a user
exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, type, startDate, endDate, search } = req.query

    const filters = { userId: req.user.id }

    if (category) filters.category = category
    if (type) filters.type = type
    if (startDate || endDate) {
      filters.date = {}
      if (startDate) filters.date.$gte = new Date(startDate)
      if (endDate) filters.date.$lte = new Date(endDate)
    }
    if (search) {
      filters.$or = [
        { description: { $regex: search, $options: "i" } },
        { merchant: { $regex: search, $options: "i" } },
      ]
    }

    const transactions = await transactionService.getTransactions(filters, {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      sort: { date: -1 },
    })

    res.json({
      success: true,
      data: transactions,
    })
  } catch (error) {
    next(error)
  }
}

// Get transaction by ID
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!transaction) {
      return next(new AppError("Transaction not found", 404))
    }

    res.json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    next(error)
  }
}

// Create new transaction
exports.createTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new AppError("Validation failed", 400, errors.array()))
    }

    const transactionData = {
      ...req.body,
      userId: req.user.id,
    }

    // If receipt image is uploaded, process it with AI
    if (req.file) {
      try {
        const aiData = await aiService.processReceipt(req.file.path)
        transactionData.amount = aiData.amount || transactionData.amount
        transactionData.merchant = aiData.merchant || transactionData.merchant
        transactionData.category = aiData.category || transactionData.category
        transactionData.receiptUrl = req.file.path
      } catch (aiError) {
        console.error("AI processing failed:", aiError)
        // Continue without AI data if processing fails
        transactionData.receiptUrl = req.file.path
      }
    }

    const transaction = await transactionService.createTransaction(transactionData)

    res.status(201).json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    next(error)
  }
}

// Update transaction
exports.updateTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new AppError("Validation failed", 400, errors.array()))
    }

    const transaction = await Transaction.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body, {
      new: true,
      runValidators: true,
    })

    if (!transaction) {
      return next(new AppError("Transaction not found", 404))
    }

    res.json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    next(error)
  }
}

// Delete transaction
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!transaction) {
      return next(new AppError("Transaction not found", 404))
    }

    res.json({
      success: true,
      message: "Transaction deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

// Get transaction statistics
exports.getTransactionStats = async (req, res, next) => {
  try {
    const { period = "month" } = req.query
    const stats = await transactionService.getTransactionStats(req.user.id, period)

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    next(error)
  }
}

// Bulk import transactions
exports.bulkImport = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError("CSV file is required", 400))
    }

    const result = await transactionService.bulkImportTransactions(req.file.path, req.user.id)

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

// Export transactions
exports.exportTransactions = async (req, res, next) => {
  try {
    const { format = "csv", startDate, endDate } = req.query

    const filters = { userId: req.user.id }
    if (startDate || endDate) {
      filters.date = {}
      if (startDate) filters.date.$gte = new Date(startDate)
      if (endDate) filters.date.$lte = new Date(endDate)
    }

    const exportData = await transactionService.exportTransactions(filters, format)

    res.setHeader("Content-Type", format === "csv" ? "text/csv" : "application/json")
    res.setHeader("Content-Disposition", `attachment; filename=transactions.${format}`)
    res.send(exportData)
  } catch (error) {
    next(error)
  }
}