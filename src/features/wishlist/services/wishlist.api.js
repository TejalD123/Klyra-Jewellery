import axiosInstance from "../../../api/apiClient";

const BASE = "/wishlist"; // axiosInstance's baseURL already includes /api/v1

export const getWishlist = () => axiosInstance.get(BASE);

export const addToWishlist = (productId) => axiosInstance.post(`${BASE}/${productId}`);

export const removeFromWishlist = (productId) => axiosInstance.delete(`${BASE}/${productId}`);

export const toggleWishlist = (productId) => axiosInstance.post(`${BASE}/toggle/${productId}`);

export const clearWishlist = () => axiosInstance.delete(BASE);