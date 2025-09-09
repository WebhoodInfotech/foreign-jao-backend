// server/controllers/collegeApplicationController.js
const mongoose = require("mongoose");
const CollegeApplication = require("../models/collegeApplication");

/**
 * POST /api/applications
 * Body:
 * {
 *   studentId?: "64f..",             // optional but recommended
 *   studentName: "John Doe",
 *   studentNumber: "9876543210",
 *   fatherName: "Father Name",
 *   motherName: "Mother Name",
 *   city: "Mumbai",
 *   state: "Maharashtra",
 *   country: "India",
 *   currentCollege: "ABC College",
 *   cgpa: 8.5,
 *   lastSemesterMarks: 85,
 *   motivation: "I want to join because..."
 *   collegeId?: "..."                // optional: the college being applied to
 * }
 */
exports.createApplication = async (req, res) => {
  try {
    const payload = req.body;

    // Basic validations
    if (!payload.studentName || !payload.studentEmail) {
      return res.status(400).json({
        ok: false,
        error: "studentName and studentEmail are required",
      });
    }

    if (payload.studentId && !mongoose.isValidObjectId(payload.studentId)) {
      return res.status(400).json({ ok: false, error: "Invalid studentId" });
    }
    if (payload.collegeId && !mongoose.isValidObjectId(payload.collegeId)) {
      return res.status(400).json({ ok: false, error: "Invalid collegeId" });
    }

    const doc = await CollegeApplication.create({
      studentId: payload.studentId || null,
      studentName: payload.studentName,
      studentEmail: payload.studentEmail,
      studentNumber: payload.studentNumber || null,
      fatherName: payload.fatherName || null,
      motherName: payload.motherName || null,
      city: payload.city || null,
      state: payload.state || null,
      country: payload.country || null,
      currentCollege: payload.currentCollege || null,
      cgpa: typeof payload.cgpa === "number" ? payload.cgpa : null,
      lastSemesterMarks:
        typeof payload.lastSemesterMarks === "number"
          ? payload.lastSemesterMarks
          : null,
      motivation: payload.motivation || null,
      collegeId: payload.collegeId || null,
      status: payload.status || "submitted",
      adminNotes: payload.adminNotes || null,
    });

    return res
      .status(201)
      .json({ ok: true, message: "Application created", data: doc });
  } catch (err) {
    console.error("createApplication error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

/**
 * GET /api/applications?studentId=<id>
 * or GET /api/applications/student/:studentId
 *
 * Returns all applications for a student (optionally paginated)
 */
exports.getApplicationsByStudent = async (req, res) => {
  try {
    const studentId = req.query.studentId || req.params.studentId;
    if (!studentId)
      return res
        .status(400)
        .json({ ok: false, error: "studentId is required" });
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ ok: false, error: "Invalid studentId" });
    }

    // optional paging
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      CollegeApplication.find({ studentId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CollegeApplication.countDocuments({ studentId }),
    ]);

    return res.json({ ok: true, data, meta: { total, page, limit } });
  } catch (err) {
    console.error("getApplicationsByStudent error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
