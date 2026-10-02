const Application = require("../models/Application");

exports.createApplication = async (req, res, next) => {
  try {
    const { job, candidate } = req.body;
    const application = await Application.create({
      job,
      candidate,
      stage: "applied",
      stageHistory: [{ stage: "applied", changedBy: req.user._id }],
    });
    res.status(201).json(application);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Candidate already applied to this job" });
    }
    next(err);
  }
};

exports.getApplications = async (req, res, next) => {
  try {
    const { job, candidate, stage } = req.query;
    const filter = {};
    if (job) filter.job = job;
    if (candidate) filter.candidate = candidate;
    if (stage) filter.stage = stage;

    const applications = await Application.find(filter)
      .populate("job", "title department status")
      .populate("candidate", "name email currentTitle skills")
      .sort({ updatedAt: -1 });
    res.json(applications);
  } catch (err) {
    next(err);
  }
};

// Pipeline board grouped by stage for a given job
exports.getPipelineForJob = async (req, res, next) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate("candidate", "name email currentTitle skills experienceYears")
      .sort({ updatedAt: -1 });

    const board = {};
    Application.STAGES.forEach((s) => (board[s] = []));
    applications.forEach((a) => board[a.stage].push(a));

    res.json({ stages: Application.STAGES, board });
  } catch (err) {
    next(err);
  }
};

exports.moveStage = async (req, res, next) => {
  try {
    const { stage, note } = req.body;
    if (!Application.STAGES.includes(stage)) {
      return res.status(400).json({ message: "Invalid stage" });
    }
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    application.stage = stage;
    application.stageHistory.push({ stage, changedBy: req.user._id, note: note || "" });
    if (stage === "rejected" && req.body.rejectionReason) {
      application.rejectionReason = req.body.rejectionReason;
    }
    await application.save();
    res.json(application);
  } catch (err) {
    next(err);
  }
};

exports.deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json({ message: "Application deleted" });
  } catch (err) {
    next(err);
  }
};
