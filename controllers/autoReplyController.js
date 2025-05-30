const AutoReply = require('../Model/autoreplay');
const cloudinary = require('../utils/cloudinary').v2;



const OnlyAutoReplyDefult = async (req, res) => {
    const userId = req.userId 
  
  try {
    const autoReply = await AutoReply.findOne({ userId });
    if (autoReply) { 
        autoReply.isActive = true; 
        await autoReply.save();
      return res.status(200).json({ success: true,message: "Auto Reply DB Alredy created but it is active now" });
    }

    const newAutoReply = await AutoReply.create({
        userId,
        header: {
            type: "image",
            url: "https://prodaddyagency.com/wp-content/uploads/2024/07/Pro-daddy-agency-2.png"
        },
        body: "Hello, this is a default auto reply message.",
        footer: "Thank you for reaching out!",
        button1: {
            lable: "About Us",
            message: "Learn more about us"
        },
        button2: {
            lable: "Contact Us",
            message: "Get in touch with us"
        },
        button3: {
            lable: "Talk to us",
            message: "Let's chat",
        },
        isActive: true
    })
    return res.status(200).json({ success: true, message: "Auto Reply DB created successfully", autoReply: newAutoReply });
   
  } catch (error) {
    console.error("Error fetching auto reply:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const whenUserClickInactive = async (req, res) => {
    const userId = req.userId;
    
    try {
        const autoReply = await AutoReply.findOne({ userId });
        if (!autoReply) {
            return res.status(404).json({ success: false, message: "Auto Reply not found" });
        }
        autoReply.isActive = false;
        await autoReply.save();
        return res.status(200).json({ success: true, message: "Auto Reply is now inactive" });
    }
    catch (error) {
        console.error("Error fetching auto reply:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getAutoReply = async (req, res) => {
    const userId = req.userId;
    try {
      const autoReply = await AutoReply.findOne({userId});
        if (!autoReply) {
            return res.status(404).json({ success: false, message: "Auto Reply not found" });
        }
        return res.status(200).json({ success: true,message: "Auto Reply fetched successfully", autoReply });
    } catch (error) {
        console.error("Error fetching auto reply:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// autoreply update chese API
const updateAutoReply = async (req, res) => {
    const userId = req.userId;
    const { header, body, footer, button1, button2, button3 } = req.body;

    try {
        const autoReply = await AutoReply.findOne({ userId });
        if (!autoReply) {
            return res.status(404).json({ success: false, message: "Auto Reply not found" });
        }

        autoReply.header = header ;
        autoReply.body = body ;
        autoReply.footer = footer ;
        autoReply.button1 = button1 ;
        autoReply.button2 = button2 ;
        autoReply.button3 = button3 ;

        await autoReply.save();
        return res.status(200).json({ success: true, message: "Auto Reply updated successfully", autoReply });
    } catch (error) {
        console.error("Error updating auto reply:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// auto reply lo image cloud lo store in cloudinary
const uploadImageToCloudinary = async (req, res) => {
    const userId = req.userId;

    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Check if userId exists
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const autoreplay = await AutoReply.findOne({ userId });
        if (!autoreplay) {
            return res.status(404).json({ success: false, message: "Auto Reply not found" });
        }
        
        // 1. Delete old image if exists
        if (autoreplay?.header?.publicId) {
            await cloudinary.uploader.destroy(autoreplay.header.publicId);
        }

        // Upload new image
        const result = await cloudinary.uploader.upload(req.file.buffer, {
            folder: "autoreply_images", 
            public_id: `${userId}_profile`, 
        });

        return res.status(200).json({ 
            success: true, 
            message: "Image uploaded successfully", 
            url: result.secure_url,
            publicId: result.public_id 
        });
    } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}


module.exports = {
    OnlyAutoReplyDefult,
    whenUserClickInactive,
    getAutoReply,
    updateAutoReply,
    uploadImageToCloudinary
}