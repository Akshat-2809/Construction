const express = require("express");
const Machine = require("../models/machine");
const WhatsappSubscriber = require("../models/whatsappSubscriber");
const { sendWhatsappText, SITE_URL } = require("../utils/whatsapp");

const router = express.Router();

// ── In-memory session store (conversation step + lang) ───────────────────────
const sessions = new Map();

function getSession(phone) {
  if (!sessions.has(phone)) {
    sessions.set(phone, { step: "lang_select", lang: null, data: {} });
  }
  return sessions.get(phone);
}

function setSession(phone, update) {
  const current = getSession(phone);
  sessions.set(phone, { ...current, ...update });
}

function clearSession(phone) {
  sessions.set(phone, { step: "lang_select", lang: null, data: {} });
}

// ── Track subscriber in DB (used for broadcasts later) ────────────────────────
async function trackSubscriber(phone, lang) {
  try {
    await WhatsappSubscriber.findOneAndUpdate(
      { phone },
      {
        phone,
        ...(lang ? { lang } : {}),
        lastMessageAt: new Date(),
        optedOut: false,
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("⚠️ Failed to track subscriber:", err.message);
  }
}

// ── Constants ────────────────────────────────────────────────────────────────
const SUPPORT_EMAIL = "myequipomachines@gmail.com";
const SUPPORT_PHONE = "9980952438";

// Maps user-typed keyword -> exact DB category value
const MACHINE_CATEGORY_MAP = {
  excavator: "Excavator",
  "concrete pump": "Concrete Pump",
  concrete: "Concrete Pump",
  fiori: "Fiori",
  jcb: "JCB",
  crane: "Crane",
  hydra: "Crane",
  "mobile crane": "Crane",
  // Hindi
  "खुदाई": "Excavator",
  "क्रेन": "Crane",
  "मिक्सर": "Fiori",
  "कंक्रीट पंप": "Concrete Pump",
};
const ALL_MACHINE_KEYWORDS = Object.keys(MACHINE_CATEGORY_MAP);

// ── Helpers ──────────────────────────────────────────────────────────────────
function containsAny(text, keywords) {
  return keywords.some((kw) => text.includes(kw));
}

function isGreeting(text) {
  return containsAny(text, [
    "hi", "hello", "hey", "hlo", "hii", "start", "menu",
    "namaste", "namaskar", "नमस्ते", "हेलो", "हाय",
  ]);
}

function isMachineRequest(text) {
  return containsAny(text, [
    "rent", "hire", "need", "want", "chahiye", "चाहिए",
    "किराया", "किराए", "book", "find", "machine chahiye",
    ...ALL_MACHINE_KEYWORDS,
  ]);
}

function isListRequest(text) {
  return containsAny(text, [
    "list", "sell", "rent out", "post", "register", "add machine",
    "dena hai", "देना है", "list karna", "apni machine", "मशीन देना",
  ]);
}

function isContactRequest(text) {
  return containsAny(text, [
    "contact", "call", "support", "team", "problem", "issue",
    "baat", "बात", "संपर्क", "सहायता",
  ]);
}

function isEndChat(text) {
  return containsAny(text, [
    "bye", "exit", "end", "quit", "stop", "close", "done", "finish",
    "thank", "thanks", "goodbye", "ok bye",
    "बाय", "बंद", "धन्यवाद", "शुक्रिया", "ठीक है",
  ]);
}

// ── All messages in EN + HI ──────────────────────────────────────────────────
const msgs = {
  en: {
    welcome: `🙏 *Welcome to Myequipo!*

India's construction machinery marketplace — connecting contractors with machine owners directly.

🌐 ${SITE_URL}

Please select your preferred language:

1️⃣ *English*
2️⃣ *हिंदी (Hindi)*`,

    langConfirm: `✅ Great! I'll chat with you in *English*.

`,

    mainMenu: (name = "") => `${name ? `Hello ${name}! ` : ""}What would you like to do?

1️⃣ *Rent a machine* — Find excavators, cranes, JCBs & more
2️⃣ *List your machine* — Earn by renting out your equipment
3️⃣ *Post a request* — Let owners come to you
4️⃣ *Contact support* — Get help from our team

Type *0* anytime to return here.
Type *bye* to end the chat.`,

    rent: `🚜 *Find a machine on Myequipo*

We have Excavators, Concrete Pumps, Fioris, JCBs, Cranes & more.

👉 Browse all machines:
${SITE_URL}/machinery

Filter by machine type, location, availability & price.

Or type the machine you need (e.g. *Excavator*) and I'll show you live availability.

Type *0* for main menu.`,

    list: `📋 *List your machine — It's FREE!*

No commission. No hidden fees. Go live in under 2 minutes.

👉 List here:
${SITE_URL}/machinery/register

You'll need:
• Machine type, company & model
• Location & monthly rate
• Contact number (verified via OTP)

Type *0* for main menu.`,

    request: `📢 *Post a machine request*

Can't find what you need? Post a request and let owners come to *you*!

👉 Post your requirement:
${SITE_URL}/machinery/request

Fill in machine type, location, dates & budget. Owners in your area will contact you directly. 📞

Type *0* for main menu.`,

    contact: `📞 *Contact Myequipo Support*

📧 Email: ${SUPPORT_EMAIL}
📱 Phone/WhatsApp: ${SUPPORT_PHONE}
🌐 Help center: ${SITE_URL}/help

We respond within *24 hours*. 

Type *0* for main menu.`,

    machineAvailable: (type, count) => `🔍 *${type}* availability

${count > 0
  ? `✅ We have *${count} ${type}${count > 1 ? "s" : ""}* available right now!`
  : `😔 No ${type}s are available right now, but new listings come in daily.`}

👉 ${count > 0 ? "Book one now:" : "Check back or browse all machines:"}
${SITE_URL}/machinery?category=${encodeURIComponent(type)}

${count === 0 ? `💡 Or post a request and get notified:\n${SITE_URL}/machinery/request\n\n` : ""}Type *0* for main menu.`,

    goodbye: `👋 *Thank you for using Myequipo!*

We hope we could help you. 🙏

🌐 Visit us anytime at ${SITE_URL}
📧 ${SUPPORT_EMAIL}
📱 ${SUPPORT_PHONE}

*Happy building!* 🏗️`,

    unknown: `🤔 I didn't quite understand that.

`,
  },

  hi: {
    welcome: `🙏 *Myequipo में आपका स्वागत है!*

भारत का कंस्ट्रक्शन मशीनरी मार्केटप्लेस — ठेकेदारों को मशीन मालिकों से सीधे जोड़ता है।

🌐 ${SITE_URL}

कृपया अपनी पसंदीदा भाषा चुनें:

1️⃣ *English*
2️⃣ *हिंदी (Hindi)*`,

    langConfirm: `✅ बढ़िया! मैं आपसे *हिंदी* में बात करूंगा।

`,

    mainMenu: (name = "") => `${name ? `नमस्ते ${name}! ` : ""}आप क्या करना चाहते हैं?

1️⃣ *मशीन किराए पर लें* — एक्सकेवेटर, क्रेन, JCB और अधिक
2️⃣ *मशीन लिस्ट करें* — अपनी मशीन से कमाई करें
3️⃣ *रिक्वेस्ट पोस्ट करें* — मालिक आपसे संपर्क करेंगे
4️⃣ *सहायता* — हमारी टीम से मदद लें

*0* टाइप करें — मुख्य मेनू पर वापस जाएं
*बाय* टाइप करें — चैट समाप्त करें`,

    rent: `🚜 *Myequipo पर मशीन खोजें*

हमारे पास एक्सकेवेटर, कंक्रीट पंप, फिओरी, JCB, क्रेन और अधिक हैं।

👉 सभी मशीनें देखें:
${SITE_URL}/machinery

मशीन का प्रकार, स्थान, उपलब्धता और कीमत से फ़िल्टर करें।

या जो मशीन चाहिए उसका नाम टाइप करें (जैसे *Excavator*) और मैं लाइव उपलब्धता दिखाऊंगा।

*0* टाइप करें — मुख्य मेनू।`,

    list: `📋 *अपनी मशीन लिस्ट करें — बिल्कुल मुफ़्त!*

कोई कमीशन नहीं। कोई छिपा शुल्क नहीं। 2 मिनट में लाइव हो जाएं।

👉 यहाँ लिस्ट करें:
${SITE_URL}/machinery/register

आपको चाहिए:
• मशीन का प्रकार, कंपनी और मॉडल
• स्थान और मासिक किराया
• संपर्क नंबर (OTP से सत्यापित)

*0* टाइप करें — मुख्य मेनू।`,

    request: `📢 *मशीन की रिक्वेस्ट पोस्ट करें*

जो चाहिए नहीं मिल रहा? रिक्वेस्ट पोस्ट करें और मालिक आपसे संपर्क करेंगे!

👉 रिक्वेस्ट पोस्ट करें:
${SITE_URL}/machinery/request

मशीन का प्रकार, स्थान, तारीख और बजट भरें। आपके इलाके के मालिक सीधे संपर्क करेंगे। 📞

*0* टाइप करें — मुख्य मेनू।`,

    contact: `📞 *Myequipo सहायता*

📧 ईमेल: ${SUPPORT_EMAIL}
📱 फोन/WhatsApp: ${SUPPORT_PHONE}
🌐 सहायता केंद्र: ${SITE_URL}/help

हम *24 घंटे* में जवाब देते हैं।

*0* टाइप करें — मुख्य मेनू।`,

    machineAvailable: (type, count) => `🔍 *${type}* उपलब्धता

${count > 0
  ? `✅ अभी *${count} ${type}* उपलब्ध हैं!`
  : `😔 अभी कोई ${type} उपलब्ध नहीं है, लेकिन रोज़ नई लिस्टिंग आती हैं।`}

👉 ${count > 0 ? "अभी बुक करें:" : "सभी मशीनें देखें:"}
${SITE_URL}/machinery?category=${encodeURIComponent(type)}

${count === 0 ? `💡 या रिक्वेस्ट पोस्ट करें:\n${SITE_URL}/machinery/request\n\n` : ""}*0* टाइप करें — मुख्य मेनू।`,

    goodbye: `👋 *Myequipo का उपयोग करने के लिए धन्यवाद!*

उम्मीद है हम आपके काम आए। 🙏

🌐 कभी भी विज़िट करें: ${SITE_URL}
📧 ${SUPPORT_EMAIL}
📱 ${SUPPORT_PHONE}

*शुभकामनाएं! Happy building!* 🏗️`,

    unknown: `🤔 मैं यह नहीं समझ पाया।

`,
  },
};

// ── Webhook GET — verification ───────────────────────────────────────────────
router.get("/", (req, res) => {
  const mode      = req.query["hub.mode"];
  const token     = req.query["hub.verify_token"];
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
  res.sendStatus(200); // always respond fast so Meta doesn't retry

  try {
    const body    = req.body;
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return;

    const from = message.from;

    // Track every inbound message as a live subscriber touch
    await trackSubscriber(from);

    if (message.type !== "text") {
      const session = getSession(from);
      const lang    = session.lang || "en";
      await sendWhatsappText(from, lang === "hi"
        ? "👋 मैं अभी केवल टेक्स्ट संदेश समझ सकता हूं।\n\n" + msgs.hi.mainMenu()
        : "👋 I can only handle text messages right now.\n\n" + msgs.en.mainMenu());
      return;
    }

    const rawText = message.text?.body?.trim() || "";
    const text    = rawText.toLowerCase();

    console.log(`📩 From ${from}: "${rawText}"`);

    const session = getSession(from);
    const lang    = session.lang || "en";
    const m       = msgs[lang];

    // ── Opt-out (stops future broadcasts) ─────────────────────────────────────
    if (text === "stop" || text === "unsubscribe" || text === "बंद करो") {
      await WhatsappSubscriber.findOneAndUpdate({ phone: from }, { optedOut: true });
      clearSession(from);
      await sendWhatsappText(from, lang === "hi"
        ? "✅ आपको अब लिस्टिंग अपडेट नहीं मिलेंगे। दोबारा शुरू करने के लिए *hi* भेजें।"
        : "✅ You won't receive listing updates anymore. Send *hi* to start again.");
      return;
    }

    // ── End chat ──────────────────────────────────────────────────────────────
    if (isEndChat(text)) {
      clearSession(from);
      await sendWhatsappText(from, m.goodbye);
      return;
    }

    // ── Greeting → show welcome + language picker ────────────────────────────
    if (isGreeting(text)) {
      sessions.set(from, { step: "lang_select", lang: null, data: {} });
      await sendWhatsappText(from, msgs.en.welcome);
      return;
    }

    // ── User picks language ───────────────────────────────────────────────────
    if (session.step === "lang_select") {
      if (text === "1" || text === "english" || text === "en") {
        setSession(from, { step: "main", lang: "en" });
        await trackSubscriber(from, "en");
        await sendWhatsappText(from, msgs.en.langConfirm + msgs.en.mainMenu());
      } else if (text === "2" || text === "hindi" || text === "हिंदी" || text === "hi" || text === "हिन्दी") {
        setSession(from, { step: "main", lang: "hi" });
        await trackSubscriber(from, "hi");
        await sendWhatsappText(from, msgs.hi.langConfirm + msgs.hi.mainMenu());
      } else {
        await sendWhatsappText(from, `Please reply with *1* for English or *2* for हिंदी.\n\nकृपया *1* (English) या *2* (हिंदी) टाइप करें।`);
      }
      return;
    }

    // ── Back to main menu ─────────────────────────────────────────────────────
    if (text === "0" || text === "back" || text === "menu" || text === "मेनू") {
      setSession(from, { step: "main" });
      await sendWhatsappText(from, m.mainMenu());
      return;
    }

    // ── Main menu options ─────────────────────────────────────────────────────
    if (text === "1" || (session.step === "main" && isMachineRequest(text))) {
      setSession(from, { step: "renting" });
      await sendWhatsappText(from, m.rent);
      return;
    }

    if (text === "2" || (session.step === "main" && isListRequest(text))) {
      setSession(from, { step: "listing" });
      await sendWhatsappText(from, m.list);
      return;
    }

    if (text === "3") {
      setSession(from, { step: "requesting" });
      await sendWhatsappText(from, m.request);
      return;
    }

    if (text === "4" || (session.step === "main" && isContactRequest(text))) {
      setSession(from, { step: "contact" });
      await sendWhatsappText(from, m.contact);
      return;
    }

    // ── Machine type detection (live DB count) ────────────────────────────────
    if (session.step === "renting") {
      const matchedKeyword = ALL_MACHINE_KEYWORDS.find((kw) => text.includes(kw));

      if (matchedKeyword) {
        const category = MACHINE_CATEGORY_MAP[matchedKeyword];
        let count = 0;
        try {
          count = await Machine.countDocuments({ category, availability: "yes" });
        } catch (err) {
          console.error("⚠️ Machine count query failed:", err.message);
        }
        await sendWhatsappText(from, m.machineAvailable(category, count));
        return;
      }
      // Unknown reply inside renting — re-show rent menu
      await sendWhatsappText(from, m.rent);
      return;
    }

    // ── Inside other steps — handle number shortcuts ──────────────────────────
    if (["listing", "requesting", "contact"].includes(session.step)) {
      if (text === "1") { setSession(from, { step: "renting" });    await sendWhatsappText(from, m.rent);    return; }
      if (text === "2") { setSession(from, { step: "listing" });    await sendWhatsappText(from, m.list);    return; }
      if (text === "3") { setSession(from, { step: "requesting" }); await sendWhatsappText(from, m.request); return; }
      if (text === "4") { setSession(from, { step: "contact" });    await sendWhatsappText(from, m.contact); return; }
      const stepMsg = { listing: m.list, requesting: m.request, contact: m.contact };
      await sendWhatsappText(from, stepMsg[session.step]);
      return;
    }

    // ── Fallback ──────────────────────────────────────────────────────────────
    setSession(from, { step: "main" });
    await sendWhatsappText(from, m.unknown + m.mainMenu());

  } catch (err) {
    console.error("❌ Webhook error:", err.response?.data || err.message);
  }
});

module.exports = router;