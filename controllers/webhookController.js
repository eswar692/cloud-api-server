const Api = require("../Model/Api.js");
const Contact = require("../Model/Contact");
const Webhook = require("../Model/Webhook");
const { sendContacts, sendWebhooks } = require("../utils/socket");

const checkMessageExists = new Set();
getWebhooks = async (req, res) => {
  const data = req.body;
  const message = data?.entry?.[0]?.changes?.[0].value?.messages?.[0];
  const apiNumber =
    data?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;

  if (checkMessageExists.has(message?.id)) {
    return res.status(200);
  }

  if (!data || !data.entry)
    return res.status(401).json({ success: false, message: "No data found" });

  const profileName =
    data?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile.name;
  try {
    // Check if the message is a text message
    const messageData = {
      sender: message?.from,
      receiver: apiNumber,
      name: profileName,
      type: message?.type,
      textMessage: message?.text?.body,
      imageMessage: message?.image?.url,
      messageId: message?.id,
      timestamp: new Date(),
    };
    const webhook = await Webhook.create(messageData);
    const contact = await Contact.findOne({
      phoneNumber: message.from,
    });
    if (!contact) {
      const contact = await Contact.create({
        displayName: profileName,
        phoneNumber: message.from,
        userApiNumber: apiNumber,
        whatsappUserTime: message.timestamp,
      });

      const userApi = await Api.findOne({ phoneNumber: contact.userApiNumber });
      if (userApi) {
        const userId = userApi.userId.toString();
        await sendContacts(userId);
      }
    } else {
      contact.whatsappUserTime = message.timestamp; // update field
      const updatedContact = await contact.save(); // save the changes

      const userApi = await Api.findOne({
        phoneNumber: updatedContact.userApiNumber,
      });
      if (userApi) {
        const userId = userApi.userId.toString();
        await sendContacts(userId);
      }
    }

    const userApi = await Api.findOne({ phoneNumber: apiNumber });
    if (userApi) {
      const userId = userApi.userId.toString();
      await sendWebhooks(messageData, userId);
    }

    checkMessageExists.add(message?.id);
    clearTimeout(() => {
      checkMessageExists.delete(message.id);
    }, 120000); // 1 minute timeout
    console.log("webhooks:", webhook);
    return res.status(201).json({
      success: true,
      message: "Webhook created successfully",
      webhook,
    });
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
    checkMessageExists.clear(); // Clear the Set to remove all message IDs
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
