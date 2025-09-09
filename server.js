// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { connectDB, disconnectDB } = require("./config/db");

// ROUTES
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const collegeRoutes = require("./routes/collegeRoutes");
const testRoutes = require("./routes/testRoutes");
const assetRoutes = require("./routes/assetRoutes");
const courseRoutes = require("./routes/courseRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const collageApplicationRoutes = require("./routes/collegeApplicationRoutes");

const app = express();

/* -------------------- Global middleware -------------------- */
app.use(express.json({ limit: "1mb" }));

app.use(
  cors({
    origin:
      (process.env.CORS_ORIGIN || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) || true,
    credentials: true,
  })
);

app.use(morgan("dev"));

/* -------------------- Health check -------------------- */
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    ts: new Date().toISOString(),
  });
});

/* -------------------- Mount routes -------------------- */
app.use("/", authRoutes);
app.use("/", studentRoutes);
app.use("/", collegeRoutes);
app.use("/", testRoutes);
app.use("/", assetRoutes);
app.use("/", courseRoutes);
app.use("/", sessionRoutes);
app.use("/", collageApplicationRoutes);

/* -------------------- Boot server -------------------- */
// If running locally, start the server with app.listen
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  (async () => {
    try {
      await connectDB();
      app.listen(PORT, () =>
        console.log(`Server running on http://localhost:${PORT}`)
      );
    } catch (err) {
      console.error("Failed to start server:", err?.message || err);
      process.exit(1);
    }
  })();

  function shutdown(signal) {
    console.log(`\n${signal} received. Closing server...`);
    disconnectDB?.().finally(() => process.exit(0));
  }
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

// Export the app for Vercel
module.exports = app;
