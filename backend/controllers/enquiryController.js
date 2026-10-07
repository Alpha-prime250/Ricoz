const Enquiry = require("../models/Enquiry");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/enquiries  (public)
exports.createEnquiry = async (req, res, next) => {
  try {
    const { type, name, email, phone, city, state, investmentRange, message } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Name is required" });
    if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ message: "Enter a valid email address" });
    if (phone && !/^[0-9+()\-\s]{7,20}$/.test(phone)) {
      return res.status(400).json({ message: "Enter a valid phone number" });
    }

    await Enquiry.create({
      type: type === "demo" ? "demo" : "franchise",
      name,
      email,
      phone,
      city,
      state,
      investmentRange,
      message,
    });
    res.status(201).json({ message: "Thanks, we have your enquiry and will get back to you." });
  } catch (err) {
    next(err);
  }
};

// GET /api/enquiries  (admin only)
exports.getEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    next(err);
  }
};