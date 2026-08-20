const { Worker } = require('bullmq');
const { connection } = require('../jobs/queues');
const { getMonthlyReportData } = require('../services/reportGeneration.service');
const { emit } = require('../events/domainEvents');
const events = require('../events/eventTypes');

const reportWorker = new Worker('report.generate', async (job) => {
  const report = await getMonthlyReportData(job.data.userId, job.data.month);
  emit(events.REPORT_GENERATION_COMPLETED, { userId: job.data.userId, jobId: job.id, month: report.month });
  return { month: report.month, totalIncome: report.totalIncome, totalExpenses: report.totalExpenses, netSavings: report.netSavings };
}, { connection });

reportWorker.on('active', (job) => emit(events.REPORT_GENERATION_STARTED, { userId: job.data.userId, jobId: job.id, month: job.data.month }));
reportWorker.on('failed', (job, error) => emit(events.REPORT_GENERATION_FAILED, { userId: job?.data.userId, jobId: job?.id, message: error.message }));
reportWorker.on('error', (error) => console.error('Report worker error:', error.message));

module.exports = reportWorker;
