const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully with Mongoose!");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  console.log("Shutting down MongoDB connection...");
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = { connectDB };
