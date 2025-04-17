const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/userMiddleware");
const { getIndividualChat } = require("../controllers/messagesController");

router.get("/person-chat/:phoneNumber", verifyToken, getIndividualChat);

module.exports = router;
