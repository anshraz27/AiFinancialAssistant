const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { budgetAlertQueue } = require('../jobs/queues');
const { emit } = require('../events/domainEvents');
const events = require('../events/eventTypes');

const checkBudgetAlert = async ({ userId, category, queueEmail = true }) => {
  // Case-insensitive category lookup — budget may store "food" while
  // transactions use the canonical "Food" from the category list.
  const budgets = await Budget.find({
    userId,
    category: { $regex: new RegExp(`^${category}$`, 'i') },
    isActive: true,
  });

  for (const budget of budgets) {
    // Normalize dates to day boundaries so that a budget created at 19:41
    // on Aug 24 still captures expenses dated Aug 24 (which default to 00:00).
    const periodStart = new Date(budget.startDate);
    periodStart.setHours(0, 0, 0, 0);
    const periodEnd = new Date(budget.endDate);
    periodEnd.setHours(23, 59, 59, 999);

    const [result] = await Transaction.aggregate([
      {
        $match: {
          user: budget.userId,
          category: { $regex: new RegExp(`^${budget.category}$`, 'i') },
          type: 'expense',
          date: { $gte: periodStart, $lte: periodEnd },
        },
      },
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
