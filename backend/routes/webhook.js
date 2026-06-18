const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    console.log("✅ WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  }

  console.log("❌ WEBHOOK VERIFICATION FAILED");
  return res.sendStatus(403);
});

router.post("/", async (req, res) => {
  try {
    const body = req.body;

    console.log(
      "📩 Incoming message:",
      JSON.stringify(body, null, 2)
    );

    const message =
      body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    console.log("PHONE_NUMBER_ID =", process.env.PHONE_NUMBER_ID);
    console.log("TOKEN EXISTS =", !!process.env.WHATSAPP_TOKEN);

    const from = message.from;

    const userText =
      message.text?.body?.toLowerCase().trim() || "";

    let reply = `👋 Welcome to Myequipo

1️⃣ Rent Equipment
2️⃣ List Equipment
3️⃣ Contact Team

Reply with 1, 2 or 3`;

    if (userText === "1") {
      reply =
        "🚜 What equipment do you need? (Excavator, JCB, Crane, etc)";
    }

    if (userText === "2") {
      reply =
        "📋 Please send details of the equipment you'd like to list.";
    }

    if (userText === "3") {
      reply =
        "📞 Our team will contact you shortly.";
    }

    const url = `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`;

    console.log("REQUEST URL =", url);

    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: {
          body: reply,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("META RESPONSE =", response.data);
    console.log("✅ Reply Sent");

    return res.sendStatus(200);
  } catch (err) {
    console.error(
      "❌ Error:",
      err.response?.data || err.message
    );

    return res.sendStatus(500);
  }
});

module.exports = router;