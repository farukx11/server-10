const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Connecting to MongoDB using Mongoose
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected successfully with Mongoose!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit process if connection fails
  }
};

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("Shutting down MongoDB connection...");
  await mongoose.connection.close();
  process.exit(0); // Exit the process cleanly
});

module.exports = { connectDB };
