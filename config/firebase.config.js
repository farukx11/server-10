const express = require("express");
const { auth } = require("./firebase.config"); // Import Firebase config
const app = express();

app.use(express.json());

// Helper function for email validation
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Helper function for password validation (e.g., minimum length check)
const validatePassword = (password) => {
  return password && password.length >= 6; // Password must be at least 6 characters
};

app.post("/create-user", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !validateEmail(email)) {
    return res.status(400).send({
      success: false,
      message: "Invalid email format",
    });
  }

  if (!password || !validatePassword(password)) {
    return res.status(400).send({
      success: false,
      message: "Password must be at least 6 characters long",
    });
  }

  try {
    // Create user with Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: false,
      disabled: false,
    });

    res.status(201).send({
      success: true,
      message: `User created successfully: ${userRecord.uid}`,
    });
  } catch (error) {
    console.error("Error creating new user:", error);
    res.status(500).send({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
