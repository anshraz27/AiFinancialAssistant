const test = require('node:test');
const assert = require('node:assert/strict');
const { domainEvents, emit } = require('../server/events/domainEvents');
const redisClient = require('../server/utils/redisClient');

test.after(async () => {
  if (redisClient.isOpen) await redisClient.quit();
});

test('domain events retain type, payload, and timestamp', () => {
  let received;
  const listener = (event) => { received = event; };
  domainEvents.once('transaction.created', listener);
  emit('transaction.created', { userId: 'user-1', transactionId: 'transaction-1' });
  assert.equal(received.type, 'transaction.created');
  assert.equal(received.userId, 'user-1');
  assert.ok(received.occurredAt);
});
