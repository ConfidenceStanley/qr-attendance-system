import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { HiOutlineEye, HiOutlineDocumentDownload } from "react-icons/hi";
import LecturerLayout from "../../components/lecturer/LecturerLayout";
import { fetchMySessions } from "../../redux/slices/lecturerSessionSlice";
import downloadReport from "../../utils/downloadReport";

const colors = {
  primary: "#4f46e5",
  text: "#18181b",
  textMuted: "#71717a",
  border: "#e4e4e7",
  success: "#10b981",
  error: "#f43f5e",
};

const AttendancePage = () => {
  const dispatch = useDispatch();
  const { sessions, loading } = useSelector((s) => s.lecturerSession);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    dispatch(fetchMySessions({ status: "closed" }));
  }, [dispatch]);

  const closedSessions = sessions.filter((s) => s.status === "closed");

  const handleDownload = async (sessionId, format) => {
    setDownloadingId(`${sessionId}-${format}`);
    await downloadReport(
      `/lecturer/reports/session/${sessionId}`,
      `session-report-${sessionId}.${format}`,
      format
    );
    setDownloadingId(null);
  };

  return (
    <LecturerLayout>
      <div style={{ maxWidth: "1100px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: colors.text,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Attendance Records
          </h1>
          <p
            style={{
              color: colors.textMuted,
              marginTop: "6px",
              fontSize: "14px",
            }}
          >
            View and download attendance for closed sessions
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            border: `1px solid ${colors.border}`,
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div
              style={{
                padding: "64px",
                textAlign: "center",
                color: colors.textMuted,
              }}
            >
              Loading...
            </div>
          ) : closedSessions.length === 0 ? (
            <div
              style={{
                padding: "64px",
                textAlign: "center",
                color: colors.textMuted,
                fontSize: "14px",
              }}
            >
              No closed sessions yet.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {[
                    "Course",
                    "Topic",
                    "Date",
                    "Present",
                    "Absent",
                    "Rate",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 20px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: colors.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {closedSessions.map((session) => {
                  const rate =
                    session.totalEnrolled > 0
                      ? Math.round(
                          (session.presentCount / session.totalEnrolled) * 100
                        )
                      : 0;
                  return (
                    <tr
                      key={session._id}
                      style={{ borderBottom: `1px solid ${colors.border}` }}
                    >
                      <td
                        style={{
                          padding: "14px 20px",
                          fontWeight: 700,
                          fontSize: "14px",
                          color: colors.text,
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {session.course?.courseCode}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          fontSize: "14px",
                          color: colors.textMuted,
                        }}
                      >
                        {session.topic}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          fontSize: "13px",
                          color: colors.textMuted,
                        }}
                      >
                        {new Date(session.createdAt).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short" }
                        )}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: colors.success,
                        }}
                      >
                        {session.presentCount}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: colors.error,
                        }}
                      >
                        {session.totalEnrolled - session.presentCount}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 700,
                            background: rate >= 75 ? "#d1fae5" : "#fff1f2",
                            color: rate >= 75 ? "#065f46" : "#9f1239",
                          }}
                        >
                          {rate}%
                        </span>
                      </td>

                      {/* ── Actions Column ── */}
                      <td style={{ padding: "14px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {/* View button */}
                          <Link
                            to={`/lecturer/sessions/${session._id}/attendance`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "13px",
                              color: colors.primary,
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            <HiOutlineEye size={14} />
                            View
                          </Link>

                          {/* PDF download */}
                          <button
                            onClick={() => handleDownload(session._id, "pdf")}
                            disabled={
                              downloadingId === `${session._id}-pdf`
                            }
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px",
                              color: "#fff",
                              background:
                                downloadingId === `${session._id}-pdf`
                                  ? colors.textMuted
                                  : "#f43f5e",
                              border: "none",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              cursor:
                                downloadingId === `${session._id}-pdf`
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight: 600,
                              fontFamily: "inherit",
                            }}
                          >
                            <HiOutlineDocumentDownload size={13} />
                            {downloadingId === `${session._id}-pdf`
                              ? "..."
                              : "PDF"}
                          </button>

                          {/* CSV download */}
                          <button
                            onClick={() => handleDownload(session._id, "csv")}
                            disabled={
                              downloadingId === `${session._id}-csv`
                            }
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px",
                              color: "#fff",
                              background:
                                downloadingId === `${session._id}-csv`
                                  ? colors.textMuted
                                  : "#10b981",
                              border: "none",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              cursor:
                                downloadingId === `${session._id}-csv`
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight: 600,
                              fontFamily: "inherit",
                            }}
                          >
                            <HiOutlineDocumentDownload size={13} />
                            {downloadingId === `${session._id}-csv`
                              ? "..."
                              : "CSV"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </LecturerLayout>
  );
};

export default AttendancePage;