const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "ace-secret-key";

module.exports = function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.ace_token;
    if (!token) {
      return res.status(401).json({ message: "Not logged in" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
};