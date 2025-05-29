const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/userMiddleware");
const { OnlyAutoReplyDefult, whenUserClickInactive, getAutoReply } = require("../controllers/autoReplyController");

router.post("/auto-reply-set-update", verifyToken,OnlyAutoReplyDefult);
router.post("/auto-reply-inactive", verifyToken, whenUserClickInactive);
router.get("/get-auto-reply", verifyToken, getAutoReply);

module.exports = router;
