const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  getDashboard,
  getMyCourses,
  getCourseStudents,
  createSession,
  getMySessions,
  getSessionById,
  closeSession,
  getSessionAttendance,
  updateAttendanceRecord,
} = require("../controllers/lecturerController");

// All routes require login + lecturer role
router.use(protect, authorize("lecturer"));

router.get("/dashboard", getDashboard);

router.get("/courses", getMyCourses);
router.get("/courses/:id/students", getCourseStudents);

router.post("/sessions", createSession);
router.get("/sessions", getMySessions);
router.get("/sessions/:id", getSessionById);
router.put("/sessions/:id/close", closeSession);
router.get("/sessions/:id/attendance", getSessionAttendance);
router.put(
  "/sessions/:id/attendance/:studentId",
  updateAttendanceRecord
);

module.exports = router;