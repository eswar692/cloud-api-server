const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middlewares/userMiddleware");

// Route to handle sending OTP
router.post("/send-otp", userController.sendOtp);

// Route to handle verifying OTP and registering user
router.post("/verify-otp-and-register", userController.verifyOtpAndRegister);

// Route to handle updating user business details
router.put(
  "/business-details",
  verifyToken,
  userController.userBusinessDetails
);

// Route to handle deleting all user accounts development time only using API
router.delete("/delete-all", userController.allAccountsDelete);

// Route to handle user login
router.post("/login", userController.login);

// Route to handle getting user details
router.get("/get-user", verifyToken, userController.getUser);

// Route to handle user logout
router.post("/logout", verifyToken, userController.logout);


module.exports = router;
