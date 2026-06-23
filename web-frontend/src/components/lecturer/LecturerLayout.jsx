import LecturerSidebar from "./LecturerSidebar";
import LecturerNavbar from "./LecturerNavbar";

const LecturerLayout = ({ children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fafafa" }}>
      <LecturerSidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: "260px" }}>
        <LecturerNavbar />
        <main style={{ flex: 1, padding: "32px", marginTop: "64px" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default LecturerLayout;