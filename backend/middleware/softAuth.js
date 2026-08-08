const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * This middleware is similar to `protect`, but it doesn't fail if the user is not authenticated.
 * It just tries to load `req.user` if a valid token is present.
 * This is useful for routes like registration where an admin can create a user,
 * or a new user can register themselves.
 */
const softAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {}
  }
  next();
};

module.exports = softAuth;