import axiosInstance from "../../../api/apiClient";

const BASE = "/admin/banners";

// GET /api/v1/admin/banners?type=
export const fetchBanners = (params = {}) => axiosInstance.get(BASE, { params });

// POST /api/v1/admin/banners  (multipart/form-data — image required for "hero" type)
export const createBanner = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "image" && value instanceof File) {
      formData.append("image", value);
    } else {
      formData.append(key, value);
    }
  });
  return axiosInstance.post(BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// PATCH /api/v1/admin/banners/:id
export const updateBanner = (id, payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "image" && value instanceof File) {
      formData.append("image", value);
    } else {
      formData.append(key, value);
    }
  });
  return axiosInstance.patch(`${BASE}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// PATCH /api/v1/admin/banners/:id/toggle
export const toggleBannerStatus = (id) => axiosInstance.patch(`${BASE}/${id}/toggle`);

// DELETE /api/v1/admin/banners/:id
export const deleteBanner = (id) => axiosInstance.delete(`${BASE}/${id}`);