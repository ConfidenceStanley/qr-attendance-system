import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const AdminLayout = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fafafa",
      }}
    >
      {/* Sidebar - fixed on left */}
      <AdminSidebar />

      {/* Main content area - shifted to right by sidebar width */}
      <div
        style={{
          marginLeft: "260px", // matches sidebar width
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top navbar */}
        <AdminNavbar />

        {/* Page content - changes based on route */}
        {/* <Outlet /> renders the matched child route component */}
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;