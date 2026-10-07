const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["franchise", "demo"], default: "franchise" },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    phone: { type: String, trim: true, maxlength: 30 },
    city: { type: String, trim: true, maxlength: 80 },
    state: { type: String, trim: true, maxlength: 80 },
    investmentRange: { type: String, trim: true, maxlength: 60 },
    message: { type: String, trim: true, maxlength: 1500 },
    status: { type: String, enum: ["new", "contacted", "closed"], default: "new" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enquiry", enquirySchema);