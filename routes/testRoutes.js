// routes/testRoutes.js
const express = require("express");
const {
  createTest,
  listTests,
  getTestById,
} = require("../controllers/testController");
const {
  createTestReport,
  getStudentTestAnalytics,
} = require("../controllers/testReportController");

const router = express.Router();

// Tests
router.post("/tests", createTest); // 1) publish new test
router.get("/tests", listTests); // 2) list all tests
router.get("/tests/:id", getTestById); // 3) get specific test

// Test Reports
router.post("/testReports", createTestReport); // 4) submit a test attempt
router.get("/testReports/by-student/:studentId", getStudentTestAnalytics); // 5) student analytics

module.exports = router;
