const Candidate = require("../models/Candidate");

exports.createCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.create({ ...req.body, addedBy: req.user._id });
    res.status(201).json(candidate);
  } catch (err) {
    next(err);
  }
};

exports.getCandidates = async (req, res, next) => {
  try {
    const { q, source, skill } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { currentTitle: { $regex: q, $options: "i" } },
      ];
    }
    if (source) filter.source = source;
    if (skill) filter.skills = { $in: [new RegExp(skill, "i")] };

    const candidates = await Candidate.find(filter).sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) {
    next(err);
  }
};

exports.getCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json(candidate);
  } catch (err) {
    next(err);
  }
};

exports.updateCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json(candidate);
  } catch (err) {
    next(err);
  }
};

exports.deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json({ message: "Candidate deleted" });
  } catch (err) {
    next(err);
  }
};
