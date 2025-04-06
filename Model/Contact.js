const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  userApiNumber: {
    // api user phone number
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true, // The phone number of the user who saved this contact
  },
  displayName: {
    type: String,
    ref: "User",
    required: true, // Reference to the user who saved this contact
  },
  whatsappUserTime: {
    type: Date,
  },
});

module.exports = mongoose.model("Contact", contactSchema);
