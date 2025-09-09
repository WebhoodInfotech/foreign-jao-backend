// server/routes/collegeApplicationRoutes.js
const express = require("express");
const router = express.Router();
const {
  createApplication,
  getApplicationsByStudent,
} = require("../controllers/collegeApplicationController");

// Create application
router.post("/applications", createApplication);

// Get applications by studentId (query or param)
router.get("/applications", getApplicationsByStudent);
router.get("/applications/student/:studentId", getApplicationsByStudent);

module.exports = router;
