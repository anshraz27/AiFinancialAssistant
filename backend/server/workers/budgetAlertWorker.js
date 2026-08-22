const { Worker } = require('bullmq');
const { connection } = require('../jobs/queues');
const User = require('../models/User');
const { sendBudgetAlertEmail } = require('../utils/emailService');

const budgetAlertWorker = new Worker('budget.alert', async (job) => {
  const { userId, category, spent, limit } = job.data;
  const user = await User.findById(userId).select('email');
  if (user?.email) await sendBudgetAlertEmail(user.email, category, spent, limit);
}, { connection });

budgetAlertWorker.on('error', (error) => console.error('Budget alert worker error:', error.message));

module.exports = budgetAlertWorker;