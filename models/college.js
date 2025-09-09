// models/College.js
const mongoose = require("mongoose");

// Subdocument for course
const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },

  overview: {
    fees: { type: Number },
    satRange: { type: String },
    acceptanceRate: { type: Number },
    location: { type: String },
    website: { type: String },
    actRange: { type: String },
  },

  costAndScholarship: {
    inStateCost: { type: Number },
    outStateCost: { type: Number },
    inStateTuitionFee: { type: Number },
    roomAndBoard: { type: Number },
    averageTotalAidAwarded: { type: Number },
    graduateAwardedLoan: { type: Number },
  },

  application: [{ type: String }], // array of strings

  academics: {
    studentFacultyRatio: { type: String },
    academicCalendar: { type: String },
    popularCourses: [{ type: String }],
  },

  students: {
    fullTimeEnrollment: { type: Number },
    admissionPolicy: { type: String },
    internationalStudents: { type: Number },
    retentionRate: { type: Number },
  },
});

// Main College Schema
const CollegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: Object }, // structure later if you want
    gallery: { type: [String] },
    logo: { type: String },
    courses: { type: [CourseSchema] }, // array of courses
  },
  { timestamps: true }
);

// 3rd param forces the collection name to "college"
module.exports = mongoose.model("Colleges", CollegeSchema, "colleges");
