const Api = require("../Model/Api.js");
const Contact = require("../Model/Contact");
const Webhook = require("../Model/Webhook");
const { sendContacts, sendWebhooks } = require("../utils/socket");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const axios = require("axios");
const {
  getFileWebhook,
} = require("../utils/components/webhookComponents/fileWebhook.js");
const {
  textMessage,
} = require("../utils/components/webhookComponents/textWebhook.js");
const {
  contactSet,
} = require("../utils/components/webhookComponents/contact.js");
const {
  messageStatus,
} = require("../utils/components/webhookComponents/status.js");
const messageCount = require("../utils/components/webhookComponents/messageCount.js");
const PlanLimitCheck = require("../utils/components/webhookComponents/planLimit.js");
const autoReplySend = require("../utils/components/webhookComponents/AutoReplySend.js");

getWebhooks = async (req, res) => {
  const data = req.body;
  //plan limit check function
  const limitCheck = await PlanLimitCheck(data);
  // if limit check is false, return 404 status with message
  if (!limitCheck) {
    console.log("Plan limit exceeded");
    return res.status(404).json({ message: "Plan limit exceeded" });
  }
  if (!data)
    return res.status(401).json({ success: false, message: "No data found" });

  // facebook send chesina webhook ki return data vaste 200 status code return cheyali edi cheykapothe again facebook send same webhook

  // Extracting necessary information from the webhook data
  const message = data?.entry?.[0]?.changes?.[0].value?.messages?.[0];
  const apiNumber =
    data?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;

  const profileName =
    data?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile.name;
  let webhook;
  // Check if the message, whatsappUserPhoneNumber, and apiNumber are present
  const userApi = await Api.findOne({ phoneNumber: apiNumber });
  try {
    // count all messages this is only track message count not store in DB only count track DB update chestundi
    await messageCount(data);
    // new message contact send to socket ante this function is used to send contact to frontend not store in DB in any messages ante instant update ki used chestamu temparay contact ni client send chestamu
    await sendContacts(data);
    // contact set function is used to store the contact in DB and update the contact if already exist
    await contactSet(data);

    // eppudu autoreply function call cheyyali incase function return true ante webhook fumction this functions tho stop avvali if autoreply is false vaste next webhook function call avuthundi
    const autoReply = await autoReplySend(data);
    if (autoReply) {
      return res.status(200).json({
        success: true,
        message: "Auto reply sent successfully",
      });
    }

    // All the data is present, and manam DB lo set chesaka next step whatsapp server ki 200 status code return cheyyali
    if (data) {
      res.status(200).json({
        success: true,
        message: "Data received successfully",
      });
    }

    // this start nundi messages store avuthayi as per category

    // Check if the message is a text message

    switch (message?.type) {
      case "text":
        webhook = await textMessage(data);
        break;
      case "image":
      case "video":
      case "audio":
      case "docs":
        webhook = await getFileWebhook(data, userApi.accessToken);
        break;
      default:
        console.log("Unknown message type:", message?.type);
    }

    // if (message?.type === "text") {
    //   webhook = await textMessage(data);

    // }

    // if (
    //   message?.type === "image" ||
    //   message?.type === "video" ||
    //   message?.type === "docs" ||
    //   message?.type === "audio"
    // ) {
    //   console.log("file webhook");
    //   webhook = await getFileWebhook(data, userApi.accessToken);
    // }

    if (userApi || webhook) {
      const userId = userApi.userId.toString();
      await sendWebhooks(webhook, userId);
    }

    await messageStatus(data);

    console.log("webhooks:", webhook);
  } catch (err) {
    console.error("Error in getWebhooks:", err);
    res.status(501).json({ success: false, message: "Server error" });
  }
};

// all message
const allMessages = async (req, res) => {
  const userId = req.userId;
  if (!userId)
    return res
      .status(401)
      .json({ success: false, message: "User ID is required" });
  try {
    const api = await Api.findOne({ userId });
    if (!api)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    const messages = await Webhook.find({
      $or: [{ sender: api.phoneNumber }, { receiver: api.phoneNumber }],
    }).sort({ timestamp: 1 });
    if (messages.length === 0) {
      return res.status(401).json({ success: false, messages: "No message" });
    }

    return res.status(201).json({
      success: true,
      message: "message Gets successfully",
      data: messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ success: false, message: error.message });
  }
};

const deleteAllMessages = async (req, res) => {
  try {
    await Webhook.deleteMany(); // Delete all messages from the database
    console.log("All messages deleted successfully");
    res
      .status(200)
      .json({ success: true, message: "All messages deleted successfully" });
  } catch (err) {
    console.error("Error deleting messages:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getWebhooks, allMessages, deleteAllMessages };
