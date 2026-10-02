const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
    round: { type: String, default: "Round 1" },
    type: {
      type: String,
      enum: ["phone_screen", "technical", "assessment", "panel", "hr", "final"],
      default: "technical",
    },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 45 },
    interviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    location: { type: String, default: "Google Meet" },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no_show"],
      default: "scheduled",
    },
    feedback: { type: String, default: "" },
    score: { type: Number, min: 0, max: 10 },
    recommendation: {
      type: String,
      enum: ["strong_yes", "yes", "neutral", "no", "strong_no", ""],
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
