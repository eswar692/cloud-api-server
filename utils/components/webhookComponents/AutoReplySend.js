const Api = require('../../../Model/Api'); 
const Webhook = require('../../../Model/Webhook');
const AutoReply = require('../../../Model/autoreplay'); 
const axios = require('axios');
const { sendWebhooks } = require('../../socket');
const { textMessage } = require('./textWebhook');
const { getFileWebhook } = require('./fileWebhook');



const autoReplySend = async(data) => {
    console.log("AutoReplySend function called with data:")
 try {
      // Check if data is present and extract message, whatsappUserPhoneNumber, and apiNumber
    const message = data?.entry?.[0]?.changes?.[0].value?.messages?.[0];
    const whatsappUserPhoneNumber = message?.from;
    const apiNumber = data?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;
    
  const profileName =
    data?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile.name;

    // Check if message, whatsappUserPhoneNumber, and apiNumber are present
    if (!message || !whatsappUserPhoneNumber || !apiNumber) return false;


    // Find the user by phone number
        const findUser = await Api.findOne({ phoneNumber: apiNumber });
        if (!findUser) return false;
    // Check if the user has auto-reply enabled

    

        const autoReply = await AutoReply.findOne({ userId: findUser.userId });
    if (!autoReply || !autoReply.isActive) return false ;

    // if user clicked the quick reply button
    if( message?.type === 'interactive' && message?.interactive?.type === 'button_reply'){
        const buttonId = message?.interactive?.button_reply?.id;
        const buttonTitle = message?.interactive?.button_reply?.title;
        // Check if the button ID matches any of the auto-reply buttons
      

       const storeMessage = await Webhook.create({
        sender: whatsappUserPhoneNumber,
        receiver: apiNumber,
        name: profileName,
        type: 'text',
        textMessage:buttonTitle,
        messageId: message.id,
        timestamp: message.timestamp,
        context: {
            messageId: message.context?.message_id,
        }
       });

       // send frontend with socket 
       await sendWebhooks(storeMessage, findUser.userId.toString());

        if(autoReply.isActive ){

                const payload = {
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": storeMessage.sender,
                    "type": "text",
                    "text": {
                        "body": buttonId === 1 ? autoReply.button1.message : (buttonId === 2 ? autoReply.button2.message : autoReply.button3.message)
                    }
                };

            const sendReplyInQuickReply = await axios.post(`https://graph.facebook.com/v22.0/${findUser.phoneNumberId}/messages`, payload, {
                headers: {
                Authorization: `Bearer ${findUser.accessToken}`,
                },
            })
            if (sendReplyInQuickReply.status === 200) {
                const autoReplyMessageStore = await Webhook.create({
                    sender: apiNumber,
                    receiver: whatsappUserPhoneNumber,
                    name: profileName,
                    type: 'text',
                    textMessage: buttonId === 1 ? autoReply.button1.message : (buttonId === 2 ? autoReply.button2.message : autoReply.button3.message),
                    messageId: sendReplyInQuickReply.data.messages[0].id,
                    timestamp: Math.floor(Date.now() / 1000), 
                    context: {
                        messageId: storeMessage.messageId
                    }
                })
                await sendWebhooks(autoReplyMessageStore, findUser.userId.toString());
                return true;
            } 

        }       

    }



    // Auto replay only send 12 hours after the last message    
    //find the last message sent by the whatsapp user
    const lastMessage = await Webhook.find({ sender: whatsappUserPhoneNumber, receiver: apiNumber }).sort({ timestamp: -1 }).limit(1);
    if (lastMessage.length === 1) {
        const lastMessageTime = lastMessage[0].timestamp * 1000; // Convert to milliseconds
        const currentTime = Date.now(); // Get current time in milliseconds
        const timeDifference = currentTime - lastMessageTime;

        // Check if the time difference is less than 12 hours (43200000 milliseconds)
        if (timeDifference < (12 * 60 * 60 * 1000))   return false;

    }
    // store Data in DB in webhook 
     switch (message?.type) {
          case "text":
             await textMessage(data);
            break;
          case "image":
          case "video":
          case "audio":
          case "document":
             await getFileWebhook(data, findUser.accessToken);
            break;
          default:
            console.log("Unknown message type:", message?.type);
        }

    // this helper function  4 parameters 1. userApiData, 2. autoReply, 3. message, 4. profileName
    console.log("Sending auto-reply...");
    const autoReplySent = await sendAutoReplyHelper(findUser, autoReply, message, profileName);


    if(autoReplySent){
        return true;
    } else {
        console.error('Failed to send auto-reply');
        return false;
    }

    
 } catch (error) {
        console.error('Error in AutoReplySend:', error);
        return false;
    
 }
    

    
}

async function sendAutoReplyHelper (userApiData, autoReply, message, profileName){
    const whatsappUserPhoneNumber = message?.from;
    const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: whatsappUserPhoneNumber,
            type: 'interactive',
            interactive: {
                type: 'button',
                header: {
                    type: autoReply.header.type,
                    image: {
                        link: autoReply.header.url,
                    }
                },
                body: {
                    text: autoReply.body
                },
                footer: {
                    text: autoReply.footer
                },
                action: {
                    buttons: [
                        {
                        type: 'reply',
                        reply: {
                            id: 1,
                            title: autoReply.button1.lable
                        }
                        },
                        {
                        type: 'reply',
                        reply: {
                            id: 2,
                            title: autoReply.button2.lable
                        }
                        },
                        {
                        type: 'reply',
                        reply: {
                            id: 3,
                            title: autoReply.button3.lable
                        }
                        }
                    ]
                }
            }
    };

    try {
        const response = await axios.post(`https://graph.facebook.com/v22.0/${userApiData.phoneNumberId}/messages`, payload, {
            headers: {
                Authorization: `Bearer ${userApiData.accessToken}`,
            },
        });

        if (response.status === 200) {
            const autoReplyMessageStore = await Webhook.create({
                sender: userApiData.phoneNumber,
                receiver: whatsappUserPhoneNumber,
                name: profileName,
                type: 'interactive',
                messageId: response.data.messages[0].id,
                timestamp: Math.floor(Date.now() / 1000),
                autoReply: {
                    messageId: message.id,
                }
            });
            await sendWebhooks(autoReplyMessageStore, userApiData.userId.toString());
            return true;
        }

        return true;
    } catch (error) {
        console.error('Error sending auto-reply:', error);
        return false;
    }
}


module.exports = autoReplySend;