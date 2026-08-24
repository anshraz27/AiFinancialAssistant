const { budgetAlertQueue } = require('./queues');

const addBudgetAlert = (data) => {
	const jobId = data.transactionId
		? `budget-check-${data.transactionId}-${data.category}`
		: undefined;
	return budgetAlertQueue.add('check', data, { jobId });
};

module.exports = { addBudgetAlert, budgetAlertQueue };