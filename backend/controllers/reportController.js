const { generateSessionReport, generateCourseReport, generateStudentReport } = require("../utils/pdfGenerator");
const { generateSessionCSV, generateCourseCSV, generateStudentCSV } = require("../utils/csvGenerator");

// ─────────────────────────────────────────
// SESSION REPORT
// GET /api/lecturer/reports/session/:id?format=pdf|csv
// ─────────────────────────────────────────
const sessionReport = async (req, res) => {
  try {
    const { id } = req.params;
    const format = req.query.format || "pdf";

    if (format === "csv") {
      await generateSessionCSV(res, id);
    } else {
      await generateSessionReport(res, id);
    }
  } catch (error) {
    console.error("Session report error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message || "Failed to generate report" });
    }
  }
};

// ─────────────────────────────────────────
// COURSE REPORT
// GET /api/lecturer/reports/course/:id?format=pdf|csv&startDate=&endDate=
// ─────────────────────────────────────────
const courseReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { format, startDate, endDate } = req.query;

    if (format === "csv") {
      await generateCourseCSV(res, id, startDate, endDate);
    } else {
      await generateCourseReport(res, id, startDate, endDate);
    }
  } catch (error) {
    console.error("Course report error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message || "Failed to generate report" });
    }
  }
};

// ─────────────────────────────────────────
// STUDENT REPORT
// GET /api/admin/reports/student/:id?format=pdf|csv
// ─────────────────────────────────────────
const studentReport = async (req, res) => {
  try {
    const { id } = req.params;
    const format = req.query.format || "pdf";

    if (format === "csv") {
      await generateStudentCSV(res, id);
    } else {
      await generateStudentReport(res, id);
    }
  } catch (error) {
    console.error("Student report error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message || "Failed to generate report" });
    }
  }
};

module.exports = { sessionReport, courseReport, studentReport };