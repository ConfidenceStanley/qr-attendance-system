import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlinePencil } from "react-icons/hi";
import LecturerLayout from "../../components/lecturer/LecturerLayout";
import { fetchSessionAttendance, updateRecord } from "../../redux/slices/lecturerSessionSlice";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";

const colors = {
  primary: "#4f46e5",
  text: "#18181b",
  textMuted: "#71717a",
  border: "#e4e4e7",
  success: "#10b981",
  error: "#f43f5e",
};

const SessionAttendanceDetailPage = () => {
  const { id }     = useParams();
  const dispatch   = useDispatch();
  const { attendanceRecords, loading } = useSelector((s) => s.lecturerSession);

  const [editingId, setEditingId]   = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNote, setEditNote]     = useState("");
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    dispatch(fetchSessionAttendance(id));
  }, [id, dispatch]);

  const handleEdit = (record) => {
    setEditingId(record._id);
    setEditStatus(record.status);
    setEditNote(record.editNote || "");
  };

  const handleSave = async (studentId) => {
    setSaving(true);
    try {
      await dispatch(updateRecord({ sessionId: id, studentId, status: editStatus, editNote })).unwrap();
      toast.success("Record updated");
      setEditingId(null);
    } catch (err) {
      toast.error(err || "Failed to update");
    }
    setSaving(false);
  };

  const present = attendanceRecords.filter((r) => r.status === "present").length;
  const total   = attendanceRecords.length;

  return (
    <LecturerLayout>
      <div style={{ maxWidth: "900px" }}>
        {/* Back link */}
        <Link
          to="/lecturer/attendance"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: colors.textMuted, textDecoration: "none", fontSize: "14px", marginBottom: "24px" }}
        >
          <HiOutlineArrowLeft size={15} />
          Back to Records
        </Link>

        {/* Summary */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: colors.text, margin: 0 }}>
              Session Attendance
            </h1>
            <p style={{ color: colors.textMuted, fontSize: "13px", marginTop: "4px" }}>
              {present} present · {total - present} absent · {total} total
            </p>
          </div>
          <div style={{
            padding: "8px 16px",
            borderRadius: "20px",
            background: present / total >= 0.75 ? "#d1fae5" : "#fff1f2",
            color: present / total >= 0.75 ? "#065f46" : "#9f1239",
            fontWeight: 700,
            fontSize: "16px",
          }}>
            {total > 0 ? Math.round((present / total) * 100) : 0}%
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "48px", textAlign: "center", color: colors.textMuted }}>Loading...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Student", "ID", "Status", "Time", "Distance", "Action"].map((h) => (
                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${colors.border}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: "14px 20px", fontSize: "14px", fontWeight: 600, color: colors.text }}>
                      {record.student?.user?.fullName}
                      {record.manuallyEdited && (
                        <span style={{ marginLeft: "8px", fontSize: "11px", color: colors.warning, background: "#fef3c7", padding: "2px 6px", borderRadius: "4px" }}>
                          edited
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "14px 20px", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: colors.textMuted }}>
                      {record.student?.studentId}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      {editingId === record._id ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          style={{ padding: "4px 8px", borderRadius: "6px", border: `1px solid ${colors.border}`, fontSize: "13px" }}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                        </select>
                      ) : (
                        <span style={{
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: record.status === "present" ? "#d1fae5" : record.status === "late" ? "#fef3c7" : "#fff1f2",
                          color: record.status === "present" ? "#065f46" : record.status === "late" ? "#92400e" : "#9f1239",
                        }}>
                          {record.status}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "12px", color: colors.textMuted }}>
                      {record.scannedAt
                        ? new Date(record.scannedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "12px", color: colors.textMuted }}>
                      {record.distance != null ? `${record.distance}m` : "—"}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      {editingId === record._id ? (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleSave(record.student._id)}
                            disabled={saving}
                            style={{ padding: "4px 12px", background: colors.primary, color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{ padding: "4px 12px", background: "#f4f4f5", color: colors.textMuted, border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(record)}
                          style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", color: colors.primary, fontSize: "13px", fontWeight: 600 }}
                        >
                          <HiOutlinePencil size={13} />
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </LecturerLayout>
  );
};

export default SessionAttendanceDetailPage;