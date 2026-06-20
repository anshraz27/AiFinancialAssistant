const { createClient } = require("redis");
require("dotenv").config();

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Initialize Redis Client
const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis Connected Successfully"));
redisClient.on("ready", () => console.log("Redis Ready"));

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    console.log("✓ Redis connection established");
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
})();

module.exports = redisClient;
