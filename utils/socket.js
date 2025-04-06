const { Server } = require("socket.io");
const Contact = require("../Model/Contact");
const Api = require("../Model/Api");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  const userObj = new Map();

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

  /*************  ✨ Windsurf Command 🌟  *************/
  const sendContacts = async (userId) => {
    const socketId = userObj.get(userId);
    if (!socketId) return console.log("Socket ID not found for", userId);

    const userApi = await Api.findOne({ userId });
    if (!userApi) throw new Error("User not found");
    const phoneNumber = userApi.phoneNumber.split(" ");
    console.log(userApi.phoneNumber);
    const contacts = await Contact.find({
      userApiNumber: userApi.phoneNumber,
    }).sort({ whatsappUserTime: -1 });
    console.log("Sending contacts to", socketId);

    io.to(socketId).emit("contacts", contacts);
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

    socket.on("disconnect", () => disConnect(socket));
  });
};

module.exports = initSocket;
