const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../models/user");
const authMiddleware = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "ace-secret-key";
const GETOTP_API_KEY = process.env.GETOTP_API_KEY;
const GETOTP_SENDER_ID = process.env.GETOTP_SENDER_ID;
const GETOTP_TEMPLATE_ID = process.env.GETOTP_TEMPLATE_ID;

// ── In-memory OTP store ───────────────────────────────────────────────────────
const otpStore = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function issueToken(user) {
  return jwt.sign(
    { _id: user._id, name: user.name, phone: user.phone },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

// ── POST /api/auth/send-otp ───────────────────────────────────────────────────
router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone required" });

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ message: "Enter a valid 10-digit phone number" });
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    otpStore.set(cleanPhone, { otp, expiresAt, attempts: 0 });

    // Send via GetOTP
    await axios.post(
      "https://api.otp.dev/v1/verifications",
      {
        data: {
          channel: "sms",
          sender: GETOTP_SENDER_ID,
          phone: `91${cleanPhone}`,
          template: GETOTP_TEMPLATE_ID,
          code: otp,
        },
      },
      {
        headers: {
          "X-OTP-Key": GETOTP_API_KEY,
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );

    console.log(`✅ OTP sent to 91${cleanPhone}`);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ Send OTP error:", err.response?.data || err.message);
    res.status(500).json({
      message: "Failed to send OTP. Please try again.",
      error: err.response?.data || err.message,
    });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
router.post("/verify-otp", (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP required" });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const record = otpStore.get(cleanPhone);

    if (!record) {
      return res.status(400).json({ message: "No OTP requested for this number. Please request a new one." });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    record.attempts += 1;

    if (record.attempts > MAX_ATTEMPTS) {
      otpStore.delete(cleanPhone);
      return res.status(429).json({ message: "Too many attempts. Please request a new OTP." });
    }

    // ── Temporary test bypass (remove before production) ──────────────────────
    if (otp.trim() === '000000') {
      otpStore.delete(cleanPhone);
      console.log(`🧪 Test OTP bypass used for 91${cleanPhone}`);
      return res.json({ success: true, message: 'OTP verified' });
    }
    // ─────────────────────────────────────────────────────────────────────────

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ message: `Invalid OTP. ${MAX_ATTEMPTS - record.attempts} attempts remaining.` });
    }

    otpStore.delete(cleanPhone);
    console.log(`✅ OTP verified for 91${cleanPhone}`);
    res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    console.error("❌ Verify OTP error:", err.message);
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
});

// ── POST /api/auth/check-phone ────────────────────────────────────────────────
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

// ── POST /api/auth/register ───────────────────────────────────────────────────
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

// ── POST /api/auth/login ──────────────────────────────────────────────────────
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

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── DELETE /api/auth/me ───────────────────────────────────────────────────────
router.delete("/me", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete account", error: err.message });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post("/logout", (req, res) => {
  res.json({ success: true });
});

module.exports = router;