const mongoose = require("mongoose");

const WebhookSchema = new mongoose.Schema({
  sender: {
    type: String,
  },
  receiver: {
    type: String,
  },
  name: {
    type: String,
  },
  type: {
    type: String,
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
  autoReply:{
    type: new mongoose.Schema({
      messageId: {
        type: String,
      },
      

    }, { _id: false }),
  },
  context:{
    type: new mongoose.Schema({
      messageId: {
        type: String,
      },
      
    }, { _id: false }),
  },
  referral : new mongoose.Schema({
    type: {
      type: String,
      enum: ['ad',"post"]
    },
    url: {
      type: String,
    },
    media_type: {
      type: String,
      enum: ['image', 'video'],
    },
  })

  
});

WebhookSchema.index({ sender: 1, receiver: 1, timestamp: 1, messageId: 1 });
// auto delete after 4 months
WebhookSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 * 4 }
);

module.exports = mongoose.model("Webhook", WebhookSchema);
