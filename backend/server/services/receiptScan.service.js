const { analyzeDocument } = require('./ai.service');
const { validateAIExpenseOutput } = require('../validators/expense.validator');
const { normalizeExpense } = require('../utils/normalizeExpense');
const { createExpense } = require('./expense.service');

const scanReceipt = async ({ imageBuffer, mimeType, userId, receiptImageUrl }) => {
  const result = await analyzeDocument({ imageBuffer, imageUrl: receiptImageUrl, mimeType, documentType: 'receipt' });
  const validation = validateAIExpenseOutput(result);
  if (!validation.success) throw new Error('AI returned invalid receipt data.');
  if (!validation.data.amount || validation.data.amount <= 0) {
    throw new Error('Could not extract a valid amount from the receipt.');
  }
  return createExpense(normalizeExpense(validation.data), userId, receiptImageUrl);
};

module.exports = { scanReceipt };
