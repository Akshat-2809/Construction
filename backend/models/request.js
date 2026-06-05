const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["Excavator", "Concrete Pump", "Fiori", "JCB", "Crane", "Any"],
    },
    craneType: {
      type: String,
      enum: ["Hydra", "Mobile Crane", "Rough Terrain Crane", "Tower Crane", null],
      default: null,
    },
    location: { type: String, required: true },
    requiredFrom: { type: Date, required: true },
    requiredTill: { type: Date, default: null },
    budgetPerMonth: { type: Number, default: null },
    description: { type: String },
    contactName: { type: String, required: true },
    contactNumber: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);