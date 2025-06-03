const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const verifyToken = require('../middlewares/userMiddleware');

router.post(
  '/otp-send-for-update-email',
  verifyToken,
  profileController.otpSendForUpdateEmail
);
router.post('/update-email', verifyToken, profileController.verifyOtp);
router.post('/update-password', verifyToken, profileController.updatePassword);

module.exports = router;
