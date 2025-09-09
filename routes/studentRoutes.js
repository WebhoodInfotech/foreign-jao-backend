const express = require("express");
const router = express.Router();
const {
  fetchStudentData,
  updateStudentData,
} = require("../controllers/studentController");

// Public endpoints (no middleware)
router.get("/fetchStudentData", fetchStudentData); // use query ?id=...
router.put("/updateStudentData", updateStudentData); // body must include id + fields

module.exports = router;
