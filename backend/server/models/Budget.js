const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    period: {
      type: String,
      enum: ["weekly", "monthly", "quarterly", "yearly"],
      default: "monthly",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
budgetSchema.index({ userId: 1, category: 1, period: 1 });
budgetSchema.index({ userId: 1, startDate: 1, endDate: 1 });

// Virtual for budget progress percentage
budgetSchema.virtual("progressPercentage").get(function () {
  return this.amount > 0 ? Math.round((this.spent / this.amount) * 100) : 0;
});

// Virtual for remaining amount
budgetSchema.virtual("remaining").get(function () {
  return Math.max(0, this.amount - this.spent);
});

// Virtual for status
budgetSchema.virtual("status").get(function () {
  const progress = this.progressPercentage;
  if (progress >= 100) return "exceeded";
  if (progress >= this.alertThreshold) return "warning";
  return "on-track";
});

// Method to check if budget is current
budgetSchema.methods.isCurrent = function () {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

// Method to update spent amount
budgetSchema.methods.updateSpent = async function () {
  const Transaction = require("./Transaction");

  const result = await Transaction.aggregate([
    {
      $match: {
        userId: this.userId,
        category: this.category,
        type: "expense",
        date: {
          $gte: this.startDate,
          $lte: this.endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  this.spent = result.length > 0 ? result[0].total : 0;
  return this.save();
};

// Static method to get budget summary
budgetSchema.statics.getBudgetSummary = async function (
  userId,
  period = "monthly"
) {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case "weekly":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay()
      );
      endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
      break;
    case "monthly":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case "quarterly":
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      break;
    case "yearly":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
        isActive: true,
      },
    },
    {
      $group: {
        _id: null,
        totalBudget: { $sum: "$amount" },
        totalSpent: { $sum: "$spent" },
        budgetCount: { $sum: 1 },
      },
    },
  ]);
};

module.exports =
  mongoose.models.Budget || mongoose.model("Budget", budgetSchema);
