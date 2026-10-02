const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true },
    location: { type: String, required: true },
    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "contract", "internship"],
      default: "full_time",
    },
    openings: { type: Number, default: 1, min: 1 },
    minSalary: { type: Number },
    maxSalary: { type: Number },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    skills: [{ type: String }],

    // Requisition / approval workflow
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvalNote: { type: String, default: "" },

    // Publishing status
    status: {
      type: String,
      enum: ["draft", "open", "on_hold", "closed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
