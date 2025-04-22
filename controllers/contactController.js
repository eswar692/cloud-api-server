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
  } catch (error) {
    return res.json(500).json({});
  }
};

module.exports = { getContacts };
