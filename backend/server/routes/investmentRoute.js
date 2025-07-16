const express = require("express");
const {
  getInvestments,
  getInvestmentById,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  getPortfolioSummary,
  getAllocationByType
} = require("../controllers/investmentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all investment routes
router.use(protect);

// Get all investments
router.get("/", getInvestments);

// Get investment by ID
router.get("/:id", getInvestmentById);

// Create new investment
router.post("/", createInvestment);

// Update investment
router.put("/:id", updateInvestment);

// Delete investment
router.delete("/:id", deleteInvestment);

// Get portfolio summary
router.get("/summary/portfolio", getPortfolioSummary);

// Get allocation by type
router.get("/summary/allocation", getAllocationByType);

module.exports = router;
