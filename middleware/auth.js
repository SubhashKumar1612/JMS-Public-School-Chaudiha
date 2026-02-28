const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getJwtSecret = () => process.env.JWT_SECRET || "local_dev_jwt_secret_change_later";

// Verifies JWT and attaches current user to request
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing." });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid." });
  }
};

// Role guard used on admin-only mutation routes
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: insufficient permissions." });
  }
  next();
};

module.exports = { protect, authorize };


