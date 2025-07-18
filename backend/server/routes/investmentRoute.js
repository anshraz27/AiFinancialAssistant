const express = require("express");
const {
  getInvestments,
  getInvestmentById,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  getPortfolioSummary,
  getAllocationByType,
} = require("../controllers/investmentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all investment routes
router.use(protect);

// Get all investments
router.get("/all",protect, getInvestments);

// Get investment by ID
router.get("/:id",protect, getInvestmentById);

// Create new investment
router.post("/",protect, createInvestment);

// Update investment
router.put("/:id",protect, updateInvestment);

// Delete investment
router.delete("/:id",protect, deleteInvestment);

// Get portfolio summary
router.get("/summary/portfolio",protect, getPortfolioSummary);

// Get allocation by type
router.get("/summary/allocation",protect, getAllocationByType);


module.exports = router;
