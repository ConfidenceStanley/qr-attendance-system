import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUsers,
  HiOutlineMail,
  HiOutlineIdentification,
  HiOutlineUser,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePhone,
  HiOutlineEye,
  HiOutlineFilter,
  HiOutlineKey,
  HiOutlineUpload,
} from "react-icons/hi";

// Redux
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../../redux/slices/studentSlice";

// Reusable Components
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import FormInput from "../../components/common/FormInput";
import FormSelect from "../../components/common/FormSelect";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import ResetPasswordModal from "../../components/admin/ResetPasswordModal";
import BulkImportModal from "../../components/admin/BulkImportModal";

const StudentsPage = () => {
  const dispatch = useDispatch();
  const { list: students, isLoading, isSubmitting } = useSelector(
    (state) => state.students
  );

  // Local UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const initialFormState = {
    fullName: "",
    email: "",
    studentId: "",
    level: "HND1",
    department: "Computer Science",
    guardianName: "",
    guardianEmail: "",
    guardianPhone: "",
    guardianRelationship: "Parent",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  // ─────────────────────────────────────────────
  // Fetch students with debounced search
  // ─────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (levelFilter) params.level = levelFilter;
      dispatch(fetchStudents(params));
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, searchTerm, levelFilter]);

  // ─────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────
  const handleAddNew = () => {
    setEditingStudent(null);
    setFormData(initialFormState);
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName || "",
      email: student.email || "",
      studentId: student.studentId || "",
      level: student.level || "HND1",
      department: student.department || "Computer Science",
      guardianName: student.guardian?.name || "",
      guardianEmail: student.guardian?.email || "",
      guardianPhone: student.guardian?.phone || "",
      guardianRelationship: student.guardian?.relationship || "Parent",
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleViewDetails = (student) => {
    setViewingStudent(student);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }
    if (!editingStudent && !formData.studentId.trim()) {
      errors.studentId = "Student ID is required";
    }
    if (!formData.level) errors.level = "Level is required";
    if (!editingStudent) {
      if (!formData.guardianName.trim())
        errors.guardianName = "Guardian name is required";
      if (!formData.guardianEmail.trim()) {
        errors.guardianEmail = "Guardian email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.guardianEmail)) {
        errors.guardianEmail = "Please enter a valid email";
      }
      if (!formData.guardianPhone.trim())
        errors.guardianPhone = "Guardian phone is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (editingStudent) {
        const { studentId, ...updateData } = formData;
        await dispatch(
          updateStudent({ id: editingStudent.id, data: updateData })
        ).unwrap();
        toast.success("Student updated successfully");
      } else {
        await dispatch(createStudent(formData)).unwrap();
        toast.success("Student created. Welcome email sent.");
      }
      setShowFormModal(false);
    } catch (error) {
      toast.error(error || "Operation failed", { duration: 4000 });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteStudent(studentToDelete.id)).unwrap();
      toast.success("Student deactivated successfully");
      setShowDeleteDialog(false);
      setStudentToDelete(null);
    } catch (error) {
      toast.error(error || "Failed to deactivate", { duration: 4000 });
    }
  };

  // Called by BulkImportModal after successful import
  const handleBulkImportSuccess = () => {
    dispatch(fetchStudents({}));
  };

  const activeCount = students.filter((s) => s.isActive).length;
  const inactiveCount = students.filter((s) => !s.isActive).length;

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 32px" }}>

      {/* ── Page Header ── */}
      <PageHeader
        breadcrumb="Admin"
        title="Students"
        description={`${activeCount} active, ${inactiveCount} inactive`}
        action={
          // Header right side — two buttons side by side
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={() => setBulkImportOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 16px",
                backgroundColor: "#f4f4f5",
                color: "#18181b",
                border: "1px solid #e4e4e7",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e4e4e7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f4f4f5";
              }}
            >
              <HiOutlineUpload size={16} />
              Bulk Import
            </button>

            <Button
              variant="primary"
              icon={<HiOutlinePlus size={16} />}
              onClick={handleAddNew}
            >
              Add Student
            </Button>
          </div>
        }
      />

      {/* ── Search + Filter ── */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <HiOutlineSearch
            size={18}
            color="#71717a"
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            type="text"
            placeholder="Search by name, email or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 14px 11px 42px",
              fontSize: "14px",
              color: "#18181b",
              background: "white",
              border: "1px solid #e4e4e7",
              borderRadius: "10px",
              outline: "none",
              fontFamily: "inherit",
              transition: "all 0.2s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#4f46e5";
              e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e4e4e7";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <div style={{ position: "relative", minWidth: "180px" }}>
          <HiOutlineFilter
            size={16}
            color="#71717a"
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 14px 11px 40px",
              fontSize: "14px",
              color: levelFilter ? "#18181b" : "#71717a",
              background: "white",
              border: "1px solid #e4e4e7",
              borderRadius: "10px",
              outline: "none",
              fontFamily: "inherit",
              cursor: "pointer",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2371717a' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
              paddingRight: "40px",
            }}
          >
            <option value="">All Levels</option>
            <option value="ND1">ND1</option>
            <option value="ND2">ND2</option>
            <option value="HND1">HND1</option>
            <option value="HND2">HND2</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          border: "1px solid #e4e4e7",
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <div
              style={{
                display: "inline-block",
                width: "32px",
                height: "32px",
                border: "3px solid #e4e4e7",
                borderTopColor: "#4f46e5",
                borderRadius: "50%",
                animation: "spin 0.6s linear infinite",
              }}
            />
            <p style={{ fontSize: "13px", color: "#71717a", marginTop: "16px" }}>
              Loading students...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            icon={HiOutlineUsers}
            title={searchTerm || levelFilter ? "No students found" : "No students yet"}
            description={
              searchTerm || levelFilter
                ? "Try different search terms or clear filters."
                : "Get started by adding your first student or use Bulk Import."
            }
            action={
              !searchTerm && !levelFilter && (
                <Button
                  variant="primary"
                  icon={<HiOutlinePlus size={16} />}
                  onClick={handleAddNew}
                >
                  Add Student
                </Button>
              )
            }
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}
            >
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid #e4e4e7" }}>
                  <th style={th}>Student</th>
                  <th style={th}>Student ID</th>
                  <th style={th}>Level</th>
                  <th style={th}>Department</th>
                  <th style={th}>Courses</th>
                  <th style={th}>Status</th>
                  <th style={{ ...th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    style={{
                      borderBottom: "1px solid #f4f4f5",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fafafa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Name + Email */}
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, #10b981, #059669)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            fontSize: "13px",
                            flexShrink: 0,
                          }}
                        >
                          {student.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 500, color: "#18181b" }}>
                            {student.fullName}
                          </p>
                          <p style={{ margin: "2px 0 0", color: "#71717a", fontSize: "12px" }}>
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Student ID */}
                    <td style={td}>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "12px",
                          color: "#18181b",
                          background: "#fafafa",
                          padding: "4px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        {student.studentId}
                      </span>
                    </td>

                    {/* Level */}
                    <td style={td}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: "rgba(79,70,229,0.08)",
                          color: "#4f46e5",
                        }}
                      >
                        {student.level}
                      </span>
                    </td>

                    {/* Department */}
                    <td style={td}>{student.department}</td>

                    {/* Courses */}
                    <td style={td}>
                      <span
                        style={{
                          color: student.courseCount > 0 ? "#4f46e5" : "#71717a",
                          fontWeight: 500,
                        }}
                      >
                        {student.courseCount || 0}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={td}>
                      {student.isActive ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "3px 8px",
                            background: "rgba(16,185,129,0.1)",
                            color: "#10b981",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 500,
                          }}
                        >
                          <HiOutlineCheckCircle size={12} />
                          Active
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "3px 8px",
                            background: "rgba(113,113,122,0.1)",
                            color: "#71717a",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 500,
                          }}
                        >
                          <HiOutlineXCircle size={12} />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ ...td, textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          onClick={() => handleViewDetails(student)}
                          style={iconBtn}
                          title="View details"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#10b981";
                            e.currentTarget.style.color = "#10b981";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e4e4e7";
                            e.currentTarget.style.color = "#71717a";
                          }}
                        >
                          <HiOutlineEye size={14} />
                        </button>

                        <button
                          onClick={() => handleEdit(student)}
                          style={iconBtn}
                          title="Edit"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#4f46e5";
                            e.currentTarget.style.color = "#4f46e5";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e4e4e7";
                            e.currentTarget.style.color = "#71717a";
                          }}
                        >
                          <HiOutlinePencil size={14} />
                        </button>

                        {student.isActive && (
                          <button
                            onClick={() => setResetUser(student)}
                            style={iconBtn}
                            title="Reset Password"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#f59e0b";
                              e.currentTarget.style.color = "#f59e0b";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#e4e4e7";
                              e.currentTarget.style.color = "#71717a";
                            }}
                          >
                            <HiOutlineKey size={14} />
                          </button>
                        )}

                        {student.isActive && (
                          <button
                            onClick={() => handleDeleteClick(student)}
                            style={iconBtn}
                            title="Deactivate"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#f43f5e";
                              e.currentTarget.style.color = "#f43f5e";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#e4e4e7";
                              e.currentTarget.style.color = "#71717a";
                            }}
                          >
                            <HiOutlineTrash size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingStudent ? "Edit Student" : "Add New Student"}
        subtitle={
          editingStudent
            ? "Update student and guardian details"
            : "Fill in student info and guardian contact details"
        }
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <SectionLabel
            title="Student Information"
            description="Basic student details and academic info"
          />

          <FormGrid>
            <FormInput
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Alice Johnson"
              required
              icon={<HiOutlineUser size={16} />}
              error={formErrors.fullName}
            />
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="alice@student.edu"
              required
              icon={<HiOutlineMail size={16} />}
              error={formErrors.email}
            />
            <FormInput
              label="Student ID"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              placeholder="HND1/2024/001"
              required={!editingStudent}
              disabled={!!editingStudent}
              icon={<HiOutlineIdentification size={16} />}
              error={formErrors.studentId}
              hint={editingStudent ? "Student ID cannot be changed" : null}
            />
            <FormSelect
              label="Level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              options={[
                { value: "ND1", label: "ND1 - National Diploma 1" },
                { value: "ND2", label: "ND2 - National Diploma 2" },
                { value: "HND1", label: "HND1 - Higher National 1" },
                { value: "HND2", label: "HND2 - Higher National 2" },
              ]}
              required
              error={formErrors.level}
            />
            <FormSelect
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              options={[
                { value: "Computer Science", label: "Computer Science" },
                { value: "Mathematics", label: "Mathematics" },
                { value: "Physics", label: "Physics" },
                { value: "Statistics", label: "Statistics" },
                { value: "Engineering", label: "Engineering" },
              ]}
              required
            />
          </FormGrid>

          <SectionLabel
            title="Guardian Information"
            description="Emergency contact and notification recipient"
            spacing
          />

          <FormGrid>
            <FormInput
              label="Guardian Full Name"
              name="guardianName"
              value={formData.guardianName}
              onChange={handleInputChange}
              placeholder="Mr Johnson"
              required={!editingStudent}
              icon={<HiOutlineUser size={16} />}
              error={formErrors.guardianName}
            />
            <FormSelect
              label="Relationship"
              name="guardianRelationship"
              value={formData.guardianRelationship}
              onChange={handleInputChange}
              options={[
                { value: "Parent", label: "Parent" },
                { value: "Guardian", label: "Guardian" },
                { value: "Sibling", label: "Sibling" },
                { value: "Spouse", label: "Spouse" },
                { value: "Other", label: "Other" },
              ]}
              required={!editingStudent}
            />
            <FormInput
              label="Guardian Email"
              name="guardianEmail"
              type="email"
              value={formData.guardianEmail}
              onChange={handleInputChange}
              placeholder="parent@example.com"
              required={!editingStudent}
              icon={<HiOutlineMail size={16} />}
              error={formErrors.guardianEmail}
              hint="Absence alerts will be sent here"
            />
            <FormInput
              label="Guardian Phone"
              name="guardianPhone"
              value={formData.guardianPhone}
              onChange={handleInputChange}
              placeholder="08012345678"
              required={!editingStudent}
              icon={<HiOutlinePhone size={16} />}
              error={formErrors.guardianPhone}
            />
          </FormGrid>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid #e4e4e7",
            }}
          >
            <Button
              variant="secondary"
              onClick={() => setShowFormModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting}>
              {editingStudent ? "Save Changes" : "Create Student"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Student Details Modal ── */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Student Details"
        subtitle={viewingStudent?.fullName}
        size="md"
      >
        {viewingStudent && (
          <div>
            <DetailSection title="Personal Information">
              <DetailRow label="Full Name" value={viewingStudent.fullName} />
              <DetailRow label="Email" value={viewingStudent.email} />
              <DetailRow label="Student ID" value={viewingStudent.studentId} mono />
              <DetailRow label="Level" value={viewingStudent.level} />
              <DetailRow label="Department" value={viewingStudent.department} />
              <DetailRow
                label="Status"
                value={viewingStudent.isActive ? "Active" : "Inactive"}
              />
            </DetailSection>

            <DetailSection title="Guardian Information" spacing>
              <DetailRow
                label="Name"
                value={viewingStudent.guardian?.name || "Not provided"}
              />
              <DetailRow
                label="Relationship"
                value={viewingStudent.guardian?.relationship || "Not provided"}
              />
              <DetailRow
                label="Email"
                value={viewingStudent.guardian?.email || "Not provided"}
              />
              <DetailRow
                label="Phone"
                value={viewingStudent.guardian?.phone || "Not provided"}
              />
            </DetailSection>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: "1px solid #e4e4e7",
              }}
            >
              <Button
                variant="primary"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEdit(viewingStudent);
                }}
                icon={<HiOutlinePencil size={14} />}
              >
                Edit Student
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Confirmation ── */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Deactivate Student?"
        message={
          studentToDelete
            ? `${studentToDelete.fullName} will lose access to the system. Their attendance history and enrollment data will be preserved.`
            : ""
        }
        confirmText="Yes, Deactivate"
        cancelText="Cancel"
        variant="danger"
        loading={isSubmitting}
      />

      {/* ── Reset Password Modal ── */}
      {resetUser && (
        <ResetPasswordModal
          user={resetUser}
          onClose={() => setResetUser(null)}
        />
      )}

      {/* ── Bulk Import Modal ── */}
      <BulkImportModal
        isOpen={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        type="students"
        onSuccess={handleBulkImportSuccess}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
// Helper Components
// ─────────────────────────────────────────────
const SectionLabel = ({ title, description, spacing }) => (
  <div style={{ marginTop: spacing ? "24px" : 0, marginBottom: "16px" }}>
    <h3
      style={{
        fontSize: "13px",
        fontWeight: 600,
        color: "#18181b",
        margin: "0 0 4px",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {title}
    </h3>
    <p style={{ fontSize: "12px", color: "#71717a", margin: 0 }}>{description}</p>
  </div>
);

const FormGrid = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "12px",
    }}
  >
    {children}
  </div>
);

