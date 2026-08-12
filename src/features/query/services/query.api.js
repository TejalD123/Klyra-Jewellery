import axiosInstance from "../../../api/apiClient"; // ⚠️ adjust path to your apiClient

const BASE = "/queries";

export const queryAPI = {
  // ---- Public (storefront contact form — no auth needed) ----
  submit: (payload) => axiosInstance.post(BASE, payload).then((res) => res.data.data),

  // ---- Admin only ----
  getAll: (params = {}) => axiosInstance.get(BASE, { params }).then((res) => res.data.data),
  getById: (id) => axiosInstance.get(`${BASE}/${id}`).then((res) => res.data.data),
  respond: (id, response) =>
    axiosInstance.patch(`${BASE}/${id}/respond`, { response }).then((res) => res.data.data),
  updateStatus: (id, status) =>
    axiosInstance.patch(`${BASE}/${id}/status`, { status }).then((res) => res.data.data),
  remove: (id) => axiosInstance.delete(`${BASE}/${id}`).then((res) => res.data.data),
};