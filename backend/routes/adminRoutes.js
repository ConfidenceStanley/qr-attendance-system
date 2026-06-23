const express = require("express");
const router = express.Router();

// Middleware
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Controllers
const {
  createLecturer,
  getAllLecturers,
  getLecturerById,
  updateLecturer,
  deleteLecturer,
} = require("../controllers/adminLecturerController");

const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/adminStudentController");

const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  assignLecturer,
  assignStudents,
  removeStudent,
} = require("../controllers/adminCourseController");

const { resetUserPassword } = require("../controllers/adminPasswordController");

// All routes below require login + admin role
// protect → checks JWT token is valid
// authorize("admin") → checks role is admin
router.use(protect);
router.use(authorize("admin"));

// ─────────────────────────────────────────────
// LECTURER ROUTES
// ─────────────────────────────────────────────
router.route("/lecturers")
  .get(getAllLecturers)       // GET  /api/admin/lecturers
  .post(createLecturer);     // POST /api/admin/lecturers

router.route("/lecturers/:id")
  .get(getLecturerById)      // GET    /api/admin/lecturers/:id
  .put(updateLecturer)       // PUT    /api/admin/lecturers/:id
  .delete(deleteLecturer);   // DELETE /api/admin/lecturers/:id

// ─────────────────────────────────────────────
// STUDENT ROUTES
// ─────────────────────────────────────────────
router.route("/students")
  .get(getAllStudents)        // GET  /api/admin/students
  .post(createStudent);      // POST /api/admin/students

router.route("/students/:id")
  .get(getStudentById)       // GET    /api/admin/students/:id
  .put(updateStudent)        // PUT    /api/admin/students/:id
  .delete(deleteStudent);    // DELETE /api/admin/students/:id

// ─────────────────────────────────────────────
// COURSE ROUTES
// ─────────────────────────────────────────────
router.route("/courses")
  .get(getAllCourses)         // GET  /api/admin/courses
  .post(createCourse);       // POST /api/admin/courses

router.post("/users/:userId/reset-password", resetUserPassword);

router.route("/courses/:id")
  .get(getCourseById)        // GET    /api/admin/courses/:id
  .put(updateCourse)         // PUT    /api/admin/courses/:id
  .delete(deleteCourse);     // DELETE /api/admin/courses/:id

// Course assignment routes
router.post(
  "/courses/:id/assign-lecturer",   // POST /api/admin/courses/:id/assign-lecturer
  assignLecturer
);

router.post(
  "/courses/:id/assign-students",   // POST /api/admin/courses/:id/assign-students
  assignStudents
);

router.delete(
  "/courses/:id/students/:studentId", // DELETE /api/admin/courses/:id/students/:studentId
  removeStudent
);

module.exports = router;