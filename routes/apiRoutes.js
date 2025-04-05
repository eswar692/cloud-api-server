const express = require("express");
const router = express.Router();
const {
  api,
  getApi,
  getCloudApiDetails,
} = require("../controllers/apiController");
const verifyToken = require("../middlewares/userMiddleware");

// Route to handle API requests
router.post("/api-settings", verifyToken, api);
router.get("/get-api-settings", verifyToken, getApi);

// Route to handle API requests in get whatsapp cloud api details
router.get("/get-cloud-api-details", getCloudApiDetails);

module.exports = router;
