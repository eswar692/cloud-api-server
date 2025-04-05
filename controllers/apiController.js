const Api = require("../Model/Api");
const User = require("../Model/User");
const axios = require("axios");
const { connectRedis } = require("../utils/redisClient");


const api = async (req, res) => {
  const userId = req.userId;
  const { whatsappId, phoneNumberId, accessToken } = req.body;
  if (!whatsappId || !phoneNumberId || !accessToken || !userId) {
    return res.status(401).json({
      success: false,
      message: "Please provide all required fields",
    });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    const api = await Api.create({
      userId: user._id,
      whatsappId,
      phoneNumberId,
      accessToken,
    });

    res.status(201).json({
      success: true,
      message: "API is working",
    });
  } catch (error) {
    res.status(501).json({
      success: false,
      message: error.message,
    });
  }
};

const getApi = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User ID is required",
    });
  }
  try {
    const api = await Api.find({ userId });
    if (!api) {
      return res.status(401).json({
        success: false,
        message: "API not found",
      });
    }
    const data = api;

    res.status(201).json({
      success: true,
      data: api[0],
    });
  } catch (error) {
    res.status(501).json({
      success: false,
      message: error.message,
    });
  }
};

//GET in whatsapp CLoud api details
const getCloudApiDetails = async (req, res) => {
  const { userId } = req;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User ID is required",
    });
  }
  try {
    // Check if the user exists
    const redis = await connectRedis();
    const redisGet = await redis.get(`${userId}api`);
    if (redisGet) {
      const api = JSON.parse(redisGet);
      const { data } = await axios.get(`https://graph.facebook.com/v22.0/${api.phoneNumberId}`, {
        headers: {
          Authorization: `Bearer ${api.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      return res.status(201).json({
        success: true,
        message: "API is working",
        data: api,
        apiDetails: data,
      });
    }


    const api = await Api.findOne({ userId });
    if (!api) {
      return res.status(401).json({
        success: false,
        message: "API not found",
      });
    }
    // Check if the API is already stored in Redis
    const redisValue = await redis?.set(
      `${api.userId}api`,
      JSON.stringify(api),
      "EX",
      24 * 60 * 60
    ); // Set expiration time to 24 hours
    

    if (!api?.phoneNumber) {
      const { data } = await axios.get(
        `https://graph.facebook.com/v22.0/${api.phoneNumberId}`,
        {
          headers: {
            Authorization: `Bearer ${api.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!data) {
        return res.status(401).json({
          success: false,
          message: "API not found",
        });
      }
      api.phoneNumber = data.display_phone_number;
      api.qualityRating = data.quality_rating;
      api.dispalyName = data.verified_name;
      const updatedApi = await api.save();
      if (!updatedApi) {
        return res.status(401).json({
          success: false,
          message: "API not found",
        });
      }

      return res.status(201).json({
        success: true,
        message: "API is working",
        data: updatedApi,
        apiDetails: data,
      });
    }

    if (api.phoneNumber) {
      const { data } = await axios.get(
        `https://graph.facebook.com/v22.0/${api.phoneNumberId}`,
        {
          headers: {
            Authorization: `Bearer ${api.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if(data.verified_name !== api.dispalyName) {
        api.dispalyName = data.verified_name;
        api.save();
      }
      if(data.quality_rating !== api.qualityRating) {
        api.qualityRating = data.quality_rating;
        api.save();

      }

      return res.status(201).json({
        success: true,
        message: "API is working",
        data: api,
        apiDetails: data,
      });
    }
  } catch (error) {
    res.status(501).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { api, getApi, getCloudApiDetails };
