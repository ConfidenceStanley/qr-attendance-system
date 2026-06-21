import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";
import { toast } from "react-hot-toast";
import {
  HiOutlineQrcode,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineBookOpen,
  HiOutlineChartBar,
  HiOutlineLogout,
  HiOutlinePlus,
  HiOutlineDocumentReport,
  HiArrowRight,
} from "react-icons/hi";

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const c = {
    primary: "#4f46e5",
    primaryDark: "#3730a3",
    text: "#18181b",
    textMuted: "#71717a",
    bg: "#fafafa",
    border: "#e4e4e7",
    surface: "#ffffff",
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Signed out");
    navigate("/login");
  };

  const stats = [
    {
      label: "Total Students",
      value: "0",
      icon: HiOutlineUsers,
      color: "#4f46e5",
      bg: "rgba(79,70,229,0.08)",
      trend: "+0%",
    },
    {
      label: "Total Lecturers",
      value: "0",
      icon: HiOutlineUserGroup,
      color: "#10b981",
      bg: "rgba(16,185,129,0.08)",
      trend: "+0%",
    },
    {
      label: "Active Courses",
      value: "0",
      icon: HiOutlineBookOpen,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
      trend: "+0%",
    },
    {
      label: "Sessions Today",
      value: "0",
      icon: HiOutlineChartBar,
      color: "#ec4899",
      bg: "rgba(236,72,153,0.08)",
      trend: "Live",
    },
  ];

  const actions = [
    {
      title: "Add Lecturer",
      desc: "Register new teaching staff",
      icon: HiOutlineUserGroup,
      color: "#4f46e5",
    },
    {
      title: "Add Student",
      desc: "Enroll new student",
      icon: HiOutlineUsers,
      color: "#10b981",
    },
    {
      title: "Create Course",
      desc: "Add a new course offering",
      icon: HiOutlineBookOpen,
      color: "#f59e0b",
    },
    {
      title: "View Reports",
      desc: "Attendance analytics",
      icon: HiOutlineDocumentReport,
      color: "#a855f7",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: c.bg }}>
      {/* Navbar */}
      <nav
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${c.border}`,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "16px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: `linear-gradient(135deg, ${c.primary}, ${c.primaryDark})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HiOutlineQrcode size={20} color="white" />
            </div>
            <div>
              <p style={{ fontSize: "15px", fontWeight: 600, color: c.text }}>
                QRoll
              </p>
              <p style={{ fontSize: "11px", color: c.textMuted }}>
                Admin Console
              </p>
            </div>
          </div>

          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "13px", fontWeight: 500, color: c.text }}>
                {user?.fullName}
              </p>
              <p style={{ fontSize: "11px", color: c.textMuted }}>
                Administrator
              </p>
            </div>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: `linear-gradient(135deg, ${c.primary}, ${c.primaryDark})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 500,
                fontSize: "13px",
              }}
            >
              {user?.fullName?.charAt(0)}
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 14px",
                background: "white",
                border: `1px solid ${c.border}`,
                borderRadius: "10px",
                fontSize: "12px",
                color: c.text,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "inherit",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#ef4444";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = c.border;
                e.currentTarget.style.color = c.text;
              }}
            >
              <HiOutlineLogout size={14} />
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "40px 32px",
        }}
        className="fade-in-up"
      >
        {/* Welcome */}
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
            Heres an overview of your department today
          </p>
        </div>

        {/* Stats */}
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
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                border: `1px solid ${c.border}`,
                transition: "all 0.3s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 32px rgba(0,0,0,0.06)";
                e.currentTarget.style.borderColor = stat.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = c.border;
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
                  {stat.trend}
                </span>
              </div>
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
              <p style={{ fontSize: "13px", color: c.textMuted }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "32px",
            border: `1px solid ${c.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "24px",
            }}
          >
            <div>
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
                style={{
                  padding: "20px",
                  background: c.bg,
                  border: `1px solid transparent`,
                  borderRadius: "14px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = action.color;
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = c.bg;
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.transform = "translateX(0)";
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
      </main>
    </div>
  );
};

export default AdminDashboard;