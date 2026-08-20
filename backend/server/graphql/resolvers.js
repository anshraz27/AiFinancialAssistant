const mongoose = require('mongoose');
const { getDashboardAnalytics } = require('../services/dashboardAnalytics.service');

module.exports = { dashboardAnalytics: (_, context) => getDashboardAnalytics(new mongoose.Types.ObjectId(context.user._id)) };
