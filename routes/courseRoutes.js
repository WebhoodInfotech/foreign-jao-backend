// server/routes/courseRoutes.js
const express = require("express");
const router = express.Router();

const {
  getCourses,
  getSpecificCourseData,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

const {
  enrollCourse,
  getEnrolledCourses,
  getSpecificEnrolledCourseData,
  updateStudentProgress,
} = require("../controllers/enrollmentController");

/* Course (public + admin) */
router.get("/getCourses", getCourses); // list all courses
router.get("/getSpecificCourseData/:id", getSpecificCourseData); // get course by id

// admin endpoints (optional)
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

/* Enrollment (student) */
router.post("/enrollCourse", enrollCourse); // student enrolls
router.get("/getEnrolledCourses", getEnrolledCourses); // ?studentId=
router.get("/getEnrolledCourses/:studentId", getEnrolledCourses);
router.get(
  "/getSpecificEnrolledCourseData/:enrollmentId",
  getSpecificEnrolledCourseData
);

router.put("/updateStudentProgress", updateStudentProgress);

module.exports = router;
