const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "food",
        "transport",
        "utilities",
        "salary",
        "entertainment",
        "home",
        "freelance",
        "investment",
      ],
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    description: {
      type: String,
      maxlength: 255,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional, since Firebase already manages user identity
      index: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
