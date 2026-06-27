import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineBookOpen,
  HiOutlineChartBar,
  HiOutlineDocumentReport,
  HiArrowRight,
} from "react-icons/hi";

// Redux actions to fetch real data
import { fetchLecturers } from "../../redux/slices/lecturerSlice";
import { fetchStudents } from "../../redux/slices/studentSlice";
import { fetchCourses } from "../../redux/slices/courseSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
const lecturerState = useSelector((state) => state.lecturers);
const studentState  = useSelector((state) => state.students);
const courseState   = useSelector((state) => state.courses);

const lecturers       = lecturerState?.list        ?? [];
const lecturersLoading = lecturerState?.isLoading  ?? false;
const students        = studentState?.list         ?? [];
const studentsLoading  = studentState?.isLoading   ?? false;
const courses         = courseState?.list          ?? [];
const coursesLoading   = courseState?.isLoading    ?? false;


  const c = {
    primary: "#4f46e5",
    primaryDark: "#3730a3",
    text: "#18181b",
    textMuted: "#71717a",
    bg: "#fafafa",
    border: "#e4e4e7",
  };

  // ─────────────────────────────────────────────
  // Fetch all stats on mount
  // ─────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchLecturers());
    dispatch(fetchStudents());
    dispatch(fetchCourses());
  }, [dispatch]);

  // ─────────────────────────────────────────────
  // Calculate real counts
  // ─────────────────────────────────────────────
  const activeStudents = students.filter((s) => s.isActive).length;
  const activeLecturers = lecturers.filter((l) => l.isActive).length;
  const activeCourses = courses.filter((c) => c.isActive).length;

  // Check if any data is still loading
  const isLoading = lecturersLoading || studentsLoading || coursesLoading;

  const stats = [
    {
      label: "Total Students",
      value: activeStudents,
      icon: HiOutlineUsers,
      color: "#4f46e5",
      bg: "rgba(79,70,229,0.08)",
      // Show total including inactive
      sublabel:
        students.length > activeStudents
          ? `${students.length - activeStudents} inactive`
          : "All active",
      path: "/admin/students",
    },
    {
      label: "Total Lecturers",
      value: activeLecturers,
      icon: HiOutlineUserGroup,
      color: "#10b981",
      bg: "rgba(16,185,129,0.08)",
      sublabel:
        lecturers.length > activeLecturers
          ? `${lecturers.length - activeLecturers} inactive`
          : "All active",
      path: "/admin/lecturers",
    },
    {
      label: "Active Courses",
      value: activeCourses,
      icon: HiOutlineBookOpen,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
      sublabel:
        courses.length > activeCourses
          ? `${courses.length - activeCourses} archived`
          : "All active",
      path: "/admin/courses",
    },
    {
      label: "Sessions Today",
      value: 0,
      icon: HiOutlineChartBar,
      color: "#ec4899",
      bg: "rgba(236,72,153,0.08)",
      sublabel: "Live sessions",
      path: null, // disabled
    },
  ];

  const actions = [
    {
      title: "Add Lecturer",
      desc: "Register new teaching staff",
      icon: HiOutlineUserGroup,
      color: "#4f46e5",
      path: "/admin/lecturers",
    },
    {
      title: "Add Student",
      desc: "Enroll new student",
      icon: HiOutlineUsers,
      color: "#10b981",
      path: "/admin/students",
    },
    {
      title: "Create Course",
      desc: "Add a new course offering",
      icon: HiOutlineBookOpen,
      color: "#f59e0b",
      path: "/admin/courses",
    },
    {
      title: "View Reports",
      desc: "Download attendance reports",
      icon: HiOutlineDocumentReport,
      color: "#a855f7",
      path: "/admin/reports",
    },
  ];

  return (
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "40px 32px",
      }}
      className="fade-in-up"
    >
      {/* Welcome header */}
      <div style={{ marginBottom: "40px" }}>
        <p
          style={{
            fontSize: "13px",
            color: c.textMuted,
            marginBottom: "4px",
          }}
        >
          Dashboard
        </p>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 600,
            color: c.text,
            letterSpacing: "-0.02em",
            marginBottom: "8px",
          }}
        >
          Hello, {user?.fullName?.split(" ")[0]}
        </h1>
        <p style={{ fontSize: "14px", color: c.textMuted }}>
          Here is an overview of your department today
        </p>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            onClick={() => stat.path && navigate(stat.path)}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "24px",
              border: `1px solid ${c.border}`,
              transition: "all 0.3s",
              cursor: stat.path ? "pointer" : "default",
            }}
            onMouseEnter={(e) => {
              if (stat.path) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 32px rgba(0,0,0,0.06)";
                e.currentTarget.style.borderColor = stat.color;
              }
            }}
            onMouseLeave={(e) => {
              if (stat.path) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = c.border;
              }
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: stat.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <stat.icon size={20} color={stat.color} />
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: stat.color,
                  background: stat.bg,
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontWeight: 500,
                }}
              >
                {stat.sublabel}
              </span>
            </div>

            {/* Show loading dots or real number */}
            {isLoading ? (
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: 600,
                  color: c.textMuted,
                  marginBottom: "4px",
                  letterSpacing: "-0.02em",
                }}
              >
                ···
              </p>
            ) : (
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: 600,
                  color: c.text,
                  marginBottom: "4px",
                  letterSpacing: "-0.02em",
                }}
              >
                {stat.value}
              </p>
            )}

            <p style={{ fontSize: "13px", color: c.textMuted }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "32px",
          border: `1px solid ${c.border}`,
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: c.text,
              marginBottom: "4px",
            }}
          >
            Quick actions
          </h2>
          <p style={{ fontSize: "13px", color: c.textMuted }}>
            Common tasks to get you started
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "12px",
          }}
        >
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => action.path && navigate(action.path)}
              disabled={!action.path}
              style={{
                padding: "20px",
                background: c.bg,
                border: `1px solid transparent`,
                borderRadius: "14px",
                cursor: action.path ? "pointer" : "not-allowed",
                opacity: action.path ? 1 : 0.5,
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (action.path) {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = action.color;
                  e.currentTarget.style.transform = "translateX(4px)";
                }
              }}
              onMouseLeave={(e) => {
                if (action.path) {
                  e.currentTarget.style.background = c.bg;
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.transform = "translateX(0)";
                }
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: `${action.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <action.icon size={20} color={action.color} />
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: c.text,
                    marginBottom: "2px",
                  }}
                >
                  {action.title}
                </p>
                <p style={{ fontSize: "12px", color: c.textMuted }}>
                  {action.desc}
                </p>
              </div>
              <HiArrowRight size={16} color={c.textMuted} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;