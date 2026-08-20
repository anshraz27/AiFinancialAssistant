const Transaction = require('../models/Transaction');
const Investment = require('../models/Investment');

const getMonthlyReportData = async (userId, month) => {
  if (!/^\d{4}-\d{2}$/.test(month || '')) throw new Error('Month must use YYYY-MM format.');
  const startDate = new Date(`${month}-01T00:00:00Z`);
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);
  const [transactions, investments] = await Promise.all([
    Transaction.find({ user: userId, date: { $gte: startDate, $lte: endDate } }),
    Investment.find({ user: userId, date: { $gte: startDate, $lte: endDate } }),
  ]);
  const totalIncome = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const totalInvestments = investments.reduce((sum, item) => sum + item.amount, 0);
  return { month, transactions, investments, totalIncome, totalExpenses, totalInvestments, netSavings: totalIncome - totalExpenses - totalInvestments };
};

module.exports = { getMonthlyReportData };
