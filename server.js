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

/* -------------------- Robust CORS parsing & setup -------------------- */
/**
 * Read process.env.CORS_ORIGIN which can be:
 *  - empty -> we'll use sensible defaults
 *  - a single origin -> eg "https://example.com"
 *  - comma separated origins -> eg "https://a.com,https://b.com:3000"
 *
 * IMPORTANT: we'll sanitize each entry via the URL constructor and only keep the "origin"
 * (protocol + host + port). This prevents stray path segments like
 * "https://git.new/pathToRegexpError" from making it into arrays that confuse internals.
 */
function parseAndSanitizeOrigins(envVal) {
  if (!envVal || typeof envVal !== "string") return [];

  return envVal
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((candidate) => {
      try {
        // If candidate is a bare host like "localhost:3000", URL requires protocol; try to normalize
        if (!candidate.startsWith("http://") && !candidate.startsWith("https://")) {
          // assume http for parsing only
          candidate = "http://" + candidate;
        }
        const u = new URL(candidate);
        return u.origin; // e.g. "http://localhost:3000" or "https://domain.com"
      } catch (err) {
        console.warn(`CORS: ignoring invalid origin entry: "${candidate}" (${err?.message})`);
        return null;
      }
    })
    .filter(Boolean);
}

const envOrigins = parseAndSanitizeOrigins(process.env.CORS_ORIGIN);

// sensible defaults if nothing provided
const defaultWhitelist = [
  "https://foreign-jao-public.vercel.app", // your Vercel frontend
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

// final whitelist: union of envOrigins and defaults (env entries first)
const whitelist = Array.from(new Set([...envOrigins, ...defaultWhitelist]));

if (envOrigins.length === 0) {
  console.info("CORS: no CORS_ORIGIN env detected or no valid entries — using defaults:", defaultWhitelist);
} else {
  console.info("CORS: using whitelist (env + defaults):", whitelist);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Tools like Postman / curl / server-to-server often send no Origin header
    if (!origin) {
      // allow no-origin requests (Postman/curl etc.)
      return callback(null, true);
    }
    // allow if exact match in whitelist
    if (whitelist.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    // not allowed
    const msg = `CORS policy: origin ${origin} is not allowed by CORS`;
    console.warn(msg);
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // enable preflight for all routes

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
