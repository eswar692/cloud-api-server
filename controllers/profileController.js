const User = require('../Model/User');
const { generateOTP, mailOptions, sendOTP } = require('../utils/otpSend');
const connectRedis = require('../utils/redisClient');
const bcryptjs = require('bcryptjs');

const otpSendForUpdateEmail = async (req, res) => {
  const userId = req.userId;
  const { email } = req.body;
  if (!email && !userId) {
    return res
      .status(400)
      .json({ success: false, message: 'userId or email is required' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    const otp = generateOTP();
    const options = mailOptions({
      title: 'Verify Your Email',
      email,
      message: { text: 'Verify Your Email', main: null, sub: null },
      otp
    });
    const sendOtpMail = await sendOTP(email, options, otp);
    if (!sendOtpMail)
      return res
        .status(500)
        .json({ success: false, message: 'Failed to send OTP' });

    //store otp in
    await connectRedis.set(email, sendOtpMail, 'EX', 600);

    return res
      .status(200)
      .json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

const verifyOtp = async (req, res) => {
  const userId = req.userId;
  const { email, otp } = req.body;
  if (!email || !otp || !userId) {
    return res
      .status(400)
      .json({ success: false, message: 'Email and OTP or UseID are required' });
  }
  try {
    const user = await User.findById(userId);
    //find user by userId
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    //first check otp is valid or not
    const storedOtp = await connectRedis.get(email);
    if (storedOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    // next update email in user collection
    user.email = email;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
};

// update password
const updatePassword = async (req, res) => {
  const userId = req.userId;
  const { password } = req.body;
  if (!password || !userId) {
    return res
      .status(400)
      .json({ success: false, message: 'Password or UseID are required' });
  }
  try {
    const user = await User.findById(userId);
    //find user by userId
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to update password' });
  }
};

module.exports = {
  otpSendForUpdateEmail,
  verifyOtp,
  updatePassword
};
