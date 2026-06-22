import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import store from "./redux/store";

// Public pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Admin pages
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LecturersPage from "./pages/admin/LecturersPage";
import StudentsPage from "./pages/admin/StudentsPage";
import CoursesPage from "./pages/admin/CoursesPage";

// Lecturer
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";

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
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Admin routes - all wrapped by AdminLayout */}
          {/* AdminLayout provides sidebar + navbar for every admin page */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* These render inside AdminLayout's <Outlet /> */}
            <Route
              index
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="lecturers" element={<LecturersPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="courses" element={<CoursesPage />} />
          </Route>

          {/* Lecturer routes */}
          <Route
            path="/lecturer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;