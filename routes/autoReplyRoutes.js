const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/userMiddleware");
const { OnlyAutoReplyDefult, whenUserClickInactive, getAutoReply, updateAutoReply, uploadImageToCloudinary } = require("../controllers/autoReplyController");

// Importing multer for file uploads
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post("/auto-reply-set-update", verifyToken,OnlyAutoReplyDefult);
router.post("/auto-reply-inactive", verifyToken, whenUserClickInactive);
router.get("/get-auto-reply", verifyToken, getAutoReply);
router.post("/update-auto-reply", verifyToken, updateAutoReply);
router.post("/upload-file", verifyToken, upload.single('autoreply-file'), uploadImageToCloudinary);

module.exports = router;
