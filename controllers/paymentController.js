const Api = require("../Model/Api");
const Payment = require("../Model/Payment");
const axios = require("axios");
const Razorpay = require("razorpay");
require("dotenv").config();
const crypto = require("crypto");

//razorpay
const razorpay = new Razorpay({
  key_id: process.env.key,
  key_secret: process.env.key_secret,
});

const paymentOrder = async (req, res) => {
  const userId = req.userId;
  const plan = req.body.plan;
  const country = req.body.country;
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User ID is required" });
  }
  try {
    const user = await Api.findOne({ userId });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    if (!plan) {
      return res
        .status(401)
        .json({ success: false, message: "Plan is required" });
    }

    if (plan === "free-Plan") {
      const payment = await Payment.create({
        userId: user.userId,
        plan: "free-Plan",
        amount: 0,
        createdAt: Date.now()/1000,
        messageLimit: 100,
      });
      return res
        .status(201)
        .json({ success: true, message: "Free Plan Purchased", payment });
    }

    // basic-plan
    if (plan === "basic-Plan") {
      const option = {
        amount: 600 * 100,
        currency: country,
        receipt: `req${Date.now()}`,
      };
      // Oder Api calls
      const order = await razorpay.orders.create(option);
      if (!order) {
        return res
          .status(401)
          .json({ success: false, message: "Order not created" });
      }
      let payment = await Payment.findOne({ userId });

      if (!payment) {
        const paymentCreate = await Payment.create({
          userId: user.userId,
          paymentDetails: {
            order_id: order?.id,
            status: "pending",
          },
        });
      }
      if (!payment.paymentDetails) {
        payment.paymentDetails = {};
      }
      payment.paymentDetails.order_id = order?.id;
      payment.paymentDetails.status = "pending";
      const updatePlanReq = await payment.save();

      return res
        .status(201)
        .json({ success: true, message: "Basic Plan Order Created", order });
    }

    // standard-plan
    if (plan === "standard-Plan") {
      const option = {
        amount: 1100 * 100,
        currency: country,
        receipt: `req${Date.now()}`,
      };
      // Oder Api calls
      const order = await razorpay.orders.create(option);
      if (!order) {
        return res
          .status(401)
          .json({ success: false, message: "Order not created" });
      }
      const payment = await Payment.findOne({ userId });

      if (!payment) {
        const payment = await Payment.create({
          userId: user.userId,
          paymentDetails: {
            order_id: order?.id,
            status: "pending",
          },
        });
      }
      if (!payment.paymentDetails) {
        payment.paymentDetails = {};
      }
      payment.paymentDetails.order_id = order?.id;
      payment.paymentDetails.status = "pending";
      const updatePlanReq = await payment.save();
      return res
        .status(201)
        .json({ success: true, message: "standard Plan order created", order });
    }

    // standard-plan
    if (plan === "business-Plan") {
      const option = {
        amount: 2200 * 100,
        currency: country,
        receipt: `req${Date.now()}`,
      };
      // Oder Api calls
      const order = await razorpay.orders.create(option);
      const payment = await Payment.findOne({ userId });

      if (!payment) {
        const payment = await Payment.create({
          userId: user.userId,
          paymentDetails: {
            order_id: order?.id,
            status: "pending",
          },
        });
      }
      if (!payment.paymentDetails) {
        payment.paymentDetails = {};
      }
      payment.paymentDetails.order_id = order?.id;
      payment.paymentDetails.status = "pending";
      const updatePlanReq = await payment.save();
      return res
        .status(201)
        .json({ success: true, message: "business Plan order created", order });
    }

    return res.status(201).json({ success: false, message: "Plan not found" });
  } catch (error) {
    console.error("get user error:", error);
    return res.status(501).json({ success: false, message: "Server error" });
  }
};

const verifyPayment = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan } =
    req.body;
  const userId = req.userId;
  const user = await Api.findOne({ userId });
  if (!user) {
    return res.status(401).json({ success: false, message: "User not found" });
  }
  const payment = await Payment.findOne({ userId });
  if (!payment) {
    return res
      .status(401)
      .json({ success: false, message: "Payment not found" });
  }
  try {
    const rzrSecreteKey = process.env.key_secret;
    const dataBody = razorpay_order_id + "|" + razorpay_payment_id;
    const signatureVerify = crypto
      .createHmac("sha256", rzrSecreteKey)
      .update(dataBody);

    if (signatureVerify === razorpay_signature) {
      const timeInSeconds = (Date.now()/1000)
        (payment.plan = plan),
        (payment.amount =
          plan === "basic-Plan"
            ? 10
            : plan === "standard-Plan"
            ? 1100
            : plan === "business-Plan" && 2200);
        payment.createdAt = timeInSeconds
        payment.endPlanDate = (timeInSeconds + (30 * 24 * 60 * 60) )
        payment.messageLimit =
          plan === "basic-Plan"
            ? 100
            : plan === "standard-Plan"
            ? 500
            : plan === "business-Plan" && "unlimited";
        payment.paymentDetails={
          payment_id: razorpay_payment_id,
          signature: razorpay_signature,
          status: "success"
        }
        await payment.save()
        return res
        .status(201)
        .json({ success: true, message: "Payment verified successfully" });

    }else{
      payment.paymentDetails.status = "failed"
      await payment.save()
      return res.status(401).json({success:false,message:"payment failed"})
    }

  } catch (error) {
   console.log(error)
   return res.status(501).json({success:false, message:"internal server error"})
  }

};

const allDelete = async (req, res) => {
  try {
    await Payment.deleteMany();
    return res
      .status(201)
      .json({ success: true, message: "All payments deleted successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(501).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  paymentOrder,
  allDelete,
};
