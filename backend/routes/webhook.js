const express = require("express");
const axios = require("axios");

const router = express.Router();

// ── In-memory session store ──────────────────────────────────────────────────
// Stores conversation state per phone number.
// Format: { step: string, data: {} }
// For production replace with Redis: sessions.set/get via ioredis
const sessions = new Map();

function getSession(phone) {
  if (!sessions.has(phone)) {
    sessions.set(phone, { step: "idle", data: {} });
  }
  return sessions.get(phone);
}

function setSession(phone, update) {
  const current = getSession(phone);
  sessions.set(phone, { ...current, ...update });
}

function clearSession(phone) {
  sessions.set(phone, { step: "idle", data: {} });
}

// ── Constants ────────────────────────────────────────────────────────────────
const SITE_URL = "https://myequipo.com";

const MACHINE_TYPES = [
  "excavator", "concrete pump", "fiori", "jcb", "crane",
  "hydra", "mobile crane", "mixer",
  // Hindi equivalents
  "खुदाई", "क्रेन", "मिक्सर",
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function containsAny(text, keywords) {
  return keywords.some((kw) => text.includes(kw));
}

function isGreeting(text) {
  return containsAny(text, [
    "hi", "hello", "hey", "hlo", "hii", "start", "menu",
    "namaste", "namaskar", "नमस्ते", "हेलो", "help", "हेल्प",
  ]);
}

function isMachineRequest(text) {
  return containsAny(text, [
    "rent", "hire", "need", "want", "chahiye", "चाहिए",
    "किराया", "किराए", "book", "find machine", "machine chahiye",
    ...MACHINE_TYPES,
  ]);
}

function isListRequest(text) {
  return containsAny(text, [
    "list", "sell", "rent out", "post", "register", "add machine",
    "dena hai", "देना है", "list karna", "apni machine",
  ]);
}

function isContactRequest(text) {
  return containsAny(text, [
    "contact", "call", "support", "team", "help",
    "problem", "issue", "baat", "बात", "संपर्क",
  ]);
}

// ── Message builder ──────────────────────────────────────────────────────────
function mainMenu() {
  return `👋 Welcome to *Myequipo* — India's construction machinery marketplace!

What would you like to do?

1️⃣ *Rent a machine* — Find excavators, cranes, JCBs & more
2️⃣ *List your machine* — Earn by renting out your equipment
3️⃣ *Post a request* — Tell us what you need, owners will contact you
4️⃣ *Talk to our team* — Get help or ask a question

Reply with *1, 2, 3 or 4* 👇`;
}

function rentMenu() {
  return `🚜 *Find a machine on Myequipo*

We have Excavators, Concrete Pumps, Fioris, JCBs, Cranes and more.

👉 Browse all available machines here:
${SITE_URL}/machinery

You can filter by:
• Machine type
• Location
• Availability
• Price range

Or reply with the *machine type* you need (e.g. "Excavator") and I'll help you further.

Type *0* to go back to the main menu.`;
}

function listMenu() {
  return `📋 *List your machine on Myequipo*

Listing is *completely free* — no commission, no hidden fees.

👉 List your machine here:
${SITE_URL}/machinery/register

You'll need:
• Machine type, company & model
• Location & rate per month
• Your contact number (verified via OTP)

It takes less than *2 minutes* to go live! ✅

Type *0* for main menu.`;
}

function requestMenu() {
  return `📢 *Post a machine request*

Can't find what you need? Post a request and let machine owners come to *you*!

👉 Post your requirement here:
${SITE_URL}/machinery/request

Just fill in:
• Machine type needed
• Your location
• Required dates & budget

Machine owners in your area will contact you directly. 📞

Type *0* for main menu.`;
}

function contactMenu() {
  return `📞 *Contact Myequipo Team*

For support or queries, reach us at:

🌐 Website: ${SITE_URL}
📧 Help center: ${SITE_URL}/help

Our team will get back to you within *24 hours*.

Type *0* for main menu.`;
}

function machineTypeResponse(machineType) {
  const type = machineType.charAt(0).toUpperCase() + machineType.slice(1);
  return `🔍 Looking for a *${type}*?

Browse available ${type}s near you:
${SITE_URL}/machinery

Use the *Category* filter to find exactly what you need, then call the owner directly — no middlemen!

💡 Tip: You can also post a request and let owners contact you:
${SITE_URL}/machinery/request

Type *0* for main menu.`;
}

function unknownResponse() {
  return `🤔 I didn't quite get that.

${mainMenu()}`;
}

// ── Webhook GET — verification ───────────────────────────────────────────────
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("✅ WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  }

  console.log("❌ WEBHOOK VERIFICATION FAILED");
  return res.sendStatus(403);
});

