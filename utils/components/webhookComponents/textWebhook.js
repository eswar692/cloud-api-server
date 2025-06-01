const Webhook = require("../.././../Model/Webhook");
const Api = require("../.././../Model/Api");
const axios = require("axios");
const { sendWebhooks } = require("../../socket");
const adsAndPost = require("./ads&post");

const textMessage = async (data) => {
  // Check if data is present and extract message, whatsappUserPhoneNumber, and apiNumber
  const message = data?.entry?.[0]?.changes?.[0].value?.messages?.[0];
  const apiNumber =
    data?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;
  const profileName =
    data?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile.name;

   const userApi = await Api.findOne({ phoneNumber: apiNumber });
   if (!userApi) return console.log("User not found");

   if(message?.referral){
    await adsAndPost(data);
    return null;
   }


  const messageData = {
    sender: message?.from,
    receiver: apiNumber,
    name: profileName,
    type: message?.type,
    textMessage: message?.text?.body,
    imageMessage: message?.image?.url,
    messageId: message?.id,
    timestamp: message?.timestamp,
  };
  const webhook = await Webhook.create(messageData);
  await sendWebhooks(webhook, userApi.userId.toString());
};
module.exports = { textMessage };
