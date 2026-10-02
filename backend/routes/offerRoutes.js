const express = require("express");
const router = express.Router();
const {
  createOffer,
  getOffers,
  updateOfferStatus,
  logCommunication,
  deleteOffer,
} = require("../controllers/offerController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.route("/").post(createOffer).get(getOffers);
router.put("/:id/status", updateOfferStatus);
router.post("/:id/communications", logCommunication);
router.delete("/:id", deleteOffer);

module.exports = router;
