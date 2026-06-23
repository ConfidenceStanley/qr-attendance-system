import { useState } from "react";
import { useDispatch } from "react-redux";
import { HiOutlineLocationMarker, HiOutlineClock, HiOutlineBookOpen, HiX } from "react-icons/hi";
import { createSession } from "../../redux/slices/lecturerSessionSlice";
import toast from "react-hot-toast";

const colors = {
  primary: "#4f46e5",
  text: "#18181b",
  textMuted: "#71717a",
  border: "#e4e4e7",
  success: "#10b981",
  error: "#f43f5e",
};

const CreateSessionModal = ({ course, onClose, onCreated }) => {
  const dispatch = useDispatch();

  const [topic, setTopic]         = useState("");
  const [qrMode, setQrMode]       = useState("dynamic");
  const [duration, setDuration]   = useState(60);
  const [radius, setRadius]       = useState(50);
  const [location, setLocation]   = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Capture GPS from browser ──────────────────────────
  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Your browser does not support GPS");
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGpsLoading(false);
        toast.success("Location captured");
      },
      (error) => {
        setGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please allow location access.");
        } else {
          toast.error("Could not get location. Try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      toast.error("Please enter a session topic");
      return;
    }
    if (!location) {
      toast.error("Please capture your classroom location first");
      return;
    }

    setSubmitting(true);

    try {
      const result = await dispatch(
        createSession({
          courseId: course._id,
          topic: topic.trim(),
          qrMode,
          duration,
          location: { ...location, radius },
        })
      ).unwrap();

      toast.success("Session started!");
      onCreated(result.session);
    } catch (err) {
      toast.error(err || "Failed to create session");
      setSubmitting(false);
    }
  };

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      {/* Modal Box */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "520px",
          padding: "32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: colors.text, letterSpacing: "-0.02em" }}>
              Start Attendance Session
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: colors.textMuted }}>
              {course.courseCode} — {course.courseTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted, padding: "4px" }}
          >
            <HiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Topic */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: colors.text, marginBottom: "6px" }}>
              Session Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Introduction to Algorithms"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: `1px solid ${colors.border}`,
                fontSize: "14px",
                color: colors.text,
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = colors.primary)}
              onBlur={(e) => (e.target.style.borderColor = colors.border)}
            />
          </div>

          {/* QR Mode Toggle */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: colors.text, marginBottom: "8px" }}>
              QR Mode
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              {["dynamic", "static"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setQrMode(mode)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: `2px solid ${qrMode === mode ? colors.primary : colors.border}`,
                    background: qrMode === mode ? "#ede9fe" : "#fff",
                    color: qrMode === mode ? colors.primary : colors.textMuted,
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.15s",
                  }}
                >
                  {mode === "dynamic" ? "Dynamic (Screen)" : "Static (Printed)"}
                </button>
              ))}
            </div>
            <p style={{ margin: "6px 0 0", fontSize: "12px", color: colors.textMuted }}>
              {qrMode === "dynamic"
                ? "Display QR on screen. Students scan from your screen."
                : "Generates a permanent QR you can print and laminate."}
            </p>
          </div>

          {/* Duration */}
          <div>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, color: colors.text, marginBottom: "6px" }}>
              <span>Session Duration</span>
              <span style={{ color: colors.primary, fontFamily: "JetBrains Mono, monospace" }}>
                {duration} min
              </span>
            </label>
            <input
              type="range"
              min={15}
              max={180}
              step={15}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{ width: "100%", accentColor: colors.primary }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: colors.textMuted, marginTop: "2px" }}>
              <span>15 min</span>
              <span>3 hrs</span>
            </div>
          </div>

          {/* GPS Location */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: colors.text, marginBottom: "8px" }}>
              Classroom Location (GPS)
            </label>

            <button
              type="button"
              onClick={captureLocation}
              disabled={gpsLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "8px",
                border: `1px solid ${location ? colors.success : colors.border}`,
                background: location ? "#d1fae5" : "#fafafa",
                color: location ? "#065f46" : colors.textMuted,
                fontSize: "13px",
                fontWeight: 600,
                cursor: gpsLoading ? "wait" : "pointer",
                transition: "all 0.15s",
              }}
            >
              <HiOutlineLocationMarker size={16} />
              {gpsLoading
                ? "Getting location..."
                : location
                ? "Location Captured - Click to Recapture"
                : "Capture My Location"}
            </button>

            {location && (
              <div style={{ marginTop: "8px", padding: "10px 14px", background: "#f4f4f5", borderRadius: "8px" }}>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: colors.textMuted }}>
                  Lat: {location.latitude.toFixed(6)}
                </div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: colors.textMuted }}>
                  Lng: {location.longitude.toFixed(6)}
                </div>
              </div>
            )}
          </div>

          {/* Radius Slider */}
          <div>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, color: colors.text, marginBottom: "6px" }}>
              <span>Allowed Radius</span>
              <span style={{ color: colors.primary, fontFamily: "JetBrains Mono, monospace" }}>
                {radius}m
              </span>
            </label>
            <input
              type="range"
              min={10}
              max={200}
              step={10}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              style={{ width: "100%", accentColor: colors.primary }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: colors.textMuted, marginTop: "2px" }}>
              <span>10m (strict)</span>
              <span>200m (lenient)</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !location}
            style={{
              padding: "13px",
              background: submitting || !location ? "#a5b4fc" : colors.primary,
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: submitting || !location ? "not-allowed" : "pointer",
              transition: "opacity 0.15s",
              letterSpacing: "-0.01em",
            }}
          >
            {submitting ? "Starting Session..." : "Start Session & Show QR"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateSessionModal;