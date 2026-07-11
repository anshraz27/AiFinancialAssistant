/**
 * Expense Normalization Utility
 *
 * Post-validation normalization of AI-extracted expense data.
 * Handles common variations in merchant names, categories,
 * payment methods, and ensures consistent formatting before
 * saving to the database.
 */

/**
 * Known merchant name aliases → canonical name.
 * Add more mappings as the app encounters common variations.
 */
const MERCHANT_ALIASES = {
  'star bucks': 'Starbucks',
  'starbucks coffee': 'Starbucks',
  'mc donalds': 'McDonald\'s',
  'mcdonalds': 'McDonald\'s',
  'mcdonald\'s': 'McDonald\'s',
  'wal mart': 'Walmart',
  'wal-mart': 'Walmart',
  'walmart inc': 'Walmart',
  'costco wholesale': 'Costco',
  'whole foods': 'Whole Foods Market',
  'whole foods market': 'Whole Foods Market',
  'target corp': 'Target',
  'amazon.com': 'Amazon',
  'amzn': 'Amazon',
  'uber eats': 'Uber Eats',
  'uber trip': 'Uber',
  'lyft ride': 'Lyft',
  'doordash': 'DoorDash',
  'grubhub': 'Grubhub',
};

/**
 * Category aliases → canonical category name.
 * Maps common AI-generated category names to the application's allowed categories.
 */
const CATEGORY_ALIASES = {
  'food & dining': 'Food',
  'food and dining': 'Food',
  'dining': 'Food',
  'restaurant': 'Food',
  'restaurants': 'Food',
  'groceries': 'Food',
  'grocery': 'Food',
  'cafe': 'Food',
  'fast food': 'Food',
  'transportation': 'Transport',
  'transit': 'Transport',
  'taxi': 'Transport',
  'ride': 'Transport',
  'fuel': 'Transport',
  'gas': 'Transport',
  'parking': 'Transport',
  'retail': 'Shopping',
  'clothing': 'Shopping',
  'electronics': 'Shopping',
  'home': 'Shopping',
  'utilities': 'Bills',
  'utility': 'Bills',
  'electricity': 'Bills',
  'water': 'Bills',
  'internet': 'Bills',
  'phone': 'Bills',
  'subscription': 'Bills',
  'medical': 'Health',
  'healthcare': 'Health',
  'pharmacy': 'Health',
  'medicine': 'Health',
  'doctor': 'Health',
  'hospital': 'Health',
  'movies': 'Entertainment',
  'gaming': 'Entertainment',
  'sports': 'Entertainment',
  'music': 'Entertainment',
  'streaming': 'Entertainment',
  'books': 'Education',
  'course': 'Education',
  'training': 'Education',
  'school': 'Education',
  'tuition': 'Education',
  'hotel': 'Travel',
  'flight': 'Travel',
  'airfare': 'Travel',
  'accommodation': 'Travel',
  'lodging': 'Travel',
  'housing': 'Rent',
  'apartment': 'Rent',
  'lease': 'Rent',
  'miscellaneous': 'Other',
  'general': 'Other',
  'uncategorized': 'Other',
};

/**
 * Payment method aliases → Transaction model enum values.
 */
const PAYMENT_METHOD_ALIASES = {
  'credit card': 'card',
  'credit': 'card',
  'debit card': 'card',
  'debit': 'card',
  'visa': 'card',
  'mastercard': 'card',
  'amex': 'card',
  'american express': 'card',
  'bank transfer': 'bank',
  'wire transfer': 'bank',
  'upi': 'bank',
  'neft': 'bank',
  'imps': 'bank',
  'ach': 'bank',
  'check': 'bank',
  'cheque': 'bank',
  'cash payment': 'cash',
  'currency': 'cash',
};

/**
 * Round a number to 2 decimal places. Returns null for non-numeric input.
 * @param {*} value
 * @returns {number|null}
 */
const roundMoney = (value) => {
  if (value === null || value === undefined || isNaN(value)) return null;
  return Math.round(Number(value) * 100) / 100;
};

/**
 * Normalize a merchant name using the alias lookup.
 * @param {string|null} merchant
 * @returns {string|null}
 */
const normalizeMerchant = (merchant) => {
  if (!merchant) return null;
  const trimmed = merchant.trim();
  const lower = trimmed.toLowerCase();
  return MERCHANT_ALIASES[lower] || trimmed;
};

/**
 * Normalize a category using the alias lookup.
 * @param {string|null} category
 * @returns {string}
 */
const normalizeCategory = (category) => {
  if (!category) return 'Other';
  const lower = category.trim().toLowerCase();
  return CATEGORY_ALIASES[lower] || category.trim();
};

/**
 * Normalize a payment method to match the Transaction model enum.
 * @param {string|null} method
 * @returns {string|null}
 */
const normalizePaymentMethod = (method) => {
  if (!method) return null;
  const lower = method.trim().toLowerCase();
  // Already a valid enum value
  if (['cash', 'card', 'bank'].includes(lower)) return lower;
  return PAYMENT_METHOD_ALIASES[lower] || null;
};

/**
 * Normalize the full expense data object.
 * Trims strings, rounds monetary values, and maps aliases to canonical names.
 *
 * @param {Object} expenseData - Validated expense data from the Zod validator
 * @returns {Object} Normalized expense data ready for DB insertion
 */
const normalizeExpense = (expenseData) => {
  return {
    merchant: normalizeMerchant(expenseData.merchant),
    description: expenseData.description
      ? expenseData.description.trim()
      : null,
    date: expenseData.date || null,
    amount: roundMoney(expenseData.amount),
    subtotal: roundMoney(expenseData.subtotal),
    tax: roundMoney(expenseData.tax),
    currency: expenseData.currency
      ? expenseData.currency.trim().toUpperCase()
      : null,
    category: normalizeCategory(expenseData.category),
    paymentMethod: normalizePaymentMethod(expenseData.paymentMethod),
    items: Array.isArray(expenseData.items)
      ? expenseData.items.map((item) => ({
          name: item.name ? item.name.trim() : 'Unknown Item',
          quantity: item.quantity || 1,
          price: roundMoney(item.price),
        }))
      : [],
    tags: Array.isArray(expenseData.tags)
      ? expenseData.tags.map((t) => t.trim()).filter(Boolean)
      : [],
    confidence: expenseData.confidence,
  };
};

module.exports = { normalizeExpense };
