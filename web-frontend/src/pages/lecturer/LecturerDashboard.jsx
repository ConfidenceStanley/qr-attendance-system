
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  HiOutlineBookOpen,
  HiOutlineCollection,
  HiOutlineClipboardCheck,
  HiOutlineLightningBolt,
} from "react-icons/hi";
import LecturerLayout from "../../components/lecturer/LecturerLayout";
import { fetchLecturerDashboard } from "../../redux/slices/lecturerSessionSlice";

const colors = {
  primary: "#4f46e5",
  text: "#18181b",
  textMuted: "#71717a",
  border: "#e4e4e7",
  success: "#10b981",
  warning: "#f59e0b",
};

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div
    style={{
      background: "#fff",
      border: `1px solid ${colors.border}`,
      borderRadius: "12px",
      padding: "24px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
    }}
  >
    <div
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        background: accent + "18",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: accent,
        flexShrink: 0,
      }}
    >
      <Icon size={22} />
    </div>
    <div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: colors.text, letterSpacing: "-0.03em" }}>
        {value ?? "—"}
      </div>
      <div style={{ fontSize: "13px", color: colors.textMuted, marginTop: "2px" }}>
        {label}
      </div>
    </div>
  </div>
);

const LecturerDashboard = () => {
  const dispatch = useDispatch();
  const { dashboard, loading } = useSelector((state) => state.lecturerSession);

  useEffect(() => {
    dispatch(fetchLecturerDashboard());
  }, [dispatch]);

  const stats = dashboard?.stats;
  const recentSessions = dashboard?.recentSessions || [];

  return (
    <LecturerLayout>
      <div style={{ maxWidth: "1100px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: colors.text, letterSpacing: "-0.02em", margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ color: colors.textMuted, marginTop: "6px", fontSize: "14px" }}>
            Overview of your courses and attendance sessions
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
          <StatCard icon={HiOutlineBookOpen}      label="My Courses"       value={stats?.totalCourses}   accent={colors.primary} />
          <StatCard icon={HiOutlineCollection}    label="Total Sessions"   value={stats?.totalSessions}  accent="#8b5cf6" />
          <StatCard icon={HiOutlineLightningBolt} label="Active Now"       value={stats?.activeSessions} accent={colors.success} />
          <StatCard icon={HiOutlineClipboardCheck}label="Today's Sessions" value={stats?.todaysSessions} accent={colors.warning} />
        </div>

        {/* Quick Action */}
        <div style={{ marginBottom: "32px" }}>
          <Link
            to="/lecturer/courses"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              background: colors.primary,
              color: "#fff",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <HiOutlineLightningBolt size={16} />
            Start New Session
          </Link>
        </div>

        {/* Recent Sessions */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${colors.border}`,
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${colors.border}` }}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: colors.text }}>
              Recent Sessions
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: "48px", textAlign: "center", color: colors.textMuted }}>
              Loading...
            </div>
          ) : recentSessions.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: colors.textMuted, fontSize: "14px" }}>
              No sessions yet. Start your first session above.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Course", "Topic", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 24px",
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
                {recentSessions.map((session) => (
                  <tr
                    key={session._id}
                    style={{ borderBottom: `1px solid ${colors.border}` }}
                  >
                    <td style={{ padding: "14px 24px", fontSize: "14px", fontWeight: 600, color: colors.text }}>
                      {session.course?.courseCode}
                    </td>
                    <td style={{ padding: "14px 24px", fontSize: "14px", color: colors.textMuted }}>
                      {session.topic}
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: session.status === "active" ? "#d1fae5" : "#f4f4f5",
                          color: session.status === "active" ? "#065f46" : colors.textMuted,
                        }}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 24px", fontSize: "13px", color: colors.textMuted }}>
                      {new Date(session.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
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

export default LecturerDashboard;