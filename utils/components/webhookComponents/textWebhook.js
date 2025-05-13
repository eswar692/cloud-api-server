const Webhook = require("../.././../Model/Webhook");
const Api = require("../.././../Model/Api");
const axios = require("axios");

const textMessage = async (data) => {
  const message = data?.entry?.[0]?.changes?.[0].value?.messages?.[0];
  const apiNumber =
    data?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;
  const profileName =
    data?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile.name;
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
  return webhook;
};
module.exports = { textMessage };
