const router = require('express').Router();
const {
  sendOtpController,
  otpVerifyAndUpdatePassword
} = require('../controllers/forgotPasswordController');

router.post('/send-otp', sendOtpController);
router.post('/otp-verify-password-update', otpVerifyAndUpdatePassword);

module.exports = router;
