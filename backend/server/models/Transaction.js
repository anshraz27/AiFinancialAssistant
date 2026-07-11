
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank'],
    default: 'card'
  },
  receipt: {
    url: String,
    publicId: String
  },
  tags: [String],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly']
  },
  // --- Receipt scan fields (all optional, existing data unaffected) ---
  merchant: {
    type: String,
    default: null
  },
  currency: {
    type: String,
    default: null
  },
  subtotal: {
    type: Number,
    default: null
  },
  tax: {
    type: Number,
    default: null
  },
  items: [{
    name: { type: String, default: 'Unknown Item' },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 }
  }],
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: null
  },
  source: {
    type: String,
    enum: ['manual', 'receipt_scan'],
    default: 'manual'
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending_review'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

// Index for better query performance
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);