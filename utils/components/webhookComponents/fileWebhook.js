const Api = require("../../../Model/Api");
const Contact = require("../../../Model/Contact");
const axios = require("axios");


const getFileWebhook = async (data) => {
    const message = data?.entry?.[0]?.changes?.[0].value?.messages?.[0];
    const apiNumber = data?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;
    const profileName = data?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile.name;

    const apiData = await Api.findOne({ phoneNumber: apiNumber });
    const mediaId = message?.image?.id || message?.video?.id;
    const imageFile = await axios.get(`https://graph.facebook.com/v22.0/${mediaId}`,{headers:{Authorization: `Bearer ${apiData?.accessToken}`}});
    if(!imageFile) return res.status(401).json({success:false,message:"file not found"})
      const messageData = {
        sender: message?.from,
        receiver: apiNumber,
        name: profileName,
        type:'file',
        file:message?.type,
        textMessage: undefined,
        fileUrl: imageFile?.data.url,
        messageId: message?.id,
        timestamp: new Date(),
      };
      const webhook = await Webhook.create(messageData);
      return webhook;
}

module.exports = {getFileWebhook}