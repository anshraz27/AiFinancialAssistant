const { domainEvents } = require('./domainEvents');
const events = require('./eventTypes');
const { addBudgetAlert } = require('../jobs/budgetQueue');

const queueBudgetCheck = (event) => {
  if (event.type === events.TRANSACTION_CREATED && event.transactionType === 'expense' && event.category && event.userId) {
    addBudgetAlert({
      userId: event.userId,
      category: event.category,
      transactionId: event.transactionId,
    }).catch((error) => {
      console.error('Budget alert queue failed:', error.message);
    });
  }
};

domainEvents.on(events.TRANSACTION_CREATED, queueBudgetCheck);

module.exports = { queueBudgetCheck };