import { useNavigate } from "react-router-dom";
import {
  HiOutlineQrcode,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineDeviceMobile,
  HiOutlineBell,
  HiArrowRight,
  HiCheck,
} from "react-icons/hi";

const LandingPage = () => {
  const navigate = useNavigate();

  // Design tokens
  const c = {
    primary: "#4f46e5",       // Indigo 600
    primaryDark: "#3730a3",   // Indigo 800
    primaryLight: "#818cf8",  // Indigo 400
    accent: "#f43f5e",        // Rose 500
    text: "#18181b",          // Zinc 900
    textMuted: "#71717a",     // Zinc 500
    bg: "#fafafa",            // Zinc 50
    border: "#e4e4e7",        // Zinc 200
    surface: "#ffffff",
  };

  const features = [
    {
      icon: HiOutlineQrcode,
      title: "Dynamic QR Codes",
      desc: "Rotating QR codes refresh every 15 seconds to prevent proxy attendance",
      color: "#4f46e5",
    },
    {
      icon: HiOutlineShieldCheck,
      title: "Secure & Reliable",
      desc: "JWT authentication and role-based access control for all users",
      color: "#10b981",
    },
    {
      icon: HiOutlineLightningBolt,
      title: "Real-time Updates",
      desc: "Watch attendance roll in live as students scan their QR codes",
      color: "#f59e0b",
    },
    {
      icon: HiOutlineDeviceMobile,
      title: "Mobile Friendly",
      desc: "Students mark attendance instantly through our mobile application",
      color: "#ec4899",
    },
    {
      icon: HiOutlineChartBar,
      title: "Smart Reports",
      desc: "Generate beautiful PDF and CSV reports with attendance analytics",
      color: "#8b5cf6",
    },
    {
      icon: HiOutlineBell,
      title: "Guardian Alerts",
      desc: "Automatic notifications to guardians on absence or low attendance",
      color: "#06b6d4",
    },
  ];

  const stats = [
    { value: "15s", label: "QR Refresh Rate" },
    { value: "100%", label: "Accurate" },
    { value: "3", label: "User Roles" },
    { value: "24/7", label: "Available" },
  ];

  return (
    <div style={{ background: c.bg, minHeight: "100vh", color: c.text }}>
      {/* Decorative gradient orbs */}
      <div
        style={{
          position: "fixed",
          top: "-200px",
          right: "-200px",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,70,229,0.15), transparent 70%)",
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
          background: "radial-gradient(circle, rgba(244,63,94,0.1), transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Navbar */}
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
            onMouseEnter={(e) => (e.currentTarget.style.background = c.primary)}
            onMouseLeave={(e) => (e.currentTarget.style.background = c.text)}
          >
            Sign In
            <HiArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
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
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            background: "rgba(79,70,229,0.08)",
            border: `1px solid rgba(79,70,229,0.15)`,
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
              animation: "pulse-slow 2s infinite",
            }}
          />
          Smart Attendance for Modern Classrooms
        </div>

        {/* Headline */}
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
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          A modern QR-based attendance monitoring system designed for the
          Department of Computer Science. Fast, secure, and proxy-proof.
        </p>

        {/* CTA Buttons */}
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
          <button
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
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = c.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = c.border;
            }}
          >
            Learn More
          </button>
        </div>

        {/* Hero Visual - QR Code Mockup */}
        <div
          style={{
            position: "relative",
            maxWidth: "640px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "32px",
              boxShadow:
                "0 30px 80px rgba(79,70,229,0.2), 0 0 0 1px rgba(0,0,0,0.04)",
              transform: "rotate(-1deg)",
              transition: "transform 0.5s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "rotate(0deg) translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "rotate(-1deg) translateY(0)";
            }}
          >
            {/* Browser dots */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                marginBottom: "20px",
              }}
            >
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

            {/* QR Display */}
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
                    animation: "pulse-slow 1.5s infinite",
                  }}
                />
                Refreshing in 12s
              </div>
            </div>

            {/* Mini stats below */}
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
                      letterSpacing: "0.5px",
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

      {/* Stats Section */}
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
            gap: "24px",
            padding: "40px",
            background: "white",
            borderRadius: "24px",
            border: `1px solid ${c.border}`,
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                borderRight:
                  i < stats.length - 1 ? `1px solid ${c.border}` : "none",
              }}
            >
              <p
                style={{
                  fontSize: "36px",
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
      </section>

      {/* Features Section */}
      <section
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
              fontWeight: 500,
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
                cursor: "pointer",
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

      {/* CTA Section */}
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
              }}
            >
              Join the modern way of tracking attendance. Sign in to your
              dashboard now.
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
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.3)";
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

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${c.border}`,
          padding: "32px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <p style={{ fontSize: "13px", color: c.textMuted }}>
          © 2026 QRoll • HND Computer Science Project
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;