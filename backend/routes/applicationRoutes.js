const express = require("express");
const router = express.Router();
const {
  createApplication,
  getApplications,
  getPipelineForJob,
  moveStage,
  deleteApplication,
} = require("../controllers/applicationController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.route("/").post(createApplication).get(getApplications);
router.get("/pipeline/:jobId", getPipelineForJob);
router.put("/:id/stage", moveStage);
router.delete("/:id", deleteApplication);

module.exports = router;
