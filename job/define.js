const Payment = require("../Model/Payment");
const User = require("../Model/User");
const { mailOptions, sendOTP } = require("../utils/otpSend");

const agendaDefine = (agenda) => {
  agenda.define("plan-expire", async (job) => {
    try {
      const { userId } = job.attrs.data;
      console.log(`Processing plan expiration for user: ${userId}`);
      
      const user = await Payment.findOne({ userId });
      if (!user) {
        console.log(`User not found with ID: ${userId}`);
        return;
      }

      // Check for active prepaid plan
      if (user?.prepaidOneMonth?.plan === "basic Plan" ||
          user?.prepaidOneMonth?.plan === "Standard Plan" ||
          user?.prepaidOneMonth?.plan === "business Plan") {
        
        // Apply prepaid plan
        user.plan = user.prepaidOneMonth.plan;
        user.amount = user.prepaidOneMonth.amount;
        user.endPlanDate = user.prepaidOneMonth.endPlanDate;
        user.messageLimit = user.prepaidOneMonth.messageLimit;
        user.prepaidOneMonth = undefined;
        user.messageCountTracker = 0;
        
        await user.save();
        console.log(`Prepaid plan applied for user: ${userId}`);
        return;
      }
      
      // No prepaid plan - expire current plan
      user.plan = "expired";
      if(user.freePlanActive === "active") {
        user.freePlanActive = "completed";
      }
      user.amount = 0;
      user.endPlanDate = 0;
      user.messageLimit = 0;
      user.createdAt = 0;
      user.paymentDetails = undefined;
      
      
      await user.save();
      const userDetails = await User.findById(userId);
      if(!userDetails) {
        console.log(`User details not found for ID: ${userId}`);
        return;
      }
      const emailOptionsInstance = mailOptions({title:"Plan Expired",email:userDetails.email, message:{text:"Plan Expired",main:"Please renew your plan",sub:"your plan has been expired"}, otp:null});
      await sendOTP(userDetails.email, emailOptionsInstance);

      console.log(`Plan expired for user: ${userId}`);
      // Delete the job in Mongo DB 
       await job.remove();
    } catch (error) {
      console.error(`Error processing plan expiration job: ${error.message}`, error);
    }
  });
  agenda.define("plan-alert", async (job) => {
    try {
      const { userId } = job.attrs.data;
      console.log(`Processing plan alert for user: ${userId}`);
      
      const user = await Payment.findOne({ userId });
      if (!user) {
        console.log(`User not found with ID: ${userId}`);
        return;
      }
      const userDetails = await User.findById(userId);
      if(!userDetails) {
        console.log(`User details not found for ID: ${userId}`);
        return;
      }
      const emailOptionsInstance = mailOptions({title:"Your Plan is about to expire in 2 days",email:userDetails.email, message:{text:"Plan Alert",main:"Please renew your plan",sub:"your plan is about to expire"}, otp:null});
      await sendOTP(userDetails.email, emailOptionsInstance);

      console.log(`Plan alert sent for user: ${userId}`);
      // Delete the job in Mongo DB 
       await job.remove();
    } catch (error) {
      console.error(`Error processing plan alert job: ${error.message}`, error);
    }
  });
};

module.exports = agendaDefine;