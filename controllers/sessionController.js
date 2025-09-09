// server/controllers/sessionController.js
const mongoose = require("mongoose");
const Session = require("../models/Session");

/**
 * POST /api/sessions
 * Body:
 * {
 *   studentId: "...",
 *   title: "One-on-one mentoring",
 *   date: "2025-09-15",           // or ISO "2025-09-15T00:00:00.000Z"
 *   startTime: "14:00",
 *   endTime: "15:00",
 *   mentor: { name: "John Doe", image: "https://..." },
 *   meetingLink: "https://meet.google.com/abc-defg-hij",
 *   status: "scheduled",
 *   notes: "Pre-session homework"
 * }
 */
exports.createSession = async (req, res) => {
  try {
    const {
      studentId,
      title,
      date,
      startTime,
      endTime,
      mentor,
      meetingLink,
      status,
      notes,
    } = req.body;

    // Basic validation
    if (!studentId || !title || !date) {
      return res
        .status(400)
        .json({ ok: false, error: "studentId, title and date are required" });
    }
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ ok: false, error: "Invalid studentId" });
    }

    // Parse date safely
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ ok: false, error: "Invalid date format" });
    }

    const doc = await Session.create({
      studentId,
      title,
      date: parsedDate,
      startTime: startTime || null,
      endTime: endTime || null,
      mentor: mentor || null,
      meetingLink: meetingLink || null,
      status: status || "scheduled",
      notes: notes || null,
    });

    return res
      .status(201)
      .json({ ok: true, message: "Session created", data: doc });
  } catch (err) {
    console.error("createSession error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

/**
 * GET /api/sessions?studentId=<id>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>
 * or GET /api/sessions/:studentId
 *
 * Returns list of sessions for the student. Optional date range filtering with `from` and `to`.
 */
exports.getSessionsByStudent = async (req, res) => {
  try {
    const studentId = req.query.studentId || req.params.studentId;
    if (!studentId)
      return res
        .status(400)
        .json({ ok: false, error: "studentId is required" });
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ ok: false, error: "Invalid studentId" });
    }

    const filter = { studentId };

    // optional date range filters (inclusive)
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;
    if (from && isNaN(from.getTime()))
      return res.status(400).json({ ok: false, error: "Invalid from date" });
    if (to && isNaN(to.getTime()))
      return res.status(400).json({ ok: false, error: "Invalid to date" });

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) {
        // to end of day for inclusive behavior
        const toEnd = new Date(to);
        toEnd.setHours(23, 59, 59, 999);
        filter.date.$lte = toEnd;
      }
    }

    // optional status query: ?status=scheduled
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const sessions = await Session.find(filter)
      .sort({ date: 1, startTime: 1 })
      .lean();

    return res.json({ ok: true, data: sessions });
  } catch (err) {
    console.error("getSessionsByStudent error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
