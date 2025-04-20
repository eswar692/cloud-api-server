const User = require("../Model/User");
const cloudinary = require("cloudinary").v2;
const Webhook = require("../Model/Webhook");
const { sendWebhooks } = require("../utils/socket");
const Api = require("../Model/Api");
const axios = require("axios");

const allowedTypes = {
  image: ["jpg", "jpeg", "png", "gif", "webp"],
  video: ["mp4", "avi", "mov", "mkv", "webm"],
  docs: ["pdf", "doc", "docx", "ppt", "pptx"],
};
const fileUpload = async (req, res) => {
  const userId = req.userId;
  const fileBuffer = req.file.buffer;
  const { caption, phoneNumber, profileName } = req.body;
  if (!userId || !fileBuffer || !phoneNumber || !profileName)
    return res
      .status(401)
      .json({ success: false, message: "All fields are required" });

  try {
    const apiData = await Api.findOne({ userId });
    if (!apiData) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const cloudinaryUrl = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) return reject(error);
          resolve({ fileUrl: result.secure_url, fileId: result.public_id });
        }
      );

      uploadStream.end(fileBuffer);
    });
    const fileExt = cloudinaryUrl.fileUrl.split(".").pop().toLowerCase();
    const imageType = allowedTypes.image.includes(fileExt);
    const videoType = allowedTypes.video.includes(fileExt);
    const docsType = allowedTypes.docs.includes(fileExt);
    let fileType = null;
    if (imageType) fileType = "image";
    else if (videoType) fileType = "video";
    else if (docsType) fileType = "docs";

    const message = {
      sender: apiData.phoneNumber,
      receiver: phoneNumber,
      name: profileName,
      type: "file",
      fileData: {
        fileType: fileType,
        fileUrl: cloudinaryUrl.fileUrl,
        cloudinaryId: cloudinaryUrl.fileId,
        caption: caption,
      },
      timestamp: new Date(),
    };
    const webhook = await Webhook.create(message);
    const sendFile = await axios.post(
      `https://graph.facebook.com/v22.0/${apiData.phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: `${phoneNumber}`,
        type: "image",
        image: {
          link: `${webhook.fileData.fileUrl}`,
          caption: `${webhook?.caption ? webhook.caption : ""}`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiData.accessToken}`,
        },
      }
    );
    if (sendFile.status === 200) {
    }
    return res.status(200).json({ success: true, data: webhook });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { fileUpload };
