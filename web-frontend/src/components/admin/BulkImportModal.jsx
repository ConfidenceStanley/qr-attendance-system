import { useState, useRef } from "react";
import { HiOutlineUpload, HiOutlineDownload, HiOutlineX, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineDocumentText } from "react-icons/hi";
import axios from "axios";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────
// BULK IMPORT MODAL
// Props:
//   isOpen   — boolean
//   onClose  — function
//   type     — "students" | "lecturers"
//   onSuccess — function (called after successful import)
// ─────────────────────────────────────────────

const STEPS = {
  UPLOAD: "upload",
  RESULTS: "results",
};

const BulkImportModal = ({ isOpen, onClose, type, onSuccess }) => {
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const typeLabel = type === "students" ? "Students" : "Lecturers";

  // ── Reset everything when modal closes ──
  const handleClose = () => {
    setStep(STEPS.UPLOAD);
    setFile(null);
    setIsDragging(false);
    setIsUploading(false);
    setResults(null);
    onClose();
  };

  // ─────────────────────────────────────────
  // FILE SELECTION
  // ─────────────────────────────────────────
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    const ext = selectedFile.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      toast.error("Only CSV and Excel files are accepted.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  // ─────────────────────────────────────────
  // DRAG AND DROP
  // ─────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  // ─────────────────────────────────────────
  // DOWNLOAD TEMPLATE
  // ─────────────────────────────────────────
  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/bulk-import/template/${type}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      // Trigger browser download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `qrroll_${type}_template.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Template downloaded.");
    } catch (err) {
      toast.error("Failed to download template.");
    }
  };

  // ─────────────────────────────────────────
  // UPLOAD + IMPORT
  // ─────────────────────────────────────────
  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }

    setIsUploading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file); // "file" must match upload.single("file") in backend

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/bulk-import/${type}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResults(response.data);
      setStep(STEPS.RESULTS);

      if (response.data.success > 0) {
        onSuccess?.(); // refresh the parent list
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Import failed. Please try again.";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  // ─────────────────────────────────────────
  // FORMAT FILE SIZE
  // ─────────────────────────────────────────
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    // ── Backdrop ──
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
      onClick={(e) => {
        // Close if clicking backdrop
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* ── Modal Box ── */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "24px 28px 20px",
            borderBottom: "1px solid #e4e4e7",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                color: "#18181b",
                letterSpacing: "-0.02em",
              }}
            >
              Bulk Import {typeLabel}
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "13px",
                color: "#71717a",
              }}
            >
              Upload a CSV or Excel file to import multiple {typeLabel.toLowerCase()} at once
            </p>
          </div>

          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "#71717a",
              display: "flex",
              alignItems: "center",
            }}
          >
            <HiOutlineX size={20} />
          </button>
        </div>

        {/* ────────────────────────────────────── */}
        {/* STEP 1 — UPLOAD                        */}
        {/* ────────────────────────────────────── */}
        {step === STEPS.UPLOAD && (
          <div style={{ padding: "24px 28px 28px" }}>

            {/* ── Step 1: Download Template ── */}
            <div style={{ marginBottom: "24px" }}>
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#18181b",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Step 1 — Download Template
              </p>
              <div
                style={{
                  backgroundColor: "#f4f4f5",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#e0e7ff",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <HiOutlineDocumentText size={20} color="#4f46e5" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#18181b" }}>
                      {type === "students"
                        ? "qrroll_students_template.csv"
                        : "qrroll_lecturers_template.csv"}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#71717a" }}>
                      Fill this template with your data then upload below
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownloadTemplate}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    backgroundColor: "#4f46e5",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <HiOutlineDownload size={15} />
                  Download
                </button>
              </div>
            </div>

            {/* ── Required Columns Info ── */}
            <div
              style={{
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "24px",
              }}
            >
              <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 600, color: "#1e40af" }}>
                Required columns:
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#1d4ed8", lineHeight: 1.6 }}>
                {type === "students"
                  ? "fullName, email, studentId, level, department"
                  : "fullName, email, staffId, department"}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#3b82f6" }}>
                {type === "students"
                  ? "Optional: guardianName, guardianEmail, guardianPhone, guardianRelationship"
                  : "All columns above are required."}
              </p>
            </div>

            {/* ── Default Password Info ── */}
            <div
              style={{
                backgroundColor: "#fefce8",
                border: "1px solid #fde68a",
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "24px",
              }}
            >
              <p style={{ margin: 0, fontSize: "13px", color: "#92400e" }}>
                <strong>Default password:</strong> All imported {typeLabel.toLowerCase()} will
                use{" "}
                <span
                  style={{
                    fontFamily: "monospace",
                    backgroundColor: "#fef3c7",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    fontWeight: 700,
                  }}
                >
                  QRoll@1234
                </span>{" "}
                as their initial password. Please inform them to log in and change it.
              </p>
            </div>

            {/* ── Step 2: Upload File ── */}
            <p
              style={{
                margin: "0 0 10px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#18181b",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Step 2 — Upload Your File
            </p>

            {/* ── Drop Zone ── */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? "#4f46e5" : file ? "#10b981" : "#d4d4d8"}`,
                borderRadius: "12px",
                padding: "32px 24px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: isDragging
                  ? "#eef2ff"
                  : file
                  ? "#f0fdf4"
                  : "#fafafa",
                transition: "all 0.2s ease",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInputChange}
                style={{ display: "none" }}
              />

              {file ? (
                // ── File selected state ──
                <div>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: "#dcfce7",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <HiOutlineCheckCircle size={24} color="#10b981" />
                  </div>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#18181b",
                    }}
                  >
                    {file.name}
                  </p>
                  <p style={{ margin: 0, fontSize: "13px", color: "#71717a" }}>
                    {formatFileSize(file.size)} — Click to change file
                  </p>
                </div>
              ) : (
                // ── Empty state ──
                <div>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: "#e4e4e7",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <HiOutlineUpload size={24} color="#71717a" />
                  </div>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#18181b",
                    }}
                  >
                    Drag and drop your file here
                  </p>
                  <p style={{ margin: 0, fontSize: "13px", color: "#71717a" }}>
                    or click to browse — CSV, XLSX, XLS up to 5MB
                  </p>
                </div>
              )}
            </div>

            {/* ── Action Buttons ── */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <button
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "#f4f4f5",
                  color: "#18181b",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleImport}
                disabled={!file || isUploading}
                style={{
                  flex: 2,
                  padding: "11px",
                  backgroundColor: !file || isUploading ? "#a5b4fc" : "#4f46e5",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: !file || isUploading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {isUploading ? (
                  <>
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTop: "2px solid #ffffff",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Importing...
                  </>
                ) : (
                  <>
                    <HiOutlineUpload size={16} />
                    Import {typeLabel}
                  </>
                )}
              </button>
            </div>

            {/* spinner keyframe */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ────────────────────────────────────── */}
        {/* STEP 2 — RESULTS                       */}
        {/* ────────────────────────────────────── */}
        {step === STEPS.RESULTS && results && (
          <div style={{ padding: "24px 28px 28px" }}>

            {/* ── Summary Cards ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              {/* Created */}
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "10px",
                  padding: "16px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#10b981",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {results.success}
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "#059669", fontWeight: 600 }}>
                  Created
                </p>
              </div>

              {/* Skipped */}
              <div
                style={{
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "10px",
                  padding: "16px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#f59e0b",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {results.skipped}
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "#d97706", fontWeight: 600 }}>
                  Skipped
                </p>
              </div>

              {/* Failed */}
              <div
                style={{
                  backgroundColor: "#fff1f2",
                  border: "1px solid #fecdd3",
                  borderRadius: "10px",
                  padding: "16px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#f43f5e",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {results.failed}
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "#e11d48", fontWeight: 600 }}>
                  Failed
                </p>
              </div>
            </div>

            {/* ── Default Password Reminder ── */}
            {results.success > 0 && (
              <div
                style={{
                  backgroundColor: "#fefce8",
                  border: "1px solid #fde68a",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  marginBottom: "20px",
                }}
              >
                <p style={{ margin: 0, fontSize: "13px", color: "#92400e" }}>
                  <strong>Remind {typeLabel.toLowerCase()}:</strong> Default login password is{" "}
                  <span
                    style={{
                      fontFamily: "monospace",
                      backgroundColor: "#fef3c7",
                      padding: "1px 8px",
                      borderRadius: "4px",
                      fontWeight: 700,
                      fontSize: "14px",
                    }}
                  >
                    {results.defaultPassword}
                  </span>
                </p>
              </div>
            )}

            {/* ── Successfully Imported List ── */}
            {results.imported?.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#18181b",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <HiOutlineCheckCircle size={16} color="#10b981" />
                  Successfully Imported ({results.imported.length})
                </p>

                <div
                  style={{
                    border: "1px solid #e4e4e7",
                    borderRadius: "8px",
                    overflow: "hidden",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f4f4f5" }}>
                        <th style={thStyle}>Row</th>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Email</th>
                        <th style={thStyle}>
                          {type === "students" ? "Student ID" : "Staff ID"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.imported.map((item, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderTop: "1px solid #f4f4f5",
                            backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fafafa",
                          }}
                        >
                          <td style={tdStyle}>{item.row}</td>
                          <td style={tdStyle}>{item.fullName}</td>
                          <td style={tdStyle}>{item.email}</td>
                          <td style={tdStyle}>
                            {type === "students" ? item.studentId : item.staffId}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Errors / Skipped List ── */}
            {results.errors?.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#18181b",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <HiOutlineExclamationCircle size={16} color="#f59e0b" />
                  Issues ({results.errors.length})
                </p>

                <div
                  style={{
                    border: "1px solid #e4e4e7",
                    borderRadius: "8px",
                    overflow: "hidden",
                    maxHeight: "180px",
                    overflowY: "auto",
                  }}
                >
                  {results.errors.map((err, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px 14px",
                        borderBottom:
                          idx < results.errors.length - 1
                            ? "1px solid #f4f4f5"
                            : "none",
                        backgroundColor: err.skipped ? "#fffbeb" : "#fff1f2",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 2px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#18181b",
                        }}
                      >
                        Row {err.row}
                        {err.data?.fullName ? ` — ${err.data.fullName}` : ""}
                        {err.skipped && (
                          <span
                            style={{
                              marginLeft: "8px",
                              fontSize: "11px",
                              backgroundColor: "#fde68a",
                              color: "#92400e",
                              padding: "1px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            SKIPPED
                          </span>
                        )}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: "#71717a",
                        }}
                      >
                        {err.reasons?.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  // Reset to upload step for another import
                  setStep(STEPS.UPLOAD);
                  setFile(null);
                  setResults(null);
                }}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "#f4f4f5",
                  color: "#18181b",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Import Another File
              </button>

              <button
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "#4f46e5",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// TABLE STYLES — defined outside component
// so they don't recreate on every render
// ─────────────────────────────────────────────
const thStyle = {
  padding: "8px 12px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 700,
  color: "#71717a",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "8px 12px",
  fontSize: "13px",
  color: "#18181b",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "160px",
};

export default BulkImportModal;