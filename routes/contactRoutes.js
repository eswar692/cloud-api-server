const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const verifyToken = require('../middlewares/userMiddleware');

router.get('/get-contacts', verifyToken, contactController.getContacts);
router.post(
  '/update-contact-new-message-seen',
  verifyToken,
  contactController.updateContactNewMessageSeen
);
router.post(
  '/delete-contacts-with-selected',
  verifyToken,
  contactController.deleteContactsWithSelected
);
router.post(
  '/delete-all-except-selected-messages',
  verifyToken,
  contactController.deleteAllExceptSelectedMessages
);

module.exports = router;
