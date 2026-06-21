import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";
import { toast } from "react-hot-toast";
import {
  HiOutlineQrcode,
  HiOutlineBookOpen,
  HiOutlineUsers,
  HiOutlineLogout,
  HiOutlinePlay,
  HiArrowRight,
} from "react-icons/hi";

const LecturerDashboard = () => {
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
    toast.success("Signed out");
    navigate("/login");
  };

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
              <p style={{ fontSize: "15px", fontWeight: 600 }}>QRoll</p>
              <p style={{ fontSize: "11px", color: c.textMuted }}>
                Lecturer Console
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "13px", fontWeight: 500 }}>
                {user?.fullName}
              </p>
              <p style={{ fontSize: "11px", color: c.textMuted }}>Lecturer</p>
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
            Manage your attendance sessions
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
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "24px",
              border: `1px solid ${c.border}`,
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(79,70,229,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <HiOutlineBookOpen size={20} color={c.primary} />
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
              {user?.profile?.courses?.length || 0}
            </p>
            <p style={{ fontSize: "13px", color: c.textMuted }}>My Courses</p>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "24px",
              border: `1px solid ${c.border}`,
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(16,185,129,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <HiOutlineUsers size={20} color="#10b981" />
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
              0
            </p>
            <p style={{ fontSize: "13px", color: c.textMuted }}>
              Sessions This Week
            </p>
          </div>
        </div>

        {/* Start Session CTA */}
        <div
          style={{
            background: `linear-gradient(135deg, ${c.text}, #27272a)`,
            borderRadius: "20px",
            padding: "40px",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 600,
                marginBottom: "8px",
                letterSpacing: "-0.01em",
              }}
            >
              Ready to start a session?
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Generate a QR code and let students mark attendance
            </p>
          </div>
          <button
            style={{
              padding: "14px 24px",
              background: "white",
              color: c.text,
              border: "none",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "inherit",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-2px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <HiOutlinePlay size={16} />
            Start New Session
            <HiArrowRight size={14} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default LecturerDashboard;