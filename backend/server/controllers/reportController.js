const reportService = require("../services/reportService")
const { validationResult } = require("express-validator")
const { AppError } = require("../middleware/errorHandler")

// Get financial summary
exports.getFinancialSummary = async (req, res, next) => {
  try {
    const { period = "monthly", startDate, endDate } = req.query

    const summary = await reportService.getFinancialSummary(req.user.id, {
      period,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    })

    res.json({
      success: true,
      data: summary,
    })
  } catch (error) {
    next(error)
  }
}

// Get spending analysis
exports.getSpendingAnalysis = async (req, res, next) => {
  try {
    const { period = "monthly", groupBy = "category" } = req.query

    const analysis = await reportService.getSpendingAnalysis(req.user.id, {
      period,
      groupBy,
    })

    res.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    next(error)
  }
}

// Get income analysis
exports.getIncomeAnalysis = async (req, res, next) => {
  try {
    const { period = "monthly" } = req.query

    const analysis = await reportService.getIncomeAnalysis(req.user.id, period)

    res.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    next(error)
  }
}

// Get trends analysis
exports.getTrendsAnalysis = async (req, res, next) => {
  try {
    const { period = "monthly", months = 12 } = req.query

    const trends = await reportService.getTrendsAnalysis(req.user.id, {
      period,
      months: Number.parseInt(months),
    })

    res.json({
      success: true,
      data: trends,
    })
  } catch (error) {
    next(error)
  }
}

// Get cash flow report
exports.getCashFlowReport = async (req, res, next) => {
  try {
    const { period = "monthly", months = 6 } = req.query

    const cashFlow = await reportService.getCashFlowReport(req.user.id, {
      period,
      months: Number.parseInt(months),
    })

    res.json({
      success: true,
      data: cashFlow,
    })
  } catch (error) {
    next(error)
  }
}

// Get budget performance report
exports.getBudgetPerformance = async (req, res, next) => {
  try {
    const { period = "monthly" } = req.query

    const performance = await reportService.getBudgetPerformance(req.user.id, period)

    res.json({
      success: true,
      data: performance,
    })
  } catch (error) {
    next(error)
  }
}

// Generate custom report
exports.generateCustomReport = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new AppError("Validation failed", 400, errors.array()))
    }

    const { reportType, filters, format = "json" } = req.body

    const report = await reportService.generateCustomReport(req.user.id, {
      reportType,
      filters,
      format,
    })

    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader("Content-Disposition", "attachment; filename=financial-report.pdf")
    } else if (format === "csv") {
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", "attachment; filename=financial-report.csv")
    }

    res.json({
      success: true,
      data: report,
    })
  } catch (error) {
    next(error)
  }
}

// Get financial goals progress
exports.getGoalsProgress = async (req, res, next) => {
  try {
    const progress = await reportService.getGoalsProgress(req.user.id)

    res.json({
      success: true,
      data: progress,
    })
  } catch (error) {
    next(error)
  }
}

// Get net worth analysis
exports.getNetWorthAnalysis = async (req, res, next) => {
  try {
    const { period = "monthly" } = req.query

    const netWorth = await reportService.getNetWorthAnalysis(req.user.id, period)

    res.json({
      success: true,
      data: netWorth,
    })
  } catch (error) {
    next(error)
  }
}