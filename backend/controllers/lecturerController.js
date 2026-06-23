const AttendanceSession = require("../models/AttendanceSession");
const AttendanceRecord = require("../models/AttendanceRecord");
const Course = require("../models/Course");
const Student = require("../models/Student");
const Lecturer = require("../models/Lecturer");
const { generateQRToken } = require("../utils/qrService");

// ─────────────────────────────────────────
// GET /api/lecturer/dashboard
// ─────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    // Find lecturer profile from logged-in user
    const lecturer = await Lecturer.findOne({ user: req.user._id });
    if (!lecturer) {
      return res.status(404).json({ message: "Lecturer profile not found" });
    }

    // Count their assigned courses
    const totalCourses = lecturer.courses.length;

    // Get today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Sessions created today
    const todaysSessions = await AttendanceSession.countDocuments({
      lecturer: lecturer._id,
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    // Currently active sessions
    const activeSessions = await AttendanceSession.countDocuments({
      lecturer: lecturer._id,
      status: "active",
    });

    // Total sessions all time
    const totalSessions = await AttendanceSession.countDocuments({
      lecturer: lecturer._id,
    });

    // 5 most recent sessions for the dashboard list
    const recentSessions = await AttendanceSession.find({
      lecturer: lecturer._id,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("course", "courseCode courseTitle");

    res.json({
      stats: {
        totalCourses,
        todaysSessions,
        activeSessions,
        totalSessions,
      },
      recentSessions,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/lecturer/courses
// ─────────────────────────────────────────
const getMyCourses = async (req, res, next) => {
  try {
    const lecturer = await Lecturer.findOne({ user: req.user._id });
    if (!lecturer) {
      return res.status(404).json({ message: "Lecturer profile not found" });
    }

    // Populate full course details including enrolled students
    const courses = await Course.find({
      _id: { $in: lecturer.courses },
      isActive: true,
    }).populate("students", "studentId user");

    // Attach student count to each course
    const coursesWithCount = courses.map((c) => ({
      ...c.toObject(),
      studentCount: c.students.length,
    }));

    res.json({ courses: coursesWithCount });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/lecturer/courses/:id/students
// ─────────────────────────────────────────
const getCourseStudents = async (req, res, next) => {
  try {
    const lecturer = await Lecturer.findOne({ user: req.user._id });

    // Verify this course belongs to this lecturer
    const course = await Course.findOne({
      _id: req.params.id,
      lecturer: lecturer._id,
    }).populate({
      path: "students",
      populate: { path: "user", select: "fullName email isActive" },
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or not assigned to you" });
    }

    res.json({ students: course.students });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /api/lecturer/sessions
// Create a new attendance session
// ─────────────────────────────────────────
const createSession = async (req, res, next) => {
  try {
    const { courseId, topic, qrMode, location, duration } = req.body;

    // Validation
    if (!courseId || !topic || !location) {
      return res
        .status(400)
        .json({ message: "Course, topic, and location are required" });
    }

    if (!location.latitude || !location.longitude) {
      return res
        .status(400)
        .json({ message: "Valid GPS coordinates are required" });
    }

    const lecturer = await Lecturer.findOne({ user: req.user._id });
    if (!lecturer) {
      return res.status(404).json({ message: "Lecturer profile not found" });
    }

    // Ensure this course is assigned to this lecturer
    const course = await Course.findOne({
      _id: courseId,
      lecturer: lecturer._id,
      isActive: true,
    }).populate("students");

    if (!course) {
      return res
        .status(403)
        .json({ message: "Course not found or not assigned to you" });
    }

    // Prevent duplicate active sessions for same course
    const existingActive = await AttendanceSession.findOne({
      course: courseId,
      lecturer: lecturer._id,
      status: "active",
    });

    if (existingActive) {
      return res.status(400).json({
        message: "An active session already exists for this course",
        sessionId: existingActive._id,
      });
    }

    // Generate the initial QR token
    // We need session ID first - create with placeholder then update
    const session = new AttendanceSession({
      course: courseId,
      lecturer: lecturer._id,
      topic: topic.trim(),
      qrMode: qrMode || "dynamic",
      qrToken: "pending", // placeholder
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        radius: location.radius || 50,
      },
      duration: duration || 30,
      // Snapshot enrolled students at session creation time
      enrolledStudents: course.students.map((s) => s._id),
    });

    await session.save();

    // Now generate token using the real session ID
    const qrToken = generateQRToken(session._id.toString());
    session.qrToken = qrToken;
    await session.save();

    // Populate course info for response
    const populated = await AttendanceSession.findById(session._id).populate(
      "course",
      "courseCode courseTitle level"
    );

    res.status(201).json({
      message: "Session created successfully",
      session: populated,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/lecturer/sessions
// All sessions for this lecturer
// ─────────────────────────────────────────
const getMySessions = async (req, res, next) => {
  try {
    const lecturer = await Lecturer.findOne({ user: req.user._id });

    const { status, courseId } = req.query;
    const filter = { lecturer: lecturer._id };

    if (status) filter.status = status;
    if (courseId) filter.course = courseId;

    const sessions = await AttendanceSession.find(filter)
      .sort({ createdAt: -1 })
      .populate("course", "courseCode courseTitle");

    // Attach counts without loading all attendee data
    const sessionsWithCounts = sessions.map((s) => ({
      ...s.toObject(),
      presentCount: s.attendees.length,
      totalEnrolled: s.enrolledStudents.length,
    }));

    res.json({ sessions: sessionsWithCounts });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/lecturer/sessions/:id
// Single session with full attendee list
// ─────────────────────────────────────────
const getSessionById = async (req, res, next) => {
  try {
    const lecturer = await Lecturer.findOne({ user: req.user._id });

    const session = await AttendanceSession.findOne({
      _id: req.params.id,
      lecturer: lecturer._id,
    })
      .populate("course", "courseCode courseTitle level department")
      .populate({
        path: "attendees.student",
        populate: { path: "user", select: "fullName email" },
      })
      .populate({
        path: "enrolledStudents",
        populate: { path: "user", select: "fullName email" },
      });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json({ session });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// PUT /api/lecturer/sessions/:id/close
// Close an active session + create records
// ─────────────────────────────────────────
const closeSession = async (req, res, next) => {
  try {
    const lecturer = await Lecturer.findOne({ user: req.user._id });

    const session = await AttendanceSession.findOne({
      _id: req.params.id,
      lecturer: lecturer._id,
      status: "active",
    });

    if (!session) {
      return res
        .status(404)
        .json({ message: "Active session not found" });
    }

    // Mark session closed
    session.status = "closed";
    session.endTime = new Date();
    await session.save();

    // Build set of student IDs who attended
    const attendedIds = new Set(
      session.attendees.map((a) => a.student.toString())
    );

    // Create AttendanceRecord for every enrolled student
    // present → scanned, absent → did not scan
    const recordPromises = session.enrolledStudents.map((studentId) => {
      const attended = attendedIds.has(studentId.toString());
      const attendeeEntry = attended
        ? session.attendees.find(
            (a) => a.student.toString() === studentId.toString()
          )
        : null;

      return AttendanceRecord.findOneAndUpdate(
        { session: session._id, student: studentId },
        {
          session: session._id,
          student: studentId,
          course: session.course,
          status: attended ? "present" : "absent",
          scannedAt: attended ? attendeeEntry.scannedAt : null,
          scannedLocation: attended ? attendeeEntry.scannedLocation : null,
          distance: attended ? attendeeEntry.distance : null,
        },
        { upsert: true, new: true }
      );
    });

    await Promise.all(recordPromises);

    res.json({
      message: "Session closed successfully",
      presentCount: attendedIds.size,
      absentCount: session.enrolledStudents.length - attendedIds.size,
      totalEnrolled: session.enrolledStudents.length,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/lecturer/sessions/:id/attendance
// Attendance list for a closed session
// ─────────────────────────────────────────
const getSessionAttendance = async (req, res, next) => {
  try {
    const lecturer = await Lecturer.findOne({ user: req.user._id });

    // Verify session belongs to this lecturer
    const session = await AttendanceSession.findOne({
      _id: req.params.id,
      lecturer: lecturer._id,
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const records = await AttendanceRecord.find({ session: req.params.id })
      .populate({
        path: "student",
        populate: { path: "user", select: "fullName email" },
        select: "studentId level department",
      })
      .sort({ status: 1 }); // present first (alphabetically)

    res.json({ records });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// PUT /api/lecturer/sessions/:id/attendance/:studentId
// Manual override for individual student
// ─────────────────────────────────────────
const updateAttendanceRecord = async (req, res, next) => {
  try {
    const { status, editNote } = req.body;

    if (!["present", "absent", "late"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const record = await AttendanceRecord.findOneAndUpdate(
      {
        session: req.params.id,
        student: req.params.studentId,
      },
      {
        status,
        manuallyEdited: true,
        editedBy: req.user._id,
        editNote: editNote || "",
      },
      { new: true }
    ).populate({
      path: "student",
      populate: { path: "user", select: "fullName" },
    });

    if (!record) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.json({ message: "Record updated", record });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getMyCourses,
  getCourseStudents,
  createSession,
  getMySessions,
  getSessionById,
  closeSession,
  getSessionAttendance,
  updateAttendanceRecord,
};