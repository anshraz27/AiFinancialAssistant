/**
 * Expense Persistence Service
 *
 * Handles creating and confirming scanned expenses in MongoDB.
 * Uses the existing Transaction model with type='expense' and
 * source='receipt_scan' to keep data consistent with manual entries.
 */

const Transaction = require('../models/Transaction');

/**
 * Create a new expense from receipt scan data.
 * The expense is saved with status='pending_review' so the user
 * can edit it before finalizing.
 *
 * @param {Object} expenseData - Normalized expense data from the AI + validator
 * @param {string} userId - Authenticated user's ID
 * @param {string} receiptUrl - S3 URL of the uploaded receipt image
 * @returns {Object} The created Transaction document
 */
const createExpense = async (expenseData, userId, receiptUrl) => {
  const transaction = new Transaction({
    user: userId,
    type: 'expense',
    amount: expenseData.amount,
    category: expenseData.category || 'Other',
    description: expenseData.description || `Receipt scan - ${expenseData.merchant || 'Unknown'}`,
    date: expenseData.date ? new Date(expenseData.date) : new Date(),
    paymentMethod: expenseData.paymentMethod || 'card',
    receipt: {
      url: receiptUrl,
      publicId: null,
    },
    tags: expenseData.tags || [],
    isRecurring: false,
    recurringFrequency: null,
    // Receipt-scan-specific fields
    merchant: expenseData.merchant || null,
    currency: expenseData.currency || null,
    subtotal: expenseData.subtotal || null,
    tax: expenseData.tax || null,
    items: expenseData.items || [],
    confidence: expenseData.confidence || null,
    source: 'receipt_scan',
    status: 'pending_review',
  });

  await transaction.save();
  return transaction;
};

/**
 * Confirm (finalize) a scanned expense after user review/edits.
 * Updates the expense with any user modifications and sets status to 'confirmed'.
 *
 * @param {string} expenseId - The Transaction document ID
 * @param {string} userId - Authenticated user's ID (for ownership check)
 * @param {Object} updates - User-edited fields to apply before confirming
 * @returns {Object} The updated Transaction document
 * @throws {Error} If expense not found or unauthorized
 */
const confirmExpense = async (expenseId, userId, updates = {}) => {
  const expense = await Transaction.findOne({
    _id: expenseId,
    user: userId,
    source: 'receipt_scan',
  });

  if (!expense) {
    throw new Error('Scanned expense not found or you do not have permission to access it.');
  }

  if (expense.status === 'confirmed') {
    throw new Error('This expense has already been confirmed.');
  }

  // Apply user edits — only allow updating safe fields
  const allowedUpdates = [
    'amount', 'category', 'description', 'date', 'paymentMethod',
    'merchant', 'tags', 'items', 'currency', 'subtotal', 'tax',
  ];

  for (const field of allowedUpdates) {
    if (updates[field] !== undefined) {
      expense[field] = updates[field];
    }
  }

  // Mark as confirmed
  expense.status = 'confirmed';

  await expense.save();
  return expense;
};

module.exports = { createExpense, confirmExpense };
