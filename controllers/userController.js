const User = require("../models/User");
const bcrypt = require("bcryptjs");

/**
 * Get profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * Update profile: name, photoURL, optionally password
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, photoURL, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Update name and photoURL if provided
    if (name) user.name = name;
    if (photoURL) user.photoURL = photoURL;

    // Handle password update
    if (password) {
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 chars and contain uppercase, lowercase, number, and special character",
        });
      }

      // Only hash password if it's being updated
      const salt = await bcrypt.genSalt(12); // stronger salt
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
      },
      message: "Profile updated",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile };
