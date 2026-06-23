import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { QRCodeSVG } from "qrcode.react";
import { io } from "socket.io-client";
import {
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi";
import LecturerLayout from "../../components/lecturer/LecturerLayout";
import { fetchSessionById, closeSession } from "../../redux/slices/lecturerSessionSlice";
import toast from "react-hot-toast";

const colors = {
  primary: "#4f46e5",
  text: "#18181b",
  textMuted: "#71717a",
  border: "#e4e4e7",
  success: "#10b981",
  error: "#f43f5e",
  background: "#fafafa",
};

// Format seconds into MM:SS
const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const SessionLivePage = () => {
  const { id }      = useParams();
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const { currentSession, loading } = useSelector((s) => s.lecturerSession);

  // Live attendees from socket (supplements DB data)
  const [liveAttendees, setLiveAttendees]   = useState([]);
  const [presentCount, setPresentCount]     = useState(0);
  const [timeLeft, setTimeLeft]             = useState(null);
  const [closing, setClosing]               = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef   = useRef(null);
  const timerRef    = useRef(null);

  // ── Load session data ──────────────────────────────────
  useEffect(() => {
    dispatch(fetchSessionById(id));
  }, [id, dispatch]);

  // ── Seed live list from DB data once loaded ────────────
  useEffect(() => {
    if (currentSession) {
      setLiveAttendees(currentSession.attendees || []);
      setPresentCount(currentSession.attendees?.length || 0);

      // Calculate time left from startTime + duration
      const start    = new Date(currentSession.startTime).getTime();
      const durationMs = (currentSession.duration || 60) * 60 * 1000;
      const elapsed  = Date.now() - start;
      const remaining = Math.max(0, Math.floor((durationMs - elapsed) / 1000));
      setTimeLeft(remaining);
    }
  }, [currentSession]);

  // ── Countdown timer ────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft !== null]); // only start once

  // ── Socket.io connection ───────────────────────────────
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000", {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      // Join this session's room so we get scan events
      socket.emit("join-session", id);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    // When a student scans successfully
    socket.on("student-scanned", (data) => {
      setLiveAttendees((prev) => [
        {
          student: {
            _id: data.student._id,
            studentId: data.student.studentId,
            user: { fullName: data.student.fullName },
          },
          scannedAt: data.scannedAt,
          distance: data.distance,
        },
        ...prev,
      ]);
      setPresentCount(data.presentCount);
      toast.success(`${data.student.fullName} marked present`, { duration: 3000 });
    });

    return () => {
      socket.emit("leave-session", id);
      socket.disconnect();
    };
  }, [id]);

  // ── Close session ──────────────────────────────────────
  const handleClose = async () => {
    if (!window.confirm("Close this session? Students will no longer be able to scan.")) return;

    setClosing(true);
    try {
      const result = await dispatch(closeSession(id)).unwrap();
      toast.success(`Session closed. ${result.presentCount} present, ${result.absentCount} absent.`, { duration: 5000 });
      navigate("/lecturer/sessions");
    } catch (err) {
      toast.error(err || "Failed to close session");
      setClosing(false);
    }
  };

  if (loading || !currentSession) {
    return (
      <LecturerLayout>
        <div style={{ textAlign: "center", padding: "64px", color: colors.textMuted }}>
          Loading session...
        </div>
      </LecturerLayout>
    );
  }

  const session      = currentSession;
  const totalEnrolled = session.enrolledStudents?.length || 0;
  const absentCount  = totalEnrolled - presentCount;

  // The QR token is what gets embedded in the QR code
  // Student mobile app will read this string and send to /api/student/scan
  const qrValue = session.qrToken;

  return (
    <LecturerLayout>
      <div style={{ maxWidth: "1100px" }}>

        {/* Header Bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "16px",
        }}>
          <div>
            <div style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "4px" }}>
              Live Session
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: colors.text, letterSpacing: "-0.02em", margin: 0 }}>
              {session.course?.courseCode} — {session.topic}
            </h1>
            <div style={{ marginTop: "8px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: colors.textMuted }}>
                <HiOutlineLocationMarker size={14} />
                Radius: {session.location?.radius}m
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: colors.textMuted }}>
                <HiOutlineClock size={14} />
                Duration: {session.duration} min
              </span>
              {/* Socket status dot */}
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: socketConnected ? colors.success : "#f59e0b" }}>
                <span style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: socketConnected ? colors.success : "#f59e0b",
                  display: "inline-block",
                }} />
                {socketConnected ? "Live" : "Connecting..."}
              </span>
            </div>
          </div>

          {session.status === "active" && (
            <button
              onClick={handleClose}
              disabled={closing}
              style={{
                padding: "10px 20px",
                background: closing ? "#fca5a5" : "#fff",
                color: colors.error,
                border: `2px solid ${colors.error}`,
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: closing ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              {closing ? "Closing..." : "Close Session"}
            </button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "24px", alignItems: "start" }}>

          {/* Left: QR Code Panel */}
          <div
            style={{
              background: "#fff",
              border: `1px solid ${colors.border}`,
              borderRadius: "16px",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              width: "320px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 600, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Scan to Attend
            </div>

            {/* The QR Code */}
            <div
              style={{
                padding: "16px",
                background: "#fff",
                borderRadius: "12px",
                border: `2px solid ${colors.border}`,
              }}
              id="qr-print-area"
            >
              <QRCodeSVG
                value={qrValue}
                size={220}
                level="M"
                includeMargin={false}
                fgColor={colors.text}
              />
            </div>

            {/* Course info below QR for printing */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "14px", fontWeight: 700, color: colors.primary }}>
                {session.course?.courseCode}
              </div>
              <div style={{ fontSize: "12px", color: colors.textMuted, marginTop: "2px" }}>
                {session.course?.courseTitle}
              </div>
            </div>

            {/* Timer */}
            {timeLeft !== null && (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "32px",
                  fontWeight: 700,
                  color: timeLeft < 300 ? colors.error : colors.text,
                  letterSpacing: "0.04em",
                }}>
                  {formatTime(timeLeft)}
                </div>
                <div style={{ fontSize: "12px", color: colors.textMuted }}>
                  remaining
                </div>
              </div>
            )}

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              style={{
                width: "100%",
                padding: "10px",
                background: "#fafafa",
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                color: colors.textMuted,
                cursor: "pointer",
              }}
            >
              Print QR Code
            </button>
          </div>

          {/* Right: Attendance Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Count Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              <div style={{ background: "#fff", border: `1px solid ${colors.border}`, borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 700, color: colors.text }}>{totalEnrolled}</div>
                <div style={{ fontSize: "12px", color: colors.textMuted }}>Enrolled</div>
              </div>
              <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "#065f46" }}>{presentCount}</div>
                <div style={{ fontSize: "12px", color: "#065f46" }}>Present</div>
              </div>
              <div style={{ background: "#fff1f2", border: "1px solid #fda4af", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "#9f1239" }}>{absentCount}</div>
                <div style={{ fontSize: "12px", color: "#9f1239" }}>Absent</div>
              </div>
            </div>

            {/* Live Attendance List */}
            <div style={{
              background: "#fff",
              border: `1px solid ${colors.border}`,
              borderRadius: "12px",
              overflow: "hidden",
              flex: 1,
            }}>
              <div style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${colors.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: colors.text }}>
                  Present Students
                </h3>
                <span style={{ fontSize: "12px", color: colors.textMuted }}>
                  Updates in real-time
                </span>
              </div>

              {liveAttendees.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: colors.textMuted, fontSize: "14px" }}>
                  Waiting for students to scan...
                </div>
              ) : (
                <div style={{ maxHeight: "420px", overflowY: "auto" }}>
                  {liveAttendees.map((entry, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 20px",
                        borderBottom: idx < liveAttendees.length - 1 ? `1px solid ${colors.border}` : "none",
                        animation: "fadeIn 0.3s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {/* Avatar */}
                        <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "#ede9fe",
                          color: colors.primary,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          {entry.student?.user?.fullName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>
                            {entry.student?.user?.fullName}
                          </div>
                          <div style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "JetBrains Mono, monospace" }}>
                            {entry.student?.studentId}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "12px", color: colors.success, fontWeight: 600 }}>
                          {entry.distance != null ? `${entry.distance}m away` : ""}
                        </div>
                        <div style={{ fontSize: "11px", color: colors.textMuted }}>
                          {new Date(entry.scannedAt).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #qr-print-area, #qr-print-area * { visibility: visible; }
          #qr-print-area { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </LecturerLayout>
  );
};

export default SessionLivePage;