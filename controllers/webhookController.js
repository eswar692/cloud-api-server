const Contact = require("../Model/Contact");
const Webhook = require("../Model/Webhook");

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

  const receiver =
    data?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
  const profileName =
    data?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile.name;
  try {
    // Check if the message is a text message
    const messageData = {
      sender: message.from,
      receiver: receiver,
      name: profileName,
      type: message.type,
      textMessage: message.text?.body,
      imageMessage: message.image?.url,
      messageId: message.id,
      timestamp: message.timestamp,
    };
    const webhook = await Webhook.create(messageData);
    const contact = await Contact.findOne({
      phoneNumber: message.from,
    });
    if (!contact) {
      await Contact.create({
        displayName: profileName,
        phoneNumber: message.from,
        userApiNumber: apiNumber,
        whatsappUserTime: message.timestamp,
      });
    } else {
      contact.whatsappUserTime = message.timestamp; // update field
      await contact.save(); // save the changes
    }

    checkMessageExists.add(message?.id);
    clearTimeout(() => {
      checkMessageExists.delete(message.id);
    }, 60000); // 1 minute timeout
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

module.exports = { getWebhooks, deleteAllMessages };
