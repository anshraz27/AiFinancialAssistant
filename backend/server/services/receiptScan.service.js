const { analyzeDocument } = require('./ai.service');
const { downloadReceiptImage } = require('./s3.service');
const { validateAIExpenseOutput } = require('../validators/expense.validator');
const { normalizeExpense } = require('../utils/normalizeExpense');

const scanReceipt = async ({ imageBuffer, mimeType, receiptImageUrl }) => {
  // When called from the BullMQ worker, only the S3 URL is available
  // (Buffers can't be serialized into Redis jobs). Download the image
  // so the AI service can base64-encode it for the Vision API.
  let buffer = imageBuffer;
  let resolvedMimeType = mimeType;

  if (!buffer && receiptImageUrl) {
    const downloaded = await downloadReceiptImage(receiptImageUrl);
    buffer = downloaded.buffer;
    resolvedMimeType = resolvedMimeType || downloaded.contentType;
  }

  const result = await analyzeDocument({ imageBuffer: buffer, imageUrl: undefined, mimeType: resolvedMimeType, documentType: 'receipt' });
  const validation = validateAIExpenseOutput(result);
  if (!validation.success) throw new Error('AI returned invalid receipt data.');
  if (!validation.data.amount || validation.data.amount <= 0) {
    throw new Error('Could not extract a valid amount from the receipt.');
  }

  // Return normalized extracted data as a draft payload.
  // The final transaction is only persisted after explicit user confirmation.
  return normalizeExpense(validation.data);
};

module.exports = { scanReceipt };
