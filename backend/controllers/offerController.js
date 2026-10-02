const Offer = require("../models/Offer");
const Application = require("../models/Application");

exports.createOffer = async (req, res, next) => {
  try {
    const offer = await Offer.create({ ...req.body, createdBy: req.user._id });

    const app = await Application.findById(req.body.application);
    if (app) {
      app.stage = "offer";
      app.stageHistory.push({ stage: "offer", changedBy: req.user._id, note: "Offer created" });
      await app.save();
    }
    res.status(201).json(offer);
  } catch (err) {
    next(err);
  }
};

exports.getOffers = async (req, res, next) => {
  try {
    const { application, status } = req.query;
    const filter = {};
    if (application) filter.application = application;
    if (status) filter.status = status;

    const offers = await Offer.find(filter)
      .populate({
        path: "application",
        populate: [
          { path: "job", select: "title department" },
          { path: "candidate", select: "name email" },
        ],
      })
      .sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    next(err);
  }
};

exports.updateOfferStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // draft | sent | accepted | declined | withdrawn
    const offer = await Offer.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    if (status === "accepted") {
      const app = await Application.findById(offer.application);
      if (app) {
        app.stage = "hired";
        app.stageHistory.push({ stage: "hired", changedBy: req.user._id, note: "Offer accepted" });
        await app.save();
      }
    }
    res.json(offer);
  } catch (err) {
    next(err);
  }
};

// Log a candidate communication (email/call/note) tied to this offer
exports.logCommunication = async (req, res, next) => {
  try {
    const { channel, subject, message } = req.body;
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    offer.communications.push({
      channel: channel || "email",
      subject: subject || "",
      message: message || "",
      sentBy: req.user._id,
    });
    if (channel === "email" && offer.status === "draft") offer.status = "sent";
    await offer.save();
    res.status(201).json(offer);
  } catch (err) {
    next(err);
  }
};

exports.deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.json({ message: "Offer deleted" });
  } catch (err) {
    next(err);
  }
};
