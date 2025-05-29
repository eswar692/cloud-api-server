const AutoReply = require('../Model/autoreplay');



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


module.exports = {
    OnlyAutoReplyDefult,
    whenUserClickInactive,
    getAutoReply
}