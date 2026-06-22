import { HiOutlineInbox } from "react-icons/hi";

/**
 * Empty State Component
 * Shown when there is no data to display
 *
 * Props:
 * - icon: ReactNode (default inbox icon)
 * - title: string
 * - description: string
 * - action: ReactNode (optional - button or link)
 */
const EmptyState = ({
  icon: Icon = HiOutlineInbox,
  title = "No data yet",
  description = "Get started by creating your first item.",
  action,
}) => {
  return (
    <div
      style={{
        padding: "60px 20px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Icon circle */}
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "rgba(79,70,229,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        <Icon size={28} color="#4f46e5" />
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: "#18181b",
          margin: "0 0 6px",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: "13px",
          color: "#71717a",
          margin: "0 0 20px",
          maxWidth: "320px",
        }}
      >
        {description}
      </p>

      {/* Optional action button */}
      {action && action}
    </div>
  );
};

export default EmptyState;