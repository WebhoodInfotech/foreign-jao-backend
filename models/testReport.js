// models/TestReport.js
const mongoose = require("mongoose");

// One answered question record
const AnswerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  optionSelected: { type: String, required: true },
  correct: { type: Boolean, required: true },
});

const TestReportSchema = new mongoose.Schema(
  {
    testID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    studentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalMarks: { type: Number, required: true }, // e.g., 100
    totalMarksScored: { type: Number, required: true }, // e.g., 90
    totalTimeGiven: { type: Number, required: true }, // minutes
    totalTimeTaken: { type: Number, required: true }, // minutes
    answers: { type: [AnswerSchema], default: [] },
  },
  { timestamps: true }
);

// Force exact collection name "testreport"
module.exports = mongoose.model("TestReport", TestReportSchema, "testreport");
