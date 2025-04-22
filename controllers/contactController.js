const Contact = require("../Model/Contact");
const Api = require("../Model/Api");

const getContacts = async (req, res) => {
  try {
    const { userId } = req;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    //find userId
    const user = await Api.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    //find contacts by User Api Number
    const contacts = await Contact.find({
      userApiNumber: user.phoneNumber,
    }).sort({ whatsappUserTime: -1 });
    if (!contacts || contacts.length === 0) {
      return res.status(404).json({ message: "No contacts found" });
    }
    return res.status(200).json({ contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateContactNewMessageSeen = async (req, res) => {
  try {
    const { userId } = req;
    const { whatsappUserNumber } = req.body;
    if (!userId || !whatsappUserNumber) {
      return res.status(400).json({success: false, message: "User ID is required" });
    }
    const findUser = await Api.findOne({ userId });
    if (!findUser) {
      return res.status(404).json({success: false, message: "User not found" });
    }
    
    const contact = await Contact.findOneAndUpdate(
      { userApiNumber: findUser.phoneNumber, phoneNumber: whatsappUserNumber },
      { $set: { "lastMessage.messageSeen": false, "lastMessage.messageCount": 0 } },
      { new: true } // return updated document
    );

    if (!contact) {
      return res.status(404).json({success: false, message: "Contact not found" });
    }
    return res.status(200).json({success: true, message: "Contact updated successfully" });
  } catch (error) {
    return res.json(500).json({success: false, message: error.message});
  }
};

module.exports = { getContacts , updateContactNewMessageSeen };
