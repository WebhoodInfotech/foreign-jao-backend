// server/controllers/courseController.js
const mongoose = require("mongoose");
const Course = require("../models/Course");

/**
 * GET /api/getCourses
 * optional query: ?limit=20
 */
exports.getCourses = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "0", 10) || 0, 1000);
    const docs = await Course.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return res.json({ ok: true, data: docs });
  } catch (err) {
    console.error("getCourses error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

/**
 * GET /api/getSpecificCourseData/:id
 */
exports.getSpecificCourseData = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ ok: false, error: "Invalid course id" });
    const doc = await Course.findById(id).lean();
    if (!doc)
      return res.status(404).json({ ok: false, error: "Course not found" });
    return res.json({ ok: true, data: doc });
  } catch (err) {
    console.error("getSpecificCourseData error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

/**
 * POST /api/courses
 * Create a new course (admin)
 * Body: { name, description, thumbnail, university, chapters: [{ title, description, video }] }
 */
exports.createCourse = async (req, res) => {
  try {
    const { name, description, thumbnail, university, chapters } = req.body;
    if (!name)
      return res.status(400).json({ ok: false, error: "name is required" });
    const doc = await Course.create({
      name,
      description,
      thumbnail,
      university,
      chapters: chapters || [],
    });
    return res.status(201).json({ ok: true, data: doc });
  } catch (err) {
    console.error("createCourse error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

/**
 * PUT /api/courses/:id
 * Update course (admin)
 */
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ ok: false, error: "Invalid course id" });
    const updates = req.body;
    const doc = await Course.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();
    if (!doc)
      return res.status(404).json({ ok: false, error: "Course not found" });
    return res.json({ ok: true, data: doc });
  } catch (err) {
    console.error("updateCourse error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

/**
 * DELETE /api/courses/:id
 */
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ ok: false, error: "Invalid course id" });
    const doc = await Course.findByIdAndDelete(id).lean();
    if (!doc)
      return res.status(404).json({ ok: false, error: "Course not found" });
    return res.json({ ok: true, message: "Course deleted" });
  } catch (err) {
    console.error("deleteCourse error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
