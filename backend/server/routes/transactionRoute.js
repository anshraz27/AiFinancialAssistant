const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const authMiddleware = require("../middleware/auth");

// Protected routes
router.get("/", authMiddleware, transactionController.getTransactions);
router.post("/", authMiddleware, transactionController.createTransaction);
// Add more like PUT, DELETE, stats etc.

module.exports = router;
