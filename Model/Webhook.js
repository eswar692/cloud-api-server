const mongoose = require("mongoose");

const WebhookSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  receiver: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  textMessage: {
    type: String,
    required: function () {
      return this.type === "text";
    },
  },
  imageMessage: {
    type: String,
    required: function () {
      return this.type === "image";
    },
  },
  messageId: {
    type: String,
  },
  timestamp: {
    type: Date,
  },
});

WebhookSchema.index({ sender: 1, receiver: 1, messageId: 1 });

module.exports = mongoose.model("Webhook", WebhookSchema);
