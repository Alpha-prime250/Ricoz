const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/auth");

router.use(protect);

// Lightweight user directory (used for the Hiring Manager dropdown)
router.get("/", async (req, res, next) => {
  try {
    const filter = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(filter).select("name email role department").sort({ name: 1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
