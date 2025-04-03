
const Api = require("../Model/Api");
const User = require("../Model/User");



const api = async(req, res) => {
    const userId = req.userId
    const {whatsappId, phoneNumberId, accessToken} = req.body;
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
        const api = await Api.create(
            {
                userId:user._id,
                 whatsappId, 
                 phoneNumberId,
                  accessToken
            }
        );
        

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
}

const getApi = async(req, res) => {
    const userId = req.userId
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "User ID is required",
        });
    }
    try {
        const api = await Api.find({userId});
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
}


module.exports = {api, getApi};