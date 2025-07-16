const Budget = require("../models/Budget");
const { validationResult } = require("express-validator");
const { AppError } = require("../middleware/errorHandler");

const AddBudget = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, amount, period, startDate, endDate } = req.body;
    const userId = req.user._id; // Get user ID from middleware

    const existingBudget = await Budget.findOne({ userId, category });
    if (existingBudget) {
      return res.status(400).json({ message: "Budget already exists" });
    }

    const budget = new Budget({
      userId,
      category,
      amount,
      period,
      startDate,
      endDate,
    });
    await budget.save();

    res.status(201).json({
      message: "Budget Created Successfully",
      budget,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const UpdateBudget = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const updatedBudget = await Budget.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedBudget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json({ message: "Budget updated successfully", budget: updatedBudget });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const DeleteBudget = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params; // assuming you pass :id in the route

    const del = await Budget.findByIdAndDelete(id);
    if (!del) {
      return res.status(404).json({ message: "Budget not found" });
    }
    return res.json({ message: "Budget Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const GetAllBudget = async(req,res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const userId = req.user._id; // Get user ID from middleware
    const budgets = await Budget.find({ userId }).sort({
          date: -1,
        });
    
    res.json({
      message: "Budgets fetched successfully",
      budgets,
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
    
  }
}

module.exports = {
  AddBudget,
  UpdateBudget,
  DeleteBudget,
  GetAllBudget
};
