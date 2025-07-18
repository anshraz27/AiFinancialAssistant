const express = require("express");
const { getFinancialSummary, getRecentTransactions} = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all investment routes
router.use(protect);
router.get("/summary", protect, getFinancialSummary);
router.get("/recent", protect, getRecentTransactions);


module.exports = router;
