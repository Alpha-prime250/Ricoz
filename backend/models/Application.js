const mongoose = require("mongoose");

const STAGES = [
  "applied",
  "screening",
  "interview",
  "assessment",
  "offer",
  "hired",
  "rejected",
];

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    stage: { type: String, enum: STAGES, default: "applied" },
    stageHistory: [
      {
        stage: { type: String, enum: STAGES },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note: { type: String, default: "" },
      },
    ],
    rejectionReason: { type: String, default: "" },
    rating: { type: Number, min: 0, max: 5 },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

applicationSchema.statics.STAGES = STAGES;

module.exports = mongoose.model("Application", applicationSchema);
