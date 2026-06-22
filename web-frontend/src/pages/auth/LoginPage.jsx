import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../redux/slices/authSlice";
import { toast } from "react-hot-toast";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineQrcode,
  HiArrowRight,
  HiArrowLeft,
} from "react-icons/hi";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, user, token } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);

  const c = {
    primary: "#4f46e5",
    primaryDark: "#3730a3",
    text: "#18181b",
    textMuted: "#71717a",
    bg: "#fafafa",
    border: "#e4e4e7",
    surface: "#ffffff",
  };

  useEffect(() => {
    if (token && user) redirectByRole(user.role);
  }, [token, user]);


  const redirectByRole = (role) => {
    if (role === "admin") navigate("/admin/dashboard");
    else if (role === "lecturer") navigate("/lecturer/dashboard");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // const handleSubmit = async (e) => {
  // e.preventDefault();

  // if (!formData.email || !formData.password) {
  //   toast.error("Please fill in all fields", { duration: 4000 });
  //   return;
  // }

  // const result = await dispatch(loginUser(formData));
  //   if (loginUser.fulfilled.match(result)) {
  //     toast.success("Welcome back!");
  //     redirectByRole(result.payload.user.role);
  //   } else {
  //     toast.error(result.payload || "Login failed. Please try again.", {
  //       duration: 4000,
  //     });
  //     dispatch(clearError());
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();      // FIRST line
  e.stopPropagation();     // ADD this too just in case

  console.log("Submit clicked"); // debug log

  if (!formData.email || !formData.password) {
    toast.error("Please fill in all fields", { duration: 4000 });
    return;
  }

  try {
    const result = await dispatch(loginUser(formData));

    console.log("Login result:", result); // debug log

    if (loginUser.fulfilled.match(result)) {
      toast.success("Welcome back!");
      redirectByRole(result.payload.user.role);
    } else {
      toast.error(
        result.payload || "Login failed. Please check your credentials.",
        { duration: 4000 }
      );
      dispatch(clearError());
    }
  } catch (err) {
    console.error("Login error:", err);
    toast.error("Something went wrong", { duration: 4000 });
  }
};

return (
    <div
      style={{
        minHeight: "100vh",
        background: c.bg,
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative orbs */}
      <div
        style={{
          position: "absolute",
          top: "-200px",
          right: "-200px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(79,70,229,0.15), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-200px",
          left: "-200px",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(244,63,94,0.1), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          padding: "10px 16px",
          background: "white",
          border: `1px solid ${c.border}`,
          borderRadius: "10px",
          fontSize: "13px",
          color: c.text,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontFamily: "inherit",
          fontWeight: 500,
          zIndex: 10,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = c.text)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = c.border)}
      >
        <HiArrowLeft size={14} />
        Back
      </button>

      {/* Login Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          margin: "auto",
          padding: "40px 32px",
          position: "relative",
          zIndex: 1,
        }}
        className="fade-in-up"
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "48px",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${c.primary}, ${c.primaryDark})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HiOutlineQrcode size={22} color="white" />
          </div>
          <span style={{ fontSize: "18px", fontWeight: 600 }}>QRoll</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              marginBottom: "8px",
              color: c.text,
            }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: "14px", color: c.textMuted }}>
            Sign in to access your dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 500,
                color: c.text,
                marginBottom: "8px",
                letterSpacing: "0.2px",
              }}
            >
              Email
            </label>
            <div style={{ position: "relative" }}>
              <HiOutlineMail
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: focused === "email" ? c.primary : "#a1a1aa",
                  transition: "color 0.2s",
                }}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 44px",
                  background: "white",
                  border: `1px solid ${
                    focused === "email" ? c.primary : c.border
                  }`,
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: c.text,
                  outline: "none",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                  boxShadow:
                    focused === "email"
                      ? "0 0 0 4px rgba(79,70,229,0.1)"
                      : "none",
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 500,
                color: c.text,
                marginBottom: "8px",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <HiOutlineLockClosed
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: focused === "password" ? c.primary : "#a1a1aa",
                  transition: "color 0.2s",
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="Enter your password"
                style={{
                  width: "100%",
                  padding: "14px 44px 14px 44px",
                  background: "white",
                  border: `1px solid ${
                    focused === "password" ? c.primary : c.border
                  }`,
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: c.text,
                  outline: "none",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                  boxShadow:
                    focused === "password"
                      ? "0 0 0 4px rgba(79,70,229,0.1)"
                      : "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#a1a1aa",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                }}
              >
                {showPassword ? (
                  <HiOutlineEyeOff size={18} />
                ) : (
                  <HiOutlineEye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px",
              background: isLoading
                ? "#a1a1aa"
                : `linear-gradient(135deg, ${c.text}, #27272a)`,
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontFamily: "inherit",
              transition: "all 0.3s",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = `linear-gradient(135deg, ${c.primary}, ${c.primaryDark})`;
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(79,70,229,0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = `linear-gradient(135deg, ${c.text}, #27272a)`;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
              }
            }}
          >
            {isLoading ? (
              <>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Signing in
              </>
            ) : (
              <>
                Sign in
                <HiArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer note */}
        <div
          style={{
            marginTop: "32px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: c.textMuted,
            }}
          >
            Students sign in via the{" "}
            <span style={{ color: c.primary, fontWeight: 500 }}>
              Mobile App
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;