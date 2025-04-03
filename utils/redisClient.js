const redis = require("redis");
require("dotenv").config();

const connectRedis = async () => {
  try {
    const client = redis.createClient({
      url: process.env.redis_url, // Add Redis URL explicitly
      socket: { reconnectStrategy: 3 }, // Auto-reconnect
    });

    client.on("error", (err) => {
      console.error("❌ Redis Error:", err);
    });

    client.on("connect", () => {
      console.log("✅ Redis Connected Successfully!");
    });

    await client.connect(); // Await connection

    return client;
  } catch (error) {
    console.error("❌ Redis Connection Failed:", error);
  }
};

const disconnectRedis = async (client) => {
  try {
    await client.quit();
    console.log("✅ Redis Disconnected Successfully!");
  } catch (error) {
    console.error("❌ Redis Disconnection Error:", error);
  }
};

module.exports = { connectRedis, disconnectRedis };
