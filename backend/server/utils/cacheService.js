const redisClient = require("./redisClient");

/**
 * Cache utility functions for Redis
 */

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} Parsed value or null
 */
const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Redis GET error:", error);
    return null;
  }
};

/**
 * Set value in cache with expiration
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} expirationTime - Time in seconds (default: 1 hour)
 * @returns {Promise<boolean>} Success status
 */
const setCache = async (key, value, expirationTime = 3600) => {
  try {
    await redisClient.setEx(key, expirationTime, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Redis SET error:", error);
    return false;
  }
};

/**
 * Delete cache key
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error("Redis DEL error:", error);
    return false;
  }
};

/**
 * Delete multiple cache keys
 * @param {string[]} keys - Array of cache keys
 * @returns {Promise<boolean>} Success status
 */
const deleteCacheMany = async (keys) => {
  try {
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error("Redis DEL MANY error:", error);
    return false;
  }
};

/**
 * Clear all cache (use with caution)
 * @returns {Promise<boolean>} Success status
 */
const flushCache = async () => {
  try {
    await redisClient.flushDb();
    return true;
  } catch (error) {
    console.error("Redis FLUSH error:", error);
    return false;
  }
};

/**
 * Get cache with fallback (if not cached, set it)
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Async function to fetch data
 * @param {number} expirationTime - Cache expiration in seconds
 * @returns {Promise<any>} Cached or fetched data
 */
const getOrSet = async (key, fetchFunction, expirationTime = 3600) => {
  try {
    // Try to get from cache
    const cached = await getCache(key);
    if (cached) {
      console.log(`Cache HIT: ${key}`);
      return cached;
    }

    // Cache miss - fetch data
    console.log(`Cache MISS: ${key}`);
    const data = await fetchFunction();

    // Set cache
    await setCache(key, data, expirationTime);
    return data;
  } catch (error) {
    console.error("getOrSet error:", error);
    // Fallback to direct fetch if redis fails
    return await fetchFunction();
  }
};

/**
 * Increment counter in cache
 * @param {string} key - Cache key
 * @returns {Promise<number>} New counter value
 */
const incrementCounter = async (key) => {
  try {
    return await redisClient.incr(key);
  } catch (error) {
    console.error("Redis INCR error:", error);
    return null;
  }
};

/**
 * Check if key exists
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Key existence
 */
const cacheExists = async (key) => {
  try {
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (error) {
    console.error("Redis EXISTS error:", error);
    return false;
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  deleteCacheMany,
  flushCache,
  getOrSet,
  incrementCounter,
  cacheExists,
  redisClient,
};
