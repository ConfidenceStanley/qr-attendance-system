import { useSelector } from "react-redux";
import { HiOutlineBell } from "react-icons/hi";

const colors = {
  primary: "#4f46e5",
  text: "#18181b",
  textMuted: "#71717a",
  border: "#e4e4e7",
};

const LecturerNavbar = () => {
  const { user } = useSelector((state) => state.auth);

  return (
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
      </div>
    </header>
  );
};

export default LecturerNavbar;