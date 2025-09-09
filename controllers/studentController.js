const User = require("../models/user");

// Fetch student by ID
const fetchStudentData = async (req, res) => {
  try {
    const studentId = req.query.id || req.body.id;
    if (!studentId) {
      return res.status(400).json({ ok: false, error: "Student ID required" });
    }

    const user = await User.findById(studentId).lean();
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    res.json({ ok: true, data: user });
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
};

// Update student by ID
const updateStudentData = async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) {
      return res.status(400).json({ ok: false, error: "Student ID required" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { ...updates, updatedDate: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    res.json({ ok: true, data: user });
  } catch (err) {
    console.error("Error updating student:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
};

module.exports = { fetchStudentData, updateStudentData };
