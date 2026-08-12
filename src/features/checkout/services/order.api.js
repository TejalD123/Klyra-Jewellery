import axiosInstance from "../../../api/apiClient";

const BASE = "/orders";

// Every method resolves directly to `res.data.data` (already unwrapped) —
// callers don't need to reach into `.data.data` themselves.
export const orderAPI = {
  // POST /api/v1/orders
  create: (payload) => axiosInstance.post(BASE, payload).then((res) => res.data.data),

  // GET /api/v1/orders/my?orderStatus=&page=&limit=  -> { orders, pagination }
  getMyOrders: (params) => axiosInstance.get(`${BASE}/my`, { params }).then((res) => res.data.data),

  // GET /api/v1/orders/:id
  getById: (id) => axiosInstance.get(`${BASE}/${id}`).then((res) => res.data.data),

  // GET /api/v1/orders/number/:orderNumber
  getByOrderNumber: (orderNumber) =>
    axiosInstance.get(`${BASE}/number/${orderNumber}`).then((res) => res.data.data),

  // PATCH /api/v1/orders/:id/cancel   body: { reason }
  cancelOrder: (id, reason) =>
    axiosInstance.patch(`${BASE}/${id}/cancel`, { reason }).then((res) => res.data.data),

  // PATCH /api/v1/orders/:id/items/:itemId/cancel   body: { reason }
  cancelItem: (id, itemId, reason) =>
    axiosInstance.patch(`${BASE}/${id}/items/${itemId}/cancel`, { reason }).then((res) => res.data.data),

  // PATCH /api/v1/orders/:id/items/:itemId/return-request   body: { reason }
  requestReturn: (id, itemId, reason) =>
    axiosInstance
      .patch(`${BASE}/${id}/items/${itemId}/return-request`, { reason })
      .then((res) => res.data.data),
};