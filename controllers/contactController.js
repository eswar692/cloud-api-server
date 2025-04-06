const Contact = require("../Model/Contact");

const findAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ whatsappUserTime: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { findAllContacts };
