const Api = require("../Model/Api");
const Webhook = require("../Model/Webhook");

const getIndividualChat = async (req, res) => {
  const { userId } = req;
  const getCustomerPhoneNumber = req.params.phoneNumber;
  //   if (!userId || !getCustomerPhoneNumber) {
  //     return res.status(401).json({
  //       success: false,
  //       message: "userId and customer phoneNumber are required",
  //     });
  //   }
  try {
    const userApi = await Api.findOne({ userId });
    if (!userApi) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    const messages = await Webhook.find({
      $or: [
        { sender: userApi.phoneNumber, receiver: getCustomerPhoneNumber },
        { sender: getCustomerPhoneNumber, receiver: userApi.phoneNumber },
      ],
    });

    if (!messages) {
      return res
        .status(401)
        .json({ success: false, message: "Messages not found" });
    }
    return res
      .status(201)
      .json({ success: true, message: "Messages found", data: messages });
  } catch (error) {
    return res.status(501).json({ success: false, message: error.message });
  }
};

module.exports = { getIndividualChat };
