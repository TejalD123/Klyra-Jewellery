import axiosInstance from "../../../api/apiClient";

// GET /api/v1/admin/dashboard -> getDashboardStats
// returns { totalUsers, totalCategories, totalProducts, totalOrders,
//   ordersByStatus, totalRevenue, recentOrders, lowStockProducts }
export const fetchDashboardStats = () => axiosInstance.get("/admin/dashboard");