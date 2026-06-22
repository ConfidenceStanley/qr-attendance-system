/**
 * Reusable Select Dropdown
 *
 * Props:
 * - label: string
 * - name: string
 * - value: string
 * - onChange: function
 * - options: [{ value, label }]
 * - placeholder: string (shown as first disabled option)
 * - required: boolean
 * - error: string
 * - disabled: boolean
 */
const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  required = false,
  error,
  disabled = false,
}) => {
  return (
    <div style={{ marginBottom: "16px" }}>
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

      <select
        id={name}
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "11px 14px",
          fontSize: "14px",
          color: value ? "#18181b" : "#71717a",
          background: disabled ? "#fafafa" : "white",
          border: `1px solid ${error ? "#f43f5e" : "#e4e4e7"}`,
          borderRadius: "10px",
          outline: "none",
          fontFamily: "inherit",
          cursor: disabled ? "not-allowed" : "pointer",
          appearance: "none",
          // Custom dropdown arrow as SVG background
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2371717a' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
          paddingRight: "40px",
          transition: "all 0.2s",
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
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <p
          style={{
            fontSize: "12px",
            color: "#f43f5e",
            margin: "6px 0 0",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FormSelect;