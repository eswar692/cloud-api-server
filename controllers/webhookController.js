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

getWebhooks = async (req, res) => {
  const data = req.body;
  if (!data)
    return res.status(401).json({ success: false, message: "No data found" });
  if (data) {
    res.status(200).json({
      success: true,
      message: "Data received successfully",
    });
  }
  const message = data?.entry?.[0]?.changes?.[0].value?.messages?.[0];
  const apiNumber =
    data?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;

  const profileName =
    data?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile.name;
  let webhook;
  const userApi = await Api.findOne({ phoneNumber: apiNumber });
  try {
    // count all messages
    await messageCount(data);
    // Check if the message is a text message
    if (message?.type === "text") {
      webhook = await textMessage(data);
    }
    if (
      message?.type === "image" ||
      message?.type === "video" ||
      message?.type === "docs" ||
      message?.type === "audio"
    ) {
      console.log("file webhook");
      webhook = await getFileWebhook(data, userApi.accessToken);
    }
    await contactSet(data);

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
