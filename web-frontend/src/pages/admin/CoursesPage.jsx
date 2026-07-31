import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineBookOpen,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineFilter,
  HiOutlineCheck,
  HiOutlineRefresh,
} from "react-icons/hi";

import {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  assignLecturerToCourse,
  assignStudentsToCourse,
  fetchStudentsForEnrollment,
  fetchLecturersForAssignment,
  clearEnrollmentStudents,
  clearAssignmentLecturers,
} from "../../redux/slices/courseSlice";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import FormInput from "../../components/common/FormInput";
import FormSelect from "../../components/common/FormSelect";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";

// All departments used across the system
const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Statistics",
  "Engineering",
];

const LEVELS = ["ND1", "ND2", "HND1", "HND2"];

const CoursesPage = () => {
  const dispatch = useDispatch();

  const {
    list: courses,
    enrollmentStudents,
    assignmentLecturers,
    isLoading,
    isSubmitting,
    isLoadingEnrollment,
    isLoadingAssignment,
  } = useSelector((state) => state.courses);

  // Main page filters
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");

  // Modal visibility
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignLecturerModal, setShowAssignLecturerModal] = useState(false);
  const [showAssignStudentsModal, setShowAssignStudentsModal] = useState(false);

  const [editingCourse, setEditingCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const initialFormState = {
    courseCode: "",
    courseTitle: "",
    creditUnits: 3,
    level: "HND1",
    semester: "First",
    department: "Computer Science",
    academicSession: "2024/2025",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  // Assign lecturer modal state
  const [selectedLecturerId, setSelectedLecturerId] = useState("");
  const [lecturerSearchTerm, setLecturerSearchTerm] = useState("");
  const [lecturerDeptFilter, setLecturerDeptFilter] = useState("");

  // Assign students modal state
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [studentLevelFilter, setStudentLevelFilter] = useState("");
  const [studentDeptFilter, setStudentDeptFilter] = useState("");

  // Fetch courses list with debounce on filters
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (levelFilter) params.level = levelFilter;
      if (semesterFilter) params.semester = semesterFilter;
      dispatch(fetchCourses(params));
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, searchTerm, levelFilter, semesterFilter]);

  // ── Fetch filtered lecturers whenever lecturer modal filters change ──
  useEffect(() => {
    if (!showAssignLecturerModal) return;
    const params = {};
    if (lecturerDeptFilter) params.department = lecturerDeptFilter;
    dispatch(fetchLecturersForAssignment(params));
  }, [dispatch, showAssignLecturerModal, lecturerDeptFilter]);

  // ── Fetch filtered students whenever student modal filters change ──
  useEffect(() => {
    if (!showAssignStudentsModal) return;
    const params = {};
    if (studentLevelFilter) params.level = studentLevelFilter;
    if (studentDeptFilter) params.department = studentDeptFilter;
    dispatch(fetchStudentsForEnrollment(params));
  }, [dispatch, showAssignStudentsModal, studentLevelFilter, studentDeptFilter]);

  // ─── CRUD ───────────────────────────────────────
  const handleAddNew = () => {
    setEditingCourse(null);
    setFormData(initialFormState);
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode || "",
      courseTitle: course.courseTitle || "",
      creditUnits: course.creditUnits || 3,
      level: course.level || "HND1",
      semester: course.semester || "First",
      department: course.department || "Computer Science",
      academicSession: course.academicSession || "2024/2025",
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowDeleteDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "creditUnits" ? parseInt(value) || 0 : value,
    }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!editingCourse && !formData.courseCode.trim()) errors.courseCode = "Course code is required";
    if (!formData.courseTitle.trim()) errors.courseTitle = "Course title is required";
    if (!formData.creditUnits || formData.creditUnits < 1) errors.creditUnits = "Credit units must be at least 1";
    if (!formData.academicSession.trim()) errors.academicSession = "Academic session is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (editingCourse) {
        const { courseCode, ...updateData } = formData;
        await dispatch(updateCourse({ id: editingCourse.id, data: updateData })).unwrap();
        toast.success("Course updated successfully");
      } else {
        await dispatch(createCourse(formData)).unwrap();
        toast.success("Course created successfully");
      }
      setShowFormModal(false);
    } catch (error) {
      toast.error(error || "Operation failed", { duration: 4000 });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteCourse(courseToDelete.id)).unwrap();
      toast.success("Course deactivated successfully");
      setShowDeleteDialog(false);
      setCourseToDelete(null);
    } catch (error) {
      toast.error(error || "Failed to deactivate", { duration: 4000 });
    }
  };

  // ─── Assign Lecturer ────────────────────────────
  const handleOpenAssignLecturer = (course) => {
    setSelectedCourse(course);
    setSelectedLecturerId(course.lecturer?.id || "");
    setLecturerSearchTerm("");
    setLecturerDeptFilter("");
    setShowAssignLecturerModal(true);
  };

  const handleCloseAssignLecturer = () => {
    setShowAssignLecturerModal(false);
    dispatch(clearAssignmentLecturers());
  };

  const handleAssignLecturer = async () => {
    if (!selectedLecturerId) {
      toast.error("Please select a lecturer", { duration: 3000 });
      return;
    }
    try {
      await dispatch(
        assignLecturerToCourse({ courseId: selectedCourse.id, lecturerId: selectedLecturerId })
      ).unwrap();
      toast.success("Lecturer assigned successfully");
      handleCloseAssignLecturer();
      dispatch(fetchCourses());
    } catch (error) {
      toast.error(error || "Failed to assign lecturer", { duration: 4000 });
    }
  };

  // ─── Assign Students ────────────────────────────
  const handleOpenAssignStudents = (course) => {
    setSelectedCourse(course);
    setSelectedStudentIds([]);
    setStudentSearchTerm("");
    setStudentLevelFilter("");
    setStudentDeptFilter("");
    setShowAssignStudentsModal(true);
  };

  const handleCloseAssignStudents = () => {
    setShowAssignStudentsModal(false);
    dispatch(clearEnrollmentStudents());
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  // Select all students currently visible after client-side search filter
  const handleSelectAllVisible = () => {
    const visibleIds = clientFilteredStudents.map((s) => s.id);
    const allAlreadySelected = visibleIds.every((id) => selectedStudentIds.includes(id));

    if (allAlreadySelected) {
      // Deselect all visible
      setSelectedStudentIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      // Add all visible that aren't already selected
      setSelectedStudentIds((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const handleAssignStudents = async () => {
    if (selectedStudentIds.length === 0) {
      toast.error("Please select at least one student", { duration: 3000 });
      return;
    }
    try {
      await dispatch(
        assignStudentsToCourse({ courseId: selectedCourse.id, studentIds: selectedStudentIds })
      ).unwrap();
      toast.success(`${selectedStudentIds.length} student(s) enrolled successfully`);
      handleCloseAssignStudents();
      setTimeout(() => {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (levelFilter) params.level = levelFilter;
        if (semesterFilter) params.semester = semesterFilter;
        dispatch(fetchCourses(params));
      }, 100);
    } catch (error) {
      toast.error(error || "Failed to enroll students", { duration: 4000 });
    }
  };

  // Client-side search on top of server-filtered students (name/email/id)
  const clientFilteredStudents = enrollmentStudents.filter((student) => {
    if (!student.isActive) return false;
    if (!studentSearchTerm) return true;
    const query = studentSearchTerm.toLowerCase();
    return (
      student.fullName?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.studentId?.toLowerCase().includes(query)
    );
  });

  // Client-side search on top of server-filtered lecturers
  const clientFilteredLecturers = assignmentLecturers.filter((lecturer) => {
    if (!lecturer.isActive) return false;
    if (!lecturerSearchTerm) return true;
    const query = lecturerSearchTerm.toLowerCase();
    return (
      lecturer.fullName?.toLowerCase().includes(query) ||
      lecturer.staffId?.toLowerCase().includes(query)
    );
  });

  const allVisibleSelected =
    clientFilteredStudents.length > 0 &&
    clientFilteredStudents.every((s) => selectedStudentIds.includes(s.id));

  const activeCount = courses.filter((c) => c.isActive).length;
  const inactiveCount = courses.filter((c) => !c.isActive).length;

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 32px" }}>
      <PageHeader
        breadcrumb="Admin"
        title="Courses"
        description={`${activeCount} active, ${inactiveCount} archived`}
        action={
          <Button variant="primary" icon={<HiOutlinePlus size={16} />} onClick={handleAddNew}>
            Create Course
          </Button>
        }
      />

      {/* Main page search + filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <HiOutlineSearch
            size={18}
            color="#71717a"
            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search by course code or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
            onFocus={(e) => { e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#e4e4e7"; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} style={filterSelectStyle}>
          <option value="">All Levels</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)} style={filterSelectStyle}>
          <option value="">All Semesters</option>
          <option value="First">First Semester</option>
          <option value="Second">Second Semester</option>
        </select>
      </div>

      {/* Courses grid */}
      {isLoading ? (
        <LoadingBox label="Loading courses..." />
      ) : courses.length === 0 ? (
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e4e4e7" }}>
          <EmptyState
            icon={HiOutlineBookOpen}
            title={searchTerm || levelFilter || semesterFilter ? "No courses found" : "No courses yet"}
            description={searchTerm || levelFilter || semesterFilter ? "Try different filters or clear them." : "Create your first course to get started."}
            action={
              !searchTerm && !levelFilter && !semesterFilter && (
                <Button variant="primary" icon={<HiOutlinePlus size={16} />} onClick={handleAddNew}>
                  Create Course
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => handleEdit(course)}
              onDelete={() => handleDeleteClick(course)}
              onAssignLecturer={() => handleOpenAssignLecturer(course)}
              onAssignStudents={() => handleOpenAssignStudents(course)}
            />
          ))}
        </div>
      )}

      {/* ── Create / Edit Course Modal ── */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingCourse ? "Edit Course" : "Create New Course"}
        subtitle={editingCourse ? "Update course details below" : "Add a new course offering to the system"}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <FormInput
              label="Course Code"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleInputChange}
              placeholder="CSC301"
              required={!editingCourse}
              disabled={!!editingCourse}
              error={formErrors.courseCode}
              hint={editingCourse ? "Cannot be changed" : null}
            />
            <FormInput
              label="Credit Units"
              name="creditUnits"
              type="number"
              value={formData.creditUnits}
              onChange={handleInputChange}
              placeholder="3"
              required
              error={formErrors.creditUnits}
            />
          </div>
          <FormInput
            label="Course Title"
            name="courseTitle"
            value={formData.courseTitle}
            onChange={handleInputChange}
            placeholder="Data Structures and Algorithms"
            required
            error={formErrors.courseTitle}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <FormSelect
              label="Level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              options={LEVELS.map((l) => ({ value: l, label: l }))}
              required
            />
            <FormSelect
              label="Semester"
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              options={[
                { value: "First", label: "First Semester" },
                { value: "Second", label: "Second Semester" },
              ]}
              required
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <FormSelect
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
              required
            />
            <FormInput
              label="Academic Session"
              name="academicSession"
              value={formData.academicSession}
              onChange={handleInputChange}
              placeholder="2024/2025"
              required
              error={formErrors.academicSession}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e4e4e7" }}>
            <Button variant="secondary" onClick={() => setShowFormModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting}>
              {editingCourse ? "Save Changes" : "Create Course"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Assign Lecturer Modal ── */}
      <Modal
        isOpen={showAssignLecturerModal}
        onClose={handleCloseAssignLecturer}
        title="Assign Lecturer"
        subtitle={selectedCourse ? `${selectedCourse.courseCode} — ${selectedCourse.courseTitle}` : ""}
        size="md"
      >
        <>
          {/* Department filter + search row */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            <select
              value={lecturerDeptFilter}
              onChange={(e) => setLecturerDeptFilter(e.target.value)}
              style={{ ...filterSelectStyle, flex: 1, minWidth: 0 }}
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <div style={{ position: "relative", flex: 1 }}>
              <HiOutlineSearch
                size={15}
                color="#71717a"
                style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search by name or staff ID..."
                value={lecturerSearchTerm}
                onChange={(e) => setLecturerSearchTerm(e.target.value)}
                style={{ ...modalSearchStyle, paddingLeft: "34px" }}
              />
            </div>
          </div>

          {/* Result count + current assignment info */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", color: "#71717a" }}>
              {isLoadingAssignment ? "Loading..." : `${clientFilteredLecturers.length} lecturer(s) found`}
            </span>
            {selectedCourse?.lecturer && (
              <span style={{ fontSize: "12px", color: "#71717a" }}>
                Currently: <strong style={{ color: "#18181b" }}>{selectedCourse.lecturer.fullName}</strong>
              </span>
            )}
          </div>

          {/* Lecturer list */}
          <div style={{ maxHeight: "340px", overflowY: "auto", border: "1px solid #e4e4e7", borderRadius: "10px", padding: "4px" }}>
            {isLoadingAssignment ? (
              <LoadingBox label="Loading lecturers..." small />
            ) : clientFilteredLecturers.length === 0 ? (
              <p style={{ padding: "40px 20px", textAlign: "center", color: "#71717a", fontSize: "13px" }}>
                No lecturers match your filters.
              </p>
            ) : (
              clientFilteredLecturers.map((lecturer) => (
                <LecturerRow
                  key={lecturer.id}
                  lecturer={lecturer}
                  isSelected={selectedLecturerId === lecturer.id}
                  onClick={() => setSelectedLecturerId(lecturer.id)}
                />
              ))
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e4e4e7" }}>
            <Button variant="secondary" onClick={handleCloseAssignLecturer}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAssignLecturer} loading={isSubmitting} disabled={!selectedLecturerId}>
              Assign Lecturer
            </Button>
          </div>
        </>
      </Modal>

      {/* ── Enroll Students Modal ── */}
      <Modal
        isOpen={showAssignStudentsModal}
        onClose={handleCloseAssignStudents}
        title="Enroll Students"
        subtitle={selectedCourse ? `${selectedCourse.courseCode} — ${selectedCourse.courseTitle}` : ""}
        size="lg"
      >
        <>
          {/* Filter row: Level + Department */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
            <select
              value={studentLevelFilter}
              onChange={(e) => { setStudentLevelFilter(e.target.value); setSelectedStudentIds([]); }}
              style={{ ...filterSelectStyle, flex: 1, minWidth: "130px" }}
            >
              <option value="">All Levels</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>

            <select
              value={studentDeptFilter}
              onChange={(e) => { setStudentDeptFilter(e.target.value); setSelectedStudentIds([]); }}
              style={{ ...filterSelectStyle, flex: 1, minWidth: "160px" }}
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <div style={{ position: "relative", flex: 2, minWidth: "200px" }}>
              <HiOutlineSearch
                size={15}
                color="#71717a"
                style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search by name, ID or email..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                style={{ ...modalSearchStyle, paddingLeft: "34px" }}
              />
            </div>
          </div>

          {/* Selection summary bar */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 14px",
            background: selectedStudentIds.length > 0 ? "rgba(79,70,229,0.08)" : "#fafafa",
            borderRadius: "10px",
            marginBottom: "10px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Select all checkbox */}
              <div
                onClick={clientFilteredStudents.length > 0 ? handleSelectAllVisible : undefined}
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "5px",
                  border: `2px solid ${allVisibleSelected ? "#4f46e5" : "#d4d4d8"}`,
                  background: allVisibleSelected ? "#4f46e5" : "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: clientFilteredStudents.length > 0 ? "pointer" : "not-allowed",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
              >
                {allVisibleSelected && <HiOutlineCheck size={12} color="white" />}
              </div>

              <span style={{ fontSize: "13px", color: selectedStudentIds.length > 0 ? "#4f46e5" : "#71717a", fontWeight: 500 }}>
                {selectedStudentIds.length > 0
                  ? `${selectedStudentIds.length} selected`
                  : isLoadingEnrollment
                  ? "Loading..."
                  : `${clientFilteredStudents.length} student(s) shown`}
              </span>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {clientFilteredStudents.length > 0 && (
                <button
                  onClick={handleSelectAllVisible}
                  style={ghostBtnStyle}
                >
                  {allVisibleSelected ? "Deselect all shown" : `Select all ${clientFilteredStudents.length} shown`}
                </button>
              )}
              {selectedStudentIds.length > 0 && (
                <button onClick={() => setSelectedStudentIds([])} style={{ ...ghostBtnStyle, color: "#f43f5e" }}>
                  Clear selection
                </button>
              )}
            </div>
          </div>

          {/* Student list */}
          <div style={{ maxHeight: "360px", overflowY: "auto", border: "1px solid #e4e4e7", borderRadius: "10px", padding: "4px" }}>
            {isLoadingEnrollment ? (
              <LoadingBox label="Loading students..." small />
            ) : clientFilteredStudents.length === 0 ? (
              <p style={{ padding: "40px 20px", textAlign: "center", color: "#71717a", fontSize: "13px" }}>
                {studentLevelFilter || studentDeptFilter || studentSearchTerm
                  ? "No students match your filters."
                  : "No active students found."}
              </p>
            ) : (
              clientFilteredStudents.map((student) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  isSelected={selectedStudentIds.includes(student.id)}
                  onClick={() => toggleStudentSelection(student.id)}
                />
              ))
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e4e4e7" }}>
            <Button variant="secondary" onClick={handleCloseAssignStudents}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssignStudents}
              loading={isSubmitting}
              disabled={selectedStudentIds.length === 0}
            >
              Enroll {selectedStudentIds.length || ""} Student{selectedStudentIds.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </>
      </Modal>

      {/* ── Delete Confirmation ── */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Archive Course?"
        message={
          courseToDelete
            ? `${courseToDelete.courseCode} - ${courseToDelete.courseTitle} will be marked as inactive. All history preserved.`
            : ""
        }
        confirmText="Yes, Archive"
        cancelText="Cancel"
        variant="danger"
        loading={isSubmitting}
      />
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const LecturerRow = ({ lecturer, isSelected, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: "12px 14px",
      borderRadius: "8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      background: isSelected ? "rgba(79,70,229,0.08)" : "transparent",
      transition: "all 0.15s",
      marginBottom: "2px",
    }}
    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#fafafa"; }}
    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
  >
    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #4f46e5, #3730a3)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 600, flexShrink: 0 }}>
      {lecturer.fullName?.charAt(0).toUpperCase()}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#18181b" }}>{lecturer.fullName}</p>
      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#71717a" }}>
        {lecturer.staffId} • {lecturer.department}
      </p>
    </div>
    {isSelected && (
      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#4f46e5", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <HiOutlineCheck size={14} />
      </div>
    )}
  </div>
);

const StudentRow = ({ student, isSelected, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: "10px 14px",
      borderRadius: "8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      background: isSelected ? "rgba(79,70,229,0.08)" : "transparent",
      transition: "all 0.15s",
      marginBottom: "2px",
    }}
    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#fafafa"; }}
    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
  >
    {/* Checkbox */}
    <div style={{ width: "18px", height: "18px", borderRadius: "5px", border: `2px solid ${isSelected ? "#4f46e5" : "#d4d4d8"}`, background: isSelected ? "#4f46e5" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
      {isSelected && <HiOutlineCheck size={12} color="white" />}
    </div>
    {/* Avatar */}
    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #10b981, #059669)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, flexShrink: 0 }}>
      {student.fullName?.charAt(0).toUpperCase()}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#18181b" }}>{student.fullName}</p>
      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#71717a" }}>
        {student.studentId} • {student.level} • {student.department}
      </p>
    </div>
  </div>
);

const LoadingBox = ({ label, small }) => (
  <div style={{ padding: small ? "32px" : "60px", textAlign: "center", background: "white", borderRadius: "16px", border: small ? "none" : "1px solid #e4e4e7" }}>
    <div style={{ display: "inline-block", width: "28px", height: "28px", border: "3px solid #e4e4e7", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
    <p style={{ fontSize: "13px", color: "#71717a", marginTop: "12px" }}>{label}</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const CourseCard = ({ course, onEdit, onDelete, onAssignLecturer, onAssignStudents }) => (
  <div
    style={{ background: "white", borderRadius: "16px", border: `1px solid ${course.isActive ? "#e4e4e7" : "#f4f4f5"}`, padding: "20px", opacity: course.isActive ? 1 : 0.6, transition: "all 0.2s", display: "flex", flexDirection: "column" }}
    onMouseEnter={(e) => { if (course.isActive) { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.04)"; } }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e4e4e7"; e.currentTarget.style.boxShadow = "none"; }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: 600, color: "#4f46e5", background: "rgba(79,70,229,0.08)", padding: "3px 8px", borderRadius: "6px" }}>
            {course.courseCode}
          </span>
          <span style={{ fontSize: "11px", color: "#71717a" }}>{course.creditUnits} units</span>
        </div>
        <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#18181b", margin: "0 0 6px", lineHeight: 1.3 }}>{course.courseTitle}</h3>
        <p style={{ fontSize: "12px", color: "#71717a", margin: 0 }}>
          {course.level} • {course.semester} Semester • {course.academicSession}
        </p>
      </div>
      {course.isActive ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", background: "rgba(16,185,129,0.1)", color: "#10b981", borderRadius: "6px", fontSize: "11px", fontWeight: 500, flexShrink: 0 }}>
          <HiOutlineCheckCircle size={12} /> Active
        </span>
      ) : (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", background: "rgba(113,113,122,0.1)", color: "#71717a", borderRadius: "6px", fontSize: "11px", fontWeight: 500, flexShrink: 0 }}>
          <HiOutlineXCircle size={12} /> Archived
        </span>
      )}
    </div>

    {/* Lecturer row */}
    <div
      onClick={course.isActive ? onAssignLecturer : undefined}
      style={{ padding: "10px 12px", background: "#fafafa", borderRadius: "10px", marginBottom: "8px", cursor: course.isActive ? "pointer" : "default", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "10px" }}
      onMouseEnter={(e) => { if (course.isActive) e.currentTarget.style.background = "rgba(79,70,229,0.08)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "#fafafa"; }}
    >
      <HiOutlineAcademicCap size={16} color="#4f46e5" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: "11px", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.03em", fontWeight: 500 }}>Lecturer</p>
        <p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 500, color: course.lecturer ? "#18181b" : "#71717a" }}>
          {course.lecturer?.fullName || "No lecturer assigned"}
        </p>
      </div>
      {course.isActive && <span style={{ fontSize: "11px", color: "#4f46e5", fontWeight: 500 }}>{course.lecturer ? "Change" : "Assign"}</span>}
    </div>

    {/* Students row */}
    <div
      onClick={course.isActive ? onAssignStudents : undefined}
      style={{ padding: "10px 12px", background: "#fafafa", borderRadius: "10px", marginBottom: "16px", cursor: course.isActive ? "pointer" : "default", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "10px" }}
      onMouseEnter={(e) => { if (course.isActive) e.currentTarget.style.background = "rgba(16,185,129,0.08)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "#fafafa"; }}
    >
      <HiOutlineUsers size={16} color="#10b981" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: "11px", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.03em", fontWeight: 500 }}>Enrolled Students</p>
        <p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 500, color: course.studentCount > 0 ? "#18181b" : "#71717a" }}>
          {course.studentCount || 0} student{course.studentCount !== 1 ? "s" : ""}
        </p>
      </div>
      {course.isActive && <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 500 }}>Enroll</span>}
    </div>

    {/* Action buttons */}
    <div style={{ display: "flex", gap: "6px", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #f4f4f5" }}>
      <button
        onClick={onEdit}
        style={cardActionBtnStyle}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.color = "#4f46e5"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e4e4e7"; e.currentTarget.style.color = "#71717a"; }}
      >
        <HiOutlinePencil size={13} /> Edit
      </button>
      {course.isActive && (
        <button
          onClick={onDelete}
          style={cardActionBtnStyle}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#f43f5e"; e.currentTarget.style.color = "#f43f5e"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e4e4e7"; e.currentTarget.style.color = "#71717a"; }}
        >
          <HiOutlineTrash size={13} /> Archive
        </button>
      )}
    </div>
  </div>
);

// ─── Styles ──────────────────────────────────────────────────────────────────

const searchInputStyle = {
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
};

const filterSelectStyle = {
  padding: "11px 36px 11px 14px",
  fontSize: "14px",
  color: "#18181b",
  background: "white",
  border: "1px solid #e4e4e7",
  borderRadius: "10px",
  outline: "none",
  fontFamily: "inherit",
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2371717a' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  minWidth: "150px",
};

const modalSearchStyle = {
  width: "100%",
  padding: "9px 12px",
  fontSize: "13px",
  border: "1px solid #e4e4e7",
  borderRadius: "8px",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  color: "#18181b",
};

const ghostBtnStyle = {
  background: "none",
  border: "none",
  color: "#4f46e5",
  fontSize: "12px",
  cursor: "pointer",
  fontFamily: "inherit",
  fontWeight: 500,
  padding: 0,
};

const cardActionBtnStyle = {
  flex: 1,
  padding: "8px",
  fontSize: "12px",
  color: "#71717a",
  background: "white",
  border: "1px solid #e4e4e7",
  borderRadius: "8px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  fontFamily: "inherit",
  fontWeight: 500,
  transition: "all 0.2s",
};

export default CoursesPage;