const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// Route to handle fetching all contacts
router.get("/", contactController.findAllContacts);

module.exports = router;
