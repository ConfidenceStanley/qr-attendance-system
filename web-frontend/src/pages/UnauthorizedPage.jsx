import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#f1f5f9" }}
    >
      <div className="text-center">
        <div style={{ fontSize: "80px", marginBottom: "24px" }}>🚫</div>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#0f172a",
            marginBottom: "8px",
          }}
        >
          Access Denied
        </h1>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>
          You do not have permission to access this page.
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;