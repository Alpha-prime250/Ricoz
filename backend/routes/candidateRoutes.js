const express = require("express");
const router = express.Router();
const {
  createCandidate,
  getCandidates,
  getCandidate,
  updateCandidate,
  deleteCandidate,
} = require("../controllers/candidateController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.route("/").post(createCandidate).get(getCandidates);
router.route("/:id").get(getCandidate).put(updateCandidate).delete(deleteCandidate);

module.exports = router;
