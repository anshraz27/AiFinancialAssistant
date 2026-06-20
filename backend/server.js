const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const redisClient = require("./server/utils/redisClient");
require("dotenv").config();

const app = require("./server/app");

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/finscope";

// Database connection
mongoose
  .connect(MONGODB_URI)
  .then((e) => console.log("✓ MongoDB Connected"))
  .catch((err) => console.error("✗ MongoDB Connection Error:", err));

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  await redisClient.quit();
  mongoose.connection.close();
  process.exit(0);
});

module.exports = { redisClient };
