require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finscope')
  .then(() => {
    require('./server/workers/receiptWorker');
    require('./server/workers/reportWorker');
    require('./server/workers/budgetAlertWorker');
    console.log('Background workers started');
  })
  .catch((error) => { console.error('Worker MongoDB connection failed:', error.message); process.exit(1); });
