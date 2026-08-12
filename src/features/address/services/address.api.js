import axiosInstance from "../../../api/apiClient";

const BASE = "/addresses";

export const addressAPI = {
  getMyAddresses: () => axiosInstance.get(BASE).then((res) => res.data.data),
  getDefaultAddress: () => axiosInstance.get(`${BASE}/default`).then((res) => res.data.data),
  getAddressById: (id) => axiosInstance.get(`${BASE}/${id}`).then((res) => res.data.data),
  createAddress: (payload) => axiosInstance.post(BASE, payload).then((res) => res.data.data),
  updateAddress: (id, payload) => axiosInstance.put(`${BASE}/${id}`, payload).then((res) => res.data.data),
  setDefaultAddress: (id) => axiosInstance.patch(`${BASE}/${id}/set-default`).then((res) => res.data.data),
  deleteAddress: (id) => axiosInstance.delete(`${BASE}/${id}`).then((res) => res.data.data),
};