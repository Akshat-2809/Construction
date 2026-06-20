const axios = require("axios");

// const SITE_URL = "https://myequipo.com";
const SITE_URL = "https://construction-chi-six.vercel.app";
/**
 * Send a free-form text message via WhatsApp Cloud API.
 * NOTE: only works if the recipient messaged you in the last 24 hours
 * (WhatsApp's "session window" rule), otherwise Meta will reject it
 * unless you use a pre-approved Message Template.
 */
async function sendWhatsappText(to, text) {
  const url = `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`;
  try {
    const res = await axios.post(
      url,
      { messaging_product: "whatsapp", to, type: "text", text: { body: text } },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`✅ WhatsApp sent to ${to}:`, res.data?.messages?.[0]?.id);
    return { success: true, id: res.data?.messages?.[0]?.id };
  } catch (err) {
    console.error(`❌ WhatsApp send failed to ${to}:`, err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
}

/**
 * Send via a pre-approved Message Template (required for messages outside
 * the 24-hour session window — e.g. broadcasting to old subscribers).
 * `templateName` must match exactly what you submitted & got approved in
 * Meta Business Manager. `params` is an ordered array filling {{1}}, {{2}}, etc.
 */
async function sendWhatsappTemplate(to, templateName, lang, params = []) {
  const url = `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`;
  try {
    const res = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: lang === "hi" ? "hi" : "en" },
          components: params.length
            ? [
                {
                  type: "body",
                  parameters: params.map((p) => ({ type: "text", text: String(p) })),
                },
              ]
            : [],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`✅ Template sent to ${to}:`, res.data?.messages?.[0]?.id);
    return { success: true, id: res.data?.messages?.[0]?.id };
  } catch (err) {
    console.error(`❌ Template send failed to ${to}:`, err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
}

module.exports = { sendWhatsappText, sendWhatsappTemplate, SITE_URL };