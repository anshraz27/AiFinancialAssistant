const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

const getFinancialSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Current month range
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Aggregate total income and expenses (overall)
    const totalAgg = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    totalAgg.forEach((item) => {
      if (item._id === "income") totalIncome = item.total;
      else if (item._id === "expense") totalExpense = item.total;
    });

    // Aggregate monthly income and expenses
    const monthlyAgg = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: firstDay, $lte: lastDay },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let monthlyIncome = 0;
    let monthlyExpense = 0;

    monthlyAgg.forEach((item) => {
      if (item._id === "income") monthlyIncome = item.total;
      else if (item._id === "expense") monthlyExpense = item.total;
    });

    const savings = monthlyIncome - monthlyExpense;
    const savingsPercentage =
      monthlyIncome > 0 ? ((savings / monthlyIncome) * 100).toFixed(2) : "0.00";

    return res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        monthlyIncome,
        monthlyExpense,
        savings,
        savingsPercentage: `${savingsPercentage}%`,
      },
    });
  } catch (error) {
    console.error("Error in getFinancialSummary:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
const getRecentTransactions = async (req, res) => {
  const recent = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(5); 

  res.status(200).json({ transactions: recent });
};

const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id })
      .sort({ amount: -1 })
      .limit(5);

    res.status(200).json({ budgets });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching budgets",
      error: error.message
    });
  }
};

module.exports = {
  getFinancialSummary,
  getRecentTransactions,
  getBudgets,
};
