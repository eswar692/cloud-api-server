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
  fileData: {
    type: new mongoose.Schema(
      {
        fileType: {
          type: String,
          required: function () {
            return this.type === "file";
          },
          enum: ["image", "video", "docs", "audio"],
        },
        fileUrl: {
          type: String,
          required: function () {
            return this.type === "file";
          },
        },
        cloudinaryId: {
          type: String,
          required: function () {
            return this.type === "file";
          },
        },
        caption: String,
      },
      { _id: false }
    ),
  },
  messageId: {
    type: String,
  },

  timestamp: {
    type: Number,
  },
  tempId: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "sent", "delivered", "read", "failed"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

WebhookSchema.index({ sender: 1, receiver: 1, timestamp: 1, messageId: 1 });
// auto delete after 4 months
WebhookSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 * 4 }
);

module.exports = mongoose.model("Webhook", WebhookSchema);
