// models/Test.js
const mongoose = require("mongoose");

// One question (assignment item)
const AssignmentSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }], // ["option1","option2","option3"]
  correctAnswer: { type: String, required: true }, // e.g., "option1"
});

// Main Test schema
const TestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // "English Test"
    description: { type: String },
    assignment: { type: [AssignmentSchema], default: [] },
    time: { type: Number, required: true }, // minutes
  },
  { timestamps: true }
);

// Force exact collection name "test"
module.exports = mongoose.model("Test", TestSchema, "test");
