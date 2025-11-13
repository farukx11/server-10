const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Email regex validation
    },
    photoURL: {
      type: String,
      default: "https://example.com/default-avatar.png", // Default photo URL if not provided
    },
    password: { type: String, required: true },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Pre-save middleware to hash the password before saving it to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password is modified

  try {
    const salt = await bcrypt.genSalt(10); // Generate salt with strength of 10
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next(); // Continue with the save process
  } catch (err) {
    next(err); // If error occurs, pass it to next() (error handler)
  }
});

// Method to compare passwords for login
userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password); // Compare provided password with stored hashed password
  } catch (err) {
    throw new Error("Password comparison failed"); // In case of error
  }
};

module.exports = mongoose.model("User", userSchema);
