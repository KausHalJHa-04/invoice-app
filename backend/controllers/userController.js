const User = require("../models/User");

// GET /api/users
exports.getUsers = async (req, res) => {
  const users = await User.find().select("-password").sort("-createdAt");
  res.json(users);
};

// POST /api/users  (Admin creates a user directly with role+permissions)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });
    const user = await User.create({ name, email, password, role, permissions });
    const { password: _pw, ...safe } = user.toObject();
    res.status(201).json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, role, permissions, isActive, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (permissions !== undefined) user.permissions = permissions;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) user.password = password;

    await user.save();
    const { password: _pw, ...safe } = user.toObject();
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};
