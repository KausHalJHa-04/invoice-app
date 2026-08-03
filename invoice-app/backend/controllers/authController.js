const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sanitize = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  permissions: user.permissions,
});

// POST /api/auth/register  (only used to bootstrap the first Admin, or by an Admin to add users)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const userCount = await User.countDocuments();
    // First user in the system is always Admin, regardless of what's posted
    const finalRole = userCount === 0 ? "Admin" : role || "Sales Person";

    const user = await User.create({ name, email, password, role: finalRole, permissions });
    res.status(201).json({ token: signToken(user), user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.isActive) return res.status(403).json({ message: "Account is disabled" });

    res.json({ token: signToken(user), user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  res.json({ user: sanitize(req.user) });
};
