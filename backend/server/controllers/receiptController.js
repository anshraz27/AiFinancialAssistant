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
const { analyzeDocument } = require('../services/ai.service');
const { validateAIExpenseOutput } = require('../validators/expense.validator');
const { normalizeExpense } = require('../utils/normalizeExpense');
const { createExpense, confirmExpense } = require('../services/expense.service');

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

    // Step 3: Call the Vision Language Model to analyze the receipt
    // Send the raw image buffer as base64 (VLM can't access private S3 URLs)
    let aiResult;
    try {
      aiResult = await analyzeDocument({
        imageBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
        documentType: 'receipt',
      });
    } catch (aiError) {
      console.error('AI analysis failed:', aiError.message);
      return res.status(502).json({
        success: false,
        message: aiError.message || 'AI analysis failed. Please try again.',
      });
    }

    // Step 4: Validate AI output against the Transaction DB schema
    const validation = validateAIExpenseOutput(aiResult);

    if (!validation.success) {
      console.error('AI output validation failed:', validation.errors);
      return res.status(422).json({
        success: false,
        message: 'AI returned invalid data. The receipt may be unclear.',
        errors: validation.errors,
      });
    }

    // Step 5: Check that we got a usable amount
    if (!validation.data.amount || validation.data.amount <= 0) {
      return res.status(422).json({
        success: false,
        message: 'Could not extract a valid amount from the receipt. Please enter the expense manually.',
      });
    }

    // Step 6: Normalize the validated data
    const normalizedData = normalizeExpense(validation.data);

    // Step 7: Save as a draft expense in MongoDB
    let expense;
    try {
      expense = await createExpense(normalizedData, userId, receiptImageUrl);
    } catch (dbError) {
      console.error('MongoDB save failed:', dbError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to save expense. Please try again.',
      });
    }

    // Step 8: Return the expense for frontend review
    return res.status(201).json({
      success: true,
      message: 'Receipt scanned successfully. Please review and confirm.',
      expense,
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

module.exports = { scanReceipt, confirmReceiptExpense };
