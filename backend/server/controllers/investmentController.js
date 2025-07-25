const Investment = require("../models/Investment");
const { protect } = require("../middleware/authMiddleware");

// Get all investments for user
const getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({
      userId: req.user._id,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(5);
    res.status(200).json(investments);
  } catch (error) {
    console.error("Error fetching investments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get investment by ID
const getInvestmentById = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    res.status(200).json(investment);
  } catch (error) {
    console.error("Error fetching investment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new investment
const createInvestment = async (req, res) => {
  try {
    const {
      symbol,
      name,
      type,
      quantity,
      purchasePrice,
      purchaseDate,
      platform,
      sector,
      currency,
      notes,
      tags
    } = req.body;

    const investment = new Investment({
      userId: req.user._id,
      symbol,
      name,
      type,
      quantity,
      purchasePrice,
      purchaseDate: purchaseDate || new Date(),
      platform,
      sector,
      currency: currency || "USD",
      notes,
      tags
    });

    await investment.save();
    res.status(201).json(investment);
  } catch (error) {
    console.error("Error creating investment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update investment
const updateInvestment = async (req, res) => {
  try {
    const {
      symbol,
      name,
      type,
      quantity,
      purchasePrice,
      currentPrice,
      purchaseDate,
      platform,
      sector,
      currency,
      notes,
      tags,
      isActive
    } = req.body;

    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        symbol,
        name,
        type,
        quantity,
        purchasePrice,
        currentPrice,
        purchaseDate,
        platform,
        sector,
        currency,
        notes,
        tags,
        isActive,
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    res.status(200).json(investment);
  } catch (error) {
    console.error("Error updating investment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete investment (soft delete)
const deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );

    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    res.status(200).json({ message: "Investment deleted" });
  } catch (error) {
    console.error("Error deleting investment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get allocation by type
const getAllocationByType = async (req, res) => {
  try {
    const allocation = await Investment.getAllocationByType(req.user._id);
    res.status(200).json(allocation);
  } catch (error) {
    console.error("Error getting allocation by type:", error);
    res.status(500).json({ message: "Server error" });
  }
};


getPortfolioSummary = async (req, res, next) => {
  try {
    const investments = await Investment.find({ user: req.user.id });

    const totalCost = investments.reduce(
      (acc, inv) => acc + inv.purchasePrice * inv.quantity,
      0
    );
    const totalValue = investments.reduce(
      (acc, inv) => acc + inv.currentPrice * inv.quantity,
      0
    );
    const totalGainLoss = totalValue - totalCost;
    const gainLossPercentage =
      totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    res.status(200).json({
      totalCost,
      totalValue,
      totalGainLoss,
      gainLossPercentage,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getInvestments,
  getInvestmentById,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  getPortfolioSummary,
  getAllocationByType,
};
