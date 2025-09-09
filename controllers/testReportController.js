// controllers/testReportController.js
const mongoose = require("mongoose");
const TestReport = require("../models/testReport");
const Test = require("../models/test");

// 4) Submit a test report (POST /testReports)
// Body: { testID, studentID, totalMarks, totalMarksScored, totalTimeGiven, totalTimeTaken, answers: [...] }
exports.createTestReport = async (req, res) => {
  try {
    const {
      testID,
      studentID,
      totalMarks,
      totalMarksScored,
      totalTimeGiven,
      totalTimeTaken,
      answers,
    } = req.body;

    // Basic validations
    if (!testID || !studentID) {
      return res
        .status(400)
        .json({ ok: false, error: "testID and studentID are required" });
    }
    if (
      !mongoose.isValidObjectId(testID) ||
      !mongoose.isValidObjectId(studentID)
    ) {
      return res
        .status(400)
        .json({ ok: false, error: "Invalid testID or studentID" });
    }
    if (
      typeof totalMarks !== "number" ||
      typeof totalMarksScored !== "number"
    ) {
      return res.status(400).json({
        ok: false,
        error: "totalMarks and totalMarksScored must be numbers",
      });
    }
    if (
      typeof totalTimeGiven !== "number" ||
      typeof totalTimeTaken !== "number"
    ) {
      return res.status(400).json({
        ok: false,
        error: "totalTimeGiven and totalTimeTaken must be numbers",
      });
    }

    // Optional: ensure test exists
    const test = await Test.findById(testID).lean();
    if (!test)
      return res.status(404).json({ ok: false, error: "Test not found" });

    const created = await TestReport.create({
      testID,
      studentID,
      totalMarks,
      totalMarksScored,
      totalTimeGiven,
      totalTimeTaken,
      answers: Array.isArray(answers) ? answers : [],
    });

    return res
      .status(201)
      .json({ ok: true, message: "Report saved", data: created });
  } catch (err) {
    console.error("createTestReport error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

// 5) Get all test data + analytics for a student (GET /testReports/by-student/:studentId)
exports.getStudentTestAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ ok: false, error: "Invalid student id" });
    }

    // Fetch all reports for student
    const reports = await TestReport.find({ studentID: studentId })
      .sort({ createdAt: -1 })
      .lean();

    // Compute analytics
    const taken = reports.length;
    let totalScore = 0;
    let pass = 0;
    let fail = 0;

    const passPercent = Number(process.env.PASS_PERCENT || 50); // default 50%
    reports.forEach((r) => {
      totalScore += r.totalMarksScored || 0;
      const isPass =
        (r.totalMarksScored || 0) >= ((r.totalMarks || 0) * passPercent) / 100;
      if (isPass) pass += 1;
      else fail += 1;
    });

    const averageScore = taken ? totalScore / taken : 0;

    return res.json({
      ok: true,
      data: {
        summary: {
          testsTaken: taken,
          averageScore, // mean of totalMarksScored
          passCount: pass,
          failCount: fail,
          passPercentRule: passPercent,
        },
        reports, // full list returned as well
      },
    });
  } catch (err) {
    console.error("getStudentTestAnalytics error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
