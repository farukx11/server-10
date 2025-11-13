const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getProfile, updateProfile } = require("../controllers/userController");
const mongoose = require("mongoose");

// Get profile
router.get("/me", auth, getProfile);

// Update profile with validation
router.put("/me", auth, async (req, res, next) => {
  try {
    const { name, photoURL, password } = req.body;

    // Check if at least one field is provided for update
    if (!name && !photoURL && !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "At least one field must be provided for update.",
        });
    }

    // If password is provided, validate it (e.g., enforce a minimum length)
    if (password && password.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters.",
        });
    }

    updateProfile(req, res, next); // Call the original updateProfile function
  } catch (err) {
    next(err);
  }
});

module.exports = router;
