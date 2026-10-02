const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
    proposedTitle: { type: String, required: true },
    salary: { type: Number, required: true },
    bonus: { type: Number, default: 0 },
    startDate: { type: Date },
    expiresAt: { type: Date },
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "declined", "withdrawn"],
      default: "draft",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    communications: [
      {
        channel: { type: String, enum: ["email", "call", "note"], default: "email" },
        subject: { type: String, default: "" },
        message: { type: String, default: "" },
        sentAt: { type: Date, default: Date.now },
        sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);
