const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoute");
const transactionRoutes = require("./transactionRoute");
const budgetRoutes = require("./budgetRoute");
const reportRoutes = require("./reportRoute");
const aiRoutes = require("./aiRoute");

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "FinScope API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API documentation endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to FinScope API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      transactions: "/api/transactions",
      budgets: "/api/budgets",
      reports: "/api/reports",
      ai: "/api/ai",
    },
    documentation: "/api/docs", // Would link to API documentation
  });
});

// Mount route modules
router.use("/auth", authRoutes);
router.use("/transactions", transactionRoutes);
router.use("/budgets", budgetRoutes);
router.use("/reports", reportRoutes);
router.use("/ai", aiRoutes);

// 404 handler for API routes
router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

module.exports = router;
