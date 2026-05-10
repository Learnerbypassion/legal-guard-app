const mongoose = require("mongoose");
const { MONGODB_URI } = require("./env");

const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      console.warn("⚠️  MONGODB_URI not set. Running without database.");
      return;
    }
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
