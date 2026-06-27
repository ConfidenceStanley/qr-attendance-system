import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  HiOutlineQrcode,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineDeviceMobile,
  HiOutlineBell,
  HiArrowRight,
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineBookOpen,
} from "react-icons/hi";

// Screenshots — save your images with these exact names
import screenshotMobile from "../assets/screenshot-mobile.png";
import screenshotAdmin from "../assets/screenshot-admin.png";
import screenshotLecturer from "../assets/screenshot-lecturer.png";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  // ── If already logged in redirect to their dashboard ──
  useEffect(() => {
    if (user && token) {
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "lecturer") navigate("/lecturer/dashboard");
      else if (user.role === "student") navigate("/lecturer/dashboard");
    }
  }, [user, token, navigate]);

  const c = {
    primary: "#4f46e5",
    primaryDark: "#3730a3",
    primaryLight: "#818cf8",
    accent: "#f43f5e",
    text: "#18181b",
    textMuted: "#71717a",
    bg: "#fafafa",
    border: "#e4e4e7",
    surface: "#ffffff",
  };

  const features = [
    {
      icon: HiOutlineQrcode,
      title: "Dynamic QR Codes",
      desc: "Rotating QR codes refresh every 15 seconds to prevent proxy attendance. Screenshots and shared codes are useless.",
      color: "#4f46e5",
    },
    {
      icon: HiOutlineShieldCheck,
      title: "Secure & Reliable",
      desc: "JWT authentication, role-based access control and HMAC-signed tokens protect every request.",
      color: "#10b981",
    },
    {
      icon: HiOutlineLightningBolt,
      title: "Real-time Updates",
      desc: "Watch attendance roll in live via Socket.io as students scan. No page refresh needed.",
      color: "#f59e0b",
    },
    {
      icon: HiOutlineDeviceMobile,
      title: "Mobile App",
      desc: "Students scan QR codes through a dedicated Expo mobile app available on Android and iOS.",
      color: "#ec4899",
    },
    {
      icon: HiOutlineChartBar,
      title: "Smart Reports",
      desc: "Generate professional PDF and CSV attendance reports per session, course or student.",
      color: "#8b5cf6",
    },
    {
      icon: HiOutlineBell,
      title: "Guardian Alerts",
      desc: "Automatic email notifications to guardians when a student is absent or falls below 75% attendance.",
      color: "#06b6d4",
    },
  ];

  const stats = [
    { value: "15s", label: "QR Refresh Rate" },
    { value: "100%", label: "Proxy-Proof" },
    { value: "3", label: "User Roles" },
    { value: "24/7", label: "Available" },
  ];

  const howItWorks = [
    {
      step: "01",
      role: "Admin",
      icon: HiOutlineViewGrid,
      color: "#4f46e5",
      title: "Admin sets up the system",
      points: [
        "Creates lecturer and student accounts",
        "Bulk imports users via CSV or Excel",
        "Creates courses and assigns lecturers",
        "Enrolls students into courses",
        "Downloads attendance reports",
      ],
    },
    {
      step: "02",
      role: "Lecturer",
      icon: HiOutlineUsers,
      color: "#10b981",
      title: "Lecturer runs the session",
      points: [
        "Logs in to the web dashboard",
        "Creates an attendance session for a course",
        "Displays the rotating QR code on screen",
        "Watches students mark attendance live",
        "Closes session when class ends",
      ],
    },
    {
      step: "03",
      role: "Student",
      icon: HiOutlineBookOpen,
      color: "#f59e0b",
      title: "Student marks attendance",
      points: [
        "Opens the QRoll mobile app",
        "Logs in with student credentials",
        "Taps Scan and points at the QR code",
        "Gets instant confirmation on screen",
        "Views attendance history anytime",
      ],
    },
  ];

  return (
    <div style={{ background: c.bg, minHeight: "100vh", color: c.text }}>
      {/* Decorative orbs */}
      <div
        style={{
          position: "fixed",
          top: "-200px",
          right: "-200px",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(79,70,229,0.15), transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-300px",
          left: "-200px",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(244,63,94,0.08), transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Navbar ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          background: "rgba(250,250,250,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${c.border}`,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "16px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: `linear-gradient(135deg, ${c.primary}, ${c.primaryLight})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HiOutlineQrcode size={20} color="white" />
            </div>
            <span style={{ fontSize: "16px", fontWeight: 600 }}>QRoll</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <a
              href="#how-it-works"
              style={{
                fontSize: "13px",
                color: c.textMuted,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              How it works
            </a>
            <a
              href="#features"
              style={{
                fontSize: "13px",
                color: c.textMuted,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Features
            </a>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "10px 20px",
                background: c.text,
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = c.primary)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = c.text)
              }
            >
              Sign In
              <HiArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "100px 32px 80px",
          position: "relative",
          zIndex: 1,
          textAlign: "center",
        }}
        className="fade-in-up"
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            background: "rgba(79,70,229,0.08)",
            border: "1px solid rgba(79,70,229,0.15)",
            borderRadius: "100px",
            fontSize: "12px",
            color: c.primary,
            fontWeight: 500,
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: c.primary,
            }}
          />
          Smart Attendance for Modern Classrooms
        </div>

        <h1
          style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: "24px",
            background: `linear-gradient(135deg, ${c.text} 0%, ${c.primary} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Attendance, <br />
          Reimagined.
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: c.textMuted,
            maxWidth: "560px",
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}
        >
          A modern QR-based attendance monitoring system designed for the
          Department of Computer Science. Fast, secure, and completely
          proxy-proof.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "80px",
          }}
        >
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "14px 28px",
              background: c.text,
              color: "white",
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
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = c.primary;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = c.text;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Get Started
            <HiArrowRight size={16} />
          </button>
          <a
            href="#how-it-works"
            style={{
              padding: "14px 28px",
              background: "white",
              color: c.text,
              border: `1px solid ${c.border}`,
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.3s",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = c.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = c.border;
            }}
          >
            See How It Works
          </a>
        </div>

        {/* Hero visual */}
        <div
          style={{
            position: "relative",
            maxWidth: "760px",
            margin: "0 auto",
          }}
        >
          {/* Main card */}
          <div
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "32px",
              boxShadow:
                "0 30px 80px rgba(79,70,229,0.15), 0 0 0 1px rgba(0,0,0,0.04)",
              transform: "rotate(-1deg)",
              transition: "transform 0.5s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "rotate(0deg) translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "rotate(-1deg) translateY(0)";
            }}
          >
            <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
              {["#fc5b57", "#fdbb2d", "#34c84a"].map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: color,
                  }}
                />
              ))}
            </div>

            <div
              style={{
                background: `linear-gradient(135deg, ${c.primary}, ${c.primaryDark})`,
                borderRadius: "16px",
                padding: "40px",
                textAlign: "center",
                color: "white",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  opacity: 0.8,
                  marginBottom: "20px",
                  letterSpacing: "1.5px",
                }}
              >
                LIVE SESSION • CSC 301
              </p>
              <div
                style={{
                  background: "white",
                  width: "180px",
                  height: "180px",
                  margin: "0 auto 20px",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                }}
              >
                <HiOutlineQrcode size={120} color={c.primary} />
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "100px",
                  fontSize: "12px",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#34d399",
                  }}
                />
                Refreshing in 12s
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              {[
                { label: "Present", value: "42" },
                { label: "Total", value: "45" },
                { label: "Time Left", value: "23:14" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: c.bg,
                    padding: "12px",
                    borderRadius: "10px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      color: c.textMuted,
                      marginBottom: "2px",
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: c.text,
                      fontFamily:
                        item.label === "Time Left"
                          ? "JetBrains Mono, monospace"
                          : "inherit",
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 32px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0",
            background: "white",
            borderRadius: "24px",
            border: `1px solid ${c.border}`,
            overflow: "hidden",
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                padding: "40px 24px",
                borderRight:
                  i < stats.length - 1 ? `1px solid ${c.border}` : "none",
              }}
            >
              <p
                style={{
                  fontSize: "36px",
                  fontWeight: 700,
                  color: c.primary,
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
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "80px 32px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <p
            style={{
              fontSize: "12px",
              color: c.primary,
              letterSpacing: "2px",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            HOW IT WORKS
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: "16px",
            }}
          >
            Three roles, one system.
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: c.textMuted,
              maxWidth: "520px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            QRoll connects admins, lecturers and students in a seamless
            attendance workflow.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {howItWorks.map((item, i) => (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: "20px",
                border: `1px solid ${c.border}`,
                overflow: "hidden",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 20px 40px ${item.color}15`;
                e.currentTarget.style.borderColor = item.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = c.border;
              }}
            >
              {/* Card top color bar */}
              <div
                style={{
                  height: "4px",
                  background: item.color,
                }}
              />

              <div style={{ padding: "28px" }}>
                {/* Step + role */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "40px",
                      fontWeight: 700,
                      color: `${item.color}20`,
                      fontFamily: "JetBrains Mono, monospace",
                      lineHeight: 1,
                    }}
                  >
                    {item.step}
                  </span>
                  <span
                    style={{
                      padding: "4px 12px",
                      background: `${item.color}12`,
                      color: item.color,
                      borderRadius: "100px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {item.role}
                  </span>
                </div>

                {/* Icon + title */}
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: `${item.color}12`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <item.icon size={22} color={item.color} />
                </div>

                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: c.text,
                    marginBottom: "16px",
                  }}
                >
                  {item.title}
                </h3>

                {/* Points */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {item.points.map((point, j) => (
                    <div
                      key={j}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: `${item.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "1px",
                        }}
                      >
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: item.color,
                          }}
                        />
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          color: c.textMuted,
                          lineHeight: 1.5,
                          margin: 0,
                        }}
                      >
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Screenshots Section ── */}
      <section
        style={{
          background: `linear-gradient(180deg, ${c.bg} 0%, white 100%)`,
          padding: "80px 32px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <p
              style={{
                fontSize: "12px",
                color: c.primary,
                letterSpacing: "2px",
                fontWeight: 600,
                marginBottom: "12px",
              }}
            >
              THE PLATFORM
            </p>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: "16px",
              }}
            >
              Built for every screen.
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: c.textMuted,
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              Web dashboards for admin and lecturers. Mobile app for students.
              Everything works together.
            </p>
          </div>

          {/* Screenshot grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginBottom: "24px",
            }}
          >
            {/* Admin dashboard screenshot */}
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                border: `1px solid ${c.border}`,
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 30px 60px rgba(79,70,229,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 20px 40px rgba(0,0,0,0.06)";
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${c.border}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: c.bg,
                }}
              >
                <div style={{ display: "flex", gap: "5px" }}>
                  {["#fc5b57", "#fdbb2d", "#34c84a"].map((col, i) => (
                    <div
                      key={i}
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: col,
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    color: c.textMuted,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  Admin Dashboard
                </span>
              </div>
              <img
                src={screenshotAdmin}
                alt="Admin Dashboard"
                style={{
                  width: "100%",
                  display: "block",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.style.minHeight = "200px";
                  e.target.parentElement.style.background = `${c.primary}08`;
                  e.target.parentElement.innerHTML +=
                    `<div style="padding:60px;text-align:center;color:${c.textMuted};font-size:13px">Admin Dashboard Screenshot</div>`;
                }}
              />
            </div>

            {/* Lecturer screenshot */}
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                border: `1px solid ${c.border}`,
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 30px 60px rgba(16,185,129,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 20px 40px rgba(0,0,0,0.06)";
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${c.border}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: c.bg,
                }}
              >
                <div style={{ display: "flex", gap: "5px" }}>
                  {["#fc5b57", "#fdbb2d", "#34c84a"].map((col, i) => (
                    <div
                      key={i}
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: col,
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    color: c.textMuted,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  Lecturer — Live Session
                </span>
              </div>
              <img
                src={screenshotLecturer}
                alt="Lecturer Dashboard"
                style={{
                  width: "100%",
                  display: "block",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.style.minHeight = "200px";
                  e.target.parentElement.style.background = `#10b98108`;
                  e.target.parentElement.innerHTML +=
                    `<div style="padding:60px;text-align:center;color:${c.textMuted};font-size:13px">Lecturer Dashboard Screenshot</div>`;
                }}
              />
            </div>
          </div>

          {/* Mobile screenshot — centered smaller */}
          <div
            style={{
              maxWidth: "320px",
              margin: "0 auto",
              background: "white",
              borderRadius: "32px",
              border: `8px solid ${c.text}`,
              overflow: "hidden",
              boxShadow:
                "0 30px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px) rotate(1deg)";
              e.currentTarget.style.boxShadow =
                "0 40px 80px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) rotate(0deg)";
              e.currentTarget.style.boxShadow =
                "0 30px 60px rgba(0,0,0,0.15)";
            }}
          >
            {/* Phone notch */}
            <div
              style={{
                background: c.text,
                padding: "10px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "4px",
                  borderRadius: "2px",
                  background: "rgba(255,255,255,0.3)",
                }}
              />
            </div>
            <img
              src={screenshotMobile}
              alt="Mobile App"
              style={{ width: "100%", display: "block" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.style.minHeight = "400px";
                e.target.parentElement.style.background = `${c.primary}08`;
                e.target.parentElement.innerHTML +=
                  `<div style="padding:80px 40px;text-align:center;color:${c.textMuted};font-size:13px">Mobile App Screenshot</div>`;
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "80px 32px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <p
            style={{
              fontSize: "12px",
              color: c.primary,
              letterSpacing: "2px",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            FEATURES
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: "16px",
            }}
          >
            Everything you need.
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: c.textMuted,
              maxWidth: "520px",
              margin: "0 auto",
            }}
          >
            Built with modern technology to make attendance tracking effortless
            and secure.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {features.map((feat, i) => (
            <div
              key={i}
              style={{
                padding: "32px",
                background: "white",
                borderRadius: "20px",
                border: `1px solid ${c.border}`,
                transition: "all 0.3s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = feat.color;
                e.currentTarget.style.boxShadow = `0 20px 40px ${feat.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = c.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: `${feat.color}12`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <feat.icon size={24} color={feat.color} />
              </div>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: c.text,
                }}
              >
                {feat.title}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: c.textMuted,
                  lineHeight: 1.6,
                }}
              >
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "60px 32px 100px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${c.text} 0%, ${c.primaryDark} 100%)`,
            borderRadius: "32px",
            padding: "80px 40px",
            textAlign: "center",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-100px",
              right: "-100px",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${c.accent}40, transparent 70%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-80px",
              left: "-80px",
              width: "240px",
              height: "240px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${c.primaryLight}30, transparent 70%)`,
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 700,
                marginBottom: "16px",
                letterSpacing: "-0.02em",
              }}
            >
              Ready to get started?
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: "rgba(255,255,255,0.7)",
                marginBottom: "32px",
                maxWidth: "480px",
                margin: "0 auto 32px",
                lineHeight: 1.6,
              }}
            >
              Join the modern way of tracking attendance. Sign in to your
              dashboard and take control today.
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "16px 32px",
                background: "white",
                color: c.text,
                border: "none",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "inherit",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 20px 40px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Sign In to Dashboard
              <HiArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: `1px solid ${c.border}`,
          padding: "40px 32px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: `linear-gradient(135deg, ${c.primary}, ${c.primaryLight})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HiOutlineQrcode size={16} color="white" />
            </div>
            <span style={{ fontSize: "14px", fontWeight: 600 }}>QRoll</span>
          </div>
          <p style={{ fontSize: "13px", color: c.textMuted }}>
            © 2026 QRoll • HND Computer Science Final Year Project
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            {["How it works", "Features"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(" ", "-")}`}
                style={{
                  fontSize: "13px",
                  color: c.textMuted,
                  textDecoration: "none",
                }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;