require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcryptjs"); // Added for secure password hashing

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB setup
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db, usersCollection, transactionsCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("finEaseDB");
    usersCollection = db.collection("users");
    transactionsCollection = db.collection("transactions");
    console.log("✅ MongoDB connected");

    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
connectDB();

// JWT Middleware
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ success: false, message: "Forbidden" });
    req.user = decoded;
    next();
  });
}

// --------- ROUTES ---------

// Test Route
app.get("/", (req, res) => {
  res.send("FinEase Server is running ✅");
});

// ---- AUTH ---- //

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, photoURL } = req.body;

    if (!name || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Name, email and password required" });

    // Password validation
    if (!/[A-Z]/.test(password))
      return res.status(400).json({
        success: false,
        message: "Password must contain an uppercase letter",
      });
    if (!/[a-z]/.test(password))
      return res.status(400).json({
        success: false,
        message: "Password must contain a lowercase letter",
      });
    if (password.length < 6)
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      name,
      email,
      password: hashedPassword,
      photoURL,
      createdAt: new Date(),
    };
    await usersCollection.insertOne(user);

    const token = jwt.sign(
      { email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res
      .status(201)
      .json({ success: true, message: "User registered successfully", token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });

    const user = await usersCollection.findOne({ email });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign(
      { email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ success: true, message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---- USER PROFILE ---- //
app.get("/api/user/me", verifyJWT, async (req, res) => {
  try {
    const user = await usersCollection.findOne(
      { email: req.user.email },
      { projection: { password: 0 } }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/user/me", verifyJWT, async (req, res) => {
  try {
    const { name, photoURL, password } = req.body;

    if (!name && !photoURL && !password)
      return res.status(400).json({
        success: false,
        message: "At least one field must be provided for update",
      });

    const updateFields = {};
    if (name) updateFields.name = name;
    if (photoURL) updateFields.photoURL = photoURL;
    if (password) {
      if (password.length < 6)
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      updateFields.password = await bcrypt.hash(password, 10);
    }

    await usersCollection.updateOne(
      { email: req.user.email },
      { $set: updateFields }
    );
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---- TRANSACTIONS CRUD ---- //

// Add Transaction
app.post("/api/transactions", verifyJWT, async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;

    if (!type || !category || !amount || !description || !date)
      return res.status(400).json({
        success: false,
        message: "All transaction fields are required",
      });

    const transaction = {
      type,
      category,
      amount,
      description,
      date: new Date(date),
      email: req.user.email,
      name: req.user.name,
      createdAt: new Date(),
    };
    const result = await transactionsCollection.insertOne(transaction);
    res.status(201).json({
      success: true,
      message: "Transaction added",
      transactionId: result.insertedId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all transactions (sorted)
app.get("/api/transactions", verifyJWT, async (req, res) => {
  try {
    const transactions = await transactionsCollection
      .find({ email: req.user.email })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single transaction
app.get("/api/transactions/:id", verifyJWT, async (req, res) => {
  try {
    const id = req.params.id;
    const transaction = await transactionsCollection.findOne({
      _id: new ObjectId(id),
      email: req.user.email,
    });
    if (!transaction)
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    res.json({ success: true, transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update transaction
app.put("/api/transactions/:id", verifyJWT, async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await transactionsCollection.updateOne(
      { _id: new ObjectId(id), email: req.user.email },
      { $set: req.body }
    );
    if (updated.matchedCount === 0)
      return res.status(404).json({
        success: false,
        message: "Transaction not found or unauthorized",
      });
    res.json({ success: true, message: "Transaction updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/transactions/:id", verifyJWT, async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await transactionsCollection.deleteOne({
      _id: new ObjectId(id),
      email: req.user.email,
    });
    if (deleted.deletedCount === 0)
      return res.status(404).json({
        success: false,
        message: "Transaction not found or unauthorized",
      });
    res.json({ success: true, message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not Found" });
});
