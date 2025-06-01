const Api = require("../../../Model/Api");
const Webhook = require("../../../Model/Webhook");

const adsAndPost = async (data) => {
    // Check if data is present and extract message, whatsappUserPhoneNumber, and apiNumber
    const message = data?.entry?.[0]?.changes?.[0].value?.messages?.[0];
    const whatsappUserPhoneNumber = message?.from;
    const apiNumber = data?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;
    const profileName = data?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name;
    try {
        const findUserApi = await Api.findOne({ phoneNumber: apiNumber });
        if(!findUserApi) return;

       if(message?.referral){
           const webhook = await Webhook.create({
               sender: whatsappUserPhoneNumber,
               receiver: apiNumber,
               name: profileName,
               type: message?.type,
               textMessage: message?.text?.body,
               messageId: message?.id,
               timestamp: message?.timestamp,
               referral: {
                  type: message?.referral?.source_type,
                  url: message?.referral?.source_url,
                  media_type: message?.referral?.media_type,
               }
            
           });

           await sendWebhooks(webhook, findUserApi.userId.toString());
       }
        
        
    } catch (error) {
        console.log(error);
    }
}

module.exports = adsAndPost;