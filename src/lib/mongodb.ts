import mongoose from "mongoose";

let isConnected = false; // Track the connection status

export async function connectDB() {
  if (isConnected) {
    console.log("✅ Using existing database connection");
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("❌ MONGODB_URI is not defined in environment variables");
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      // Removed useUnifiedTopology as it is no longer supported
    });
    isConnected = !!db.connections[0].readyState;
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    throw new Error("Failed to connect to the database");
  }
}
