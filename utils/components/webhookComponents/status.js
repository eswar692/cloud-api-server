const Webhook = require("../../../Model/Webhook");
const Api = require("../../../Model/Api");
const { sendWebhooks } = require("../../socket");


const messageStatus = async (data) => {
    const status = data?.entry?.[0]?.changes?.[0].value?.statuses?.[0];
    const apiNumber = data?.entry?.[0]?.changes[0]?.value?.metadata?.display_phone_number;
    try {
        if(!status && !apiNumber) return;
    const webhook = await Webhook.findOne({ messageId: status?.id });
    if (!webhook) return;
    webhook.status = status?.status;
    const updateWebhook = await webhook.save();
    const api = await Api.findOne({phoneNumber:apiNumber}); 
    await sendWebhooks(updateWebhook, api.userId.toString());

    } catch (error) {
        console.error("Error in messageStatus:", error);
        
    }
}
module.exports = { messageStatus };