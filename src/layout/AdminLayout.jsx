import { Outlet } from "react-router-dom";
import Sidebar from "../features/Admin/components/SideBar";
import AdminMobileNav from "../features/Admin/components/AdminMobileNav";
import "./styles/admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <Sidebar />
      <main className="admin-main">
        <div className="admin-main__inner">
          <Outlet />
        </div>
      </main>
      <AdminMobileNav />
    </div>
  );
}