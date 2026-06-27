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

const {
  upload,
  bulkImportStudents,
  bulkImportLecturers,
  downloadTemplate,
} = require("../controllers/adminBulkImportController");

const { resetUserPassword } = require("../controllers/adminPasswordController");

// ← single clean import — all three together
const { sessionReport, courseReport, studentReport } = require("../controllers/reportController");

router.use(protect);
router.use(authorize("admin"));

// ─────────────────────────────────────────────
// LECTURER ROUTES
// ─────────────────────────────────────────────
router.route("/lecturers")
  .get(getAllLecturers)
  .post(createLecturer);

router.post("/bulk-import/students", upload.single("file"), bulkImportStudents);
router.post("/bulk-import/lecturers", upload.single("file"), bulkImportLecturers);
router.get("/bulk-import/template/:type", downloadTemplate);

router.route("/lecturers/:id")
  .get(getLecturerById)
  .put(updateLecturer)
  .delete(deleteLecturer);

// ─────────────────────────────────────────────
// STUDENT ROUTES
// ─────────────────────────────────────────────
router.route("/students")
  .get(getAllStudents)
  .post(createStudent);

router.route("/students/:id")
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

// ─────────────────────────────────────────────
// COURSE ROUTES
// ─────────────────────────────────────────────
router.route("/courses")
  .get(getAllCourses)
  .post(createCourse);

router.post("/users/:userId/reset-password", resetUserPassword);

router.route("/courses/:id")
  .get(getCourseById)
  .put(updateCourse)
  .delete(deleteCourse);

router.post("/courses/:id/assign-lecturer", assignLecturer);
router.post("/courses/:id/assign-students", assignStudents);
router.delete("/courses/:id/students/:studentId", removeStudent);

// ─────────────────────────────────────────────
// REPORT ROUTES
// ─────────────────────────────────────────────
router.get("/reports/session/:id", sessionReport);
router.get("/reports/course/:id", courseReport);
router.get("/reports/student/:id", studentReport);

router.get("/reports/course-summary/:id", async (req, res) => {
  try {
    const AttendanceSession = require("../models/AttendanceSession");
    const AttendanceRecord = require("../models/AttendanceRecord");

    const query = { course: req.params.id };
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    const sessions = await AttendanceSession.find(query).sort({ createdAt: 1 });

    const sessionData = await Promise.all(
      sessions.map(async (session) => {
        const records = await AttendanceRecord.find({ session: session._id });
        const present = records.filter((r) => r.status === "present").length;
        const total = records.length;
        const rate = total > 0 ? Math.round((present / total) * 100) : 0;
        return {
          sessionId: session._id,
          topic: session.topic || "Untitled",
          present,
          total,
          rate,
          date: session.createdAt,
          status: session.status,
        };
      })
    );

    res.json({ sessions: sessionData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;