const User = require("../models/user");

// Must run AFTER authMiddleware (so req.user exists)
module.exports = async function adminMiddleware(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};