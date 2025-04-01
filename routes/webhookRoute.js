const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
require('dotenv').config()

// Define a route for handling webhooks

// this route is verified by facebook edi facebook check to test chestundi
router.get('/data', (req, res) => {
    const VERIFY_TOKEN = process.env.myToken;

    const token = req.query['hub.verify_token'];

    if ( token === VERIFY_TOKEN) {
        console.log('Webhook verified successfully!');
        return res.status(200).send(req.query['hub.challenge']);
    } else {
        console.log('Verification failed!');
        return res.status(401).send('Verification failed!');
    }
});

// this route is used to get the data from the webhook 
router.post('/data', webhookController.getWebhooks);



// this route is used to delete all the messages from the database edi only development 
router.delete('/delete-all', webhookController.deleteAllMessages);

module.exports = router;

