const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const { sendBudgetAlertEmail } = require("../utils/emailService");

// Check for budget threshold alerts for expenses
const checkBudgetAlert = async (userId, category, amount) => {
  try {
    const budget = await Budget.findOne({ userId, category });
    if (!budget) return;

    const newSpent = budget.spent + amount;
    const alertThreshold = budget.amount * 0.9;
    const previousSpent = budget.spent;

    if (newSpent >= alertThreshold && previousSpent < alertThreshold) {
      const user = await User.findById(userId);
      if (user && user.email) {
        await sendBudgetAlertEmail(
          user.email,
          category,
          newSpent,
          budget.amount
        );
      }
    }
  } catch (error) {
    console.error('Error checking budget alert:', error);
  }
};

const AddTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, amount, category, description, date, paymentMethod } = req.body;
    const user = req.user._id; // Get user ID from middleware
    
    const existingTransaction = await Transaction.findOne({
      user,
      type,
      amount,
      category,
      description,
      date,
    });

    if (existingTransaction) {
      return res
        .status(400)
        .json({ message: "Similar transaction already exists" });
    }

    const transaction = new Transaction({
      user,
      type,
      amount,
      category,
      description,
      date,
      paymentMethod,
    });

    await transaction.save();

    // Check for budget alert if it's an expense
    if (type === 'expense') {
      await checkBudgetAlert(user, category, amount);
    }

    res.status(201).json({
      message: "Transaction added successfully",
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const DeleteTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params; // assuming you pass :id in the route

    const del = await Transaction.findByIdAndDelete(id);
    if (!del) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    return res.json({ message: "Transaction Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const UpdateTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    );
    if (!updatedTransaction) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json({
      message: "Transaction updated successfully",
      budget: updatedTransaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const GetAllTransactions = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const userId = req.user._id;
    const transactions = await Transaction.find({ user: userId }).sort({
      date: -1,
    });

    res.json({
      message: "Transactions fetched successfully",
      transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  AddTransaction,
  DeleteTransaction,
  UpdateTransaction,
  GetAllTransactions,
  checkBudgetAlert
};
