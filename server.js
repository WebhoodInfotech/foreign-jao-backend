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
function parseAndSanitizeOrigins(envVal) {
  if (!envVal || typeof envVal !== "string") return [];

  return envVal
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((candidate) => {
      try {
        if (!candidate.startsWith("http://") && !candidate.startsWith("https://")) {
          candidate = "http://" + candidate;
        }
        const u = new URL(candidate);
        return u.origin;
      } catch (err) {
        console.warn(`CORS: ignoring invalid origin entry: "${candidate}" (${err?.message})`);
        return null;
      }
    })
    .filter(Boolean);
}

const envOrigins = parseAndSanitizeOrigins(process.env.CORS_ORIGIN);

const defaultWhitelist = [
  "https://foreign-jao-public.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const whitelist = Array.from(new Set([...envOrigins, ...defaultWhitelist]));

if (envOrigins.length === 0) {
  console.info("CORS: no CORS_ORIGIN env detected or no valid entries — using defaults:", defaultWhitelist);
} else {
  console.info("CORS: using whitelist (env + defaults):", whitelist);
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (whitelist.indexOf(origin) !== -1) return callback(null, true);
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

/* -------------------- Safe mounting helper -------------------- */
/**
 * Use safeMount to mount routers so a bad route pattern doesn't crash boot.
 * `mounts` expects an array of objects: { path: string, router: express.Router, name?: string }
 */
function safeMount(mounts) {
  mounts.forEach(({ path, router, name }) => {
    try {
      // Validate path quickly: Express expects strings like "/" or "/api"
      if (typeof path !== "string" || !path.startsWith("/")) {
        console.warn(`Skipping mount for ${name || "<unnamed>"}: invalid mount path "${path}"`);
        return;
      }
      app.use(path, router);
      console.info(`Mounted ${name || "router"} at "${path}"`);
    } catch (err) {
      // Catch errors thrown by path-to-regexp or other mount-time parsing issues.
      console.error(`Failed to mount ${name || "router"} at "${path}":`, err && err.message ? err.message : err);
      // also print stack for debugging (short)
      console.error(err && err.stack ? err.stack.split("\n").slice(0, 6).join("\n") : err);
      // Do NOT throw — we want server to continue starting so you can inspect & fix.
    }
  });
}

/* -------------------- Mount routes safely -------------------- */
safeMount([
  { path: "/", router: authRoutes, name: "authRoutes" },
  { path: "/", router: studentRoutes, name: "studentRoutes" },
  { path: "/", router: collegeRoutes, name: "collegeRoutes" },
  { path: "/", router: testRoutes, name: "testRoutes" },
  { path: "/", router: assetRoutes, name: "assetRoutes" },
  { path: "/", router: courseRoutes, name: "courseRoutes" },
  { path: "/", router: sessionRoutes, name: "sessionRoutes" },
  { path: "/", router: collageApplicationRoutes, name: "collageApplicationRoutes" },
]);

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
