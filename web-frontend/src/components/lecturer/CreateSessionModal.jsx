import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  HiOutlineLocationMarker,
  HiX,
  HiOutlineInformationCircle,
  HiOutlineRefresh,
} from "react-icons/hi";
import { createSession } from "../../redux/slices/lecturerSessionSlice";
import toast from "react-hot-toast";

const colors = {
  primary: "#4f46e5",
  text: "#18181b",
  textMuted: "#71717a",
  border: "#e4e4e7",
  success: "#10b981",
  error: "#f43f5e",
  warning: "#f59e0b",
};

const CreateSessionModal = ({ course, onClose, onCreated }) => {
  const dispatch = useDispatch();

  const [topic, setTopic] = useState("");
  const [qrMode, setQrMode] = useState("dynamic");
  const [duration, setDuration] = useState(60);
  const [radius, setRadius] = useState(100);
  const [location, setLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Manual entry mode
  const [manualMode, setManualMode] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");

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
          accuracy: position.coords.accuracy,
        });
        setGpsLoading(false);
        toast.success(
          `Location captured (±${Math.round(position.coords.accuracy)}m accuracy)`
        );
      },
      (error) => {
        setGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please allow location access.");
        } else {
          toast.error("Could not get location. Try manual entry instead.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Apply manual coordinates ──────────────────────────
  const applyManualLocation = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Please enter valid numeric coordinates");
      return;
    }
    if (lat < -90 || lat > 90) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }
    if (lng < -180 || lng > 180) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }

    setLocation({ latitude: lat, longitude: lng, accuracy: null });
    toast.success("Manual location applied");
  };

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      toast.error("Please enter a session topic");
      return;
    }
    if (!location) {
      toast.error("Please set your classroom location first");
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
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            radius,
          },
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
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "560px",
          padding: "32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 700,
                color: colors.text,
                letterSpacing: "-0.02em",
              }}
            >
              Start Attendance Session
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: colors.textMuted }}>
              {course.courseCode} — {course.courseTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: colors.textMuted,
              padding: "4px",
            }}
          >
            <HiX size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* Topic */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: colors.text,
                marginBottom: "6px",
              }}
            >
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

          {/* QR Mode */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: colors.text,
                marginBottom: "8px",
              }}
            >
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
                    border: `2px solid ${
                      qrMode === mode ? colors.primary : colors.border
                    }`,
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
          </div>

          {/* Duration */}
          <div>
            <label
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                fontWeight: 600,
                color: colors.text,
                marginBottom: "6px",
              }}
            >
              <span>Session Duration</span>
              <span
                style={{
                  color: colors.primary,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: colors.textMuted,
                marginTop: "2px",
              }}
            >
              <span>15 min</span>
              <span>3 hrs</span>
            </div>
          </div>

          {/* GPS Location Section */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: colors.text,
                marginBottom: "8px",
              }}
            >
              Classroom Location
            </label>

            {/* Mode Toggle */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <button
                type="button"
                onClick={() => setManualMode(false)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  border: `1px solid ${!manualMode ? colors.primary : colors.border}`,
                  background: !manualMode ? "#ede9fe" : "#fff",
                  color: !manualMode ? colors.primary : colors.textMuted,
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Auto-Detect
              </button>
              <button
                type="button"
                onClick={() => setManualMode(true)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  border: `1px solid ${manualMode ? colors.primary : colors.border}`,
                  background: manualMode ? "#ede9fe" : "#fff",
                  color: manualMode ? colors.primary : colors.textMuted,
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Manual Entry
              </button>
            </div>

            {!manualMode ? (
              <>
                {/* Auto-Detect Mode */}
                <button
                  type="button"
                  onClick={captureLocation}
                  disabled={gpsLoading}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 18px",
                    borderRadius: "8px",
                    border: `1px solid ${location ? colors.success : colors.border}`,
                    background: location ? "#d1fae5" : "#fafafa",
                    color: location ? "#065f46" : colors.text,
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: gpsLoading ? "wait" : "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {location ? <HiOutlineRefresh size={16} /> : <HiOutlineLocationMarker size={16} />}
                  {gpsLoading
                    ? "Getting location..."
                    : location
                    ? "Recapture Location"
                    : "Capture My Location"}
                </button>

                {/* Warning about browser GPS accuracy */}
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px 12px",
                    background: "#fef3c7",
                    borderLeft: `3px solid ${colors.warning}`,
                    borderRadius: "6px",
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                  }}
                >
                  <HiOutlineInformationCircle
                    size={16}
                    color={colors.warning}
                    style={{ marginTop: "2px", flexShrink: 0 }}
                  />
                  <p style={{ margin: 0, fontSize: "11px", color: "#78350f", lineHeight: 1.5 }}>
                    <strong>Note:</strong> Browser GPS on laptops is inaccurate (may be off by km).
                    For accurate location, switch to <strong>Manual Entry</strong> and paste
                    coordinates from Google Maps.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Manual Entry Mode */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      placeholder="Latitude"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: `1px solid ${colors.border}`,
                        fontSize: "13px",
                        fontFamily: "JetBrains Mono, monospace",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      placeholder="Longitude"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: `1px solid ${colors.border}`,
                        fontSize: "13px",
                        fontFamily: "JetBrains Mono, monospace",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={applyManualLocation}
                  style={{
                    marginTop: "8px",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: "none",
                    background: colors.primary,
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Apply Coordinates
                </button>

                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px 12px",
                    background: "#eff6ff",
                    borderLeft: `3px solid ${colors.primary}`,
                    borderRadius: "6px",
                    fontSize: "11px",
                    color: "#1e40af",
                    lineHeight: 1.6,
                  }}
                >
                  <strong>How to get exact coords:</strong>
                  <br />
                  1. Open Google Maps on your phone (in the classroom)
                  <br />
                  2. Long-press your current location
                  <br />
                  3. Copy the numbers shown (e.g. 6.524379, 3.379205)
                  <br />
                  4. Paste them in the boxes above
                </div>
              </>
            )}

            {/* Captured Location Display */}
            {location && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "12px 14px",
                  background: "#f0fdf4",
                  border: `1px solid ${colors.success}`,
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: colors.success,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px",
                  }}
                >
                  Location Set
                </div>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "12px",
                    color: colors.text,
                  }}
                >
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </div>
                {location.accuracy && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: colors.textMuted,
                      marginTop: "2px",
                    }}
                  >
                    GPS accuracy: ±{Math.round(location.accuracy)}m
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Radius Slider — INCREASED RANGE */}
          <div>
            <label
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                fontWeight: 600,
                color: colors.text,
                marginBottom: "6px",
              }}
            >
              <span>Allowed Radius</span>
              <span
                style={{
                  color: colors.primary,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius}m`}
              </span>
            </label>
            <input
              type="range"
              min={10}
              max={2000}
              step={10}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              style={{ width: "100%", accentColor: colors.primary }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: colors.textMuted,
                marginTop: "2px",
              }}
            >
              <span>10m (strict)</span>
              <span>1km (lenient)</span>
              <span>2km (max)</span>
            </div>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "11px",
                color: colors.textMuted,
                lineHeight: 1.5,
              }}
            >
              <strong>Tip:</strong> Use 50-100m for classroom only.
              Use 500-1000m if browser GPS is inaccurate (testing).
            </p>
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