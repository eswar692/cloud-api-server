const { Server } = require("socket.io");

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

  io.on("connection", (socket) => {
    const userId = socket.handshake.query?.userId;
    if (userId) {
      userObj.set(userId, socket.id);
      console.log(
        `user connected user ID :${userId} and soket ID:${socket.id}`
      );
    } else {
      console.log("user id required");
    }

    socket.on("disconnect", () => disConnect(socket));
  });
};

module.exports = initSocket;
