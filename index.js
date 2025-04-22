const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
require("dotenv").config();
//app.use(cors());

app.use(
  cors({
    origin: ["http://192.168.1.5:5173", "http://192.168.1.38:5173"],
    credentials: true,
  })
);
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");
app.use(cookieParser());

const { connectRedis } = require("./utils/redisClient");

const webhookRoute = require("./routes/webhookRoute");
const userRoute = require("./routes/userRoutes");
const apiRoute = require("./routes/apiRoutes");
const fileRoute = require("./routes/userSideFileROute");
const { initSocket } = require("./utils/socket");
const contactRoute = require("./routes/contactRoutes");
const message = require("./routes/messageRoutes");

app.use("/api", apiRoute);
app.use("/webhook", webhookRoute);
app.use("/user", userRoute);
app.use("/contact", contactRoute);
app.use("/file", fileRoute);
app.use("/message", message);

cloudinary.v2.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

mongoose
  .connect(process.env.mongo_url)
  .then(() => console.log("Connected to DB!"))
  .catch((err) => console.log("DB Connection Error:", err));

connectRedis();

const PORT = process.env.PORT || 80;
const server = app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server is running on port ${PORT}`)
);
initSocket(server);
