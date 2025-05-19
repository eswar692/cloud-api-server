const { Server } = require("socket.io");
const Contact = require("../Model/Contact");
const Api = require("../Model/Api");
const Webhook = require("../Model/Webhook");
const axios = require("axios").default;
let io;
const userObj = new Map();

const sendContacts = async (data) => {
  if (!data) return;
  const message = data?.entry?.[0]?.changes?.[0].value?.messages?.[0];
  const displayName =
    data?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile.name;
  const apiNumber =
    data?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;
  if (!message || !apiNumber || !displayName) return;

  const userApi = await Api.findOne({ phoneNumber: apiNumber });
  if (!userApi) console.log("User not found");
  const socketId = userObj.get(userApi.userId.toString());
  if (!socketId)
    return console.log("Socket ID not found for", userApi.userId.toString());
  const contact = await Contact.findOne({
    userApiNumber: userApi.phoneNumber,
    phoneNumber: message.from,
  });
  const tempContact = {
    apiNumber: userApi.phoneNumber,
    phoneNumber: message.from,
    displayName: displayName,
    whatsappUserTime: new Date(parseInt(message?.timestamp) * 1000),
    lastMessage: {
      messageType: message?.type,
      textMessage: message?.text?.body || null,
      messageTimestamp: new Date(parseInt(message?.timestamp) * 1000),
      messageSeen: true,
      messageCount: contact?.lastMessage.messageCount + 1,
    },
  };

  io.to(socketId).emit("receiveContacts", tempContact);
};

const sendWebhooks = async (message, userId) => {
  // console.log("send webhook", message, userId);
  const socketId = userObj.get(userId);
  if (!socketId) return console.log("Socket ID not found for", userId);

  try {
    io.to(socketId).emit("receiveMessage", message);
  } catch (error) {
    console.error("Error sending webhook:", error);
  }
};

const initSocket = (server) => {
  const allowedOrigin = ["http://192.168.4.183:5173"];
  io = new Server(server, {
    cors: {
      origin: function (origin, callBack) {
        if (!origin) {
          return callBack(null, true);
        }
        if (allowedOrigin.includes(origin)) {
          return callBack(null, true);
        } else {
          return callBack(new Error("Not Allowed this Origin", false));
        }
      },
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
    const socketId = userObj.get(api?.userId.toString());
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
      const contact = await Contact.findOneAndUpdate(
        { userApiNumber: api.phoneNumber, phoneNumber: message.receiver },
        {
          $set: {
            whatsappUserTime: message.timestamp,
            lastMessage: {
              messageType: message.type,
              textMessage: message?.textMessage,
              messageTimestamp: message?.timestamp,
              messageSeen: false,
              messageCount: 0,
            },
          },
        },
        { new: true }
      );
    }
    message.messageId = data.messages[0].id;
    const messageSave = await Webhook.create(message);
    console.log(messageSave);
    // io.to(socketId).emit("receiveMessage", messageSave); this atep not need because we already emit in sendWebhooks function
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

    // sendContacts(userId);
    socket.on("sendMessage", sendMessage);

    socket.on("disconnect", () => disConnect(socket));
  });
};

module.exports = {
  initSocket,
  sendContacts,
  sendWebhooks,
};
