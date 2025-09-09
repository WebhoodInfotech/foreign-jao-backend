// server/models/CollegeApplication.js
const mongoose = require("mongoose");

const CollegeApplicationSchema = new mongoose.Schema(
  {
    // link to student (optional but recommended)
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    // Snapshot of student details (denormalized so admin can see without extra lookup)
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    studentNumber: { type: String, required: false },

    fatherName: { type: String },
    motherName: { type: String },

    city: { type: String },
    state: { type: String },
    country: { type: String },

    currentCollege: { type: String }, // note spelling: "college"
    cgpa: { type: Number },
    lastSemesterMarks: { type: Number },

    motivation: { type: String }, // "why you want to join this college"

    // meta
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: false,
    }, // if applying to a specific college
    status: { type: String, default: "submitted" }, // e.g., submitted, in-review, accepted, rejected
    adminNotes: { type: String }, // optional notes by admin
  },
  { timestamps: true }
);

// force collection name 'applications' (optional). Remove third arg to let mongoose pluralize.
module.exports = mongoose.model(
  "CollegeApplication",
  CollegeApplicationSchema,
  "applications"
);
