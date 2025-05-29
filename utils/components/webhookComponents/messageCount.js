const Api = require("../../../Model/Api");
const Webhook = require("../../../Model/Webhook");
const Payment = require("../../../Model/Payment");

const messageCount = async (data) => {
  try {
    const message = data?.entry?.[0]?.changes?.[0].value?.messages?.[0];
    const whatsappUserPhoneNumber = message?.from;
    const apiNumber =
      data?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;
    if (!message) return;
    const findUser = await Api.findOne({ phoneNumber: apiNumber });
    if (!findUser) return;
    // first paymnent lo unna APi user ni find cheyali ante first payment catch ki userID kavali first API DB ni find cheste user ID vastundi
    const payment = await Payment.findOne({ userId: findUser.userId });
    const userId = findUser.userId.toString();
    const oldMessage = await Webhook.find({
      sender: whatsappUserPhoneNumber,
      receiver: apiNumber,
    })
      .sort({ timestamp: -1 })
      .limit(1);
    if (oldMessage.length === 0) {
      console.log("No previous messages found, incrementing message count.");
      findUser.messageCount += 1;
      if (payment) {
        payment.messageCountTracker += 1;
        await payment.save();
      }
      await findUser.save();
      return;
    }

    const lastTimestamp = Math.floor(oldMessage[0].timestamp * 1000);
    const currentTimestamp = Math.floor(message?.timestamp * 1000);

    const timeDiff = currentTimestamp - lastTimestamp;
    const oneDayInMillis = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    const isOneDayGap = timeDiff >= oneDayInMillis;
    if (isOneDayGap) {
      console.log("One day gap detected, incrementing message count.");
      findUser.messageCount += 1;
      if (payment) {
        payment.messageCountTracker += 1;
        await payment.save();
      }
      await findUser.save();
    } else {
      return;
    }
  } catch (error) {
    console.error("Error in messageCount:", error);
  }
};

module.exports = messageCount;
