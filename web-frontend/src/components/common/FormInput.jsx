/**
 * Reusable Form Input
 *
 * Props:
 * - label: string
 * - name: string (required for form binding)
 * - value: string
 * - onChange: function
 * - type: string (default "text")
 * - placeholder: string
 * - required: boolean
 * - error: string (shows red error message)
 * - icon: ReactNode (optional - shown inside input on left)
 * - disabled: boolean
 * - hint: string (small helper text under input)
 */
const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  error,
  icon,
  disabled = false,
  hint,
}) => {
  return (
    <div style={{ marginBottom: "16px" }}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 500,
            color: "#18181b",
            marginBottom: "6px",
          }}
        >
          {label}
          {required && (
            <span style={{ color: "#f43f5e", marginLeft: "4px" }}>*</span>
          )}
        </label>
      )}

      {/* Input wrapper - allows icon positioning */}
      <div style={{ position: "relative" }}>
        {icon && (
          <div
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#71717a",
              pointerEvents: "none",
            }}
          >
            {icon}
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          style={{
            width: "100%",
            padding: icon ? "11px 14px 11px 40px" : "11px 14px",
            fontSize: "14px",
            color: "#18181b",
            background: disabled ? "#fafafa" : "white",
            border: `1px solid ${error ? "#f43f5e" : "#e4e4e7"}`,
            borderRadius: "10px",
            outline: "none",
            fontFamily: "inherit",
            transition: "all 0.2s",
            cursor: disabled ? "not-allowed" : "text",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = "#4f46e5";
              e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? "#f43f5e" : "#e4e4e7";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Error message OR hint text (error takes priority) */}
      {error ? (
        <p
          style={{
            fontSize: "12px",
            color: "#f43f5e",
            marginTop: "6px",
            margin: "6px 0 0",
          }}
        >
          {error}
        </p>
      ) : hint ? (
        <p
          style={{
            fontSize: "12px",
            color: "#71717a",
            marginTop: "6px",
            margin: "6px 0 0",
          }}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export default FormInput;