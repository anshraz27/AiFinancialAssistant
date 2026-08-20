const { receiptQueue } = require('./queues');

const addReceiptScan = (data) => receiptQueue.add('scan', data);

module.exports = { addReceiptScan, receiptQueue };
