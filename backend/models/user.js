const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phoneVerified: {
      type: Boolean,
      default: true, // always true since they verified via OTP to register
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);