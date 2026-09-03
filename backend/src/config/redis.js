const Redis = require("ioredis");
const redisClient = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

redisClient.on("connect", () => {
  console.log("Redis connected to Upstash");
});

redisClient.on("ready", () => {
  console.log("Redis is ready");
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err.message);
});

redisClient.on("close", () => {
  console.log("Redis connection closed");
});

module.exports = redisClient;