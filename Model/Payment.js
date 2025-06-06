const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true
  },
  freePlanActive: {
    type: String,
    enum: ['completed', 'active', 'not-used'],
    default: 'not-used'
  },
  plan: {
    type: String,
    enum: [
      'free-Plan',
      'basic-Plan',
      'standard-Plan',
      'business-Plan',
      'expired'
    ]
  },
  amount: {
    type: Number,
    enum: [0, 1199, 1999, 2999]
  },
  createdAt: {
    type: Number
  },
  endPlanDate: {
    type: Number
  },
  messageLimit: {
    type: mongoose.Schema.Types.Mixed,
    enum: [0, 7000, 10000, 'unlimited']
  },
  prepaidOneMonth: {
    type: new mongoose.Schema(
      {
        plan: {
          type: String,
          enum: ['basic Plan', 'Standard Plan', 'business Plan']
        },
        amount: {
          type: Number,
          enum: [600, 1100, 2200]
        },
        createdAt: {
          type: Number,
          default: function () {
            return this.endPlanDate + 1;
          }
        },
        endPlanDate: {
          type: Number
        },
        messageLimit: {
          type: Number
        }
      },
      { _id: false }
    )
  },
  paymentDetails: {
    type: new mongoose.Schema(
      {
        order_id: {
          type: String
        },
        payment_id: {
          type: String
        },
        signature: {
          type: String
        },
        status: {
          type: String,
          enum: ['pending', 'success', 'failed', 'expired']
        },
        invoice_id: {
          type: String
        },
        invoice_url: {
          type: String
        }
      },
      { _id: false }
    )
  },
  messageCountTracker: {
    type: Number,
    default: 0
  }
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
