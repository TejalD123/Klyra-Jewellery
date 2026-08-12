import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import DashboardPage from "../features/Admin/pages/DashBoardPage";
import Categories from "../features/Admin/pages/Categories";
import Products from "../features/Admin/pages/Products";
import Orders from "../features/Admin/pages/Orders";
import Users from "../features/Admin/pages/Users";
import DeliveryAgencies from "../features/Admin/pages/DeliveryAgencies";
import NotificationPage from "../features/notification/page/NotificationPage";
import Queries from "../features/Admin/pages/Queries";
import Banner from "../features/Admin/pages/Banner";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="categories" element={<Categories />} />
        <Route path="products" element={<Products />} />
        <Route path="banners" element={<Banner />} />
        <Route path="orders" element={<Orders />} />
        <Route path="users" element={<Users />} />
        <Route path="delivery" element={<DeliveryAgencies />} />
        <Route path="notifications" element={<NotificationPage />} />
        <Route path="queries" element={<Queries />} />
      </Route>
    </Routes>
  );
}