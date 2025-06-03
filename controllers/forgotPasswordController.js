const User = require('../Model/User');
const { generateOTP, mailOptions, sendOTP } = require('../utils/otpSend');
const connectRedis = require('../utils/redisClient');
const bcryptjs = require('bcryptjs');

// Controller Function
const sendOtpController = async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res
      .status(400)
      .json({ success: false, message: 'Email is required' });

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found with this email' });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    const options = mailOptions({
      title: 'Verify Your Email',
      email,
      message: { text: 'Verify Your Email', main: null, sub: null },
      otp
    });
    // send email message
    const sendOtpMail = await sendOTP(email, options, otp);
    // if sendOtpMail return otp ok send suuccusfully led error vundhi
    if (!sendOtpMail)
      return res
        .status(500)
        .json({ success: false, message: 'Failed to send OTP' });

    //store otp in redis
    await connectRedis.set(email, sendOtpMail, 'EX', 600);

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

const otpVerifyAndUpdatePassword = async (req, res) => {
  const { password, otp, email } = req.body;
  if (!password || !otp || !email) {
    return res
      .status(400)
      .json({
        success: false,
        message: 'OTP or Password or Email are required'
      });
  }
  try {
    const user = await User.findById({ email });
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
    const hashedPassword = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return res
      .status(200)
      .json({
        success: true,
        message: 'OTP verified successfully and update Password'
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
};

module.exports = { sendOtpController, otpVerifyAndUpdatePassword };
