const mongoose = require("mongoose");

const whatsappSubscriberSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true }, // e.g. "917014130830"
    lang: { type: String, enum: ["en", "hi"], default: "en" },
    lastMessageAt: { type: Date, default: Date.now },
    optedOut: { type: Boolean, default: false }, // set true if user replies STOP
  },
  { timestamps: true }
);

module.exports = mongoose.model("WhatsappSubscriber", whatsappSubscriberSchema);