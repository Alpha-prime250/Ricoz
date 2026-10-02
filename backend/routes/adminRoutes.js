const express = require("express");
const router = express.Router();
const { resetDemoData } = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

router.post("/reset-demo-data", protect, authorize("admin"), resetDemoData);

module.exports = router;
