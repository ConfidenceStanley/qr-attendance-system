import { useEffect, useState } from "react";
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
  HiOutlineEye,
  HiOutlineFilter,
  HiOutlineCheck,
} from "react-icons/hi";

// Redux
import {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  assignLecturerToCourse,
  assignStudentsToCourse,
} from "../../redux/slices/courseSlice";
import { fetchLecturers } from "../../redux/slices/lecturerSlice";
import { fetchStudents } from "../../redux/slices/studentSlice";

// Reusable Components
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import FormInput from "../../components/common/FormInput";
import FormSelect from "../../components/common/FormSelect";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";

const CoursesPage = () => {
  const dispatch = useDispatch();

  // Redux state
  const {
    list: courses,
    isLoading,
    isSubmitting,
  } = useSelector((state) => state.courses);
  const { list: lecturers } = useSelector((state) => state.lecturers);
  const { list: students } = useSelector((state) => state.students);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignLecturerModal, setShowAssignLecturerModal] =
    useState(false);
  const [showAssignStudentsModal, setShowAssignStudentsModal] =
    useState(false);

  // Editing/selected items
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Form data
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

  // Assignment state
  const [selectedLecturerId, setSelectedLecturerId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  // ─────────────────────────────────────────────
  // Fetch data on mount and when filters change
  // ─────────────────────────────────────────────
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

  // Fetch lecturers and students once - needed for assignments
  useEffect(() => {
    dispatch(fetchLecturers());
    dispatch(fetchStudents());
  }, [dispatch]);

  // ─────────────────────────────────────────────
  // CRUD Handlers
  // ─────────────────────────────────────────────
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
    setFormData({
      ...formData,
      [name]: name === "creditUnits" ? parseInt(value) || 0 : value,
    });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!editingCourse && !formData.courseCode.trim()) {
      errors.courseCode = "Course code is required";
    }

    if (!formData.courseTitle.trim()) {
      errors.courseTitle = "Course title is required";
    }

    if (!formData.creditUnits || formData.creditUnits < 1) {
      errors.creditUnits = "Credit units must be at least 1";
    }

    if (!formData.academicSession.trim()) {
      errors.academicSession = "Academic session is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingCourse) {
        const { courseCode, ...updateData } = formData;
        await dispatch(
          updateCourse({ id: editingCourse.id, data: updateData })
        ).unwrap();
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

  // ─────────────────────────────────────────────
  // Assign Lecturer Handlers
  // ─────────────────────────────────────────────
  const handleOpenAssignLecturer = (course) => {
    setSelectedCourse(course);
    // Pre-select if course already has lecturer
    setSelectedLecturerId(course.lecturer?.id || "");
    setShowAssignLecturerModal(true);
  };

  const handleAssignLecturer = async () => {
    if (!selectedLecturerId) {
      toast.error("Please select a lecturer", { duration: 3000 });
      return;
    }

    try {
      await dispatch(
        assignLecturerToCourse({
          courseId: selectedCourse.id,
          lecturerId: selectedLecturerId,
        })
      ).unwrap();

      toast.success("Lecturer assigned successfully");
      setShowAssignLecturerModal(false);

      // Refetch courses to get updated lecturer info
      dispatch(fetchCourses());
    } catch (error) {
      toast.error(error || "Failed to assign lecturer", {
        duration: 4000,
      });
    }
  };

  // ─────────────────────────────────────────────
  // Assign Students Handlers
  // ─────────────────────────────────────────────
  const handleOpenAssignStudents = (course) => {
    setSelectedCourse(course);
    setSelectedStudentIds([]);
    setStudentSearchTerm("");
    setShowAssignStudentsModal(true);
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

const handleAssignStudents = async () => {
  if (selectedStudentIds.length === 0) {
    toast.error("Please select at least one student", {
      duration: 3000,
    });
    return;
  }

  try {
    await dispatch(
      assignStudentsToCourse({
        courseId: selectedCourse.id,
        studentIds: selectedStudentIds,
      })
    ).unwrap();

    toast.success(
      `${selectedStudentIds.length} student(s) assigned successfully`
    );
    setShowAssignStudentsModal(false);

    setTimeout(() => {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (levelFilter) params.level = levelFilter;
      if (semesterFilter) params.semester = semesterFilter;
      dispatch(fetchCourses(params));
      
      // Also refetch students to update their course count
      dispatch(fetchStudents());
    }, 100);
  } catch (error) {
    toast.error(error || "Failed to assign students", {
      duration: 4000,
    });
  }
};  

  // Filter students for the assignment modal
  // Only show active students matching search
  const filteredStudents = students.filter((student) => {
    if (!student.isActive) return false;
    if (!studentSearchTerm) return true;

    const query = studentSearchTerm.toLowerCase();
    return (
      student.fullName?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.studentId?.toLowerCase().includes(query)
    );
  });

  const activeCount = courses.filter((c) => c.isActive).length;
  const inactiveCount = courses.filter((c) => !c.isActive).length;
  const activeLecturers = lecturers.filter((l) => l.isActive);

  return (
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "40px 32px",
      }}
    >
      {/* Header */}
      <PageHeader
        breadcrumb="Admin"
        title="Courses"
        description={`${activeCount} active, ${inactiveCount} archived`}
        action={
          <Button
            variant="primary"
            icon={<HiOutlinePlus size={16} />}
            onClick={handleAddNew}
          >
            Create Course
          </Button>
        }
      />

      {/* Search + Filters */}
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
            placeholder="Search by course code or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInput}
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

        {/* Level filter */}
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          style={filterSelect}
        >
          <option value="">All Levels</option>
          <option value="ND1">ND1</option>
          <option value="ND2">ND2</option>
          <option value="HND1">HND1</option>
          <option value="HND2">HND2</option>
        </select>

        {/* Semester filter */}
        <select
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          style={filterSelect}
        >
          <option value="">All Semesters</option>
          <option value="First">First Semester</option>
          <option value="Second">Second Semester</option>
        </select>
      </div>

      {/* Courses Grid (cards layout instead of table) */}
      {isLoading ? (
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #e4e4e7",
            padding: "60px",
            textAlign: "center",
          }}
        >
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
            Loading courses...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : courses.length === 0 ? (
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #e4e4e7",
          }}
        >
          <EmptyState
            icon={HiOutlineBookOpen}
            title={
              searchTerm || levelFilter || semesterFilter
                ? "No courses found"
                : "No courses yet"
            }
            description={
              searchTerm || levelFilter || semesterFilter
                ? "Try different filters or clear them."
                : "Create your first course to get started."
            }
            action={
              !searchTerm &&
              !levelFilter &&
              !semesterFilter && (
                <Button
                  variant="primary"
                  icon={<HiOutlinePlus size={16} />}
                  onClick={handleAddNew}
                >
                  Create Course
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "16px",
          }}
        >
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

      {/* ───── Create/Edit Course Modal ───── */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingCourse ? "Edit Course" : "Create New Course"}
        subtitle={
          editingCourse
            ? "Update course details below"
            : "Add a new course offering to the system"
        }
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <FormSelect
              label="Level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              options={[
                { value: "ND1", label: "ND1" },
                { value: "ND2", label: "ND2" },
                { value: "HND1", label: "HND1" },
                { value: "HND2", label: "HND2" },
              ]}
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
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

          {/* Actions */}
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
              {editingCourse ? "Save Changes" : "Create Course"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ───── Assign Lecturer Modal ───── */}
      <Modal
        isOpen={showAssignLecturerModal}
        onClose={() => setShowAssignLecturerModal(false)}
        title="Assign Lecturer"
        subtitle={
          selectedCourse
            ? `${selectedCourse.courseCode} - ${selectedCourse.courseTitle}`
            : ""
        }
        size="md"
      >
        {activeLecturers.length === 0 ? (
          <EmptyState
            icon={HiOutlineUserGroup}
            title="No lecturers available"
            description="You need to add active lecturers before you can assign them to courses."
          />
        ) : (
          <>
            <p
              style={{
                fontSize: "13px",
                color: "#71717a",
                marginBottom: "16px",
              }}
            >
              Select one lecturer to teach this course.
              {selectedCourse?.lecturer && (
                <span style={{ display: "block", marginTop: "4px" }}>
                  Currently assigned:{" "}
                  <strong style={{ color: "#18181b" }}>
                    {selectedCourse.lecturer.fullName}
                  </strong>
                </span>
              )}
            </p>

            {/* Lecturer list */}
            <div
              style={{
                maxHeight: "320px",
                overflowY: "auto",
                border: "1px solid #e4e4e7",
                borderRadius: "10px",
                padding: "4px",
              }}
            >
              {activeLecturers.map((lecturer) => (
                <div
                  key={lecturer.id}
                  onClick={() => setSelectedLecturerId(lecturer.id)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background:
                      selectedLecturerId === lecturer.id
                        ? "rgba(79,70,229,0.08)"
                        : "transparent",
                    transition: "all 0.15s",
                    marginBottom: "2px",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedLecturerId !== lecturer.id) {
                      e.currentTarget.style.background = "#fafafa";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedLecturerId !== lecturer.id) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {/* Avatar */}
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
                      fontSize: "13px",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {lecturer.fullName?.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#18181b",
                      }}
                    >
                      {lecturer.fullName}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: "12px",
                        color: "#71717a",
                      }}
                    >
                      {lecturer.staffId} • {lecturer.department}
                    </p>
                  </div>

                  {/* Selected indicator */}
                  {selectedLecturerId === lecturer.id && (
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "#4f46e5",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <HiOutlineCheck size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
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
                onClick={() => setShowAssignLecturerModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAssignLecturer}
                loading={isSubmitting}
                disabled={!selectedLecturerId}
              >
                Assign Lecturer
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* ───── Assign Students Modal ───── */}
      <Modal
        isOpen={showAssignStudentsModal}
        onClose={() => setShowAssignStudentsModal(false)}
        title="Enroll Students"
        subtitle={
          selectedCourse
            ? `${selectedCourse.courseCode} - ${selectedCourse.courseTitle}`
            : ""
        }
        size="lg"
      >
        {students.filter((s) => s.isActive).length === 0 ? (
          <EmptyState
            icon={HiOutlineUsers}
            title="No students available"
            description="You need to add active students before enrolling them in courses."
          />
        ) : (
          <>
            {/* Summary bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 14px",
                background:
                  selectedStudentIds.length > 0
                    ? "rgba(79,70,229,0.08)"
                    : "#fafafa",
                borderRadius: "10px",
                marginBottom: "12px",
                fontSize: "13px",
              }}
            >
              <span
                style={{
                  color:
                    selectedStudentIds.length > 0 ? "#4f46e5" : "#71717a",
                  fontWeight: 500,
                }}
              >
                {selectedStudentIds.length} student
                {selectedStudentIds.length !== 1 ? "s" : ""} selected
              </span>
              {selectedStudentIds.length > 0 && (
                <button
                  onClick={() => setSelectedStudentIds([])}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#4f46e5",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: 500,
                  }}
                >
                  Clear selection
                </button>
              )}
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: "12px" }}>
              <HiOutlineSearch
                size={16}
                color="#71717a"
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                placeholder="Search students..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 38px",
                  fontSize: "13px",
                  border: "1px solid #e4e4e7",
                  borderRadius: "10px",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Students list */}
            <div
              style={{
                maxHeight: "360px",
                overflowY: "auto",
                border: "1px solid #e4e4e7",
                borderRadius: "10px",
                padding: "4px",
              }}
            >
              {filteredStudents.length === 0 ? (
                <p
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: "#71717a",
                    fontSize: "13px",
                  }}
                >
                  No students match your search.
                </p>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleStudentSelection(student.id)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        background: isSelected
                          ? "rgba(79,70,229,0.08)"
                          : "transparent",
                        transition: "all 0.15s",
                        marginBottom: "2px",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "#fafafa";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      {/* Checkbox */}
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "5px",
                          border: `2px solid ${
                            isSelected ? "#4f46e5" : "#d4d4d8"
                          }`,
                          background: isSelected ? "#4f46e5" : "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.15s",
                        }}
                      >
                        {isSelected && (
                          <HiOutlineCheck size={12} color="white" />
                        )}
                      </div>

                      {/* Avatar */}
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background:
                            "linear-gradient(135deg, #10b981, #059669)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {student.fullName?.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "#18181b",
                          }}
                        >
                          {student.fullName}
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: "11px",
                            color: "#71717a",
                          }}
                        >
                          {student.studentId} • {student.level}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Actions */}
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
                onClick={() => setShowAssignStudentsModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAssignStudents}
                loading={isSubmitting}
                disabled={selectedStudentIds.length === 0}
              >
                Enroll {selectedStudentIds.length || ""} Student
                {selectedStudentIds.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* ───── Delete Confirmation ───── */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Archive Course?"
        message={
          courseToDelete
            ? `${courseToDelete.courseCode} - ${courseToDelete.courseTitle} will be marked as inactive. Enrollment and attendance history will be preserved.`
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

// ─────────────────────────────────────────────
// Course Card Component
// ─────────────────────────────────────────────
const CourseCard = ({
  course,
  onEdit,
  onDelete,
  onAssignLecturer,
  onAssignStudents,
}) => {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        border: `1px solid ${course.isActive ? "#e4e4e7" : "#f4f4f5"}`,
        padding: "20px",
        opacity: course.isActive ? 1 : 0.6,
        transition: "all 0.2s",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        if (course.isActive) {
          e.currentTarget.style.borderColor = "#4f46e5";
          e.currentTarget.style.boxShadow =
            "0 8px 24px rgba(0,0,0,0.04)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e4e4e7";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "12px",
                fontWeight: 600,
                color: "#4f46e5",
                background: "rgba(79,70,229,0.08)",
                padding: "3px 8px",
                borderRadius: "6px",
              }}
            >
              {course.courseCode}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "#71717a",
              }}
            >
              {course.creditUnits} units
            </span>
          </div>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#18181b",
              margin: "0 0 6px",
              lineHeight: 1.3,
            }}
          >
            {course.courseTitle}
          </h3>
          <p
            style={{
              fontSize: "12px",
              color: "#71717a",
              margin: 0,
            }}
          >
            {course.level} • {course.semester} Semester •{" "}
            {course.academicSession}
          </p>
        </div>

        {/* Status badge */}
        {course.isActive ? (
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
              flexShrink: 0,
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
              flexShrink: 0,
            }}
          >
            <HiOutlineXCircle size={12} />
            Archived
          </span>
        )}
      </div>

      {/* Lecturer info */}
      <div
        onClick={course.isActive ? onAssignLecturer : undefined}
        style={{
          padding: "10px 12px",
          background: "#fafafa",
          borderRadius: "10px",
          marginBottom: "8px",
          cursor: course.isActive ? "pointer" : "default",
          transition: "all 0.15s",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
        onMouseEnter={(e) => {
          if (course.isActive) {
            e.currentTarget.style.background = "rgba(79,70,229,0.08)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#fafafa";
        }}
      >
        <HiOutlineAcademicCap size={16} color="#4f46e5" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              color: "#71717a",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              fontWeight: 500,
            }}
          >
            Lecturer
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "13px",
              fontWeight: 500,
              color: course.lecturer ? "#18181b" : "#71717a",
            }}
          >
            {course.lecturer?.fullName || "No lecturer assigned"}
          </p>
        </div>
        {course.isActive && (
          <span
            style={{
              fontSize: "11px",
              color: "#4f46e5",
              fontWeight: 500,
            }}
          >
            {course.lecturer ? "Change" : "Assign"}
          </span>
        )}
      </div>

      {/* Students info */}
      <div
        onClick={course.isActive ? onAssignStudents : undefined}
        style={{
          padding: "10px 12px",
          background: "#fafafa",
          borderRadius: "10px",
          marginBottom: "16px",
          cursor: course.isActive ? "pointer" : "default",
          transition: "all 0.15s",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
        onMouseEnter={(e) => {
          if (course.isActive) {
            e.currentTarget.style.background = "rgba(16,185,129,0.08)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#fafafa";
        }}
      >
        <HiOutlineUsers size={16} color="#10b981" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              color: "#71717a",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              fontWeight: 500,
            }}
          >
            Enrolled Students
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "13px",
              fontWeight: 500,
              color: course.studentCount > 0 ? "#18181b" : "#71717a",
            }}
          >
            {course.studentCount || 0} student
            {course.studentCount !== 1 ? "s" : ""}
          </p>
        </div>
        {course.isActive && (
          <span
            style={{
              fontSize: "11px",
              color: "#10b981",
              fontWeight: 500,
            }}
          >
            Enroll
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginTop: "auto",
          paddingTop: "12px",
          borderTop: "1px solid #f4f4f5",
        }}
      >
        <button
          onClick={onEdit}
          style={cardActionBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#4f46e5";
            e.currentTarget.style.color = "#4f46e5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e4e4e7";
            e.currentTarget.style.color = "#71717a";
          }}
        >
          <HiOutlinePencil size={13} />
          Edit
        </button>

        {course.isActive && (
          <button
            onClick={onDelete}
            style={cardActionBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#f43f5e";
              e.currentTarget.style.color = "#f43f5e";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e4e4e7";
              e.currentTarget.style.color = "#71717a";
            }}
          >
            <HiOutlineTrash size={13} />
            Archive
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────
const searchInput = {
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

const filterSelect = {
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

const cardActionBtn = {
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