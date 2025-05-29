// const Redis = require("ioredis");
// require("dotenv").config();

// const connectRedis = async () => {
//   try {
//     const client = new Redis({
//   port: 6379, // Redis port
//   host: "127.0.0.1", // Redis host
//   username: "default", // needs Redis >= 6
//   password: "AWH7AAIjcDEwOTNlZmI1NjFlZjk0Mzg3OWE0NmFlM2RiOTExNDA0NnAxMA",
//   db: 0, // Defaults to 0
// });

//     client.on("connect", () => {
//       console.log("✅ Redis Connected Successfully!");
//     });

//     client.on("error", (err) => {
//       console.error("❌ Redis Error:", err);
//     });

//     // Optional: Wait until ready
//     await new Promise((resolve) => client.once("ready", resolve));

//     return client;
//   } catch (error) {
//     console.error("❌ Redis Connection Failed:", error);
//   }
// };

// const disconnectRedis = async (client) => {
//   try {
//     await client.quit();
//     console.log("✅ Redis Disconnected Successfully!");
//   } catch (error) {
//     console.error("❌ Redis Disconnection Error:", error);
//   }
// };

// module.exports = { connectRedis, disconnectRedis };

const Redis = require("ioredis");

const connectRedis = new Redis(process.env.redis_url, {
  tls: {
    // Required for Upstash Redis
    rejectUnauthorized: false,
  },
});

// Test connection
connectRedis
  .ping()
  .then((response) => {
    console.log("✅ Redis Response:", response);
  })
  .catch((err) => {
    console.error("❌ Redis Ping Failed:", err);
  });

  //if error occurs, 
  connectRedis.on("error", (err) => {
    console.error("❌ Redis Error:", err);
  });
    
module.exports = { connectRedis };
