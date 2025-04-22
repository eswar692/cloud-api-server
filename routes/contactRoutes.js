const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const verifyToken = require("../middlewares/userMiddleware");

router.get("/get-contacts", verifyToken, contactController.getContacts);

module.exports = router;
