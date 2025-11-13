const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../config/jwt");

const register = async (req, res, next) => {
  try {
    const { name, email, password, photoURL } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long, and include uppercase, lowercase, number, and special character",
      });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashed,
      photoURL: photoURL || "",
      provider: "local",
    });

    const token = signToken({ id: user._id, email: user.email });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          photoURL: user.photoURL,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = signToken({ id: user._id, email: user.email });

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          photoURL: user.photoURL,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const { email, name, photoURL } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email required" });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email,
        photoURL: photoURL || "",
        password: Math.random().toString(36).slice(-8),
        provider: "google",
      });
    }

    const token = signToken({ id: user._id, email: user.email });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          photoURL: user.photoURL,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, googleAuth };
