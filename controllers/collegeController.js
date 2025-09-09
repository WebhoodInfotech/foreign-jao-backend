// controllers/collegeController.js
const mongoose = require("mongoose");
const College = require("../models/college");

// Function #1: GET all colleges
// GET /colleges  (also aliased to /fetchCollege via routes)
exports.listColleges = async (req, res) => {
  try {
    // optional pagination/query (use if needed)
    const limit = Math.min(parseInt(req.query.limit || "0", 10) || 0, 1000); // cap to 1000
    const docs = await College.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json({ ok: true, data: docs });
  } catch (err) {
    console.error("listColleges error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

// Function #2: GET college by ID
// GET /colleges/:id  (also aliased to /fetchCollege/:id via routes)
exports.getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ ok: false, error: "Invalid college id" });
    }

    const doc = await College.findById(id).lean();
    if (!doc)
      return res.status(404).json({ ok: false, error: "College not found" });

    return res.json({ ok: true, data: doc });
  } catch (err) {
    console.error("getCollegeById error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

// Function #3: CREATE a new college
// POST /colleges
exports.createCollege = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload?.name) {
      return res.status(400).json({ ok: false, error: "name is required" });
    }

    const doc = await College.create(payload);
    return res
      .status(201)
      .json({ ok: true, message: "College created", data: doc });
  } catch (err) {
    console.error("createCollege error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

// Function #4: UPDATE a college by ID
// PUT /colleges/:id
exports.updateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ ok: false, error: "Invalid college id" });
    }

    const updates = req.body; // full or partial doc
    const doc = await College.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();
    if (!doc)
      return res.status(404).json({ ok: false, error: "College not found" });

    return res.json({ ok: true, message: "College updated", data: doc });
  } catch (err) {
    console.error("updateCollege error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

// Function #5: DELETE a college by ID
// DELETE /colleges/:id
exports.deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ ok: false, error: "Invalid college id" });
    }

    const doc = await College.findByIdAndDelete(id).lean();
    if (!doc)
      return res.status(404).json({ ok: false, error: "College not found" });

    return res.json({ ok: true, message: "College deleted" });
  } catch (err) {
    console.error("deleteCollege error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
