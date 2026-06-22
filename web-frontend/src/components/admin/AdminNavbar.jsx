import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";
import { toast } from "react-hot-toast";
import { HiOutlineLogout, HiOutlineBell } from "react-icons/hi";

const AdminNavbar = () => {
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
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Signed out successfully");
    navigate("/login");
  };

  return (
    <header
      style={{
        height: "64px",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${c.border}`,
        position: "sticky",
        top: 0,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 32px",
        gap: "16px",
      }}
    >
      {/* Notification bell (placeholder) */}
      <button
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "white",
          border: `1px solid ${c.border}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: c.text,
          transition: "all 0.2s",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = c.primary;
          e.currentTarget.style.color = c.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = c.border;
          e.currentTarget.style.color = c.text;
        }}
      >
        <HiOutlineBell size={18} />
      </button>

      {/* User info */}
      <div style={{ textAlign: "right" }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: c.text,
            margin: 0,
          }}
        >
          {user?.fullName}
        </p>
        <p
          style={{
            fontSize: "11px",
            color: c.textMuted,
            margin: 0,
          }}
        >
          Administrator
        </p>
      </div>

      {/* Avatar */}
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: `linear-gradient(135deg, ${c.primary}, ${c.primaryDark})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 500,
          fontSize: "14px",
        }}
      >
        {user?.fullName?.charAt(0).toUpperCase()}
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          padding: "9px 14px",
          background: "white",
          border: `1px solid ${c.border}`,
          borderRadius: "10px",
          fontSize: "13px",
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
        <HiOutlineLogout size={15} />
        Sign out
      </button>
    </header>
  );
};

export default AdminNavbar;