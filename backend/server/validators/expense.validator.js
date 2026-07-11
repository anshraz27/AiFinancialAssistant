/**
 * Expense Validator
 *
 * Validates AI-extracted content against the Transaction DB schema.
 * Each field is validated to match the types and constraints defined
 * in the Mongoose Transaction model. Fields not present in the
 * extracted content are set to null.
 *
 * This ensures only valid, schema-compliant data reaches the database.
 */

const { z } = require('zod');

// These must match the Transaction model's paymentMethod enum
const DB_PAYMENT_METHODS = ['cash', 'card', 'bank'];

// These must match the categories used across the application
// (same as AddExpensePage.jsx and receiptPrompt.js)
const DB_CATEGORIES = [
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

/**
 * Zod schema that mirrors the Transaction model fields.
 *
 * Every field uses .nullable() and .optional() so that if the AI
 * doesn't extract a value, it defaults to null rather than failing.
 * Only 'amount' is strictly required (> 0) since it's the core
 * financial data point.
 */
const expenseSchema = z.object({
  // Maps to Transaction.description — brief description of the purchase
  merchant: z
    .string()
    .nullable()
    .optional()
    .default(null),

  // Maps to Transaction.description — will be used as fallback if merchant is present
  description: z
    .string()
    .nullable()
    .optional()
    .default(null),

  // Maps to Transaction.date (required in DB, defaults to now if null)
  date: z
    .string()
    .refine(
      (val) => {
        if (!val) return true; // null is OK, will default to today
        const d = new Date(val);
        return !isNaN(d.getTime());
      },
      { message: 'date must be a valid ISO date string (YYYY-MM-DD)' }
    )
    .nullable()
    .optional()
    .default(null),

  // Maps to Transaction.amount (required, must be > 0)
  amount: z
    .number()
    .positive({ message: 'amount must be a number greater than 0' })
    .nullable()
    .optional()
    .default(null),

  // Maps to Transaction.subtotal (new field)
  subtotal: z
    .number()
    .nonnegative()
    .nullable()
    .optional()
    .default(null),

  // Maps to Transaction.tax (new field)
  tax: z
    .number()
    .nonnegative()
    .nullable()
    .optional()
    .default(null),

  // Maps to Transaction.currency (new field)
  currency: z
    .string()
    .nullable()
    .optional()
    .default(null),

  // Maps to Transaction.category (required in DB, defaults to 'Other')
  category: z
    .string()
    .nullable()
    .optional()
    .default(null)
    .transform((val) => {
      // If the AI returns a category not in our DB list, map to 'Other'
      if (!val || !DB_CATEGORIES.includes(val)) return 'Other';
      return val;
    }),

  // Maps to Transaction.paymentMethod (enum: cash, card, bank)
  paymentMethod: z
    .string()
    .nullable()
    .optional()
    .default(null)
    .transform((val) => {
      // If AI returns a value not in the DB enum, set to null (will default to 'card' in DB)
      if (!val || !DB_PAYMENT_METHODS.includes(val)) return null;
      return val;
    }),

  // Maps to Transaction.items (new field — array of line items)
  items: z
    .array(
      z.object({
        name: z.string().default('Unknown Item'),
        quantity: z.number().nonnegative().default(1),
        price: z.number().nonnegative().default(0),
      })
    )
    .nullable()
    .optional()
    .default([]),

  // Maps to Transaction.tags
  tags: z
    .array(z.string())
    .nullable()
    .optional()
    .default([]),

  // Maps to Transaction.confidence (new field — AI confidence score)
  confidence: z
    .number()
    .min(0)
    .max(1)
    .nullable()
    .optional()
    .default(null),
});

/**
 * Validate AI-extracted data against the Transaction DB schema.
 *
 * Returns a cleaned object where every field is either a valid value
 * or null. This object can be directly passed to the expense service
 * for MongoDB insertion.
 *
 * @param {Object} data - Raw parsed JSON from the AI response
 * @returns {{ success: boolean, data?: Object, errors?: string[] }}
 */
const validateAIExpenseOutput = (data) => {
  const result = expenseSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    );
    return { success: false, errors };
  }

  return { success: true, data: result.data };
};

module.exports = {
  validateAIExpenseOutput,
  DB_CATEGORIES,
  DB_PAYMENT_METHODS,
};
