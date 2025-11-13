const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getProfile, updateProfile } = require("../controllers/userController");
const mongoose = require("mongoose");

router.get("/me", auth, getProfile);

router.put("/me", auth, async (req, res, next) => {
  try {
    const { name, photoURL, password } = req.body;

    if (!name && !photoURL && !password) {
      return res.status(400).json({
        success: false,
        message: "At least one field must be provided for update.",
      });
    }

    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    updateProfile(req, res, next);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
