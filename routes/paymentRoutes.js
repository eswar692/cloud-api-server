const payment = require("../controllers/paymentController");
const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/userMiddleware");

router.post("/create-order", verifyToken, payment.paymentOrder);
router.post("/verify-payment", verifyToken, payment.verifyPayment);
router.get("/get-payment", verifyToken, payment.getPayment);

module.exports = router;
