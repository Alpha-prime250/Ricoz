const Interview = require("../models/Interview");
const Application = require("../models/Application");

exports.scheduleInterview = async (req, res, next) => {
  try {
    const interview = await Interview.create(req.body);

    // Auto-advance the application stage to "interview" if it's earlier
    const app = await Application.findById(req.body.application);
    if (app && ["applied", "screening"].includes(app.stage)) {
      app.stage = "interview";
      app.stageHistory.push({ stage: "interview", changedBy: req.user._id, note: "Interview scheduled" });
      await app.save();
    }

    res.status(201).json(interview);
  } catch (err) {
    next(err);
  }
};

exports.getInterviews = async (req, res, next) => {
  try {
    const { application, status, from, to } = req.query;
    const filter = {};
    if (application) filter.application = application;
    if (status) filter.status = status;
    if (from || to) {
      filter.scheduledAt = {};
      if (from) filter.scheduledAt.$gte = new Date(from);
      if (to) filter.scheduledAt.$lte = new Date(to);
    }

    const interviews = await Interview.find(filter)
      .populate({
        path: "application",
        populate: [
          { path: "job", select: "title department" },
          { path: "candidate", select: "name email" },
        ],
      })
      .populate("interviewers", "name email")
      .sort({ scheduledAt: 1 });
    res.json(interviews);
  } catch (err) {
    next(err);
  }
};

exports.updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    res.json(interview);
  } catch (err) {
    next(err);
  }
};

exports.submitFeedback = async (req, res, next) => {
  try {
    const { feedback, score, recommendation } = req.body;
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { feedback, score, recommendation, status: "completed" },
      { new: true }
    );
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    res.json(interview);
  } catch (err) {
    next(err);
  }
};

exports.deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    res.json({ message: "Interview deleted" });
  } catch (err) {
    next(err);
  }
};
