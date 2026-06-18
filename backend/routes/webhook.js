const express = require("express");
const router = express.Router();

const VERIFY_TOKEN = "myequipo_verify_token";

router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  }

  console.log("❌ WEBHOOK VERIFICATION FAILED");
  return res.sendStatus(403);
});

router.post("/", (req, res) => {
  console.log("📩 Incoming message:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

module.exports = router;