const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    source: {
      type: String,
      enum: ["referral", "job_board", "linkedin", "career_site", "agency", "other"],
      default: "other",
    },
    currentTitle: { type: String, default: "" },
    currentCompany: { type: String, default: "" },
    experienceYears: { type: Number, default: 0 },
    skills: [{ type: String }],
    location: { type: String, default: "" },
    tags: [{ type: String }],
    notes: { type: String, default: "" },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

candidateSchema.index({ email: 1 });

module.exports = mongoose.model("Candidate", candidateSchema);
