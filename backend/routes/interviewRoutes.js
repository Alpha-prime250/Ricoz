const express = require("express");
const router = express.Router();
const {
  scheduleInterview,
  getInterviews,
  updateInterview,
  submitFeedback,
  deleteInterview,
} = require("../controllers/interviewController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.route("/").post(scheduleInterview).get(getInterviews);
router.route("/:id").put(updateInterview).delete(deleteInterview);
router.put("/:id/feedback", submitFeedback);

module.exports = router;
