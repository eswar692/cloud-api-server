const User = require("../Model/User");
const { sendOTP } = require("../utils/otpSend");
const { connectRedis } = require("../utils/redisClient");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const sendOtp = async (req, res) => {
  const { email: reqEmail } = req.body;
  const email = String(reqEmail);

  try {
    if (!email)
      return res
        .status(401)
        .json({ success: false, message: "Email is required" });
    const user = await User.findOne({ email });
    if (user) {
      console.log("user Exists");
      return res
        .status(401)
        .json({ success: false, message: "USer Already Exists please login" });
    }
    const sendOtp = await sendOTP(email);
    if (!sendOtp)
      return res
        .status(401)
        .json({ success: false, message: "Error while sending OTP" });

    const redis = await connectRedis();
    redis.set(email, sendOtp, { EX: 600 });
    return res
      .status(201)
      .json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in sendOtp:", error);
    return res.status(501).json({ success: false, message: error.message });
  }
};

const verifyOtpAndRegister = async (req, res) => {
  const { email, otp, name, password, mobileNumber } = req.body;
  try {
    if (!email || !otp)
      return res
        .status(401)
        .json({ success: false, message: "Email and OTP are required" });
    const redis = await connectRedis();
    const storedOtp = await redis.get(email);
    if (storedOtp !== otp)
      return res.status(401).json({ success: false, message: "Invalid OTP" });

    if (!name || !password || !mobileNumber)
      return res.status(401).json({
        success: false,
        message: "Name, password and mobile number are required",
      });
    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
    });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Error while creating user" });
    const maxAge = 1000 * 60 * 60 * 24; // 1 day
    const jwtFun = (id) => {
      return jwt.sign({ id }, process.env.secret_url_jwt, {
        expiresIn: maxAge,
      });
    };

    const token = await jwtFun(user._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge,
      secure: false,
      sameSite: "none",
    });
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return res
      .status(501)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const userBusinessDetails = async (req, res) => {
  const { businessName, address, pincode, state } = req.body;
  const userId = req.userId;
  if (!userId)
    return res
      .status(401)
      .json({ success: false, message: "User ID is required" });

  try {
    if (!businessName || !address || !pincode || !state)
      return res.status(401).json({
        success: false,
        message: "Business name, address, pincode and state are required",
      });
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });

    user.businessName = businessName;
    user.address = address;
    user.pincode = pincode;
    user.state = state;
    const updatedUser = await user.save();

    if (!updatedUser) {
      return res
        .status(401)
        .json({ success: false, message: "Error while updating user" });
    }
    return res.status(201).json({
      success: true,
      message: "Business details updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error in userBusinessDetails:", error);
    return res
      .status(501)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// login foun
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(401)
      .json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" }); //

    const maxAge = 1000 * 60 * 60 * 24 * 3; // 3 day
    const token = jwt.sign({ id: user._id }, process.env.secret_url_jwt, {
      expiresIn: maxAge,
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge,
      secure: false,
      sameSite: "lax",
      domain: "192.168.1.5",
    });
    return res
      .status(201)
      .json({ success: true, message: "User logged in successfully", user });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(501).json({ success: false, message: "Server error" });
  }
};

// get User
const getUser = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User ID is required" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    return res.status(201).json({ success: true, message: "User found", user });
  } catch (error) {
    console.error("get user error:", error);
    return res.status(501).json({ success: false, message: "Server error" });
  }
};

//development time lo
const allAccountsDelete = async (req, res) => {
  try {
    await User.deleteMany();
    return res
      .status(201)
      .json({ success: true, message: "All accounts deleted successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(501).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  sendOtp,
  verifyOtpAndRegister,
  userBusinessDetails,
  allAccountsDelete,
  login,
  getUser,
};
