const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["Excavator", "Concrete Pump", "Fiori", "JCB", "Crane"],
    },
    craneType: {
      type: String,
      enum: ["Hydra", "Mobile Crane", "Rough Terrain Crane", "Tower Crane", null],
      default: null,
    },
    company: { type: String, required: true },
    model: { type: String, required: true },
    image: { type: String, default: "/excavator.webp" },
    location: { type: String, required: true },
    pricePerMonth: { type: Number, required: true },
    modelYear: { type: Number },
    hoursUsed: { type: Number },
    availability: {
      type: String,
      enum: ["yes", "no"],
      default: "yes",
    },
    availableFrom: { type: Date, default: null },
    ownerName: { type: String, required: true },
    ownerContact: { type: String, required: true },
    description: { type: String },
    editCount: { type: Number, default: 0 },
    contactVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Machine", machineSchema);