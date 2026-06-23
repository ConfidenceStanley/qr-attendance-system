const AttendanceSession = require("../models/AttendanceSession");
const AttendanceRecord = require("../models/AttendanceRecord");
const Student = require("../models/Student");
const { verifyQRToken } = require("../utils/qrService");
const {
  calculateDistance,
  isWithinRadius,
  formatDistance,
} = require("../utils/gpsService");

// ─────────────────────────────────────────
// POST /api/student/scan
// The core scan endpoint - all validations here
// ─────────────────────────────────────────
const scanQR = async (req, res, next) => {
  try {
    const { qrToken, latitude, longitude } = req.body;

    // ── Validate input ──────────────────────────────────
    if (!qrToken) {
      return res.status(400).json({ message: "QR token is required" });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "GPS location is required to mark attendance",
      });
    }

    // ── Layer 1: Verify token signature ─────────────────
    const tokenResult = verifyQRToken(qrToken);
    if (!tokenResult.valid) {
      return res.status(400).json({
        message: `Invalid QR code: ${tokenResult.reason}`,
      });
    }

    const { sessionId } = tokenResult;

    // ── Fetch session ───────────────────────────────────
    const session = await AttendanceSession.findById(sessionId).populate(
      "course",
      "courseCode courseTitle"
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // ── Layer 1b: Check session is still active ─────────
    if (session.status !== "active") {
      return res.status(400).json({
        message: "This attendance session has been closed",
      });
    }

    // ── Find student profile ────────────────────────────
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // ── Layer 2: Check student is enrolled in course ────
    const isEnrolled = session.enrolledStudents.some(
      (id) => id.toString() === student._id.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        message: "You are not enrolled in this course",
      });
    }

    // ── Layer 3: Check not already scanned ──────────────
    const alreadyScanned = session.attendees.some(
      (a) => a.student.toString() === student._id.toString()
    );

    if (alreadyScanned) {
      return res.status(400).json({
        message: "You have already marked attendance for this session",
      });
    }

    // ── Layer 4: GPS validation ─────────────────────────
    const distance = calculateDistance(
      session.location.latitude,
      session.location.longitude,
      latitude,
      longitude
    );

    const withinRadius = isWithinRadius(distance, session.location.radius);

    if (!withinRadius) {
      return res.status(403).json({
        message: `You are too far from the classroom. You are ${formatDistance(distance)} away. Maximum allowed: ${formatDistance(session.location.radius)}`,
        distance,
        allowed: session.location.radius,
      });
    }

    // ── All checks passed - mark attendance ─────────────
    session.attendees.push({
      student: student._id,
      scannedAt: new Date(),
      scannedLocation: { latitude, longitude },
      distance,
    });

    await session.save();

    // ── Emit socket event to lecturer ───────────────────
    const io = req.app.get("io");
    if (io) {
      // Populate student info for the live feed on lecturer screen
      const populatedStudent = await Student.findById(student._id).populate(
        "user",
        "fullName email"
      );

      io.to(`session-${sessionId}`).emit("student-scanned", {
        student: {
          _id: student._id,
          studentId: populatedStudent.studentId,
          fullName: populatedStudent.user.fullName,
          email: populatedStudent.user.email,
        },
        scannedAt: new Date(),
        distance,
        presentCount: session.attendees.length,
        totalEnrolled: session.enrolledStudents.length,
      });
    }

    res.json({
      message: "Attendance marked successfully",
      course: session.course.courseTitle,
      courseCode: session.course.courseCode,
      topic: session.topic,
      scannedAt: new Date(),
      distance: formatDistance(distance),
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/student/dashboard
// ─────────────────────────────────────────
const getStudentDashboard = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate(
      "courses",
      "courseCode courseTitle"
    );

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // Calculate attendance % per course
    const courseStats = await Promise.all(
      student.courses.map(async (course) => {
        const total = await AttendanceRecord.countDocuments({
          student: student._id,
          course: course._id,
        });

        const present = await AttendanceRecord.countDocuments({
          student: student._id,
          course: course._id,
          status: "present",
        });

        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        return {
          course: {
            _id: course._id,
            courseCode: course.courseCode,
            courseTitle: course.courseTitle,
          },
          total,
          present,
          absent: total - present,
          percentage,
          // Flag courses below 75% threshold
          belowThreshold: percentage < 75 && total > 0,
        };
      })
    );

    // Overall percentage across all courses
    const totalClasses = courseStats.reduce((sum, c) => sum + c.total, 0);
    const totalPresent = courseStats.reduce((sum, c) => sum + c.present, 0);
    const overallPercentage =
      totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

    // Last 5 attendance records
    const recentScans = await AttendanceRecord.find({
      student: student._id,
      status: "present",
    })
      .sort({ scannedAt: -1 })
      .limit(5)
      .populate("course", "courseCode courseTitle")
      .populate("session", "topic startTime");

    res.json({
      student: {
        fullName: req.user.fullName,
        studentId: student.studentId,
        level: student.level,
        department: student.department,
      },
      overallPercentage,
      totalClasses,
      totalPresent,
      courseStats,
      recentScans,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/student/courses
// ─────────────────────────────────────────
const getStudentCourses = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate({
      path: "courses",
      populate: { path: "lecturer", populate: { path: "user", select: "fullName" } },
    });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    res.json({ courses: student.courses });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/student/courses/:id/attendance
// ─────────────────────────────────────────
const getCourseAttendance = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    const records = await AttendanceRecord.find({
      student: student._id,
      course: req.params.id,
    })
      .sort({ createdAt: -1 })
      .populate("session", "topic startTime endTime");

    const present = records.filter((r) => r.status === "present").length;
    const percentage =
      records.length > 0 ? Math.round((present / records.length) * 100) : 0;

    res.json({ records, summary: { total: records.length, present, percentage } });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/student/attendance/history
// ─────────────────────────────────────────
const getAttendanceHistory = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    const records = await AttendanceRecord.find({ student: student._id })
      .sort({ createdAt: -1 })
      .populate("course", "courseCode courseTitle")
      .populate("session", "topic startTime");

    res.json({ records });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  scanQR,
  getStudentDashboard,
  getStudentCourses,
  getCourseAttendance,
  getAttendanceHistory,
};