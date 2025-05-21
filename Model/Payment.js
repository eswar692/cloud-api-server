const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
  },
  plan: {
    type: String,
    enum: [
      "free-Plan",
      "basic-Plan",
      "standard-Plan",
      "business-Plan",
      "expired",
    ],
  },
  amount: {
    type: Number,
    enum: [0, 10, 1100, 2200],
  },
  createdAt: {
    type: Number,
  },
  endPlanDate: {
    type: Number,
  },
  messageLimit: {
    type: mongoose.Schema.Types.Mixed,
    enum: [100, 500, 1000, "unlimited"],
  },
  prepaidOneMonth: {
    type: new mongoose.Schema(
      {
        plan: {
          type: String,
          enum: ["basic Plan", "Standard Plan", "business Plan"],
        },
        amount: {
          type: Number,
          enum: [600, 1100, 2200],
        },
        createdAt: {
          type: Number,
          default: function () {
            return this.endPlanDate + 1;
          },
        },
        endPlanDate: {
          type: Number,
        },
        messageLimit: {
          type: Number,
        },
      },
      { _id: false }
    ),
  },
  paymentDetails: {
    type: new mongoose.Schema(
      {
        order_id: {
          type: String,
        },
        payment_id: {
          type: String,
        },
        signature: {
          type: String,
        },
        status: {
          type: String,
          enum: ["pending", "success", "failed", "expired"],
        },
        invoice_id: {
          type: String,
        },
        invoice_url: {
          type: String,
        },
      },
      { _id: false }
    ),
  },
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
