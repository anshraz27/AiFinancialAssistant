const Budget = require("../models/Budget")
const budgetService = require("../services/budgetService")
const { validationResult } = require("express-validator")
const { AppError } = require("../middleware/errorHandler")

// Get all budgets for a user
exports.getBudgets = async (req, res, next) => {
  try {
    const { period = "monthly" } = req.query
    const budgets = await budgetService.getUserBudgets(req.user.id, period)

    res.json({
      success: true,
      data: budgets,
    })
  } catch (error) {
    next(error)
  }
}

// Get budget by ID
exports.getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!budget) {
      return next(new AppError("Budget not found", 404))
    }

    const budgetWithProgress = await budgetService.getBudgetProgress(budget)

    res.json({
      success: true,
      data: budgetWithProgress,
    })
  } catch (error) {
    next(error)
  }
}

// Create new budget
exports.createBudget = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new AppError("Validation failed", 400, errors.array()))
    }

    const budgetData = {
      ...req.body,
      userId: req.user.id,
    }

    const budget = await budgetService.createBudget(budgetData)

    res.status(201).json({
      success: true,
      data: budget,
    })
  } catch (error) {
    next(error)
  }
}

// Update budget
exports.updateBudget = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new AppError("Validation failed", 400, errors.array()))
    }

    const budget = await Budget.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body, {
      new: true,
      runValidators: true,
    })

    if (!budget) {
      return next(new AppError("Budget not found", 404))
    }

    res.json({
      success: true,
      data: budget,
    })
  } catch (error) {
    next(error)
  }
}

// Delete budget
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!budget) {
      return next(new AppError("Budget not found", 404))
    }

    res.json({
      success: true,
      message: "Budget deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

// Get budget overview
exports.getBudgetOverview = async (req, res, next) => {
  try {
    const { period = "monthly" } = req.query
    const overview = await budgetService.getBudgetOverview(req.user.id, period)

    res.json({
      success: true,
      data: overview,
    })
  } catch (error) {
    next(error)
  }
}

// Check budget alerts
exports.getBudgetAlerts = async (req, res, next) => {
  try {
    const alerts = await budgetService.checkBudgetAlerts(req.user.id)

    res.json({
      success: true,
      data: alerts,
    })
  } catch (error) {
    next(error)
  }
}

// Get budget recommendations
exports.getBudgetRecommendations = async (req, res, next) => {
  try {
    const recommendations = await budgetService.getBudgetRecommendations(req.user.id)

    res.json({
      success: true,
      data: recommendations,
    })
  } catch (error) {
    next(error)
  }
}