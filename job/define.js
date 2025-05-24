const Payment = require("../Model/Payment");

const agendaDefine = (agenda) => {
  agenda.define("plan-expire", async (job) => {
    console.log(job.attrs.userId);
    const user = await Payment.findOne({ userId: job.attrs.userId });
    if (!user) {
      console.log("User not found");
      return;
    }
    if (
      user.prepaidOneMonth.plan &&
      user.prepaidOneMonth.amount &&
      user.prepaidOneMonth.createdAt &&
      user.prepaidOneMonth.endPlanDate
    ) {
      user.plan = user.prepaidOneMonth.plan;
      user.amount = user.prepaidOneMonth.amount;
      user.endPlanDate = user.prepaidOneMonth.endPlanDate;
      user.messageLimit = user.prepaidOneMonth.messageLimit;
      user.prepaidOneMonth = undefined;
      await user.save();
    }
    if (Date.now() > user.endPlanDate * 10000) {
    }

    job.remove();
  });
};
module.exports = agendaDefine;
