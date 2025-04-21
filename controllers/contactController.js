const Contact = require("../Model/Contact");

const getContacts = async (req, res) => {
  try {
    const { userId } = req.params;
    const contacts = await Contact.find({ userId }).sort({ whatsappUserTime: 1 });
    res.status(200).json(contacts);
  }
  catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


module.exports = {};
