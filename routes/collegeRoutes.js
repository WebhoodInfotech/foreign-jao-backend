// routes/collegeRoutes.js
const express = require("express");
const {
  listColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
} = require("../controllers/collegeController");

const router = express.Router();

/* REST-style endpoints */
router.get("/colleges", listColleges); // Function #1
router.get("/colleges/:id", getCollegeById); // Function #2
router.post("/colleges", createCollege); // Function #3
router.put("/colleges/:id", updateCollege); // Function #4
router.delete("/colleges/:id", deleteCollege); // Function #5

/* Aliases to match your earlier naming */
router.get("/fetchCollege", listColleges);
router.get("/fetchCollege/:id", getCollegeById);

module.exports = router;
