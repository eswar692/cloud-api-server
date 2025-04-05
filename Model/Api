const mongoose = require("mongoose");

const apiSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  whatsappId: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumberId: {
    type: String,
    required: true,
    unique: true,
  },
  accessToken: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
  },
  qualityRating: {
    type: String,
  },
  dispalyName: {
    type: String,
  },
});

const Api = mongoose.model("Api", apiSchema);

module.exports = Api;
