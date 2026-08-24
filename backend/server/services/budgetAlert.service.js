const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { budgetAlertQueue } = require('../jobs/queues');
const { emit } = require('../events/domainEvents');
const events = require('../events/eventTypes');

const checkBudgetAlert = async ({ userId, category, queueEmail = true }) => {
  const budgets = await Budget.find({ userId, category, isActive: true });
  for (const budget of budgets) {
    const [result] = await Transaction.aggregate([
      { $match: { user: budget.userId, category, type: 'expense', date: { $gte: budget.startDate, $lte: budget.endDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const spent = result?.total || 0;
    const threshold = budget.amount * (budget.alertThreshold / 100);
    const crossed = spent >= threshold && budget.spent < threshold;
    budget.spent = spent;
    await budget.save();
    if (!crossed) continue;
    const payload = { userId: userId.toString(), budgetId: budget.id, category, spent, limit: budget.amount, threshold: budget.alertThreshold };
    emit(events.BUDGET_THRESHOLD_EXCEEDED, payload);
    if (queueEmail && budget.notifications.email) {
      await budgetAlertQueue.add('send-email', {
        userId: userId.toString(), category, spent, limit: budget.amount,
      });
    }
  }
};

module.exports = { checkBudgetAlert };
