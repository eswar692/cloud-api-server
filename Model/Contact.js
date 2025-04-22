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
  lastMessage: {
    type: new mongoose.Schema(
      {
        messageType: {
          type: String,
          enum: ["text", "image", "video", "audio", "document"],
        },
        textMessage: {
          type: String,
          required: function () {
            return this.messageType === "text";
          },
        },
        messageTimestamp: {
          type: Date,
        },
        messageStatus: {
          type: String,
          enum: ["pending", "sent", "delivered", "read"],
        },
        messageSeen: {
          type: Boolean,
          default: true,
        },
      },
      { _id: false }
    ),
  },
});

module.exports = mongoose.model("Contact", contactSchema);
