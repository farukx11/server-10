const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    // Verify token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database using decoded token
    const user = await User.findById(decoded.id).select("name email photoURL");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    // Attach user to request object
    req.user = user;

    // Move to the next middleware or route handler
    next();
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
