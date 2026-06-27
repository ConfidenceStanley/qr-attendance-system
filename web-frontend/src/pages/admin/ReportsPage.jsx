import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { HiOutlineDocumentDownload, HiOutlineSearch } from "react-icons/hi";
import { fetchCourses } from "../../redux/slices/courseSlice";
import { fetchStudents } from "../../redux/slices/studentSlice";
import downloadReport from "../../utils/downloadReport";
import axiosInstance from "../../api/axiosInstance";

const c = {
  primary: "#4f46e5",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#f43f5e",
  text: "#18181b",
  textMuted: "#71717a",
  border: "#e4e4e7",
  bg: "#fafafa",
};

const ReportsPage = () => {
  const dispatch = useDispatch();
  const { list: courses } = useSelector((s) => s.courses);
  const { list: students } = useSelector((s) => s.students);

  // ── Section 1: Session Reports ──
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [downloadingSession, setDownloadingSession] = useState(null);

  // ── Section 2: Course Chart ──
  const [chartCourse, setChartCourse] = useState("");
  const [chartStartDate, setChartStartDate] = useState("");
  const [chartEndDate, setChartEndDate] = useState("");
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [downloadingChart, setDownloadingChart] = useState(null);

  // ── Section 3: Student Lookup ──
  const [studentSearch, setStudentSearch] = useState("");
  const [downloadingStudent, setDownloadingStudent] = useState(null);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchStudents());
  }, [dispatch]);

  // ── Load sessions when course selected ──
  useEffect(() => {
    if (!selectedCourse) {
      setSessions([]);
      return;
    }
    const load = async () => {
      setSessionsLoading(true);
      try {
        const res = await axiosInstance.get(
          `/admin/reports/course-summary/${selectedCourse}`
        );
        setSessions(res.data.sessions || []);
      } catch {
        setSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    };
    load();
  }, [selectedCourse]);

  // ── Load chart data ──
  const loadChartData = async () => {
    if (!chartCourse) return;
    setChartLoading(true);
    try {
      const res = await axiosInstance.get(
        `/admin/reports/course-summary/${chartCourse}`,
        { params: { startDate: chartStartDate, endDate: chartEndDate } }
      );
      setChartData(res.data.sessions || []);
    } catch {
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  // ── Filtered students ──
  const filteredStudents = students.filter((s) => {
    const name = s.fullName?.toLowerCase() || "";
    const id = s.studentId?.toLowerCase() || "";
    const q = studentSearch.toLowerCase();
    return name.includes(q) || id.includes(q);
  });

  // ── Download handlers ──
  const handleSessionDownload = async (sessionId, format) => {
    setDownloadingSession(`${sessionId}-${format}`);
    await downloadReport(
      `/admin/reports/session/${sessionId}`,
      `session-report-${sessionId}.${format}`,
      format
    );
    setDownloadingSession(null);
  };

  const handleCourseDownload = async (format) => {
    if (!chartCourse) return;
    setDownloadingChart(format);
    await downloadReport(
      `/admin/reports/course/${chartCourse}`,
      `course-report-${chartCourse}.${format}`,
      format,
      { startDate: chartStartDate, endDate: chartEndDate }
    );
    setDownloadingChart(null);
  };

  const handleStudentDownload = async (studentId, format) => {
    setDownloadingStudent(`${studentId}-${format}`);
    await downloadReport(
      `/admin/reports/student/${studentId}`,
      `student-report-${studentId}.${format}`,
      format
    );
    setDownloadingStudent(null);
  };

  return (
    <div
      style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 32px" }}
      className="fade-in-up"
    >
      {/* ── Page Header ── */}
      <div style={{ marginBottom: "32px" }}>
        <p
          style={{
            fontSize: "13px",
            color: c.textMuted,
            marginBottom: "4px",
          }}
        >
          Reports
        </p>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: c.text,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Attendance Reports
        </h1>
        <p style={{ color: c.textMuted, marginTop: "6px", fontSize: "14px" }}>
          Download session, course and student reports in PDF or CSV
        </p>
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 1 — Session Reports
          Pick a course → see sessions → download
          ══════════════════════════════════════════════ */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${c.border}`,
          borderRadius: "16px",
          padding: "28px",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            fontSize: "17px",
            fontWeight: 700,
            color: c.text,
            marginBottom: "4px",
          }}
        >
          📋 Session Reports
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: c.textMuted,
            marginBottom: "20px",
          }}
        >
          Select a course to view its closed sessions. Download the attendance
          list for any session as PDF or CSV.
        </p>

        {/* Course dropdown */}
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          style={{
            padding: "10px 14px",
            border: `1px solid ${c.border}`,
            borderRadius: "8px",
            fontSize: "14px",
            color: c.text,
            background: "#fff",
            marginBottom: "20px",
            minWidth: "300px",
            fontFamily: "inherit",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="">— Select a course —</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.courseCode} — {course.courseTitle}
            </option>
          ))}
        </select>

        {/* Sessions list */}
        {sessionsLoading ? (
          <p style={{ color: c.textMuted, fontSize: "14px" }}>
            Loading sessions...
          </p>
        ) : selectedCourse && sessions.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: c.textMuted,
              fontSize: "14px",
              border: `1px dashed ${c.border}`,
              borderRadius: "10px",
            }}
          >
            No closed sessions found for this course.
          </div>
        ) : sessions.length > 0 ? (
          <div
            style={{
              border: `1px solid ${c.border}`,
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: c.bg }}>
                  {["Topic", "Date", "Present / Total", "Rate", "Download"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "11px 18px",
                          textAlign: "left",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: c.textMuted,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          borderBottom: `1px solid ${c.border}`,
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, i) => (
                  <tr
                    key={session.sessionId}
                    style={{ borderBottom: `1px solid ${c.border}` }}
                  >
                    <td
                      style={{
                        padding: "13px 18px",
                        fontSize: "14px",
                        color: c.text,
                        fontWeight: 500,
                      }}
                    >
                      {session.topic || "Untitled"}
                    </td>
                    <td
                      style={{
                        padding: "13px 18px",
                        fontSize: "13px",
                        color: c.textMuted,
                      }}
                    >
                      {new Date(session.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td
                      style={{
                        padding: "13px 18px",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: c.success,
                      }}
                    >
                      {session.present} / {session.total}
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 700,
                          background:
                            session.rate >= 75 ? "#d1fae5" : "#fff1f2",
                          color:
                            session.rate >= 75 ? "#065f46" : "#9f1239",
                        }}
                      >
                        {session.rate}%
                      </span>
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() =>
                            handleSessionDownload(session.sessionId, "pdf")
                          }
                          disabled={
                            downloadingSession ===
                            `${session.sessionId}-pdf`
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "5px 12px",
                            background:
                              downloadingSession ===
                              `${session.sessionId}-pdf`
                                ? c.textMuted
                                : c.danger,
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor:
                              downloadingSession ===
                              `${session.sessionId}-pdf`
                                ? "not-allowed"
                                : "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          <HiOutlineDocumentDownload size={13} />
                          {downloadingSession ===
                          `${session.sessionId}-pdf`
                            ? "..."
                            : "PDF"}
                        </button>
                        <button
                          onClick={() =>
                            handleSessionDownload(session.sessionId, "csv")
                          }
                          disabled={
                            downloadingSession ===
                            `${session.sessionId}-csv`
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "5px 12px",
                            background:
                              downloadingSession ===
                              `${session.sessionId}-csv`
                                ? c.textMuted
                                : c.success,
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor:
                              downloadingSession ===
                              `${session.sessionId}-csv`
                                ? "not-allowed"
                                : "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          <HiOutlineDocumentDownload size={13} />
                          {downloadingSession ===
                          `${session.sessionId}-csv`
                            ? "..."
                            : "CSV"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 2 — Course Attendance Chart
          Pick course + dates → see bar chart → download
          ══════════════════════════════════════════════ */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${c.border}`,
          borderRadius: "16px",
          padding: "28px",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            fontSize: "17px",
            fontWeight: 700,
            color: c.text,
            marginBottom: "4px",
          }}
        >
          📊 Course Attendance Trend
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: c.textMuted,
            marginBottom: "20px",
          }}
        >
          Select a course and optional date range to see attendance percentage
          per session as a bar chart. Green = 75%+, Red = below 75%.
        </p>

        {/* Filters row */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "flex-end",
            marginBottom: "24px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: c.textMuted,
                marginBottom: "6px",
              }}
            >
              Course
            </label>
            <select
              value={chartCourse}
              onChange={(e) => setChartCourse(e.target.value)}
              style={{
                padding: "9px 14px",
                border: `1px solid ${c.border}`,
                borderRadius: "8px",
                fontSize: "14px",
                color: c.text,
                background: "#fff",
                fontFamily: "inherit",
                minWidth: "260px",
                outline: "none",
              }}
            >
              <option value="">— Select course —</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseCode} — {course.courseTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: c.textMuted,
                marginBottom: "6px",
              }}
            >
              Start Date (optional)
            </label>
            <input
              type="date"
              value={chartStartDate}
              onChange={(e) => setChartStartDate(e.target.value)}
              style={{
                padding: "9px 14px",
                border: `1px solid ${c.border}`,
                borderRadius: "8px",
                fontSize: "14px",
                color: c.text,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: c.textMuted,
                marginBottom: "6px",
              }}
            >
              End Date (optional)
            </label>
            <input
              type="date"
              value={chartEndDate}
              onChange={(e) => setChartEndDate(e.target.value)}
              style={{
                padding: "9px 14px",
                border: `1px solid ${c.border}`,
                borderRadius: "8px",
                fontSize: "14px",
                color: c.text,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
          </div>

          <button
            onClick={loadChartData}
            disabled={!chartCourse || chartLoading}
            style={{
              padding: "9px 24px",
              background: !chartCourse ? c.textMuted : c.primary,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: !chartCourse ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              height: "40px",
            }}
          >
            {chartLoading ? "Loading..." : "Generate"}
          </button>
        </div>

        {/* Chart area */}
        {chartData.length > 0 ? (
          <>
            <div
              style={{
                border: `1px solid ${c.border}`,
                borderRadius: "10px",
                padding: "20px 12px",
                background: c.bg,
              }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
                  <XAxis
                    dataKey="topic"
                    tick={{ fontSize: 11, fill: c.textMuted }}
                    angle={-35}
                    textAnchor="end"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: c.textMuted }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Attendance Rate"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: `1px solid ${c.border}`,
                      fontSize: "13px",
                    }}
                  />
                  <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.rate >= 75 ? c.success : c.danger}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Download buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => handleCourseDownload("pdf")}
                disabled={downloadingChart === "pdf"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 18px",
                  background:
                    downloadingChart === "pdf" ? c.textMuted : c.danger,
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor:
                    downloadingChart === "pdf" ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                <HiOutlineDocumentDownload size={15} />
                {downloadingChart === "pdf"
                  ? "Downloading..."
                  : "Download PDF"}
              </button>
              <button
                onClick={() => handleCourseDownload("csv")}
                disabled={downloadingChart === "csv"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 18px",
                  background:
                    downloadingChart === "csv" ? c.textMuted : c.success,
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor:
                    downloadingChart === "csv" ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                <HiOutlineDocumentDownload size={15} />
                {downloadingChart === "csv"
                  ? "Downloading..."
                  : "Download CSV"}
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              height: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px dashed ${c.border}`,
              borderRadius: "10px",
              color: c.textMuted,
              fontSize: "14px",
            }}
          >
            {chartLoading
              ? "Loading chart data..."
              : "Select a course and click Generate to see the chart"}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 3 — Student Report Lookup
          Search student → download their report
          ══════════════════════════════════════════════ */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${c.border}`,
          borderRadius: "16px",
          padding: "28px",
        }}
      >
        <h2
          style={{
            fontSize: "17px",
            fontWeight: 700,
            color: c.text,
            marginBottom: "4px",
          }}
        >
          🎓 Student Report Lookup
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: c.textMuted,
            marginBottom: "20px",
          }}
        >
          Search for a student by name or ID. Download their full attendance
          report showing percentage per course.
        </p>

        {/* Search input */}
        <div
          style={{
            position: "relative",
            marginBottom: "20px",
            maxWidth: "420px",
          }}
        >
          <HiOutlineSearch
            size={16}
            color={c.textMuted}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            type="text"
            placeholder="Search by name or student ID..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              border: `1px solid ${c.border}`,
              borderRadius: "8px",
              fontSize: "14px",
              color: c.text,
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Results */}
        {studentSearch.length > 0 && (
          <div
            style={{
              border: `1px solid ${c.border}`,
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: c.bg }}>
                  {["Name", "Student ID", "Level", "Department", "Download"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "11px 18px",
                          textAlign: "left",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: c.textMuted,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          borderBottom: `1px solid ${c.border}`,
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: c.textMuted,
                        fontSize: "14px",
                      }}
                    >
                      No students found matching "{studentSearch}"
                    </td>
                  </tr>
                ) : (
                  filteredStudents.slice(0, 10).map((student) => (
                    <tr
                      key={student.id}
                      style={{ borderBottom: `1px solid ${c.border}` }}
                    >
                      <td
                        style={{
                          padding: "13px 18px",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: c.text,
                        }}
                      >
                        {student?.fullName || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "13px 18px",
                          fontSize: "13px",
                          color: c.textMuted,
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {student.studentId || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "13px 18px",
                          fontSize: "13px",
                          color: c.textMuted,
                        }}
                      >
                        {student.level}
                      </td>
                      <td
                        style={{
                          padding: "13px 18px",
                          fontSize: "13px",
                          color: c.textMuted,
                        }}
                      >
                        {student.department}
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() =>
                              handleStudentDownload(student.id, "pdf")
                            }
                            disabled={
                              downloadingStudent === `${student.id}-pdf`
                            }
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "5px 12px",
                              background:
                                downloadingStudent === `${student.id}-pdf`
                                  ? c.textMuted
                                  : c.danger,
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor:
                                downloadingStudent === `${student.id}-pdf`
                                  ? "not-allowed"
                                  : "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            <HiOutlineDocumentDownload size={13} />
                            {downloadingStudent === `${student.id}-pdf`
                              ? "..."
                              : "PDF"}
                          </button>
                          <button
                            onClick={() =>
                              handleStudentDownload(student.id, "csv")
                            }
                            disabled={
                              downloadingStudent === `${student.id}-csv`
                            }
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "5px 12px",
                              background:
                                downloadingStudent === `${student.id}-csv`
                                  ? c.textMuted
                                  : c.success,
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor:
                                downloadingStudent === `${student.id}-csv`
                                  ? "not-allowed"
                                  : "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            <HiOutlineDocumentDownload size={13} />
                            {downloadingStudent === `${student.id}-csv`
                              ? "..."
                              : "CSV"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;