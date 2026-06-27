import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import store from "./redux/store";

// Public
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Admin
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LecturersPage from "./pages/admin/LecturersPage";
import StudentsPage from "./pages/admin/StudentsPage";
import CoursesPage from "./pages/admin/CoursesPage";
import ReportsPage from "./pages/admin/ReportsPage";
import SettingsPage from "./pages/admin/SettingsPage";

// Lecturer
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";
import MyCoursesPage from "./pages/lecturer/MyCoursesPage";
import SessionsPage from "./pages/lecturer/SessionsPage";
import SessionLivePage from "./pages/lecturer/SessionLivePage";
import AttendancePage from "./pages/lecturer/AttendancePage";
import SessionAttendanceDetailPage from "./pages/lecturer/SessionAttendanceDetailPage";

// Common
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#18181b",
              color: "#fff",
              borderRadius: "12px",
              padding: "12px 18px",
              fontSize: "14px",
              fontWeight: 500,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            },
          }}
        />
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* ── Admin ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="lecturers" element={<LecturersPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* ── Lecturer ── */}
          <Route
            path="/lecturer"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <Navigate to="/lecturer/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/courses"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <MyCoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/sessions"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <SessionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/sessions/:id/live"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <SessionLivePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/sessions/:id/attendance"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <SessionAttendanceDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/attendance"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <AttendancePage />
              </ProtectedRoute>
            }
          />

          {/* ── Catch all ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;