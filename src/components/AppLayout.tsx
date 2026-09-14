import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: "#FAF9F6" }}>
      {/* Sidebar occupies a fixed-width column; always visible */}
      <div style={{ width: "240px", flexShrink: 0 }}>
        <Sidebar isOpen={true} />
      </div>

      <main style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
