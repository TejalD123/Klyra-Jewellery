 // ⚠️ update path if different in your project
import axiosInstance from "../../../api/apiClient";
const BASE = "/categories";

export const categoriesAPI = {
  getAll: (params = {}) =>
    axiosInstance.get(BASE, { params }).then((res) => res.data.data),

  getTree: () =>
    axiosInstance.get(`${BASE}/tree`).then((res) => res.data.data),

  getBySlug: (slug) =>
    axiosInstance.get(`${BASE}/slug/${slug}`).then((res) => res.data.data),

  getSubcategories: (id) =>
    axiosInstance.get(`${BASE}/${id}/subcategories`).then((res) => res.data.data),
};