// server/models/Session.js
const mongoose = require("mongoose");

const MentorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String }, // URL to mentor image
  },
  { _id: false }
);

const SessionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    date: { type: Date, required: true }, // date of the session
    startTime: { type: String }, // store as string "14:00" or ISO time fragment
    endTime: { type: String },
    mentor: { type: MentorSchema, default: null },
    meetingLink: { type: String }, // Google Meet / Zoom link
    status: { type: String, default: "scheduled" }, // e.g. scheduled, completed, cancelled
    notes: { type: String }, // optional admin notes
  },
  { timestamps: true }
);

// force collection name "sessions"
module.exports = mongoose.model("Session", SessionSchema, "sessions");
