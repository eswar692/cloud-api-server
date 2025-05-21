// bull/queues/upgrade.queue.js
const { Queue } = require("bullmq");
const { connectRedis } = require("../utils/redisClient");

const connection = connectRedis();

const upgradeQueue = new Queue("job_work", {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

module.exports = upgradeQueue;
