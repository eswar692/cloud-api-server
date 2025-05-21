const Redis = require("ioredis");
require("dotenv").config();

const connectRedis = async () => {
  try {
    const client = new Redis({
      url: process.env.redis_url,
      tls: {},
    }); // ioredis uses URL directly

    client.on("connect", () => {
      console.log("✅ Redis Connected Successfully!");
    });

    client.on("error", (err) => {
      console.error("❌ Redis Error:", err);
    });

    // Optional: Wait until ready
    await new Promise((resolve) => client.once("ready", resolve));

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
