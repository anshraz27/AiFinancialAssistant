/**
 * Receipt/Document Analysis Prompt Templates
 *
 * Externalized prompts for the Vision Language Model.
 * Accepts a documentType parameter so the same AI service can later
 * handle invoices, bills, bank statements, and tax documents
 * without changing the core service code.
 */

// Categories that match the application's expense categories
const ALLOWED_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Health',
  'Entertainment',
  'Education',
  'Travel',
  'Rent',
  'Other',
];

// Payment methods that match the Transaction model enum
const ALLOWED_PAYMENT_METHODS = ['cash', 'card', 'bank'];

/**
 * Builds the system prompt for the VLM based on document type.
 * @param {string} documentType - Type of document ('receipt', 'invoice', 'bill', etc.)
 * @returns {string} The system prompt
 */
const buildSystemPrompt = (documentType = 'receipt') => {
  return `You are an expert financial document parser. You specialize in analyzing ${documentType} images and extracting structured financial data with high accuracy.

STRICT RULES:
- Return ONLY valid JSON. No markdown, no explanation, no code fences.
- If information is unavailable or unclear, return null for that field.
- NEVER hallucinate or guess values. Only extract what is clearly visible.
- Use ISO 8601 date format (YYYY-MM-DD).
- All monetary amounts MUST be numbers (not strings), rounded to 2 decimal places.
- Confidence score must reflect your actual certainty about the extraction accuracy.`;
};

/**
 * Builds the user prompt that instructs the VLM what to extract.
 * The output schema maps directly to the Transaction model fields.
 * @param {string} documentType - Type of document being analyzed
 * @returns {string} The user prompt
 */
const buildUserPrompt = (documentType = 'receipt') => {
  return `Analyze this ${documentType} image and extract all financial information.

Return JSON matching this EXACT schema:
{
  "merchant": "string or null — the store/business name",
  "description": "string or null — brief description of the purchase",
  "date": "string or null — date in YYYY-MM-DD format",
  "amount": "number or null — the total/final amount paid (number > 0)",
  "subtotal": "number or null — subtotal before tax",
  "tax": "number or null — tax amount",
  "currency": "string or null — 3-letter currency code (e.g. USD, INR, EUR)",
  "category": "string or null — must be one of: ${ALLOWED_CATEGORIES.join(', ')}",
  "paymentMethod": "string or null — must be one of: ${ALLOWED_PAYMENT_METHODS.join(', ')}",
  "items": [
    {
      "name": "string — item name",
      "quantity": "number — quantity purchased",
      "price": "number — price per unit"
    }
  ],
  "tags": ["string — relevant tags for this expense"],
  "confidence": "number between 0 and 1 — your confidence in the overall extraction accuracy"
}

IMPORTANT:
- "amount" is the most critical field. It should be the total amount paid.
- If you cannot determine the category, set it to "Other".
- If payment method is not visible, set it to null.
- "items" should be an empty array if individual items cannot be identified.
- "tags" should be an empty array if no relevant tags can be determined.
- Return ONLY the JSON object. No other text.`;
};

module.exports = {
  buildSystemPrompt,
  buildUserPrompt,
  ALLOWED_CATEGORIES,
  ALLOWED_PAYMENT_METHODS,
};
