/**
 * Receipt Scanner Routes
 *
 * POST   /api/receipts/scan         - Upload and scan a receipt image
 * PUT    /api/receipts/:id/confirm  - Confirm/finalize a scanned expense
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadReceipt } = require('../middleware/upload.middleware');
const { scanReceipt, confirmReceiptExpense } = require('../controllers/receiptController');

// Scan a receipt: auth first, then upload middleware, then controller
router.post('/scan', protect, uploadReceipt, scanReceipt);

// Confirm a scanned expense after user review
router.put('/:id/confirm', protect, confirmReceiptExpense);

module.exports = router;
