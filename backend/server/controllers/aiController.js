const aiService = require("../services/aiService")
const { validationResult } = require("express-validator")
const { AppError } = require("../middleware/errorHandler")

// Process receipt with AI
exports.processReceipt = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError("Receipt image is required", 400))
    }

    const receiptData = await aiService.processReceipt(req.file.path)

    res.json({
      success: true,
      data: receiptData,
    })
  } catch (error) {
    next(error)
  }
}

// Categorize transaction
exports.categorizeTransaction = async (req, res, next) => {
  try {
    const { description, amount, merchant } = req.body

    const category = await aiService.categorizeTransaction({
      description,
      amount,
      merchant,
    })

    res.json({
      success: true,
      data: { category },
    })
  } catch (error) {
    next(error)
  }
}

// Get financial insights
exports.getFinancialInsights = async (req, res, next) => {
  try {
    const { period = "monthly" } = req.query

    const insights = await aiService.generateFinancialInsights(req.user.id, period)

    res.json({
      success: true,
      data: insights,
    })
  } catch (error) {
    next(error)
  }
}

// Get spending recommendations
exports.getSpendingRecommendations = async (req, res, next) => {
  try {
    const recommendations = await aiService.generateSpendingRecommendations(req.user.id)

    res.json({
      success: true,
      data: recommendations,
    })
  } catch (error) {
    next(error)
  }
}

// Get budget suggestions
exports.getBudgetSuggestions = async (req, res, next) => {
  try {
    const suggestions = await aiService.generateBudgetSuggestions(req.user.id)

    res.json({
      success: true,
      data: suggestions,
    })
  } catch (error) {
    next(error)
  }
}

// Analyze spending patterns
exports.analyzeSpendingPatterns = async (req, res, next) => {
  try {
    const { period = "monthly" } = req.query

    const patterns = await aiService.analyzeSpendingPatterns(req.user.id, period)

    res.json({
      success: true,
      data: patterns,
    })
  } catch (error) {
    next(error)
  }
}

// Get financial health score
exports.getFinancialHealthScore = async (req, res, next) => {
  try {
    const healthScore = await aiService.calculateFinancialHealthScore(req.user.id)

    res.json({
      success: true,
      data: healthScore,
    })
  } catch (error) {
    next(error)
  }
}

// Get personalized tips
exports.getPersonalizedTips = async (req, res, next) => {
  try {
    const tips = await aiService.generatePersonalizedTips(req.user.id)

    res.json({
      success: true,
      data: tips,
    })
  } catch (error) {
    next(error)
  }
}

// Predict future expenses
exports.predictExpenses = async (req, res, next) => {
  try {
    const { months = 3 } = req.query

    const predictions = await aiService.predictFutureExpenses(req.user.id, Number.parseInt(months))

    res.json({
      success: true,
      data: predictions,
    })
  } catch (error) {
    next(error)
  }
}

// Chat with AI assistant
exports.chatWithAI = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new AppError("Validation failed", 400, errors.array()))
    }

    const { message, context } = req.body

    const response = await aiService.chatWithFinancialAssistant(req.user.id, message, context)

    res.json({
      success: true,
      data: response,
    })
  } catch (error) {
    next(error)
  }
}