// ── Webhook POST — incoming messages ─────────────────────────────────────────
router.post("/", async (req, res) => {
  // Always respond 200 immediately so Meta doesn't retry
  res.sendStatus(200);

  try {
    const body = req.body;
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    // Ignore non-message events (status updates, etc.)
    if (!message) return;

    // Only handle text messages for now
    if (message.type !== "text") {
      await sendMessage(message.from, `👋 Hi! I can only handle text messages right now.\n\n${mainMenu()}`);
      return;
    }

    const from = message.from;
    const rawText = message.text?.body?.trim() || "";
    const text = rawText.toLowerCase();

    console.log(`📩 From ${from}: "${rawText}"`);

    const session = getSession(from);
    let reply = "";

    // ── Global back command ──
    if (text === "0" || text === "back" || text === "menu") {
      clearSession(from);
      reply = mainMenu();
    }

    // ── Greetings → main menu ──
    else if (isGreeting(text) || session.step === "idle") {
      clearSession(from);

      if (text === "1" || isMachineRequest(text)) {
        setSession(from, { step: "renting" });
        reply = rentMenu();
      } else if (text === "2" || isListRequest(text)) {
        setSession(from, { step: "listing" });
        reply = listMenu();
      } else if (text === "3") {
        setSession(from, { step: "requesting" });
        reply = requestMenu();
      } else if (text === "4" || isContactRequest(text)) {
        setSession(from, { step: "contact" });
        reply = contactMenu();
      } else {
        reply = mainMenu();
      }
    }

    // ── User is in renting flow ──
    else if (session.step === "renting") {
      const matchedMachine = MACHINE_TYPES.find((m) => text.includes(m));

      if (matchedMachine) {
        reply = machineTypeResponse(matchedMachine);
      } else if (text === "1" || isMachineRequest(text)) {
        reply = rentMenu();
      } else if (text === "2") {
        setSession(from, { step: "listing" });
        reply = listMenu();
      } else if (text === "3") {
        setSession(from, { step: "requesting" });
        reply = requestMenu();
      } else if (text === "4") {
        setSession(from, { step: "contact" });
        reply = contactMenu();
      } else {
        reply = rentMenu();
      }
    }

    // ── User is in listing flow ──
    else if (session.step === "listing") {
      if (text === "1") {
        setSession(from, { step: "renting" });
        reply = rentMenu();
      } else if (text === "2") {
        reply = listMenu();
      } else if (text === "3") {
        setSession(from, { step: "requesting" });
        reply = requestMenu();
      } else if (text === "4") {
        setSession(from, { step: "contact" });
        reply = contactMenu();
      } else {
        reply = listMenu();
      }
    }

    // ── User is in request flow ──
    else if (session.step === "requesting") {
      if (text === "1") {
        setSession(from, { step: "renting" });
        reply = rentMenu();
      } else if (text === "2") {
        setSession(from, { step: "listing" });
        reply = listMenu();
      } else if (text === "3") {
        reply = requestMenu();
      } else if (text === "4") {
        setSession(from, { step: "contact" });
        reply = contactMenu();
      } else {
        reply = requestMenu();
      }
    }

    // ── Fallback ──
    else {
      clearSession(from);
      reply = unknownResponse();
    }

    await sendMessage(from, reply);

  } catch (err) {
    console.error("❌ Webhook error:", err.response?.data || err.message);
  }
});

// ── Send message helper ───────────────────────────────────────────────────────
async function sendMessage(to, text) {
  const url = `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`;

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`✅ Sent to ${to}:`, response.data?.messages?.[0]?.id);
  } catch (err) {
    console.error("❌ Send failed:", err.response?.data || err.message);
  }
}

module.exports = router;