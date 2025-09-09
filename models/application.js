// models/Application.js
const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    userData: { type: Object },
    collegeData: { type: Object },
    date: { type: Date, default: Date.now },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", ApplicationSchema);