const DetailSection = ({ title, children, spacing }) => (
  <div style={{ marginTop: spacing ? "20px" : 0 }}>
    <h3
      style={{
        fontSize: "12px",
        fontWeight: 600,
        color: "#71717a",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        margin: "0 0 12px",
        paddingBottom: "8px",
        borderBottom: "1px solid #f4f4f5",
      }}
    >
      {title}
    </h3>
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {children}
    </div>
  </div>
);

const DetailRow = ({ label, value, mono }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
    }}
  >
    <span style={{ fontSize: "13px", color: "#71717a" }}>{label}</span>
    <span
      style={{
        fontSize: "13px",
        fontWeight: 500,
        color: "#18181b",
        fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit",
        textAlign: "right",
      }}
    >
      {value}
    </span>
  </div>
);

// ─────────────────────────────────────────────
// Shared cell styles
// ─────────────────────────────────────────────
const th = {
  padding: "14px 20px",
  textAlign: "left",
  fontWeight: 500,
  color: "#71717a",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

const td = {
  padding: "16px 20px",
  color: "#18181b",
  verticalAlign: "middle",
};

const iconBtn = {
  width: "32px",
  height: "32px",
  border: "1px solid #e4e4e7",
  background: "white",
  borderRadius: "8px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#71717a",
  transition: "all 0.2s",
};

export default StudentsPage;