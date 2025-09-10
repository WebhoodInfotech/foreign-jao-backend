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

// ----- FIXED CORS CONFIG -----
const whitelist = [
  "https://foreign-jao-public.vercel.app", // production frontend
  "http://localhost:3000",                  // local dev frontend
  "http://127.0.0.1:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      // allow requests with no origin (Postman, curl, server-to-server)
      return callback(null, true);
    }
    if (whitelist.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error("CORS not allowed for this origin: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// handle preflight for all routes
app.options("*", cors(corsOptions));

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

module.exports = app;
