const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies JWT and attaches req.user
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Not authorized, user not found or inactive" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Restrict to specific roles
exports.allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }
  next();
};

// Restrict to specific permission (Admin always passes)
exports.requirePermission = (perm) => (req, res, next) => {
  if (!req.user.hasPermission(perm)) {
    return res.status(403).json({ message: `Forbidden: missing permission '${perm}'` });
  }
  next();
};
