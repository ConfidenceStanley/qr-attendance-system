import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineClipboardList,
  HiOutlineCollection,
  HiOutlineLogout,
} from "react-icons/hi";
import { logout } from "../../redux/slices/authSlice";

const colors = {
  primary: "#4f46e5",
  primaryDark: "#3730a3",
  text: "#18181b",
  textMuted: "#71717a",
  border: "#e4e4e7",
};

const navItems = [
  { label: "Dashboard",  path: "/lecturer/dashboard", icon: HiOutlineHome },
  { label: "My Courses", path: "/lecturer/courses",   icon: HiOutlineBookOpen },
  { label: "Sessions",   path: "/lecturer/sessions",  icon: HiOutlineCollection },
  { label: "Attendance", path: "/lecturer/attendance",icon: HiOutlineClipboardList },
];

const LecturerSidebar = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user }   = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside
      style={{
        width: "260px",
        background: "#ffffff",
        borderRight: `1px solid ${colors.border}`,
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 28px",
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            Q
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "16px", color: colors.text, letterSpacing: "-0.02em" }}>
              QRoll
            </div>
            <div style={{ fontSize: "11px", color: colors.textMuted }}>
              Lecturer Portal
            </div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 16px",
              borderRadius: "8px",
              marginBottom: "4px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: isActive ? 600 : 400,
              color: isActive ? colors.primary : colors.textMuted,
              background: isActive ? "#ede9fe" : "transparent",
              transition: "all 0.15s ease",
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div style={{ padding: "16px 12px", borderTop: `1px solid ${colors.border}` }}>
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            background: "#fafafa",
            marginBottom: "8px",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 600, color: colors.text }}>
            {user?.fullName}
          </div>
          <div style={{ fontSize: "11px", color: colors.textMuted }}>
            {user?.email}
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            color: "#f43f5e",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fff1f2")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <HiOutlineLogout size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default LecturerSidebar;