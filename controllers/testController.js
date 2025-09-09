// controllers/testController.js
const mongoose = require("mongoose");
const Test = require("../models/test");

// 1) Publish new test (POST /tests)
exports.createTest = async (req, res) => {
  try {
    const { name, description, assignment, time } = req.body;
    if (!name || !time) {
      return res
        .status(400)
        .json({ ok: false, error: "name and time are required" });
    }
    const created = await Test.create({
      name,
      description,
      assignment: assignment || [],
      time,
    });
    return res
      .status(201)
      .json({ ok: true, message: "Test created", data: created });
  } catch (err) {
    console.error("createTest error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

// 2) List all tests (GET /tests)
exports.listTests = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "0", 10) || 0, 1000);
    const docs = await Test.find().sort({ createdAt: -1 }).limit(limit).lean();
    return res.json({ ok: true, data: docs });
  } catch (err) {
    console.error("listTests error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

// 3) Get specific test (GET /tests/:id)
exports.getTestById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ ok: false, error: "Invalid test id" });
    const doc = await Test.findById(id).lean();
    if (!doc)
      return res.status(404).json({ ok: false, error: "Test not found" });
    return res.json({ ok: true, data: doc });
  } catch (err) {
    console.error("getTestById error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
