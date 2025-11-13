const express = require("express");
const router = express.Router();
const {
  register,
  login,
  googleAuth,
} = require("../controllers/authController");
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many requests, please try again later.",
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

router.post("/google", googleAuth);

module.exports = router;
