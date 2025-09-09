// server/models/CourseEnrollment.js
const mongoose = require("mongoose");

const EnrollmentChapterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    video: { type: String },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const CourseEnrollmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // snapshot of course info at enrollment time:
    courseName: { type: String, required: true },
    courseDescription: { type: String },
    courseThumbnail: { type: String },

    chapters: { type: [EnrollmentChapterSchema], default: [] },

    totalChapters: { type: Number, default: 0 },
    completedChapters: { type: Number, default: 0 },
    currentChapterIndex: { type: Number, default: 0 }, // 0-based index of current chapter

    // optional: track progress percent, startedAt, completedAt
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// force collection name "courseenrollments"
module.exports = mongoose.model(
  "CourseEnrollment",
  CourseEnrollmentSchema,
  "courseenrollments"
);
