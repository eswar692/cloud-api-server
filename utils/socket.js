const { Server } = require("socket.io");
const Contact = require("../Model/Contact");
const Api = require("../Model/Api");
const Webhook = require("../Model/Webhook");

let io;
const userObj = new Map();

const sendContacts = async (userId) => {
  const socketId = userObj.get(userId);
  if (!socketId) return console.log("Socket ID not found for", userId);

  const userApi = await Api.findOne({ userId });
  if (!userApi) throw new Error("User not found");
  const phoneNumber = userApi.phoneNumber.replace(/\D/g, "");
  console.log(userApi.phoneNumber);
  const contacts = await Contact.find({
    userApiNumber: phoneNumber,
  }).sort({ whatsappUserTime: -1 });
  console.log("Sending contacts to", socketId);

  io.to(socketId).emit("contacts", contacts);
};

const sendWebhooks = async (message, userId) => {
  const socketId = userObj.get(userId);
  if (!socketId) return console.log("Socket ID not found for", userId);

  const userApi = await Api.findOne({ userId });
  if (!userApi) throw new Error("User not found");
  io.to(socketId).emit("receiveMessage", message);
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
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

    socket.on("disconnect", () => disConnect(socket));
  });
};

module.exports = {
  initSocket,
  sendContacts,
  sendWebhooks,
};
