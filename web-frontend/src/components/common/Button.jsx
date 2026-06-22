/**
 * Reusable Button
 *
 * Props:
 * - children: button text/content
 * - onClick: function
 * - variant: "primary" | "secondary" | "danger" | "ghost"
 * - size: "sm" | "md" | "lg"
 * - icon: ReactNode (optional - shown on left)
 * - iconRight: ReactNode (optional - shown on right)
 * - disabled: boolean
 * - loading: boolean (shows spinner)
 * - type: "button" | "submit" (default "button")
 * - fullWidth: boolean
 */
const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  disabled = false,
  loading = false,
  type = "button",
  fullWidth = false,
}) => {
  // Style variants - colors based on action type
  const variants = {
    primary: {
      bg: "#4f46e5",
      bgHover: "#3730a3",
      color: "white",
      border: "1px solid #4f46e5",
      borderHover: "1px solid #3730a3",
    },
    secondary: {
      bg: "white",
      bgHover: "#fafafa",
      color: "#18181b",
      border: "1px solid #e4e4e7",
      borderHover: "1px solid #4f46e5",
    },
    danger: {
      bg: "#f43f5e",
      bgHover: "#e11d48",
      color: "white",
      border: "1px solid #f43f5e",
      borderHover: "1px solid #e11d48",
    },
    ghost: {
      bg: "transparent",
      bgHover: "#fafafa",
      color: "#18181b",
      border: "1px solid transparent",
      borderHover: "1px solid #e4e4e7",
    },
  };

  // Size variants
  const sizes = {
    sm: { padding: "7px 12px", fontSize: "12px", gap: "6px" },
    md: { padding: "10px 16px", fontSize: "13px", gap: "8px" },
    lg: { padding: "12px 20px", fontSize: "14px", gap: "8px" },
  };

  const v = variants[variant];
  const s = sizes[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: s.padding,
        fontSize: s.fontSize,
        gap: s.gap,
        background: v.bg,
        color: v.color,
        border: v.border,
        borderRadius: "10px",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        fontWeight: 500,
        fontFamily: "inherit",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: fullWidth ? "100%" : "auto",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.background = v.bgHover;
          e.currentTarget.style.border = v.borderHover;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.background = v.bg;
          e.currentTarget.style.border = v.border;
        }
      }}
    >
      {loading ? (
        <>
          <span
            style={{
              width: "14px",
              height: "14px",
              border: `2px solid ${v.color}`,
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
          />
          Loading...
        </>
      ) : (
        <>
          {icon && icon}
          {children}
          {iconRight && iconRight}
        </>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default Button;