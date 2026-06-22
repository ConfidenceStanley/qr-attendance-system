/**
 * Consistent Page Header
 * Used at the top of every admin page
 *
 * Props:
 * - breadcrumb: string (small text above title)
 * - title: string (main heading)
 * - description: string (subtitle)
 * - action: ReactNode (optional - usually a button)
 */
const PageHeader = ({ breadcrumb, title, description, action }) => {
  return (
    <div
      style={{
        marginBottom: "32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div>
        {breadcrumb && (
          <p
            style={{
              fontSize: "13px",
              color: "#71717a",
              margin: "0 0 4px",
            }}
          >
            {breadcrumb}
          </p>
        )}
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 600,
            color: "#18181b",
            margin: "0 0 6px",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: "14px",
              color: "#71717a",
              margin: 0,
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Action button on the right */}
      {action && <div>{action}</div>}
    </div>
  );
};

export default PageHeader;