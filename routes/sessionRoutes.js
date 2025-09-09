// server/routes/sessionRoutes.js
const express = require("express");
const router = express.Router();
const {
  createSession,
  getSessionsByStudent,
} = require("../controllers/sessionController");

// Create a new session (admin)
router.post("/sessions", createSession);

// Get sessions by studentId (query or param)
router.get("/sessions", getSessionsByStudent);
router.get("/sessions/:studentId", getSessionsByStudent);

module.exports = router;
