const WhatsappSubscriber = require("../models/whatsappSubscriber");
const { sendWhatsappText, SITE_URL } = require("./whatsapp");

/**
 * Broadcasts a "new machine listed" message to every tracked subscriber
 * who hasn't opted out.
 *
 * IMPORTANT — WhatsApp 24-hour session rule:
 * Free-form text messages (sendWhatsappText) only deliver to users who
 * messaged your business within the last 24 hours. Anyone outside that
 * window will silently fail to receive it unless you switch to
 * sendWhatsappTemplate() with a Meta-approved template.
 *
 * This function is intentionally simple for now (per your instruction to
 * start with all users). It throttles sends with a small delay to avoid
 * hammering the Cloud API rate limit.
 */
async function broadcastNewListing(machine) {
  try {
    const subscribers = await WhatsappSubscriber.find({ optedOut: false });

    if (!subscribers.length) {
      console.log("ℹ️ No WhatsApp subscribers to notify.");
      return;
    }

    console.log(`📢 Broadcasting new listing to ${subscribers.length} subscribers...`);

    const messages = {
      en: `🆕 *New machine listed on Myequipo!*

🚜 *${machine.category}* — ${machine.company} ${machine.model}
📍 ${machine.location}
💰 ₹${Number(machine.pricePerMonth).toLocaleString("en-IN")}/month

👉 Check it out:
${SITE_URL}/machinery

Reply *STOP* to stop these updates.`,

      hi: `🆕 *Myequipo पर नई मशीन लिस्ट हुई!*

🚜 *${machine.category}* — ${machine.company} ${machine.model}
📍 ${machine.location}
💰 ₹${Number(machine.pricePerMonth).toLocaleString("en-IN")}/माह

👉 देखें:
${SITE_URL}/machinery

ये अपडेट बंद करने के लिए *STOP* भेजें।`,
    };

    // Send with a small delay between each to avoid hitting rate limits
    for (const sub of subscribers) {
      const text = messages[sub.lang] || messages.en;
      await sendWhatsappText(sub.phone, text);
      await new Promise((resolve) => setTimeout(resolve, 250)); // ~4 msgs/sec
    }

    console.log(`✅ Broadcast complete: ${subscribers.length} subscribers notified.`);
  } catch (err) {
    console.error("❌ Broadcast failed:", err.message);
  }
}

module.exports = { broadcastNewListing };