import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUserGroup,
  HiOutlineMail,
  HiOutlineIdentification,
  HiOutlineOfficeBuilding,
  HiOutlineUser,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi";

// Redux
import {
  fetchLecturers,
  createLecturer,
  updateLecturer,
  deleteLecturer,
} from "../../redux/slices/lecturerSlice";

// Reusable Components
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import FormInput from "../../components/common/FormInput";
import FormSelect from "../../components/common/FormSelect";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";

const LecturersPage = () => {
  const dispatch = useDispatch();
  const { list: lecturers, isLoading, isSubmitting } = useSelector(
    (state) => state.lecturers
  );

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null); // null = creating
  const [lecturerToDelete, setLecturerToDelete] = useState(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    staffId: "",
    department: "Computer Science",
  });

  const [formErrors, setFormErrors] = useState({});

  // ─────────────────────────────────────────────
  // Load lecturers on mount and when search changes
  // ─────────────────────────────────────────────
  useEffect(() => {
    // Debounce search by 300ms - don't fire on every keystroke
    const timer = setTimeout(() => {
      dispatch(fetchLecturers(searchTerm ? { search: searchTerm } : {}));
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, searchTerm]);

  // ─────────────────────────────────────────────
  // Open modal for CREATE
  // ─────────────────────────────────────────────
  const handleAddNew = () => {
    setEditingLecturer(null);
    setFormData({
      fullName: "",
      email: "",
      staffId: "",
      department: "Computer Science",
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  // ─────────────────────────────────────────────
  // Open modal for EDIT
  // ─────────────────────────────────────────────
  const handleEdit = (lecturer) => {
    setEditingLecturer(lecturer);
    setFormData({
      fullName: lecturer.fullName || "",
      email: lecturer.email || "",
      staffId: lecturer.staffId || "",
      department: lecturer.department || "Computer Science",
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  // ─────────────────────────────────────────────
  // Open delete confirmation
  // ─────────────────────────────────────────────
  const handleDeleteClick = (lecturer) => {
    setLecturerToDelete(lecturer);
    setShowDeleteDialog(true);
  };

  // ─────────────────────────────────────────────
  // Form input change handler
  // ─────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field as user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  // ─────────────────────────────────────────────
  // Validate form before submit
  // ─────────────────────────────────────────────
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!editingLecturer && !formData.staffId.trim()) {
      // Staff ID is only required when creating new
      errors.staffId = "Staff ID is required";
    }

    if (!formData.department.trim()) {
      errors.department = "Department is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─────────────────────────────────────────────
  // Submit form (create or update)
  // ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingLecturer) {
        // Update existing
        // Don't send staffId on update (cannot be changed)
        const { staffId, ...updateData } = formData;
        await dispatch(
          updateLecturer({ id: editingLecturer.id, data: updateData })
        ).unwrap();
        toast.success("Lecturer updated successfully");
      } else {
        // Create new
        await dispatch(createLecturer(formData)).unwrap();
        toast.success("Lecturer created. Welcome email sent.");
      }

      setShowFormModal(false);
    } catch (error) {
      toast.error(error || "Operation failed", { duration: 4000 });
    }
  };

  // ─────────────────────────────────────────────
  // Confirm delete (deactivate)
  // ─────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteLecturer(lecturerToDelete.id)).unwrap();
      toast.success("Lecturer deactivated successfully");
      setShowDeleteDialog(false);
      setLecturerToDelete(null);
    } catch (error) {
      toast.error(error || "Failed to deactivate lecturer", {
        duration: 4000,
      });
    }
  };

  // Active/Inactive count for header stats
  const activeCount = lecturers.filter((l) => l.isActive).length;
  const inactiveCount = lecturers.filter((l) => !l.isActive).length;

  return (
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "40px 32px",
      }}
    >
      {/* Page Header */}
      <PageHeader
        breadcrumb="Admin"
        title="Lecturers"
        description={`${activeCount} active, ${inactiveCount} inactive`}
        action={
          <Button
            variant="primary"
            icon={<HiOutlinePlus size={16} />}
            onClick={handleAddNew}
          >
            Add Lecturer
          </Button>
        }
      />

      {/* Search Bar */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ position: "relative", maxWidth: "400px" }}>
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
            placeholder="Search by name, email or staff ID..."
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
      </div>

      {/* Lecturers Table / Empty State */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          border: "1px solid #e4e4e7",
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          // Loading skeleton
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
            <p
              style={{
                fontSize: "13px",
                color: "#71717a",
                marginTop: "16px",
              }}
            >
              Loading lecturers...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : lecturers.length === 0 ? (
          // Empty state
          <EmptyState
            icon={HiOutlineUserGroup}
            title={
              searchTerm ? "No lecturers found" : "No lecturers yet"
            }
            description={
              searchTerm
                ? `No results matching "${searchTerm}". Try a different search.`
                : "Get started by adding your first lecturer to the system."
            }
            action={
              !searchTerm && (
                <Button
                  variant="primary"
                  icon={<HiOutlinePlus size={16} />}
                  onClick={handleAddNew}
                >
                  Add Lecturer
                </Button>
              )
            }
          />
        ) : (
          // Table
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#fafafa",
                    borderBottom: "1px solid #e4e4e7",
                  }}
                >
                  <th style={th}>Lecturer</th>
                  <th style={th}>Staff ID</th>
                  <th style={th}>Department</th>
                  <th style={th}>Courses</th>
                  <th style={th}>Status</th>
                  <th style={{ ...th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lecturers.map((lecturer) => (
                  <tr
                    key={lecturer.id}
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
                    {/* Name + Email cell */}
                    <td style={td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background:
                              "linear-gradient(135deg, #4f46e5, #3730a3)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            fontSize: "13px",
                            flexShrink: 0,
                          }}
                        >
                          {lecturer.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 500,
                              color: "#18181b",
                            }}
                          >
                            {lecturer.fullName}
                          </p>
                          <p
                            style={{
                              margin: "2px 0 0",
                              color: "#71717a",
                              fontSize: "12px",
                            }}
                          >
                            {lecturer.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Staff ID */}
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
                        {lecturer.staffId}
                      </span>
                    </td>

                    {/* Department */}
                    <td style={td}>{lecturer.department}</td>

                    {/* Course count */}
                    <td style={td}>
                      <span
                        style={{
                          color: lecturer.courseCount > 0 ? "#4f46e5" : "#71717a",
                          fontWeight: 500,
                        }}
                      >
                        {lecturer.courseCount || 0}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td style={td}>
                      {lecturer.isActive ? (
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
                      <div
                        style={{
                          display: "inline-flex",
                          gap: "6px",
                        }}
                      >
                        <button
                          onClick={() => handleEdit(lecturer)}
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

                        {lecturer.isActive && (
                          <button
                            onClick={() => handleDeleteClick(lecturer)}
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

      {/* ───── Create/Edit Modal ───── */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingLecturer ? "Edit Lecturer" : "Add New Lecturer"}
        subtitle={
          editingLecturer
            ? "Update lecturer details below"
            : "A welcome email with login credentials will be sent automatically"
        }
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Dr John Doe"
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
            placeholder="john.doe@university.edu"
            required
            icon={<HiOutlineMail size={16} />}
            error={formErrors.email}
          />

          <FormInput
            label="Staff ID"
            name="staffId"
            value={formData.staffId}
            onChange={handleInputChange}
            placeholder="STAFF001"
            required={!editingLecturer}
            disabled={!!editingLecturer}
            icon={<HiOutlineIdentification size={16} />}
            error={formErrors.staffId}
            hint={
              editingLecturer
                ? "Staff ID cannot be changed after creation"
                : null
            }
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
            error={formErrors.department}
          />

          {/* Action buttons */}
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
            <Button
              variant="primary"
              type="submit"
              loading={isSubmitting}
            >
              {editingLecturer ? "Save Changes" : "Create Lecturer"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ───── Delete Confirmation ───── */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Deactivate Lecturer?"
        message={
          lecturerToDelete
            ? `${lecturerToDelete.fullName} will lose access to the system. Their data and any course history will be preserved.`
            : ""
        }
        confirmText="Yes, Deactivate"
        cancelText="Cancel"
        variant="danger"
        loading={isSubmitting}
      />
    </div>
  );
};

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

export default LecturersPage;