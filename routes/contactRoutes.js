const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const verifyToken = require("../middlewares/userMiddleware");

router.get("/get-contacts", verifyToken, contactController.getContacts);
router.post(
  "/update-contact-new-message-seen",
  verifyToken,
  contactController.updateContactNewMessageSeen
);

module.exports = router;
