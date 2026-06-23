import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { HiOutlineEye, HiOutlineLightningBolt } from "react-icons/hi";
import LecturerLayout from "../../components/lecturer/LecturerLayout";
import { fetchMySessions } from "../../redux/slices/lecturerSessionSlice";

const colors = {
  primary: "#4f46e5",
  text: "#18181b",
  textMuted: "#71717a",
  border: "#e4e4e7",
  success: "#10b981",
};

const SessionsPage = () => {
  const dispatch = useDispatch();
  const { sessions, loading } = useSelector((s) => s.lecturerSession);

  useEffect(() => {
    dispatch(fetchMySessions());
  }, [dispatch]);

  return (
    <LecturerLayout>
      <div style={{ maxWidth: "1100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 700, color: colors.text, letterSpacing: "-0.02em", margin: 0 }}>
              Sessions
            </h1>
            <p style={{ color: colors.textMuted, marginTop: "6px", fontSize: "14px" }}>
              All your attendance sessions
            </p>
          </div>
          <Link
            to="/lecturer/courses"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              background: colors.primary,
              color: "#fff",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            <HiOutlineLightningBolt size={15} />
            New Session
          </Link>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "64px", textAlign: "center", color: colors.textMuted }}>Loading...</div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: "64px", textAlign: "center", color: colors.textMuted, fontSize: "14px" }}>
              No sessions yet. Go to My Courses to start one.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Course", "Topic", "Date", "Duration", "Attendance", "Status", ""].map((h) => (
                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${colors.border}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: "14px 20px", fontWeight: 700, fontSize: "14px", color: colors.text, fontFamily: "JetBrains Mono, monospace" }}>
                      {session.course?.courseCode}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "14px", color: colors.textMuted }}>
                      {session.topic}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: colors.textMuted }}>
                      {new Date(session.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: colors.textMuted }}>
                      {session.duration} min
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "14px", color: colors.text }}>
                      <span style={{ fontWeight: 700, color: colors.success }}>{session.presentCount}</span>
                      <span style={{ color: colors.textMuted }}> / {session.totalEnrolled}</span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: session.status === "active" ? "#d1fae5" : "#f4f4f5",
                        color: session.status === "active" ? "#065f46" : colors.textMuted,
                      }}>
                        {session.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <Link
                        to={session.status === "active"
                          ? `/lecturer/sessions/${session._id}/live`
                          : `/lecturer/sessions/${session._id}/attendance`}
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
                        {session.status === "active" ? "View Live" : "View Report"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </LecturerLayout>
  );
};

export default SessionsPage;