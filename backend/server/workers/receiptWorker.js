const { Worker } = require('bullmq');
const { connection } = require('../jobs/queues');
const { scanReceipt } = require('../services/receiptScan.service');
const { emit } = require('../events/domainEvents');
const events = require('../events/eventTypes');

const receiptWorker = new Worker('receipt.scan', async (job) => {
  const { userId, receiptImageUrl, mimeType } = job.data;
  const expense = await scanReceipt({ userId, receiptImageUrl, mimeType });
  emit(events.RECEIPT_SCAN_COMPLETED, { userId, jobId: job.id, expenseId: expense.id });
  return { expenseId: expense.id };
}, { connection });

receiptWorker.on('active', (job) => emit(events.RECEIPT_SCAN_STARTED, { userId: job.data.userId, jobId: job.id }));
receiptWorker.on('failed', (job, error) => emit(events.RECEIPT_SCAN_FAILED, { userId: job?.data.userId, jobId: job?.id, message: error.message }));
receiptWorker.on('error', (error) => console.error('Receipt worker error:', error.message));

module.exports = receiptWorker;
