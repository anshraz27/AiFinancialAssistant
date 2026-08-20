const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

// Monthly report routes
router.get("/monthly-data",protect, reportController.getMonthlyReport);
router.get("/download", protect, reportController.generateMonthlyReport);
router.post('/generate', protect, reportController.queueMonthlyReport);

module.exports = router;
