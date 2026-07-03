const { createClient } = require("redis");
require("dotenv").config();

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Build connection options — Upstash and other cloud providers use rediss:// (TLS)
const clientOptions = { url: REDIS_URL };
if (REDIS_URL.startsWith("rediss://")) {
  clientOptions.socket = {
    tls: true,
    rejectUnauthorized: false,
  };
}

// Initialize Redis Client
const redisClient = createClient(clientOptions);

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis Connected Successfully"));
redisClient.on("ready", () => console.log("Redis Ready"));

// Connect to Redis (graceful — app still works if Redis is unavailable)
(async () => {
  try {
    await redisClient.connect();
    console.log("✓ Redis connection established");
  } catch (err) {
    console.error("⚠ Failed to connect to Redis (caching disabled):", err.message);
  }
})();

module.exports = redisClient;

