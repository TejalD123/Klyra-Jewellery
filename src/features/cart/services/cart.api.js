import axiosInstance from "../../../api/apiClient";

const BASE = "/cart";

export const cartAPI = {
  getCart: () => axiosInstance.get(BASE).then((res) => res.data.data),
  addItem: (payload) => axiosInstance.post(`${BASE}/items`, payload).then((res) => res.data.data),
  updateItem: (itemId, quantity) =>
    axiosInstance.put(`${BASE}/items/${itemId}`, { quantity }).then((res) => res.data.data),
  removeItem: (itemId) => axiosInstance.delete(`${BASE}/items/${itemId}`).then((res) => res.data.data),
  clearCart: () => axiosInstance.delete(BASE).then((res) => res.data.data),
};