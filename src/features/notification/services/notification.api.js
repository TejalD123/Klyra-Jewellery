import axiosInstance from "../../../api/apiClient";

// GET /api/v1/notifications?type=&isRead=&page=&limit=
// returns { notifications, pagination: { total, page, limit, totalPages } }
export const fetchNotifications = (params = {}) =>
  axiosInstance.get("/notifications", { params });

// GET /api/v1/notifications/unread-count -> { count }
export const fetchUnreadCount = () => axiosInstance.get("/notifications/unread-count");

// PATCH /api/v1/notifications/:id/read
export const markNotificationAsRead = (id) => axiosInstance.patch(`/notifications/${id}/read`);

// PATCH /api/v1/notifications/read-all
export const markAllNotificationsAsRead = () => axiosInstance.patch("/notifications/read-all");

// DELETE /api/v1/notifications/:id
export const deleteNotificationById = (id) => axiosInstance.delete(`/notifications/${id}`);