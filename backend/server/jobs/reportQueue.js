const { reportQueue } = require('./queues');

const addReportGeneration = (data) => reportQueue.add('generate', data);

module.exports = { addReportGeneration, reportQueue };
