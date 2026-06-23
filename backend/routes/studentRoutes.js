const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  scanQR,
  getStudentDashboard,
  getStudentCourses,
  getCourseAttendance,
  getAttendanceHistory,
} = require("../controllers/studentScanController");

// All routes require login + student role
router.use(protect, authorize("student"));

router.post("/scan", scanQR);
router.get("/dashboard", getStudentDashboard);
router.get("/courses", getStudentCourses);
router.get("/courses/:id/attendance", getCourseAttendance);
router.get("/attendance/history", getAttendanceHistory);

module.exports = router;