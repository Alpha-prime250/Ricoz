const Job = require("../models/Job");

// Create a job requisition (starts pending approval)
exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create({
      ...req.body,
      requestedBy: req.user._id,
      approvalStatus: "pending",
      status: "draft",
    });
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
};

exports.getJobs = async (req, res, next) => {
  try {
    const { status, approvalStatus, department, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (department) filter.department = department;
    if (q) filter.title = { $regex: q, $options: "i" };

    const jobs = await Job.find(filter)
      .populate("requestedBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    next(err);
  }
};

exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("requestedBy", "name email")
      .populate("approvedBy", "name email");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    next(err);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    next(err);
  }
};

// Approve / reject a requisition (admin or hiring_manager)
exports.decideApproval = async (req, res, next) => {
  try {
    const { decision, note } = req.body; // decision: "approved" | "rejected"
    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "decision must be approved or rejected" });
    }
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: decision,
        approvedBy: req.user._id,
        approvalNote: note || "",
        status: decision === "approved" ? "open" : "closed",
      },
      { new: true }
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    next(err);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted" });
  } catch (err) {
    next(err);
  }
};
