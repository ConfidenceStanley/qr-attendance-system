import { NavLink, Link } from "react-router-dom";
import {
  HiOutlineQrcode,
  HiOutlineViewGrid,
  HiOutlineUserGroup,
  HiOutlineUsers,
  HiOutlineBookOpen,
  HiOutlineDocumentReport,
  HiOutlineCog,
} from "react-icons/hi";

const AdminSidebar = () => {
  const c = {
    primary: "#4f46e5",
    primaryDark: "#3730a3",
    text: "#18181b",
    textMuted: "#71717a",
    bg: "#fafafa",
    border: "#e4e4e7",
  };

  // All sidebar menu items
  const menuItems = [
    {
      label: "Dashboard",
      icon: HiOutlineViewGrid,
      path: "/admin/dashboard",
    },
    {
      label: "Lecturers",
      icon: HiOutlineUserGroup,
      path: "/admin/lecturers",
    },
    {
      label: "Students",
      icon: HiOutlineUsers,
      path: "/admin/students",
    },
    {
      label: "Courses",
      icon: HiOutlineBookOpen,
      path: "/admin/courses",
    },
  ];

  // Future items (Phase 5)
  const futureItems = [
    {
      label: "Reports",
      icon: HiOutlineDocumentReport,
      path: "/admin/reports",
      disabled: true,
    },
    {
      label: "Settings",
      icon: HiOutlineCog,
      path: "/admin/settings",
      disabled: true,
    },
  ];

  return (
    <aside
      style={{
        width: "260px",
        height: "100vh",
        background: "white",
        borderRight: `1px solid ${c.border}`,
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Logo Section - Clickable, goes to landing page */}
      <Link
        to="/"
        style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${c.border}`,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          textDecoration: "none",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = c.bg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "white";
        }}
      >
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
          <p
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: c.text,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            QRoll
          </p>
          <p
            style={{
              fontSize: "11px",
              color: c.textMuted,
              margin: 0,
            }}
          >
            Admin Console
          </p>
        </div>
      </Link>

      {/* Menu Items */}
      <nav
        style={{
          flex: 1,
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {/* Section label */}
        <p
          style={{
            fontSize: "11px",
            color: c.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontWeight: 600,
            padding: "0 12px 8px",
            margin: 0,
          }}
        >
          Main
        </p>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 12px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
              transition: "all 0.2s",
              background: isActive ? `${c.primary}10` : "transparent",
              color: isActive ? c.primary : c.text,
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.style.background.includes("rgb")) {
                e.currentTarget.style.background = c.bg;
              }
            }}
            onMouseLeave={(e) => {
              // Only reset if not active (active has rgba color)
              if (!e.currentTarget.style.background.includes("rgba")) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}

        {/* Coming Soon section */}
        <p
          style={{
            fontSize: "11px",
            color: c.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontWeight: 600,
            padding: "20px 12px 8px",
            margin: 0,
          }}
        >
          Coming soon
        </p>

        {futureItems.map((item) => (
          <div
            key={item.path}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 12px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 500,
              color: c.textMuted,
              opacity: 0.5,
              cursor: "not-allowed",
            }}
          >
            <item.icon size={18} />
            {item.label}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: `1px solid ${c.border}`,
          fontSize: "11px",
          color: c.textMuted,
        }}
      >
        <p style={{ margin: 0 }}>QRoll v1.0</p>
        <p style={{ margin: "2px 0 0" }}>© 2025</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;