const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
require("dotenv").config();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
app.use(cookieParser());

const { connectRedis } = require("./utils/redisClient");

const webhookRoute = require("./routes/webhookRoute");
const userRoute = require("./routes/userRoutes");
const apiRoute = require("./routes/apiRoutes");
const { initSocket } = require("./utils/socket");
const contactRoute = require("./routes/contactRoutes");
app.use("/api", apiRoute);

app.use("/webhook", webhookRoute);
app.use("/user", userRoute);
app.use("/contact", contactRoute);

mongoose
  .connect(process.env.mongo_url)
  .then(() => console.log("Connected to DB!"))
  .catch((err) => console.log("DB Connection Error:", err));

connectRedis();

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () =>
  console.log(`Server is running on port ${PORT}`)
);
initSocket(server);
