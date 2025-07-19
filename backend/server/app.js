// src/app.js
const express = require('express');
const fs = require('fs');
const https = require('https');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require("dotenv").config();

const authRoutes = require('./routes/authRoute');
const transactionRoutes = require('./routes/transactionRoute');
const budgetRoutes = require('./routes/budgetRoute');
const investmentRoutes = require('./routes/investmentRoute');

const errorHandler = require('./middleware/errorHandler');
const dashboardRoute= require('./routes/dashboardRoute');

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Security middleware
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/dashboard',dashboardRoute);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

module.exports = app;