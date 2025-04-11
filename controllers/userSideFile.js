const User = require("../Model/User");
const cloudinary = require("cloudinary").v2;
const FileType = require("file-type");

const allowedTypes = {
  image: ["jpg", "jpeg", "png", "gif", "webp"],
  video: ["mp4", "avi", "mov", "mkv", "webm"],
  docs: ["pdf", "doc", "docx", "ppt", "pptx"],
};
const fileUpload = async (req, res) => {
  const userId = req.userId;
  const fileBuffer = req.file.buffer;
  if (!type) return res.status(400).json({ error: "Unknown file type" });

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const cloudinaryUrl = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );

      uploadStream.end(fileBuffer);
    });
    const imageType = allowedTypes.image.includes(fileExt);
    const fileExt = cloudinaryUrl.split(".").pop().toLowerCase();
    const message =  {
      sender: selectedChatData?.userApiNumber,
      receiver: selectedChatData?.phoneNumber,
      name: selectedChatData?.displayName,
      type: "file",
      textMessage: undefined,
      fileUrl: fileTempUrl,
      timestamp: new Date(),
      file:() ,
    };
   
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
