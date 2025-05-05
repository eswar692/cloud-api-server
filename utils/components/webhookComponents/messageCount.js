const Api = require("../../../Model/Api");
const Webhook = require("../../../Model/Webhook");

const messageCount = async (data) => {
  try {
    const message = data?.entry?.[0]?.changes?.[0].value?.messages?.[0];
    const whatsappUserPhoneNumber = message?.from;
    const apiNumber =
      data?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;
    if (!message) return;
    const findUser = await Api.findOne({ phoneNumber: apiNumber });
    if (!findUser) return;
    const userId = findUser.userId.toString();
    const oldMessage = await Webhook.find({
      $or: [
        { sender: whatsappUserPhoneNumber, receiver: apiNumber },
        { receiver: whatsappUserPhoneNumber, sender: apiNumber },
      ],
    })
      .sort({ timestamp: -1 })
      .limit(1);
    if (oldMessage.length === 0) {
      findUser.messageCount += 1;
      await findUser.save();
      return;
    }

    const lastTimestamp = parseInt(oldMessage[0].timestamp) * 1000;
    const currentTimestamp = message?.timestamp * 1000;

    const timeDiff = currentTimestamp - lastTimestamp;

    const isOneDayGap = timeDiff >= 24 * 60 * 60 * 1000;
    if (isOneDayGap) {
      findUser.messageCount += 1;
      await findUser.save();
    } else {
      return;
    }
  } catch (error) {
    console.error("Error in messageCount:", error);
  }
};

module.exports = messageCount;
