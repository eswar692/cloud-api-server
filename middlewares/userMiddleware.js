const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.jwt;

  try {
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
  } catch (error) {
    console.error("Token verification error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(405).json({
        success: false,
        message: "Token expired, please login again",
      });
    }

    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
module.exports = verifyToken;
