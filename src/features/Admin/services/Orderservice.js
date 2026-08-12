import axiosInstance from "../../../api/apiClient";

const BASE = "/admin/orders";

// GET /api/v1/admin/orders?orderStatus=&paymentStatus=&search=&startDate=&endDate=&page=&limit=
export const fetchAllOrders = (params = {}) => axiosInstance.get(BASE, { params });

// PATCH /api/v1/admin/orders/:id/status   body: { orderStatus, note }
export const updateOrderStatus = (id, orderStatus, note = "") =>
  axiosInstance.patch(`${BASE}/${id}/status`, { orderStatus, note });

// PATCH /api/v1/admin/orders/:id/payment-status   body: { paymentStatus }
export const updatePaymentStatus = (id, paymentStatus) =>
  axiosInstance.patch(`${BASE}/${id}/payment-status`, { paymentStatus });

// PATCH /api/v1/admin/orders/:id/items/:itemId/return-status   body: { itemStatus, note }
export const updateItemReturnStatus = (orderId, itemId, itemStatus, note = "") =>
  axiosInstance.patch(`${BASE}/${orderId}/items/${itemId}/return-status`, { itemStatus, note });

// PATCH /api/v1/admin/orders/:id/assign-delivery   body: { deliveryAgencyId }
export const assignDelivery = (id, deliveryAgencyId) =>
  axiosInstance.patch(`${BASE}/${id}/assign-delivery`, { deliveryAgencyId });