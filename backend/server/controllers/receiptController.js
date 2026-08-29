/**
 * Receipt Scanner Controller
 *
 * Handles the receipt scanning workflow:
 * 1. Validate uploaded image exists
 * 2. Upload to S3
 * 3. Queue async AI analysis job
 * 4. Return job details for frontend polling
 *
 * Also handles expense confirmation after user review/edits.
 *
 * Business logic is delegated to services — this controller
 * only orchestrates the workflow and handles HTTP concerns.
 */

const { uploadReceiptImage } = require('../services/s3.service');
const { confirmExpense, createConfirmedExpense } = require('../services/expense.service');
const { addReceiptScan } = require('../jobs/receiptQueue');
const Transaction = require('../models/Transaction');

/**
 * POST /api/receipts/scan
 *
 * Queue receipt analysis and return a job ID.
 * No transaction is persisted until explicit confirmation.
 */
const scanReceipt = async (req, res) => {
  try {
    // Step 1: Validate that a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No receipt image uploaded. Please attach an image file.',
      });
    }

    const userId = req.user._id;

    // Step 2: Upload image to S3
    let receiptImageUrl;
    try {
      receiptImageUrl = await uploadReceiptImage(
        req.file.buffer,
        req.file.originalname,
        userId.toString()
      );
    } catch (s3Error) {
      console.error('S3 upload failed:', s3Error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload receipt image. Please try again.',
      });
    }

    // The file is now durable in object storage; queue only metadata, not the image buffer.
    let job;
    try {
      job = await addReceiptScan({
        userId: userId.toString(),
        receiptImageUrl,
        mimeType: req.file.mimetype,
      });
    } catch (queueError) {
      console.error('Receipt queue failed:', queueError.message);
      return res.status(503).json({
        success: false,
        message: 'Receipt processing is temporarily unavailable. Please try again.',
      });
    }
    return res.status(202).json({
      success: true,
      message: 'Receipt scan queued. Check the job status for the draft expense.',
      jobId: job.id,
      receiptImageUrl,
    });
  } catch (error) {
    console.error('Receipt scan error:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while scanning the receipt.',
    });
  }
};

/**
 * PUT /api/receipts/:id/confirm
 *
 * Confirm a scanned expense after user review.
 * Accepts optional edits to the extracted data.
 */
const confirmReceiptExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    // New async flow: confirm a draft payload (not yet persisted in DB)
    if (id === 'draft') {
      const { scanData, receiptImageUrl } = updates || {};

      if (!scanData || typeof scanData !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Missing scan data. Please rescan the receipt and try again.',
        });
      }

      const allowedUpdates = [
        'amount', 'category', 'description', 'date', 'paymentMethod',
        'merchant', 'tags', 'items', 'currency', 'subtotal', 'tax',
      ];

      const mergedExpense = { ...scanData };
      for (const field of allowedUpdates) {
        if (updates[field] !== undefined) {
          mergedExpense[field] = updates[field];
        }
      }

      if (!mergedExpense.amount || Number(mergedExpense.amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'A valid amount is required to confirm this expense.',
        });
      }

      const expense = await createConfirmedExpense({
        ...mergedExpense,
        amount: Number(mergedExpense.amount),
      }, userId, receiptImageUrl || scanData?.receipt?.url || null);

      return res.status(200).json({
        success: true,
        message: 'Expense confirmed successfully.',
        expense,
      });
    }

    const expense = await confirmExpense(id, userId, updates);

    return res.status(200).json({
      success: true,
      message: 'Expense confirmed successfully.',
      expense,
    });
  } catch (error) {
    console.error('Confirm expense error:', error.message);

    if (error.message.includes('not found') || error.message.includes('permission')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('already been confirmed')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to confirm expense. Please try again.',
    });
  }
};

const getReceiptExpense = async (req, res) => {
  const expense = await Transaction.findOne({
    _id: req.params.id,
    user: req.user._id,
    source: 'receipt_scan',
  });

  if (!expense) {
    return res.status(404).json({ success: false, message: 'Receipt expense not found.' });
  }

  return res.json({ success: true, expense });
};

module.exports = { scanReceipt, confirmReceiptExpense, getReceiptExpense };
