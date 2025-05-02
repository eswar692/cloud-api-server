const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    const tokenHeader = req.headers["authorization"]?.split(" ")[1];
    if (!tokenHeader) {
      return res
        .status(401)
        .json({ success: false, message: "Please login first" });
    }
    const decoded = await jwt.verify(tokenHeader, process.env.secret_url_jwt);
    req.userId = decoded.id;
    return next();
  }

  const decoded = await jwt.verify(token, process.env.secret_url_jwt);

  req.userId = decoded.id;

  next();
};
module.exports = verifyToken;
