const { Server } = require("socket.io");
const Contact = require("../Model/Contact");
const Api = require("../Model/Api");
const Webhook = require("../Model/Webhook");
const axios = require("axios").default;
let io;
const userObj = new Map();

const sendContacts = async (userId) => {
  const socketId = userObj.get(userId);
  if (!socketId) return console.log("Socket ID not found for", userId);

  const userApi = await Api.findOne({ userId });
  if (!userApi) console.log("User not found");
  const phoneNumber = userApi.phoneNumber.replace(/\D/g, "");
  const contacts = await Contact.find({
    userApiNumber: phoneNumber,
  }).sort({ whatsappUserTime: 1 });

  io.to(socketId).emit("contacts", contacts);
};

const individualChat = async (chat) => {
  const findUser = await Api.findOne({ phoneNumber: chat.apiNumber });
  if (!findUser) console.log("User not found");
  const userId = findUser.userId.toString();
  const socketId = userObj.get(userId);
  if (!socketId) return console.log("Socket ID not found for", userId);
  const messages = await Webhook.find({
    $or: [{ sender: chat.phoneNumber }, { receiver: chat.phoneNumber }],
  });
  if (!messages) console.log("Messages not found");
  io.to(socketId).emit("getIndividualChat", messages);
};
const sendWebhooks = async (message, userId) => {
  const socketId = userObj.get(userId);
  if (!socketId) return console.log("Socket ID not found for", userId);

  try {
    io.to(socketId).emit("receiveMessage", message);
  } catch (error) {
    console.error("Error sending webhook:", error);
  }
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173","http://192.168.1.5:5173"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  const disConnect = (socket) => {
    console.log(`user disconnected and soket ID:${socket.id}`);

    for (const { userId, socketId } of userObj.entries()) {
      if (socketId === socket.id) {
        userObj.delete(userId);
        console.log(`Removed userId: ${userId} from userObj`);
        break;
      }
    }
  };
  const sendMessage = async (message) => {
    console.log(message);
    const api = await Api.findOne({ phoneNumber: message.sender });
    const socketId = userObj.get(api.userId.toString());
    if (!socketId) {
      return console.log("no socket id found userId:", socketId);
    }
    const userId = api.userId.toString();
    const { data } = await axios.post(
      `https://graph.facebook.com/v22.0/${api.phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: message.receiver,
        type: "text",
        text: {
          body: message.textMessage,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${api.accessToken}`,
        },
      }
    );
    if (data.status === 200) {
      console.log("send mesage successfully");
    }
    message.messageId = data.messages[0].id;
    const messageSave = await Webhook.create(message);
    console.log(messageSave);
    io.to(socketId).emit("receiveMessage", messageSave);
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query?.userId;
    if (!userId) {
      console.log("user id required");
      return;
    }
    userObj.set(userId, socket.id);
    console.log(
      `user connected with userId ${userId} and soket ID:${socket.id}`
    );

    sendContacts(userId);
    socket.on("sendMessage", sendMessage);
    socket.on("individualChat", individualChat);

    socket.on("disconnect", () => disConnect(socket));
  });
};

module.exports = {
  initSocket,
  sendContacts,
  sendWebhooks,
};
