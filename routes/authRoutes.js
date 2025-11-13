const express = require("express");
const router = express.Router();
const {
  register,
  login,
  googleAuth,
} = require("../controllers/authController");
const rateLimit = require("express-rate-limit");

// Rate Limiter middleware for register and login routes to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many requests, please try again later.",
});

// Apply rate limit on the register and login routes
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

// frontend can POST google profile object (email, name, photoURL) after verifying token client-side.
// In production, verify with Firebase Admin or Google token verification before creating/upserting user.
router.post("/google", googleAuth);

module.exports = router;
