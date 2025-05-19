const payment = require("../controllers/paymentController");
const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/userMiddleware");

router.post("/create-order", verifyToken, payment.paymentOrder);
router.get("/all-delete",  payment.allDelete);
router.post("/verify-payment",verifyToken, payment.verifyPayment);

module.exports = router;
