import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { HiOutlineBookOpen, HiOutlineUsers, HiOutlineLightningBolt } from "react-icons/hi";
import LecturerLayout from "../../components/lecturer/LecturerLayout";
import { fetchMyCourses } from "../../redux/slices/lecturerSessionSlice";
import CreateSessionModal from "../../components/lecturer/CreateSessionModal";

const colors = {
  primary: "#4f46e5",
  text: "#18181b",
  textMuted: "#71717a",
  border: "#e4e4e7",
};

const MyCoursesPage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { courses, loading } = useSelector((state) => state.lecturerSession);

  const [modalOpen, setModalOpen]       = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    dispatch(fetchMyCourses());
  }, [dispatch]);

  const openCreateSession = (course) => {
    setSelectedCourse(course);
    setModalOpen(true);
  };

  const handleSessionCreated = (session) => {
    setModalOpen(false);
    // Go directly to the QR display page
    navigate(`/lecturer/sessions/${session._id}/live`);
  };

  return (
    <LecturerLayout>
      <div style={{ maxWidth: "1100px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: colors.text, letterSpacing: "-0.02em", margin: 0 }}>
            My Courses
          </h1>
          <p style={{ color: colors.textMuted, marginTop: "6px", fontSize: "14px" }}>
            {courses.length} course{courses.length !== 1 ? "s" : ""} assigned to you
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "64px", color: colors.textMuted }}>
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: `1px solid ${colors.border}`,
              borderRadius: "12px",
              padding: "64px",
              textAlign: "center",
              color: colors.textMuted,
              fontSize: "14px",
            }}
          >
            No courses assigned yet. Contact your admin.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {courses.map((course) => (
              <div
                key={course._id}
                style={{
                  background: "#fff",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "12px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Course Icon + Code */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "#ede9fe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: colors.primary,
                    }}
                  >
                    <HiOutlineBookOpen size={20} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", fontWeight: 700, color: colors.primary }}>
                      {course.courseCode}
                    </div>
                    <div style={{ fontSize: "12px", color: colors.textMuted }}>
                      {course.level} · {course.semester} Semester
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div style={{ fontSize: "15px", fontWeight: 600, color: colors.text, lineHeight: 1.4 }}>
                  {course.courseTitle}
                </div>

                {/* Student Count */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.textMuted, fontSize: "13px" }}>
                  <HiOutlineUsers size={15} />
                  {course.studentCount ?? course.students?.length ?? 0} students enrolled
                </div>

                {/* Start Session Button */}
                <button
                  onClick={() => openCreateSession(course)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px",
                    background: colors.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: "auto",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <HiOutlineLightningBolt size={15} />
                  Start Attendance Session
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {modalOpen && (
        <CreateSessionModal
          course={selectedCourse}
          onClose={() => setModalOpen(false)}
          onCreated={handleSessionCreated}
        />
      )}
    </LecturerLayout>
  );
};

export default MyCoursesPage;