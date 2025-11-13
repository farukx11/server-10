const User = require("../models/User");
const bcrypt = require("bcryptjs");

const getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, photoURL, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (name) user.name = name;
    if (photoURL) user.photoURL = photoURL;

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

      const salt = await bcrypt.genSalt(12);
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
