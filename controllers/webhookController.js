const Api = require('../Model/Api.js');
const Contact = require('../Model/Contact');
const Webhook = require('../Model/Webhook');
const { sendContacts, sendWebhooks } = require('../utils/socket');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const {
  getFileWebhook
} = require('../utils/components/webhookComponents/fileWebhook.js');
const {
  textMessage
} = require('../utils/components/webhookComponents/textWebhook.js');
const {
  contactSet
} = require('../utils/components/webhookComponents/contact.js');
const {
  messageStatus
} = require('../utils/components/webhookComponents/status.js');
const messageCount = require('../utils/components/webhookComponents/messageCount.js');
const PlanLimitCheck = require('../utils/components/webhookComponents/planLimit.js');
const autoReplySend = require('../utils/components/webhookComponents/AutoReplySend.js');

getWebhooks = async (req, res) => {
  const data = req.body;

  if (!data) {
    return res.status(401).json({ success: false, message: 'No data found' });
  }

  // ✅ Always respond 200 to WhatsApp FIRST
  res
    .status(200)
    .json({ success: true, message: 'Data received successfully' });

  // ✅ Plan Limit Check
  const limitCheck = await PlanLimitCheck(data);
  if (!limitCheck) {
    console.log('Plan limit exceeded');
    return;
  }

  try {
    // ✅ Extract data
    const message = data?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const apiNumber =
      data?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;
    const profileName =
      data?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name;

    if (!message || !apiNumber) {
      console.warn('Missing message or API number');
      return;
    }

    const userApi = await Api.findOne({ phoneNumber: apiNumber });
    if (!userApi) {
      console.warn('API credentials not found for:', apiNumber);
      return;
    }

    // ✅ Parallel: non-dependent tasks
    await Promise.all([
      messageCount(data),
      sendContacts(data),
      contactSet(data)
    ]);

    // ✅ Autoreply check
    const autoReply = await autoReplySend(data);
    if (autoReply) {
      console.log('Auto reply sent. Skipping message storage.');
      return;
    }

    // ✅ Handle messages as per type
    let webhook = null;
    switch (message.type) {
      case 'text':
        await textMessage(data);
        break;
      case 'image':
      case 'video':
      case 'audio':
      case 'document':
        webhook = await getFileWebhook(data, userApi.accessToken);
        break;
      default:
        console.log('Unsupported message type:', message.type);
    }

    // ✅ Send webhook to internal system (if needed)
    if (userApi && webhook) {
      const userId = userApi.userId.toString();
      await sendWebhooks(webhook, userId);
    }

    // ✅ Final status update
    await messageStatus(data);

    console.log('Webhook processed successfully');
  } catch (err) {
    console.error('Error while processing webhook:', err);
  }
};

// all message
const allMessages = async (req, res) => {
  const userId = req.userId;
  if (!userId)
    return res
      .status(401)
      .json({ success: false, message: 'User ID is required' });
  try {
    const api = await Api.findOne({ userId });
    if (!api)
      return res
        .status(401)
        .json({ success: false, message: 'User not found' });
    const messages = await Webhook.find({
      $or: [{ sender: api.phoneNumber }, { receiver: api.phoneNumber }]
    }).sort({ timestamp: 1 });
    if (messages.length === 0) {
      return res.status(401).json({ success: false, messages: 'No message' });
    }

    return res.status(201).json({
      success: true,
      message: 'message Gets successfully',
      data: messages
    });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ success: false, message: error.message });
  }
};

const deleteAllMessages = async (req, res) => {
  try {
    await Webhook.deleteMany(); // Delete all messages from the database
    console.log('All messages deleted successfully');
    res
      .status(200)
      .json({ success: true, message: 'All messages deleted successfully' });
  } catch (err) {
    console.error('Error deleting messages:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getWebhooks, allMessages, deleteAllMessages };
