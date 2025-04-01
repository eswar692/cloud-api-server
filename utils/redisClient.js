const redis = require("redis");

const connectRedis = async () => {
  try {
    const client = redis.createClient({
      url: "redis://127.0.0.1:6379", // Add Redis URL explicitly
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
