const express = require("express");
const router = express.Router();
const fileController = require("../controllers/userSideFile");
const multer = require("multer");
const verifyToken = require("../middlewares/userMiddleware");

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/file-upload",
  verifyToken,
  upload.single("file"),
  fileController.fileUpload
);

module.exports = router;
