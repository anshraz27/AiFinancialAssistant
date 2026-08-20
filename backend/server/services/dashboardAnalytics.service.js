const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

const getDashboardAnalytics = async (userId) => {
  const [totals, categories, cashflow, budgets] = await Promise.all([
    Transaction.aggregate([{ $match: { user: userId } }, { $group: { _id: '$type', total: { $sum: '$amount' } } }]),
    Transaction.aggregate([{ $match: { user: userId, type: 'expense' } }, { $group: { _id: '$category', total: { $sum: '$amount' } } }, { $sort: { total: -1 } }]),
    Transaction.aggregate([{ $match: { user: userId } }, { $group: { _id: { month: { $dateToString: { format: '%Y-%m', date: '$date' } }, type: '$type' }, total: { $sum: '$amount' } } }, { $sort: { '_id.month': 1 } }]),
    Budget.find({ userId, isActive: true }).select('category spent amount alertThreshold'),
  ]);
  const income = totals.find((item) => item._id === 'income')?.total || 0;
  const expenses = totals.find((item) => item._id === 'expense')?.total || 0;
  const totalCategorySpend = categories.reduce((sum, item) => sum + item.total, 0);
  const byMonth = new Map();
  for (const item of cashflow) {
    const value = byMonth.get(item._id.month) || { month: item._id.month, income: 0, expenses: 0 };
    value[item._id.type === 'income' ? 'income' : 'expenses'] = item.total;
    byMonth.set(item._id.month, value);
  }
  return {
    dashboardSummary: { balance: income - expenses, income, expenses, savingsRate: income ? ((income - expenses) / income) * 100 : 0 },
    spendingByCategory: categories.map((item) => ({ category: item._id, total: item.total, percentage: totalCategorySpend ? (item.total / totalCategorySpend) * 100 : 0 })),
    monthlyCashflow: [...byMonth.values()],
    budgetHealth: budgets.map((item) => ({ category: item.category, spent: item.spent, limit: item.amount, status: item.spent >= item.amount ? 'exceeded' : item.spent >= item.amount * (item.alertThreshold / 100) ? 'warning' : 'on-track' })),
  };
};

module.exports = { getDashboardAnalytics };
