const AttendanceSession = require("../models/AttendanceSession");
const AttendanceRecord = require("../models/AttendanceRecord");
const Course = require("../models/Course");
const Student = require("../models/Student");

const toCSV = (headers, rows) => {
  const headerLine = headers.join(",");
  const dataLines = rows.map((row) =>
    headers
      .map((h) => {
        const val = row[h] !== undefined ? String(row[h]) : "";
        return val.includes(",") || val.includes("\n") ? `"${val}"` : val;
      })
      .join(",")
  );
  return [headerLine, ...dataLines].join("\n");
};

// ─────────────────────────────────────────
// CSV 1: Session Report
// ─────────────────────────────────────────
const generateSessionCSV = async (res, sessionId) => {
  const session = await AttendanceSession.findById(sessionId)
    .populate("course", "name courseCode");

  if (!session) throw new Error("Session not found");

  const records = await AttendanceRecord.find({ session: sessionId })
    .populate({
      path: "student",
      select: "studentId level",
      populate: { path: "user", select: "fullName" },
    });

  const headers = [
    "S/N",
    "Full Name",
    "Student Id",
    "Level",
    "Status",
    "Scan Time",
  ];

  const rows = records.map((record, index) => ({
    "S/N": index + 1,
    "Full Name": record.student?.user?.fullName || "Unknown",
    "Matric Number": record.student?.studentId || "N/A",
    "Level": record.student?.level || "N/A",
    "Status": record.status?.toUpperCase() || "N/A",
    "Scan Time": record.scannedAt
      ? new Date(record.scannedAt).toLocaleString()
      : "N/A",
  }));

  const csv = toCSV(headers, rows);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="session-report-${sessionId}.csv"`
  );
  res.send(csv);
};

// ─────────────────────────────────────────
// CSV 2: Course Report
// ─────────────────────────────────────────
const generateCourseCSV = async (res, courseId, startDate, endDate) => {
  const course = await Course.findById(courseId);
  if (!course) throw new Error("Course not found");

  const query = { course: courseId };
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const sessions = await AttendanceSession.find(query).sort({ createdAt: -1 });

  const sessionData = await Promise.all(
    sessions.map(async (session) => {
      const records = await AttendanceRecord.find({ session: session._id });
      const present = records.filter((r) => r.status === "present").length;
      const total = records.length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      return { session, present, total, rate };
    })
  );

  const headers = [
    "S/N",
    "Topic",
    "Date",
    "Present",
    "Total Students",
    "Attendance Rate",
    "Status",
  ];

  const rows = sessionData.map(({ session, present, total, rate }, index) => ({
    "S/N": index + 1,
    "Topic": session.topic || "N/A",
    "Date": new Date(session.createdAt).toLocaleDateString(),
    "Present": present,
    "Total Students": total,
    "Attendance Rate": `${rate}%`,
    "Status": session.status?.toUpperCase() || "N/A",
  }));

  const csv = toCSV(headers, rows);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="course-report-${courseId}.csv"`
  );
  res.send(csv);
};

// ─────────────────────────────────────────
// CSV 3: Student Report
// ─────────────────────────────────────────
const generateStudentCSV = async (res, studentId) => {
  const student = await Student.findById(studentId)
    .populate("user", "fullName")
    .populate("enrolledCourses", "name courseTitle");

  if (!student) throw new Error("Student not found");

  const courseData = await Promise.all(
    student.enrolledCourses.map(async (course) => {
      const sessions = await AttendanceSession.find({
        course: course._id,
        status: "closed",
      });
      const sessionIds = sessions.map((s) => s._id);
      const totalSessions = sessions.length;
      const presentCount = await AttendanceRecord.countDocuments({
        session: { $in: sessionIds },
        student: studentId,
        status: "present",
      });
      const rate =
        totalSessions > 0
          ? Math.round((presentCount / totalSessions) * 100)
          : 0;
      return { course, totalSessions, presentCount, rate };
    })
  );

  const headers = [
    "S/N",
    "Course Code",
    "Course Name",
    "Total Sessions",
    "Present",
    "Attendance Rate",
  ];

  const rows = courseData.map(
    ({ course, totalSessions, presentCount, rate }, index) => ({
      "S/N": index + 1,
      "Course Code": course.courseCode || "N/A",
      "Course Name": course.name || "N/A",
      "Total Sessions": totalSessions,
      "Present": presentCount,
      "Attendance Rate": `${rate}%`,
    })
  );

  const csv = toCSV(headers, rows);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="student-report-${studentId}.csv"`
  );
  res.send(csv);
};

module.exports = {
  generateSessionCSV,
  generateCourseCSV,
  generateStudentCSV,
};