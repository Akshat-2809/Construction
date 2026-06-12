const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authMiddleware = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "ace-secret-key";

function issueToken(user) {
  return jwt.sign(
    { _id: user._id, name: user.name, phone: user.phone },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

// POST /api/auth/check-phone
router.post("/check-phone", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone required" });
    const user = await User.findOne({ phone: phone.replace(/\s/g, "") });
    res.json({ exists: !!user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone)
      return res.status(400).json({ message: "Name and phone required" });

    const cleanPhone = phone.replace(/\s/g, "");
    const existing = await User.findOne({ phone: cleanPhone });
    if (existing)
      return res.status(409).json({ message: "Phone already registered. Please log in." });

    const user = await User.create({ name: name.trim(), phone: cleanPhone, phoneVerified: true });
    const token = issueToken(user);
    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, phone: user.phone, isAdmin: user.isAdmin },
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone required" });

    const cleanPhone = phone.replace(/\s/g, "");
    const user = await User.findOne({ phone: cleanPhone });
    if (!user)
      return res.status(404).json({ message: "Phone not registered. Please create an account." });

    const token = issueToken(user);
    res.json({
      token,
      user: { _id: user._id, name: user.name, phone: user.phone, isAdmin: user.isAdmin },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/auth/logout — client just deletes the token
router.post("/logout", (req, res) => {
  res.json({ success: true });
});

module.exports = router;