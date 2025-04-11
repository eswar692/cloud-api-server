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
  fileUrl: {
    type: String,
    required: function () {
      return this.type === "image";
    },
  },
  messageId: {
    type: String,
  },
  file: {
    type: String,
    required: function () {
      return this.type === "file";
    },
  },
  timestamp: {
    type: Date,
  },
  cloudinaryId: {
    type: String,
    required: function () {
      return this.type === "file";
    },
  },
});

WebhookSchema.index({ sender: 1, receiver: 1 });

module.exports = mongoose.model("Webhook", WebhookSchema);
