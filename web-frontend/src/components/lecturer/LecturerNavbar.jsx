import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineBell,
  HiOutlineKey,
  HiOutlineLogout,
  HiChevronDown,
} from "react-icons/hi";
import toast from "react-hot-toast";
import { logout } from "../../redux/slices/authSlice";
import axiosInstance from "../../api/axiosInstance";

const colors = {
  primary: "#4f46e5",
  text: "#18181b",
  textMuted: "#71717a",
  border: "#e4e4e7",
  danger: "#f43f5e",
};

const LecturerNavbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setChanging(true);
    try {
      await axiosInstance.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setChanging(false);
    }
  };

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: "260px",
          right: 0,
          height: "64px",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${colors.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          zIndex: 99,
        }}
      >
        <div style={{ fontSize: "14px", color: colors.textMuted }}>
          Welcome back,{" "}
          <span style={{ color: colors.text, fontWeight: 600 }}>
            {user?.fullName?.split(" ")[0]}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: colors.textMuted,
              display: "flex",
              alignItems: "center",
            }}
          >
            <HiOutlineBell size={20} />
          </button>

          {/* User Dropdown */}
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: dropdownOpen ? "#f4f4f5" : "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px 4px 4px",
                borderRadius: "20px",
                transition: "background 0.15s",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: colors.primary,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {user?.fullName?.[0]?.toUpperCase()}
              </div>
              <HiChevronDown
                size={14}
                color={colors.textMuted}
                style={{
                  transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.2s",
                }}
              />
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "48px",
                  right: 0,
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                  border: `1px solid ${colors.border}`,
                  width: "220px",
                  overflow: "hidden",
                  zIndex: 1000,
                }}
              >
                {/* User Info Header */}
                <div
                  style={{
                    padding: "14px 16px",
                    borderBottom: `1px solid ${colors.border}`,
                    background: "#fafafa",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      fontWeight: 700,
                      color: colors.text,
                    }}
                  >
                    {user?.fullName}
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "11px",
                      color: colors.textMuted,
                    }}
                  >
                    {user?.email}
                  </p>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowPasswordModal(true);
                  }}
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                >
                  <HiOutlineKey size={16} color={colors.textMuted} />
                  Change Password
                </button>

                <button
                  onClick={handleLogout}
                  style={{ ...menuItemStyle, color: colors.danger }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                >
                  <HiOutlineLogout size={16} color={colors.danger} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          onClick={() => !changing && setShowPasswordModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "28px",
              width: "100%",
              maxWidth: "420px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 700,
                color: colors.text,
                letterSpacing: "-0.02em",
              }}
            >
              Change Password
            </h2>
            <p
              style={{
                margin: "4px 0 20px",
                fontSize: "13px",
                color: colors.textMuted,
              }}
            >
              Enter your current and new password
            </p>

            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  style={inputStyle}
                  autoComplete="current-password"
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  style={inputStyle}
                  autoComplete="new-password"
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  style={inputStyle}
                  autoComplete="new-password"
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={changing}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#fafafa",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "10px",
                    color: colors.text,
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: changing ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changing}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: colors.primary,
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: changing ? "wait" : "pointer",
                    opacity: changing ? 0.7 : 1,
                  }}
                >
                  {changing ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const menuItemStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "12px 16px",
  background: "white",
  border: "none",
  color: "#18181b",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  textAlign: "left",
  transition: "background 0.15s",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 700,
  color: "#18181b",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  fontSize: "14px",
  color: "#18181b",
  background: "#f4f4f5",
  border: "1px solid #e4e4e7",
  borderRadius: "8px",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

export default LecturerNavbar;