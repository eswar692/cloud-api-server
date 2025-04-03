const express = require('express');
const router = express.Router();
const { api, getApi } = require('../controllers/apiController');
const verifyToken = require("../middlewares/userMiddleware")

// Route to handle API requests
router.post('/api-settings', verifyToken, api);
router.get('/get-api-settings', verifyToken, getApi);
module.exports = router;