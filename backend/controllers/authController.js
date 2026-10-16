const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const genToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, role, department });
    res.status(201).json({
      user: user.toSafeObject(),
      token: genToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({
      user: user.toSafeObject(),
      token: genToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};

// Forgot password: issues a one-hour reset token. There is no mailer wired up,
// so outside production the token is returned in the response for demo use.
exports.forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const generic = { message: "If an account exists for that email, a reset link has been sent." };
    const user = await User.findOne({ email });
    if (!user) return res.json(generic);

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    if (process.env.NODE_ENV === "production") return res.json(generic);
    res.json({ ...generic, resetToken: token });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    const hashed = crypto.createHash("sha256").update(String(token)).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");
    if (!user) return res.status(400).json({ message: "Reset link is invalid or has expired" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: "Password updated. You can now sign in." });
  } catch (err) {
    next(err);
  }
};
