// server/models/Course.js
const mongoose = require("mongoose");

const ChapterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    video: { type: String }, // URL to video (Cloudinary, Vimeo, etc.)
  },
  { _id: false }
); // chapters will be subdocuments but we can keep them without own _id if desired

const CourseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    thumbnail: { type: String }, // URL
    university: { type: String }, // "By: University name"
    chapters: { type: [ChapterSchema], default: [] },
  },
  { timestamps: true }
);

// force collection name "courses"
module.exports = mongoose.model("Course", CourseSchema, "courses");
