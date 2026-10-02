const express = require("express");
const router = express.Router();
const {
  createJob,
  getJobs,
  getJob,
  updateJob,
  decideApproval,
  deleteJob,
} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.route("/").post(createJob).get(getJobs);
router.route("/:id").get(getJob).put(updateJob).delete(authorize("admin"), deleteJob);
router.put("/:id/approval", authorize("admin", "hiring_manager"), decideApproval);

module.exports = router;
