const { Queue } = require('bullmq');

const connection = { url: process.env.REDIS_URL || 'redis://127.0.0.1:6379', maxRetriesPerRequest: null };
const queueOptions = { connection, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: 100, removeOnFail: 100 } };

const receiptQueue = new Queue('receipt.scan', queueOptions);
const reportQueue = new Queue('report.generate', queueOptions);
const budgetAlertQueue = new Queue('budget.alert', queueOptions);

module.exports = { connection, receiptQueue, reportQueue, budgetAlertQueue };
