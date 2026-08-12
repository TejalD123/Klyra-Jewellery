import axiosInstance from "../../api/apiClient";

// ===== Public =====
export const getActiveBanners = (type) =>
  axiosInstance.get("/banners/active", { params: type ? { type } : {} });

// ===== Admin =====
export const getAllBanners = (type) =>
  axiosInstance.get("/admin/banners", { params: type ? { type } : {} });

export const createBanner = (formData) =>
  axiosInstance.post("/admin/banners", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateBanner = (id, formData) =>
  axiosInstance.patch(`/admin/banners/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const toggleBannerStatus = (id) =>
  axiosInstance.patch(`/admin/banners/${id}/toggle`);

export const deleteBanner = (id) =>
  axiosInstance.delete(`/admin/banners/${id}`);