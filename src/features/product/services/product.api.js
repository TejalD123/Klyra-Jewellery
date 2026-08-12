import axiosInstance from "../../../api/apiClient";

const BASE = "/products";

export const productsAPI = {
  getAll: (params = {}) =>
    axiosInstance.get(BASE, { params }).then((res) => res.data.data),

  getBySlug: (slug) =>
    axiosInstance.get(`${BASE}/slug/${slug}`).then((res) => res.data.data),

  getRelated: (id) =>
    axiosInstance.get(`${BASE}/${id}/related`).then((res) => res.data.data),
};