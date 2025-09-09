// server/controllers/enrollmentController.js
const mongoose = require("mongoose");
const Course = require("../models/Course");
const CourseEnrollment = require("../models/courseEnrollment");

/**
 * POST /api/enrollCourse
 * Body: { courseId, studentId }
 * Creates an enrollment snapshot for the student
 */
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;
    if (!courseId || !studentId)
      return res
        .status(400)
        .json({ ok: false, error: "courseId and studentId required" });
    if (
      !mongoose.isValidObjectId(courseId) ||
      !mongoose.isValidObjectId(studentId)
    ) {
      return res.status(400).json({ ok: false, error: "Invalid ids" });
    }

    const course = await Course.findById(courseId).lean();
    if (!course)
      return res.status(404).json({ ok: false, error: "Course not found" });

    // Prevent duplicate enrollment
    const existing = await CourseEnrollment.findOne({ courseId, studentId });
    if (existing)
      return res
        .status(409)
        .json({ ok: false, error: "Already enrolled", data: existing });

    const chapters = (course.chapters || []).map((ch) => ({
      title: ch.title,
      description: ch.description,
      video: ch.video,
      completed: false,
    }));

    const enrollment = await CourseEnrollment.create({
      courseId,
      studentId,
      courseName: course.name,
      courseDescription: course.description,
      courseThumbnail: course.thumbnail,
      chapters,
      totalChapters: chapters.length,
      completedChapters: 0,
      currentChapterIndex: 0,
      startedAt: new Date(),
    });

    return res.status(201).json({ ok: true, data: enrollment });
  } catch (err) {
    console.error("enrollCourse error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

/**
 * GET /api/getEnrolledCourses?studentId=<id>
 */
exports.getEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.query.studentId || req.params.studentId;
    if (!studentId)
      return res.status(400).json({ ok: false, error: "studentId required" });
    if (!mongoose.isValidObjectId(studentId))
      return res.status(400).json({ ok: false, error: "Invalid studentId" });

    const docs = await CourseEnrollment.find({ studentId })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ ok: true, data: docs });
  } catch (err) {
    console.error("getEnrolledCourses error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

/**
 * GET /api/getSpecificEnrolledCourseData/:enrollmentId
 */
exports.getSpecificEnrolledCourseData = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    if (!mongoose.isValidObjectId(enrollmentId))
      return res
        .status(400)
        .json({ ok: false, error: "Invalid enrollment id" });

    const doc = await CourseEnrollment.findById(enrollmentId).lean();
    if (!doc)
      return res.status(404).json({ ok: false, error: "Enrollment not found" });
    return res.json({ ok: true, data: doc });
  } catch (err) {
    console.error("getSpecificEnrolledCourseData error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

/**
 * PUT /api/updateStudentProgress
 * Body: { enrollmentId, action: "completeChapter" | "setChapter", index? }
 *
 * - "completeChapter" marks current chapter completed, increments currentChapterIndex and completedChapters.
 * - "setChapter" sets currentChapterIndex to provided index (0-based).
 */
exports.updateStudentProgress = async (req, res) => {
  try {
    const { enrollmentId, action, index } = req.body;
    if (!enrollmentId || !action)
      return res
        .status(400)
        .json({ ok: false, error: "enrollmentId and action required" });
    if (!mongoose.isValidObjectId(enrollmentId))
      return res.status(400).json({ ok: false, error: "Invalid enrollmentId" });

    const enrollment = await CourseEnrollment.findById(enrollmentId);
    if (!enrollment)
      return res.status(404).json({ ok: false, error: "Enrollment not found" });

    const total =
      enrollment.totalChapters || (enrollment.chapters || []).length;

    if (action === "completeChapter") {
      const curr = enrollment.currentChapterIndex || 0;
      if (curr >= total) {
        return res
          .status(400)
          .json({ ok: false, error: "All chapters already completed" });
      }

      // mark completed
      if (enrollment.chapters && enrollment.chapters[curr])
        enrollment.chapters[curr].completed = true;
      enrollment.completedChapters = (enrollment.chapters || []).filter(
        (c) => c.completed
      ).length;

      // advance index
      enrollment.currentChapterIndex = Math.min(curr + 1, total);

      // if finished, set completedAt
      if (enrollment.completedChapters >= total)
        enrollment.completedAt = new Date();

      await enrollment.save();
      return res.json({ ok: true, data: enrollment });
    }

    if (action === "setChapter") {
      if (typeof index !== "number" || index < 0 || index >= total) {
        return res.status(400).json({ ok: false, error: "Invalid index" });
      }
      enrollment.currentChapterIndex = index;
      await enrollment.save();
      return res.json({ ok: true, data: enrollment });
    }

    return res.status(400).json({ ok: false, error: "Unknown action" });
  } catch (err) {
    console.error("updateStudentProgress error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
