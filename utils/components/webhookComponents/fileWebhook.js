const Webhook = require("../../../Model/Webhook");
const Api = require("../.././../Model/Api");
const Contact = require("../.././../Model/Contact");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;


const getFileWebhook = async (data, accessToken) => {
  // Check if data is present and extract message, whatsappUserPhoneNumber, and apiNumber
  const message = data?.entry?.[0]?.changes?.[0].value?.messages?.[0];
  const apiNumber =
    data?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;
  const profileName =
    data?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile.name;

  const userApi = await Api.findOne({ phoneNumber: apiNumber });
  if (!userApi) return console.log("User not found");

  // first file send cheste webhook dwara ,media ID get chesi api call chesi next file ni cloudinary lo store chesi url mni store in DB
  const mediaId =
    message?.image?.id ||
    message?.video?.id ||
    message?.docs?.id ||
    message?.audio?.id;

  if (!data) return console.log("user not found");
  const fileUrl = await getFIleInWhatsapp(mediaId, accessToken);

  if (fileUrl) {
    const messageData = {
      sender: message?.from,
      receiver: apiNumber,
      name: profileName,
      type: "file",
      fileData: {
        fileType: message?.type,
        fileUrl: fileUrl.fileUrl,
        cloudinaryId: fileUrl.fileId,
        caption: message?.caption,
      },
      messageId: message?.id,
      timestamp: new Date(),
    };
    console.log("stage3");

    const webhook = await Webhook.create(messageData);
    await sendWebhooks(webhook, userApi.userId.toString());
  }
};





async function getFIleInWhatsapp(mediaId, accessToken) {
  // 1. Get media URL
  const getMediaUrl = await axios.get(
    `https://graph.facebook.com/v22.0/${mediaId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const mediaUrl = getMediaUrl.data.url;

  // 2. Download file as buffer
  const mediaRes = await axios.get(mediaUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    responseType: "arraybuffer", //
  });

  const buffer = mediaRes.data;

  // 3. Upload to Cloudinary
  const cloudinaryUrl = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve({ fileUrl: result.secure_url, fileId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });

  return cloudinaryUrl;
}

module.exports = { getFileWebhook };
