import { useState } from "react";
import { HiX, HiOutlineKey, HiOutlineCheckCircle, HiOutlineClipboard } from "react-icons/hi";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

const colors = {
  primary: "#4f46e5",
  text: "#18181b",
  textMuted: "#71717a",
  border: "#e4e4e7",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#f43f5e",
};

const ResetPasswordModal = ({ user, onClose }) => {
  const [confirming, setConfirming] = useState(false);
  const [newPassword, setNewPassword] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleReset = async () => {
    setConfirming(true);
    try {
      const userId = 
        user.user?._id ||      // populated nested
        user.user ||            // ID only
        user.userId ||          // alternate name
        user.id ||              // flat shape (your case)
        user._id;               // direct ID

      const response = await axiosInstance.post(
        `/admin/users/${userId}/reset-password`
      );
      setNewPassword(response.data.newPassword);
      setEmailSent(response.data.emailSent);
      toast.success("Password reset successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
      setConfirming(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(newPassword);
    toast.success("Password copied to clipboard");
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "440px",
          padding: "28px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                background: newPassword ? "#d1fae5" : "#fef3c7",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {newPassword ? (
                <HiOutlineCheckCircle size={22} color={colors.success} />
              ) : (
                <HiOutlineKey size={22} color={colors.warning} />
              )}
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 700,
                  color: colors.text,
                  letterSpacing: "-0.02em",
                }}
              >
                {newPassword ? "Password Reset Done" : "Reset Password"}
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: colors.textMuted }}>
                {newPassword ? "Save this password" : "This action cannot be undone"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: colors.textMuted,
              padding: "4px",
            }}
          >
            <HiX size={20} />
          </button>
        </div>

        {!newPassword ? (
          <>
            {/* Confirmation */}
            <div
              style={{
                background: "#fef3c7",
                borderLeft: `3px solid ${colors.warning}`,
                padding: "14px 16px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#78350f",
                  lineHeight: 1.6,
                }}
              >
                You are about to reset the password for{" "}
                <strong>{user.user?.fullName || user.fullName}</strong>. A new random
                password will be generated and emailed to them.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={onClose}
                disabled={confirming}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#fafafa",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "10px",
                  color: colors.text,
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={confirming}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: colors.warning,
                  border: "none",
                  borderRadius: "10px",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: confirming ? "wait" : "pointer",
                  opacity: confirming ? 0.7 : 1,
                }}
              >
                {confirming ? "Resetting..." : "Yes, Reset Password"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Success - Show new password */}
            <div
              style={{
                background: "#f0fdf4",
                border: `1px dashed ${colors.success}`,
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: "11px",
                  color: colors.success,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                New Password
              </p>
              <p
                style={{
                  margin: "0 0 14px",
                  fontSize: "24px",
                  fontWeight: 800,
                  color: colors.text,
                  fontFamily: "JetBrains Mono, monospace",
                  letterSpacing: "2px",
                }}
              >
                {newPassword}
              </p>
              <button
                onClick={handleCopy}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  background: colors.success,
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                <HiOutlineClipboard size={14} />
                Copy Password
              </button>
            </div>

            <div
              style={{
                background: emailSent ? "#eff6ff" : "#fef3c7",
                padding: "12px 14px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "12px",
                color: emailSent ? "#1e40af" : "#78350f",
                lineHeight: 1.5,
              }}
            >
              {emailSent ? (
                <>
                  ✓ Password has been emailed to{" "}
                  <strong>{user.user?.email || user.email}</strong>
                </>
              ) : (
                <>
                  ⚠ Email could not be sent. Please share this password with the
                  user manually.
                </>
              )}
            </div>

            <button
              onClick={onClose}
              style={{
                width: "100%",
                padding: "12px",
                background: colors.primary,
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;