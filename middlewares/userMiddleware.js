const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Please login first" });
  }

  const decoded = await jwt.verify(token, process.env.secret_url_jwt);

  req.userId = decoded.id;

  next();
};
module.exports = verifyToken;
