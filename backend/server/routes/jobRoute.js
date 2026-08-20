const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { receiptQueue, reportQueue } = require('../jobs/queues');

const router = express.Router();
router.use(protect);

router.get('/:queue/:id', async (req, res, next) => {
  try {
    const queue = req.params.queue === 'receipt' ? receiptQueue : req.params.queue === 'report' ? reportQueue : null;
    if (!queue) return res.status(404).json({ message: 'Job queue not found.' });
    const job = await queue.getJob(req.params.id);
    if (!job || job.data.userId !== req.user._id.toString()) return res.status(404).json({ message: 'Job not found.' });
    const state = await job.getState();
    return res.json({ id: job.id, state, progress: job.progress, result: job.returnvalue, failedReason: job.failedReason });
  } catch (error) { next(error); }
});

module.exports = router;
