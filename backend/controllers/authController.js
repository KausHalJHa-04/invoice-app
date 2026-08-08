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
    const { name, email, password, permissions } = req.body;
    let { role } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const userCount = await User.countDocuments();
    // If this is the first user, they become an Admin.
    // If an admin is creating a user, respect the role, otherwise default to Sales Person.
    if (userCount === 0) {
      role = "Admin";
    } else if (!req.user || req.user.role !== "Admin") {
      // If not the first user and not an admin creating a user, default to Sales Person
      role = "Sales Person"; 
    }

    const user = await User.create({ name, email, password, role, permissions });
    // If a non-admin registers, return a token. If an admin creates a user, just return the user data.
    if (req.user?.role === "Admin") {
      res.status(201).json(sanitize(user));
    } else {
      res.status(201).json({ token: signToken(user), user: sanitize(user) });
    }
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
