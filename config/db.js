// config/db.js
const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) return mongoose.connection;
  mongoose.set("strictQuery", true);

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "foreignjaoo-database",
      serverSelectionTimeoutMS: 15000,
      ssl: true,
      family: 4, // prefer IPv4 on some Windows networks
    });
    isConnected = true;
    console.log(`✅ Mongo connected: db=${conn.connection.name} host=${conn.connection.host}`);
    return conn.connection;
  } catch (err) {
    // <-- better diagnostics
    console.error("MongoDB connection error:", err?.message || err);
    if (err?.cause) console.error("Cause:", err.cause);
    if (err?.reason) console.error("Reason:", err.reason);
    if (Array.isArray(err?.errors)) console.error("Errors:", err.errors);
    process.exit(1);
  }
}

module.exports = { connectDB };
