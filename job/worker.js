// bull/workers/upgrade.worker.js
const { Worker, QueueEvents } = require("bullmq");
const { connectRedis } = require("../utils/redisClient");
const Payment = require("../Model/Payment");

const connection = connectRedis();

const upgradeWorker = new Worker(
  "job_work",
  async (job) => {
    if (job.name === "plan_upgrade") {
      const { userId } = job.data;
      if (!userId) {
        throw new Error("User ID is required");
      }
      const payment = await Payment.findOne({ userId });
      if (!payment) {
        throw new Error("Payment not found");
      }
      payment.plan = "expired";
      payment.amount = 0;
      payment.messageLimit = 0;
      payment.endPlanDate = null;
      payment.paymentDetails.order_id = null;
      payment.paymentDetails.payment_id = null;
      payment.paymentDetails.signature = null;
      payment.paymentDetails.status = null;
      payment.paymentDetails.invoice_id = null;
      payment.paymentDetails.invoice_url = null;

      await payment.save();

      // Real upgrade logic here
      console.log(`✅ Processing upgrade for user: ${userId}`);

      // Simulate success/failure
      if (!userId) throw new Error("Invalid user");
    }
  },
  { connection }
);

// Optional: Queue Events for Logging
// const events = new QueueEvents("upgradeQueue", { connection });

upgradeWorker.on("completed", ({ jobId }) => {
  console.log(`🎉 Job ${jobId} completed!`);
});

upgradeWorker.on("failed", ({ jobId, failedReason }) => {
  console.error(`❌ Job ${jobId} failed: ${failedReason}`);
});
