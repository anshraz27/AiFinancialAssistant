/**
 * Receipt Scanner Controller
 *
 * Handles the receipt scanning workflow:
 * 1. Validate uploaded image exists
 * 2. Upload to S3
 * 3. Call VLM for analysis
 * 4. Validate AI output against DB schema
 * 5. Normalize extracted data
 * 6. Save as draft expense (pending_review)
 * 7. Return for frontend review
 *
 * Also handles expense confirmation after user review/edits.
 *
 * Business logic is delegated to services — this controller
 * only orchestrates the workflow and handles HTTP concerns.
 */

const { uploadReceiptImage } = require('../services/s3.service');
const { confirmExpense } = require('../services/expense.service');
const { addReceiptScan } = require('../jobs/receiptQueue');
const Transaction = require('../models/Transaction');

/**
 * POST /api/receipts/scan
 *
 * Scan a receipt image and extract expense data using the VLM.
 * The expense is saved as pending_review for the user to confirm.
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
