import axiosInstance from "../../../api/apiClient";

const BASE = "/payments";

export const paymentAPI = {
  createPaymentOrder: (payload) => axiosInstance.post(`${BASE}/create`, payload).then((res) => res.data.data),
  verifyPayment: (payload) => axiosInstance.post(`${BASE}/verify`, payload).then((res) => res.data.data),
  getById: (paymentId) => axiosInstance.get(`${BASE}/${paymentId}`).then((res) => res.data.data),
};