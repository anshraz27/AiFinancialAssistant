const OpenAI = require("openai")
const Transaction = require("../models/Transaction")
const Budget = require("../models/Budget")
const Category = require("../models/Category")
const mongoose = require("mongoose")

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  // Process receipt image and extract transaction data
  async processReceipt(imagePath) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract transaction information from this receipt. Return JSON with: amount (number), merchant (string), category (string), date (YYYY-MM-DD), items (array of strings). If unclear, use null.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imagePath,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      })

      const extractedData = JSON.parse(response.choices[0].message.content)

      // Validate and clean the extracted data
      return {
        amount: extractedData.amount || null,
        merchant: extractedData.merchant || null,
        category: await this.validateCategory(extractedData.category),
        date: extractedData.date || new Date().toISOString().split('T')[0],
        items: extractedData.items || [],
        confidence: 0.8, // Would implement actual confidence scoring
      }
    } catch (error) {
      console.error("Receipt processing error:", error)
      throw new Error("Failed to process receipt")
    }
  }

  // Categorize transaction based on description and merchant
  async categorizeTransaction(transactionData) {
    const { description, amount, merchant } = transactionData

    try {
      // First, try to match with existing categories using keywords
      const categories = await Category.find({ isActive: true })
      
      for (const category of categories) {
        for (const keyword of category.keywords) {
          if (description.toLowerCase().includes(keyword) || 
              (merchant && merchant.toLowerCase().includes(keyword))) {
            return category.name
          }
        }
      }

      // If no keyword match, use AI
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a financial categorization expert. Categorize transactions into standard categories like: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Education, Travel, etc.",
          },
          {
            role: "user",
            content: `Categorize this transaction: Description: "${description}", Merchant: "${merchant}", Amount: $${amount}. Return only the category name.`,
          },
        ],
        max_tokens: 50,
      })

      return response.choices[0].message.content.trim()
    } catch (error) {
      console.error("Categorization error:", error)
      return "Other"
    }
  }

  // Generate financial insights based on user data
  async generateFinancialInsights(userId, period = "monthly") {
    try {
      // Get user's financial data
      const financialData = await this.getUserFinancialSummary(userId, period)

      const prompt = `
        Analyze this financial data and provide 3-5 key insights:
        
        Income: $${financialData.totalIncome}
        Expenses: $${financialData.totalExpenses}
        Net Income: $${financialData.netIncome}
        Savings Rate: ${financialData.savingsRate}%
        
        Top Spending Categories:
        ${financialData.topCategories.map(cat => `- ${cat.category}: $${cat.amount}`).join('\n')}
        
        Budget Performance:
        ${financialData.budgetPerformance.map(budget => `- ${budget.category}: ${budget.adherence}% adherence`).join('\n')}
        
        Provide actionable insights in JSON format with: type, title, description, priority (high/medium/low), actionable (boolean).
      `

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a financial advisor providing personalized insights. Be specific and actionable.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
      })

      return JSON.parse(response.choices[0].message.content)
    } catch (error) {
      console.error("Insights generation error:", error)
      return this.getFallbackInsights(userId)
    }
  }

  // Generate spending recommendations
  async generateSpendingRecommendations(userId) {
    try {
      const spendingData = await this.getSpendingAnalysis(userId)

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a financial advisor. Provide specific, actionable spending recommendations based on spending patterns.",
          },
          {
            role: "user",
            content: `
              Based on this spending data, provide 3-5 recommendations:
              ${JSON.stringify(spendingData, null, 2)}
              
              Return JSON array with: category, recommendation, potentialSavings, difficulty (easy/medium/hard).
            `,
          },
        ],
        max_tokens: 800,
      })

      return JSON.parse(response.choices[0].message.content)
    } catch (error) {
      console.error("Recommendations error:", error)
      return this.getFallbackRecommendations()
    }
  }

  // Generate budget suggestions
  async generateBudgetSuggestions(userId) {
    try {
      const userData = await this.getUserFinancialSummary(userId, "monthly")

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a financial advisor specializing in budgeting. Suggest realistic budget allocations.",
          },
          {
            role: "user",
            content: `
              Create budget suggestions for monthly income of $${userData.totalIncome}:
              Current spending: ${JSON.stringify(userData.topCategories)}
              
              Return JSON with suggested budget allocations following 50/30/20 rule as baseline.
            `,
          },
        ],
        max_tokens: 600,
      })

      return JSON.parse(response.choices[0].message.content)
    } catch (error) {
      console.error("Budget suggestions error:", error)
      return this.getFallbackBudgetSuggestions(userId)
    }
  }

  // Analyze spending patterns
  async analyzeSpendingPatterns(userId, period = "monthly") {
    try {
      const patterns = await this.getSpendingPatterns(userId, period)

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a data analyst specializing in financial behavior patterns.",
          },
          {
            role: "user",
            content: `
              Analyze these spending patterns and identify trends:
              ${JSON.stringify(patterns, null, 2)}
              
              Return JSON with: trends, anomalies, predictions, recommendations.
            `,
          },
        ],
        max_tokens: 800,
      })

      return JSON.parse(response.choices[0].message.content)
    } catch (error) {
      console.error("Pattern analysis error:", error)
      return this.getFallbackPatternAnalysis()
    }
  }

  // Calculate financial health score
  async calculateFinancialHealthScore(userId) {
    try {
      const financialData = await this.getUserFinancialSummary(userId, "monthly")
      
      // Calculate score based on multiple factors
      let score = 0
      const factors = []

      // Savings rate (30 points)
      const savingsScore = Math.min(financialData.savingsRate * 1.5, 30)
      score += savingsScore
      factors.push({
        factor: "Savings Rate",
        score: savingsScore,
        maxScore: 30,
        description: `${financialData.savingsRate}% savings rate`,
      })

      // Budget adherence (25 points)
      const budgetScore = financialData.budgetAdherence * 0.25
      score += budgetScore
      factors.push({
        factor: "Budget Adherence",
        score: budgetScore,
        maxScore: 25,
        description: `${financialData.budgetAdherence}% budget adherence`,
      })

      // Expense diversity (20 points)
      const diversityScore = Math.min(financialData.categoryCount * 2, 20)
      score += diversityScore
      factors.push({
        factor: "Expense Diversity",
        score: diversityScore,
        maxScore: 20,
        description: `${financialData.categoryCount} spending categories`,
      })

      // Income stability (25 points)
      const stabilityScore = 20 // Would calculate based on income variance
      score += stabilityScore
      factors.push({
        factor: "Income Stability",
        score: stabilityScore,
        maxScore: 25,
        description: "Stable income pattern",
      })

      const finalScore = Math.round(score)
      let grade, status

      if (finalScore >= 80) {
        grade = "A"
        status = "Excellent"
      } else if (finalScore >= 70) {
        grade = "B"
        status = "Good"
      } else if (finalScore >= 60) {
        grade = "C"
        status = "Fair"
      } else {
        grade = "D"
        status = "Needs Improvement"
      }

      return {
        score: finalScore,
        grade,
        status,
        factors,
        recommendations: await this.getHealthScoreRecommendations(finalScore, factors),
      }
    } catch (error) {
      console.error("Health score calculation error:", error)
      return { score: 0, grade: "N/A", status: "Unable to calculate", factors: [] }
    }
  }

  // Generate personalized tips
  async generatePersonalizedTips(userId) {
    try {
      const userData = await this.getUserFinancialSummary(userId, "monthly")

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a personal finance coach. Provide personalized, actionable tips.",
          },
          {
            role: "user",
            content: `
              Generate 5 personalized financial tips based on:
              Income: $${userData.totalIncome}
              Expenses: $${userData.totalExpenses}
              Savings Rate: ${userData.savingsRate}%
              Top Categories: ${userData.topCategories.map(c => c.category).join(', ')}
              
              Return JSON array with: tip, category, impact (high/medium/low), timeframe.
            `,
          },
        ],
        max_tokens: 800,
      })

      return JSON.parse(response.choices[0].message.content)
    } catch (error) {
      console.error("Tips generation error:", error)
      return this.getFallbackTips()
    }
  }

  // Predict future expenses
  async predictFutureExpenses(userId, months = 3) {
    try {
      const historicalData = await this.getHistoricalSpending(userId, 6)

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a financial forecasting expert. Predict future expenses based on historical data.",
          },
          {
            role: "user",
            content: `
              Predict expenses for the next ${months} months based on:
              ${JSON.stringify(historicalData, null, 2)}
              
              Return JSON with monthly predictions by category, including confidence levels.
            `,
          },
        ],
        max_tokens: 1000,
      })

      return JSON.parse(response.choices[0].message.content)
    } catch (error) {
      console.error("Prediction error:", error)
      return this.getFallbackPredictions(months)
    }
  }

  // Chat with AI financial assistant
  async chatWithFinancialAssistant(userId, message, context = {}) {
    try {
      const userData = await this.getUserFinancialSummary(userId, "monthly")

      const systemPrompt = `
        You are a personal financial assistant for a user with:
        - Monthly Income: $${userData.totalIncome}
        - Monthly Expenses: $${userData.totalExpenses}
        - Savings Rate: ${userData.savingsRate}%
        - Top Spending Categories: ${userData.topCategories.map(c => c.category).join(', ')}
        
        Provide helpful, personalized financial advice. Be conversational but professional.
      `

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 500,
      })

      return {
        response: response.choices[0].message.content,
        context: {
          ...context,
          lastQuery: message,
          timestamp: new Date(),
        },
      }
    } catch (error) {
      console.error("Chat error:", error)
      return {
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        context,
      }
    }
  }

  // Helper methods
  async validateCategory(category) {
    if (!category) return "Other"

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(category, "i") },
      isActive: true,
    })

    return existingCategory ? existingCategory.name : category
  }

  async getUserFinancialSummary(userId, period) {
    const dateRange = this.getDateRange(period)

    const transactions = await Transaction.aggregate([
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
    ])

    const income = transactions.filter(t => t._id.type === "income").reduce((sum, t) => sum + t.total, 0)
    const expenses = transactions.filter(t => t._id.type === "expense").reduce((sum, t) => sum + t.total, 0)
    const netIncome = income - expenses
    const savingsRate = income > 0 ? (netIncome / income) * 100 : 0

    const topCategories = transactions
      .filter(t => t._id.type === "expense")
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(t => ({ category: t._id.category, amount: t.total }))

    // Get budget performance
    const budgets = await Budget.find({
      userId,
      isActive: true,
      startDate: { $lte: dateRange.endDate },
      endDate: { $gte: dateRange.startDate },
    })

    const budgetPerformance = budgets.map(budget => ({
      category: budget.category,
      adherence: budget.amount > 0 ? Math.max(0, ((budget.amount - budget.spent) / budget.amount) * 100) : 0,
    }))

    const avgBudgetAdherence = budgetPerformance.length > 0 
      ? budgetPerformance.reduce((sum, b) => sum + b.adherence, 0) / budgetPerformance.length 
      : 0

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netIncome,
      savingsRate,
      topCategories,
      budgetPerformance,
      budgetAdherence: avgBudgetAdherence,
      categoryCount: topCategories.length,
    }
  }

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
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }

    return { startDate, endDate }
  }

  // Fallback methods for when AI fails
  getFallbackInsights(userId) {
    return [
      {
        type: "spending",
        title: "Review Your Spending",
        description: "Track your expenses to identify areas for improvement",
        priority: "medium",
        actionable: true,
      },
    ]
  }

  getFallbackRecommendations() {
    return [
      {
        category: "Food & Dining",
        recommendation: "Consider meal planning to reduce dining out expenses",
        potentialSavings: 100,
        difficulty: "easy",
      },
    ]
  }

  getFallbackBudgetSuggestions(userId) {
    return {
      suggestions: [
        { category: "Housing", percentage: 30 },
        { category: "Food", percentage: 15 },
        { category: "Transportation", percentage: 15 },
        { category: "Savings", percentage: 20 },
        { category: "Other", percentage: 20 },
      ],
    }
  }

  getFallbackPatternAnalysis() {
    return {
      trends: ["Consistent spending patterns"],
      anomalies: [],
      predictions: ["Stable spending expected"],
      recommendations: ["Continue current spending habits"],
    }
  }

  getFallbackTips() {
    return [
      {
        tip: "Set up automatic savings transfers",
        category: "savings",
        impact: "high",
        timeframe: "immediate",
      },
    ]
  }

  getFallbackPredictions(months) {
    return {
      predictions: Array.from({ length: months }, (_, i) => ({
        month: i + 1,
        totalExpenses: 2000,
        confidence: 0.5,
      })),
    }
  }

  async getSpendingAnalysis(userId) {
    // Implementation would get detailed spending analysis
    return { categories: [], trends: [] }
  }

  async getSpendingPatterns(userId, period) {
    // Implementation would analyze spending patterns
    return { patterns: [], trends: [] }
  }

  async getHistoricalSpending(userId, months) {
    // Implementation would get historical spending data
    return { monthlyData: [] }
  }

  async getHealthScoreRecommendations(score, factors) {
    const recommendations = []

    factors.forEach(factor => {
      if (factor.score < factor.maxScore * 0.7) {
        recommendations.push({
          area: factor.factor,
          recommendation: `Improve your ${factor.factor.toLowerCase()}`,
          priority: "high",
        })
      }
    })

    return recommendations
  }
}

module.exports = new AIService()