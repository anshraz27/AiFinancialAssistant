const mongoose = require("mongoose")

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["stock", "bond", "etf", "mutual_fund", "crypto", "real_estate", "commodity", "other"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currentPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    platform: {
      type: String,
      trim: true,
    },
    sector: {
      type: String,
      trim: true,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },
    dividendYield: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    alerts: {
      priceTarget: {
        type: Number,
        min: 0,
      },
      stopLoss: {
        type: Number,
        min: 0,
      },
      enabled: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
investmentSchema.index({ userId: 1, symbol: 1 })
investmentSchema.index({ userId: 1, type: 1 })
investmentSchema.index({ symbol: 1 })

// Virtual for total value
investmentSchema.virtual("totalValue").get(function () {
  return this.quantity * this.currentPrice
})

// Virtual for total cost
investmentSchema.virtual("totalCost").get(function () {
  return this.quantity * this.purchasePrice
})

// Virtual for gain/loss amount
investmentSchema.virtual("gainLoss").get(function () {
  return this.totalValue - this.totalCost
})

// Virtual for gain/loss percentage
investmentSchema.virtual("gainLossPercentage").get(function () {
  if (this.totalCost === 0) return 0
  return (this.gainLoss / this.totalCost) * 100
})

// Virtual for daily change
investmentSchema.virtual("dailyChange").get(() => {
  // This would typically be calculated from price history
  // For now, return a placeholder
  return 0
})

// Method to update current price
investmentSchema.methods.updatePrice = async function (newPrice) {
  this.currentPrice = newPrice
  this.lastUpdated = new Date()
  return this.save()
}

// Method to add shares
investmentSchema.methods.addShares = function (quantity, price) {
  const totalCost = this.totalCost + quantity * price
  const totalQuantity = this.quantity + quantity

  this.purchasePrice = totalCost / totalQuantity
  this.quantity = totalQuantity

  return this.save()
}

// Method to sell shares
investmentSchema.methods.sellShares = function (quantity) {
  if (quantity > this.quantity) {
    throw new Error("Cannot sell more shares than owned")
  }

  this.quantity -= quantity

  if (this.quantity === 0) {
    this.isActive = false
  }

  return this.save()
}

// Static method to get portfolio summary
investmentSchema.statics.getPortfolioSummary = async function (userId) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        isActive: true,
      },
    },
    {
      $addFields: {
        totalValue: { $multiply: ["$quantity", "$currentPrice"] },
        totalCost: { $multiply: ["$quantity", "$purchasePrice"] },
      },
    },
    {
      $addFields: {
        gainLoss: { $subtract: ["$totalValue", "$totalCost"] },
      },
    },
    {
      $group: {
        _id: null,
        totalValue: { $sum: "$totalValue" },
        totalCost: { $sum: "$totalCost" },
        totalGainLoss: { $sum: "$gainLoss" },
        investmentCount: { $sum: 1 },
      },
    },
    {
      $addFields: {
        gainLossPercentage: {
          $cond: {
            if: { $eq: ["$totalCost", 0] },
            then: 0,
            else: { $multiply: [{ $divide: ["$totalGainLoss", "$totalCost"] }, 100] },
          },
        },
      },
    },
  ])
}

// Static method to get allocation by type
investmentSchema.statics.getAllocationByType = async function (userId) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        isActive: true,
      },
    },
    {
      $addFields: {
        totalValue: { $multiply: ["$quantity", "$currentPrice"] },
      },
    },
    {
      $group: {
        _id: "$type",
        totalValue: { $sum: "$totalValue" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { totalValue: -1 },
    },
  ])
}

module.exports = mongoose.model("Investment", investmentSchema)