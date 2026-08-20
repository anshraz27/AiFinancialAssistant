const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { sendBudgetAlertEmail } = require('../utils/emailService');
const { emit } = require('../events/domainEvents');
const events = require('../events/eventTypes');

const checkBudgetAlert = async ({ userId, category }) => {
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
    const user = await User.findById(userId).select('email');
    if (budget.notifications.email && user?.email) await sendBudgetAlertEmail(user.email, category, spent, budget.amount);
  }
};

module.exports = { checkBudgetAlert };
