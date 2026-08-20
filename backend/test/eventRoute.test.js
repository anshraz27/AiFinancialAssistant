const test = require('node:test');
const assert = require('node:assert/strict');
const eventTypes = require('../server/events/eventTypes');

test('event catalog contains all async job lifecycle events', () => {
  assert.equal(eventTypes.RECEIPT_SCAN_COMPLETED, 'receipt.scan.completed');
  assert.equal(eventTypes.REPORT_GENERATION_COMPLETED, 'report.generation.completed');
  assert.equal(eventTypes.BUDGET_THRESHOLD_EXCEEDED, 'budget.threshold.exceeded');
});
